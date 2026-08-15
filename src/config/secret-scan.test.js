import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  LEGACY_JWT_CLOCK_SKEW_SECONDS,
  LEGACY_JWT_MAX_LIFETIME_SECONDS,
} from "./supabase-public-key.js";

const SCANNER = resolve("scripts/scan-secrets.mjs");
const STAGING_REF = "abcdefghijklmnopqrst";
const NOW_SECONDS = Math.floor(Date.now() / 1000);
const CLI_TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;
const temporaryDirectories = [];

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function jwtWithPayload(payload) {
  const signature = Buffer.from("assinatura-sintetica-apenas-para-teste").toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.${signature}`;
}

function malformedJwt() {
  const signature = Buffer.from("assinatura-malformada-apenas-para-teste").toString("base64url");
  const payload = Buffer.from("nao-e-json").toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${payload}.${signature}`;
}

function hostedAnonJwt(ref = STAGING_REF) {
  return jwtWithPayload({
    iss: "supabase",
    ...(ref ? { ref } : {}),
    role: "anon",
    iat: NOW_SECONDS - 60,
    exp: NOW_SECONDS + (5 * 365 * 24 * 60 * 60),
  });
}

function localAnonJwt() {
  return jwtWithPayload({
    role: "anon",
    iss: "supabase-demo",
    exp: NOW_SECONDS + CLI_TEN_YEARS_SECONDS,
  });
}

function createRepository() {
  const directory = mkdtempSync(join(tmpdir(), "kriou-secret-scan-"));
  temporaryDirectories.push(directory);
  execFileSync("git", ["init", "-q"], { cwd: directory });
  return directory;
}

function scan(directory) {
  return spawnSync(process.execPath, [SCANNER], {
    cwd: directory,
    encoding: "utf8",
  });
}

function writeCandidate(directory, surface, value, variable = "CANDIDATE") {
  const relativePath = surface === "bundle" ? "dist/app.js" : "candidate.env";
  const path = join(directory, relativePath);
  if (surface === "bundle") mkdirSync(join(directory, "dist"));
  writeFileSync(path, `${variable}=${value}\n`);
  if (surface === "index") execFileSync("git", ["add", relativePath], { cwd: directory });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("scan:secrets", () => {
  it("permite o mesmo anon JWT CLI real no index, worktree, untracked e dist", () => {
    const directory = createRepository();
    const cliAnon = localAnonJwt();
    writeFileSync(
      join(directory, "environment.txt"),
      `LOCAL_ANON_KEY=${cliAnon}\n`,
    );
    execFileSync("git", ["add", "environment.txt"], { cwd: directory });

    mkdirSync(join(directory, "dist"));
    writeFileSync(join(directory, "dist/app.js"), `const anonKey=${cliAnon};\n`);
    writeFileSync(join(directory, "local.env"), `LOCAL_ANON_KEY=${cliAnon}\n`);
    writeFileSync(join(directory, "hosted.env"), `HOSTED_ANON_KEY=${hostedAnonJwt()}\n`);

    const result = scan(directory);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("[secret-scan] limpo");
  });

  it("bloqueia service_role no index, worktree, untracked e dist sem imprimir valor", () => {
    const directory = createRepository();
    const serviceRole = jwtWithPayload({
      iss: "supabase",
      ref: STAGING_REF,
      role: "service_role",
      iat: NOW_SECONDS - 60,
      exp: NOW_SECONDS + 10_000,
    });
    writeFileSync(join(directory, "tracked.env"), `KEY=${serviceRole}\n`);
    execFileSync("git", ["add", "tracked.env"], { cwd: directory });
    writeFileSync(join(directory, "untracked.env"), `KEY=${serviceRole}\n`);
    mkdirSync(join(directory, "dist"));
    writeFileSync(join(directory, "dist/app.js"), `const key=${serviceRole};\n`);

    const result = scan(directory);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("index:tracked.env");
    expect(result.stderr).toContain("worktree:tracked.env");
    expect(result.stderr).toContain("untracked:untracked.env");
    expect(result.stderr).toContain("bundle:dist/app.js");
    expect(result.stderr).not.toContain(serviceRole);
  });

  it.each([
    {
      name: "service_role no bundle",
      surface: "bundle",
      value: () => jwtWithPayload({
        iss: "supabase",
        ref: STAGING_REF,
        role: "service_role",
        iat: 1645192800,
        exp: 1960768800,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT de usuário no index",
      surface: "index",
      value: () => jwtWithPayload({
        iss: `https://${STAGING_REF}.supabase.co/auth/v1`,
        role: "authenticated",
        aud: "authenticated",
        sub: "00000000-0000-0000-0000-000000000001",
        iat: 1645192800,
        exp: 1960768800,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT desconhecido/malformado",
      surface: "untracked",
      value: malformedJwt,
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT anon hosted expirada",
      surface: "untracked",
      value: () => jwtWithPayload({
        iss: "supabase",
        role: "anon",
        iat: NOW_SECONDS - 2_000,
        exp: NOW_SECONDS - LEGACY_JWT_CLOCK_SKEW_SECONDS - 1,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT anon hosted emitida no futuro",
      surface: "untracked",
      value: () => jwtWithPayload({
        iss: "supabase",
        role: "anon",
        iat: NOW_SECONDS + LEGACY_JWT_CLOCK_SKEW_SECONDS + 60,
        exp: NOW_SECONDS + 10_000,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT anon hosted com lifetime impossível",
      surface: "untracked",
      value: () => jwtWithPayload({
        iss: "supabase",
        role: "anon",
        iat: NOW_SECONDS - 100,
        exp: NOW_SECONDS - 100 + LEGACY_JWT_MAX_LIFETIME_SECONDS + 1,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "JWT anon CLI expirada sem iat",
      surface: "untracked",
      value: () => jwtWithPayload({
        iss: "supabase-demo",
        role: "anon",
        exp: NOW_SECONDS - LEGACY_JWT_CLOCK_SKEW_SECONDS - 1,
      }),
      rule: "jwt-sensitive-or-unknown",
    },
    {
      name: "refresh token atribuído",
      surface: "untracked",
      variable: "SUPABASE_REFRESH_TOKEN",
      value: () => `refresh_${"x".repeat(32)}`,
      rule: "assigned-auth-token",
    },
    {
      name: "canário sb_secret",
      surface: "untracked",
      value: () => `${["sb", "secret"].join("_")}_${"x".repeat(32)}`,
      rule: "supabase-secret-key",
    },
  ])("bloqueia $name sem imprimir o valor", ({ surface, value, variable, rule }) => {
    const directory = createRepository();
    const candidate = value();
    writeCandidate(directory, surface, candidate, variable);

    const result = scan(directory);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(`[${rule}]`);
    expect(result.stderr).not.toContain(candidate);
    expect(result.stdout).not.toContain(candidate);
  });
});
