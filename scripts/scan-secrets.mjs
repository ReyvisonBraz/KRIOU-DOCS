import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { inspectLegacyAnonJwt } from "../src/config/supabase-public-key.js";

const rules = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["supabase-secret-key", /\bsb_secret_[A-Za-z0-9_-]{20,}/],
  ["assigned-service-role", /\bSUPABASE_SERVICE_ROLE_KEY["']?\s*[:=]\s*["']?[^\s#"']{20,}/],
  ["assigned-mp-token", /\bMP_(?:ACCESS_TOKEN|WEBHOOK_SECRET)["']?\s*[:=]\s*["']?[^\s#"']{20,}/],
  ["assigned-resend-key", /\bRESEND_API_KEY["']?\s*[:=]\s*["']?[^\s#"']{20,}/],
  ["assigned-auth-token", /\b(?:SUPABASE_(?:ACCESS|REFRESH)_TOKEN|(?:USER|AUTH)_(?:ACCESS_|REFRESH_)?TOKEN)["']?\s*[:=]\s*["']?[A-Za-z0-9._-]{20,}/],
  ["supabase-personal-token", /\bsbp_[A-Za-z0-9]{20,}/],
  ["mercado-pago-token", /\b(?:APP_USR|TEST)-\d{6,}-[A-Za-z0-9-]{20,}/],
  ["resend-api-key", /\bre_[A-Za-z0-9_-]{24,}/],
];

const jwtCandidatePattern = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g;

function gitFiles(args) {
  return execFileSync("git", [...args, "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

function walkFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(root);
  return files;
}

function readIndexFile(file) {
  try {
    return execFileSync("git", ["show", `:${file}`]);
  } catch {
    return null;
  }
}

function readWorkingFile(file) {
  try {
    return readFileSync(file);
  } catch {
    return null;
  }
}

const trackedFiles = gitFiles(["ls-files", "--cached"]);
const untrackedFiles = gitFiles(["ls-files", "--others", "--exclude-standard"]);
const bundleFiles = walkFiles("dist");

const inputs = [
  ...trackedFiles.map((file) => ({ source: "index", file, content: readIndexFile(file) })),
  ...trackedFiles.map((file) => ({ source: "worktree", file, content: readWorkingFile(file) })),
  ...untrackedFiles.map((file) => ({ source: "untracked", file, content: readWorkingFile(file) })),
  ...bundleFiles.map((file) => ({
    source: "bundle",
    file: relative(process.cwd(), file),
    content: readWorkingFile(file),
  })),
];

const findings = [];
for (const input of inputs) {
  if (!input.content || input.content.includes(0)) continue;
  const content = input.content.toString("utf8");
  content.split(/\r?\n/).forEach((line, index) => {
    for (const [rule, pattern] of rules) {
      if (pattern.test(line)) {
        findings.push({ source: input.source, file: input.file, line: index + 1, rule });
      }
    }

    for (const match of line.matchAll(jwtCandidatePattern)) {
      if (!inspectLegacyAnonJwt(match[0]).valid) {
        findings.push({
          source: input.source,
          file: input.file,
          line: index + 1,
          rule: "jwt-sensitive-or-unknown",
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("[secret-scan] possíveis secrets encontrados (valores omitidos):");
  for (const finding of findings) {
    console.error(`- ${finding.source}:${finding.file}:${finding.line} [${finding.rule}]`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `[secret-scan] limpo: index=${trackedFiles.length}; worktree=${trackedFiles.length}; untracked=${untrackedFiles.length}; bundle=${bundleFiles.length}.`,
  );
}
