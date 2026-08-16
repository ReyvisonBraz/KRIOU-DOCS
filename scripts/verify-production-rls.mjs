import { execFileSync } from "node:child_process";
import { lstatSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import { inspectLegacyAnonJwt } from "../src/config/supabase-public-key.js";
import {
  assertCommittedSourceState,
  calculateSourceDigest,
  createSupabaseIdentityOperations,
  executeProductionRlsVerification,
} from "./lib/production-rls-verification.mjs";

const CANONICAL_PROJECT_REF = "uyptmlezmdzfufzuknfz";
const ALLOWED_ENVIRONMENT_NAMES = new Set([
  "SEC21_PROJECT_REF",
  "SEC21_SUPABASE_URL",
  "SEC21_SUPABASE_PUBLISHABLE_KEY",
  "SEC21_USER_A_ID",
  "SEC21_USER_A_EMAIL",
  "SEC21_USER_A_PASSWORD",
  "SEC21_USER_B_ID",
  "SEC21_USER_B_EMAIL",
  "SEC21_USER_B_PASSWORD",
]);

function fail(message) {
  console.error(`[SEC2.1] ${message}`);
  process.exit(1);
}

function envFileFromArguments(args) {
  if (args.length !== 2 || args[0] !== "--env-file" || args[1].startsWith("-")) {
    fail("uso: npm run verify:production-rls -- --env-file <arquivo-local-ignorado>");
  }
  return resolve(args[1]);
}

function repositoryRoot() {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
}

function assertSecureIgnoredFile(path, root) {
  const relativePath = relative(root, path);
  if (!relativePath || relativePath.startsWith("..") || isAbsolute(relativePath)) {
    fail("o arquivo de credenciais deve ficar dentro do repositorio e fora do Git");
  }

  const linkInfo = lstatSync(path);
  const fileInfo = statSync(path);
  if (linkInfo.isSymbolicLink() || !fileInfo.isFile()) fail("arquivo de credenciais invalido");
  if ((fileInfo.mode & 0o777) !== 0o600) fail("arquivo de credenciais deve ter modo 0600");
  if (typeof process.getuid === "function" && fileInfo.uid !== process.getuid()) {
    fail("arquivo de credenciais deve pertencer ao usuario atual");
  }
  if (fileInfo.size > 32_768) fail("arquivo de credenciais excede o limite seguro");

  try {
    execFileSync("git", ["check-ignore", "--quiet", relativePath], { cwd: root });
  } catch {
    fail("arquivo de credenciais nao esta ignorado pelo Git");
  }
}

export function parseEnvironmentFile(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) throw new Error("invalid-environment-line");
    const name = line.slice(0, separator).trim();
    if (!ALLOWED_ENVIRONMENT_NAMES.has(name) || Object.hasOwn(values, name)) {
      throw new Error("invalid-environment-name");
    }
    let value = line.slice(separator + 1).trim();
    if (
      value.length >= 2
      && ((value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    values[name] = value;
  }
  return values;
}

function assertUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function assertPublicKey(key, projectRef) {
  if (key.startsWith("sb_publishable_") && key.length >= 32) return;
  const legacy = inspectLegacyAnonJwt(key);
  if (!legacy.valid || (legacy.projectRef && legacy.projectRef !== projectRef)) {
    throw new Error("public-key-required");
  }
}

export function validateConfiguration(values) {
  for (const name of ALLOWED_ENVIRONMENT_NAMES) {
    if (!values[name]) throw new Error("missing-environment-value");
  }
  if (values.SEC21_PROJECT_REF !== CANONICAL_PROJECT_REF) throw new Error("project-ref-mismatch");
  const expectedUrl = `https://${CANONICAL_PROJECT_REF}.supabase.co`;
  if (values.SEC21_SUPABASE_URL !== expectedUrl) throw new Error("project-url-mismatch");
  if (!assertUuid(values.SEC21_USER_A_ID) || !assertUuid(values.SEC21_USER_B_ID)) {
    throw new Error("invalid-user-id");
  }
  if (values.SEC21_USER_A_ID === values.SEC21_USER_B_ID) throw new Error("duplicate-user-id");
  assertPublicKey(values.SEC21_SUPABASE_PUBLISHABLE_KEY, values.SEC21_PROJECT_REF);
  return values;
}

function createManifestStore() {
  let directory = null;
  let path = null;
  return {
    async persist(manifest) {
      directory = mkdtempSync(join(tmpdir(), "kriou-sec21-"));
      path = join(directory, "owned-uuids.json");
      writeFileSync(path, `${JSON.stringify(manifest)}\n`, { encoding: "utf8", flag: "wx", mode: 0o600 });
    },
    finalize(cleanupVerified) {
      if (cleanupVerified && directory) rmSync(directory, { recursive: true, force: false });
      return { retained: Boolean(directory && !cleanupVerified), path };
    },
  };
}

function client(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

const envPath = envFileFromArguments(process.argv.slice(2));
const root = repositoryRoot();
try {
  assertCommittedSourceState(root);
} catch {
  fail("fontes do executor precisam estar commitadas e sem alteracoes locais");
}
assertSecureIgnoredFile(envPath, root);

let configuration;
try {
  configuration = validateConfiguration(parseEnvironmentFile(readFileSync(envPath, "utf8")));
} catch {
  fail("configuracao recusada; confira somente nomes, permissoes e valores localmente");
}

const manifestStore = createManifestStore();
const commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const sourceDigest = calculateSourceDigest(root);
const shared = {
  projectRef: configuration.SEC21_PROJECT_REF,
  commit,
  sourceDigest,
  expectedUserAId: configuration.SEC21_USER_A_ID,
  expectedUserBId: configuration.SEC21_USER_B_ID,
  credentialsA: {
    email: configuration.SEC21_USER_A_EMAIL,
    password: configuration.SEC21_USER_A_PASSWORD,
  },
  credentialsB: {
    email: configuration.SEC21_USER_B_EMAIL,
    password: configuration.SEC21_USER_B_PASSWORD,
  },
  manifestStore,
};

const report = await executeProductionRlsVerification({
  ...shared,
  opsA: createSupabaseIdentityOperations(
    client(configuration.SEC21_SUPABASE_URL, configuration.SEC21_SUPABASE_PUBLISHABLE_KEY),
  ),
  opsB: createSupabaseIdentityOperations(
    client(configuration.SEC21_SUPABASE_URL, configuration.SEC21_SUPABASE_PUBLISHABLE_KEY),
  ),
});

const manifestState = manifestStore.finalize(report.records_cleanup === "verified");
console.log(JSON.stringify({ ...report, recovery_manifest_retained: manifestState.retained }, null, 2));
if (manifestState.retained) {
  console.error(`[SEC2.1] cleanup nao comprovado; manifesto local preservado em ${manifestState.path}`);
}

process.exit(report.status === "passed_records_pending_account_cleanup" ? 0 : 1);
