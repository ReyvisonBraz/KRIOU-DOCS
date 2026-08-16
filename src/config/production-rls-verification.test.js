import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertCommittedSourceState,
  calculateSourceDigest,
  executeProductionRlsVerification,
  sanitizeErrorCode,
} from "../../scripts/lib/production-rls-verification.mjs";

const USER_A = "00000000-0000-4000-8000-00000000000a";
const USER_B = "00000000-0000-4000-8000-00000000000b";
const RUN_ID = "00000000-0000-4000-8000-000000000021";
const PROJECT_REF = "uyptmlezmdzfufzuknfz";
const COMMIT = "12d36ce1234567890abcdef1234567890abcdef";
const SOURCE_DIGEST = "a".repeat(64);
const temporaryDirectories = [];

function result(rowCount = 0, ownerIds = [], errorCode = null) {
  return { rowCount, ownerIds, errorCode };
}

function createOperations(identity, overrides = {}) {
  const ownId = identity === "a" ? USER_A : USER_B;
  const defaults = {
    signIn: vi.fn(async () => ({ userId: ownId, errorCode: null })),
    signOut: vi.fn(async () => ({ errorCode: null })),
    readOwnProfile: vi.fn(async (id) => id === ownId ? result(1, [ownId]) : result()),
    readSensitiveProfile: vi.fn(async () => result()),
    updateProfileIdentity: vi.fn(async () => result(0, [], "42501")),
    insertProfileIdentity: vi.fn(async () => result(0, [], "42501")),
    readDocument: vi.fn(async () => result()),
    insertDocument: vi.fn(async (payload) => (
      identity === "a" ? result(1, [payload.user_id]) : result(0, [], "42501")
    )),
    updateDocument: vi.fn(async () => result()),
    deleteDocument: vi.fn(async () => result()),
    readDraft: vi.fn(async () => result()),
    insertDraft: vi.fn(async (payload) => (
      identity === "a" ? result(1, [payload.user_id]) : result(0, [], "42501")
    )),
    updateDraft: vi.fn(async () => result()),
    deleteDraft: vi.fn(async () => result()),
    cleanupDocuments: vi.fn(async () => result(1, [USER_A])),
    cleanupDrafts: vi.fn(async () => result(1, [USER_A])),
    verifyDocumentsAbsent: vi.fn(async () => result()),
    verifyDraftsAbsent: vi.fn(async () => result()),
  };
  return { ...defaults, ...overrides };
}

function createManifestStore() {
  return {
    manifests: [],
    async persist(manifest) {
      this.manifests.push(structuredClone(manifest));
    },
  };
}

function execute(overrides = {}) {
  const opsA = overrides.opsA || createOperations("a");
  const opsB = overrides.opsB || createOperations("b");
  const manifestStore = overrides.manifestStore || createManifestStore();
  return executeProductionRlsVerification({
    opsA,
    opsB,
    manifestStore,
    credentialsA: { email: "synthetic-a@example.invalid", password: "local-a" },
    credentialsB: { email: "synthetic-b@example.invalid", password: "local-b" },
    expectedUserAId: USER_A,
    expectedUserBId: USER_B,
    projectRef: PROJECT_REF,
    commit: COMMIT,
    sourceDigest: SOURCE_DIGEST,
    runId: RUN_ID,
    timestamp: "2026-08-15T12:00:00.000Z",
  }).then((report) => ({ report, opsA, opsB, manifestStore }));
}

function createGitRepository() {
  const directory = mkdtempSync(join(tmpdir(), "kriou-sec21-source-"));
  temporaryDirectories.push(directory);
  mkdirSync(join(directory, "scripts"));
  writeFileSync(join(directory, ".gitignore"), ".env.*\n");
  writeFileSync(join(directory, "scripts", "runner.mjs"), "export const version = 1;\n");
  execFileSync("git", ["init", "-q"], { cwd: directory });
  execFileSync("git", ["config", "user.email", "sec21@example.invalid"], { cwd: directory });
  execFileSync("git", ["config", "user.name", "SEC21 Test"], { cwd: directory });
  execFileSync("git", ["add", ".gitignore", "scripts/runner.mjs"], { cwd: directory });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: directory });
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("SEC2.1 production RLS verification", () => {
  it("produz relatorio sanitizado e limpa somente UUIDs persistidos antes da escrita", async () => {
    const { report, opsA, manifestStore } = await execute();
    const manifest = manifestStore.manifests[0];

    expect(report.status).toBe("passed_records_pending_account_cleanup");
    expect(report.records_cleanup).toBe("verified");
    expect(report.accounts_cleanup).toBe("dashboard_required");
    expect(report.source_digest).toBe(SOURCE_DIGEST);
    expect(report.identities.a).toMatch(/^[a-f0-9]{16}$/);
    expect(report.identities.b).toMatch(/^[a-f0-9]{16}$/);
    expect(report.scenarios).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "profiles.b_cannot_read_a_sensitive_columns", status: "passed", row_count: 0 }),
      expect.objectContaining({ name: "documents.b_cannot_insert_as_a", error_code: "42501" }),
      expect.objectContaining({ name: "drafts.b_cannot_insert_as_a", error_code: "42501" }),
      expect.objectContaining({ name: "cleanup.verify_documents_absent", row_count: 0 }),
    ]));

    expect(manifest.runId).toBe(RUN_ID);
    expect(manifest.ownerId).toBe(USER_A);
    expect(manifest.documentIds).toHaveLength(2);
    expect(manifest.draftIds).toHaveLength(2);
    expect(opsA.cleanupDocuments).toHaveBeenCalledWith(manifest.documentIds, USER_A);
    expect(opsA.cleanupDrafts).toHaveBeenCalledWith(manifest.draftIds, USER_A);
    expect(opsA.updateProfileIdentity).not.toHaveBeenCalled();
    expect(opsA.insertProfileIdentity).not.toHaveBeenCalled();

    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("synthetic-a@example.invalid");
    expect(serialized).not.toContain("synthetic-b@example.invalid");
    expect(serialized).not.toContain("local-a");
    expect(serialized).not.toContain("local-b");
    expect(serialized).not.toContain(USER_A);
    expect(serialized).not.toContain(USER_B);
    for (const id of [...manifest.documentIds, ...manifest.draftIds]) {
      expect(serialized).not.toContain(id);
    }
  });

  it("para no primeiro read cruzado e ainda aciona cleanup pelos UUIDs exatos", async () => {
    const opsB = createOperations("b", {
      readSensitiveProfile: vi.fn(async () => result(1, [USER_A])),
    });
    const { report, opsA, manifestStore } = await execute({ opsB });

    expect(report.status).toBe("stopped");
    expect(report.stop_code).toBe("cross_identity_leak");
    expect(report.scenarios).toContainEqual(expect.objectContaining({
      name: "profiles.b_cannot_read_a_sensitive_columns",
      status: "stopped",
      row_count: 1,
    }));
    expect(report.records_cleanup).toBe("not_started");
    expect(manifestStore.manifests).toHaveLength(0);
    expect(opsB.updateProfileIdentity).not.toHaveBeenCalled();
    expect(opsB.insertDocument).not.toHaveBeenCalled();
    expect(opsA.cleanupDocuments).not.toHaveBeenCalled();
    expect(opsA.cleanupDrafts).not.toHaveBeenCalled();
  });

  it("para imediatamente quando uma escrita cruzada afeta o documento de A", async () => {
    const opsB = createOperations("b", {
      updateDocument: vi.fn(async () => result(1, [USER_A])),
    });
    const { report, opsA, manifestStore } = await execute({ opsB });
    const manifest = manifestStore.manifests[0];

    expect(report.status).toBe("stopped");
    expect(report.stop_code).toBe("cross_identity_write");
    expect(report.scenarios).toContainEqual(expect.objectContaining({
      name: "documents.b_cannot_update_a",
      status: "stopped",
      row_count: 1,
    }));
    expect(opsB.deleteDocument).not.toHaveBeenCalled();
    expect(opsB.insertDocument).not.toHaveBeenCalled();
    expect(opsA.cleanupDocuments).toHaveBeenCalledWith(manifest.documentIds, USER_A);
  });

  it("nao escreve se o manifesto de UUIDs nao puder ser persistido", async () => {
    const opsA = createOperations("a");
    const manifestStore = { persist: vi.fn(async () => { throw new Error("disk-failure"); }) };
    const { report } = await execute({ opsA, manifestStore });

    expect(report.status).toBe("failed");
    expect(report.stop_code).toBe("internal_error");
    expect(report.records_cleanup).toBe("not_started");
    expect(opsA.readOwnProfile).toHaveBeenCalledWith(USER_A);
    expect(opsA.updateProfileIdentity).not.toHaveBeenCalled();
    expect(opsA.insertDocument).not.toHaveBeenCalled();
  });

  it("nao afirma conclusao quando a limpeza nao pode ser comprovada", async () => {
    const opsA = createOperations("a", {
      verifyDocumentsAbsent: vi.fn(async () => result(1, [USER_A])),
    });
    const { report } = await execute({ opsA });

    expect(report.status).toBe("blocked_cleanup_failed");
    expect(report.stop_code).toBe("cleanup_failed");
    expect(report.records_cleanup).toBe("failed");
  });

  it("reduz erros a codigos seguros e nunca propaga mensagens", () => {
    expect(sanitizeErrorCode({ code: "pgrst116", message: "payload secreto" })).toBe("PGRST116");
    expect(sanitizeErrorCode({ code: "42501", details: "linha inteira" })).toBe("42501");
    expect(sanitizeErrorCode({ code: "unsafe-code-with-details" })).toBeNull();
    expect(sanitizeErrorCode(new Error("token sensivel"))).toBeNull();
  });
});

describe("SEC2.1 committed source evidence", () => {
  it("aceita fontes limpas mesmo com env ignorado 0600", () => {
    const directory = createGitRepository();
    writeFileSync(join(directory, ".env.sec21.local"), "", { mode: 0o600 });

    expect(() => assertCommittedSourceState(directory, ["scripts/runner.mjs"]))
      .not.toThrow();
  });

  it("recusa diff tracked unstaged sem expor caminho", () => {
    const directory = createGitRepository();
    writeFileSync(join(directory, "scripts", "runner.mjs"), "export const version = 2;\n");

    expect(() => assertCommittedSourceState(directory, ["scripts/runner.mjs"]))
      .toThrow("uncommitted-source");
  });

  it("recusa diff staged sem expor caminho", () => {
    const directory = createGitRepository();
    writeFileSync(join(directory, "scripts", "runner.mjs"), "export const version = 2;\n");
    execFileSync("git", ["add", "scripts/runner.mjs"], { cwd: directory });

    expect(() => assertCommittedSourceState(directory, ["scripts/runner.mjs"]))
      .toThrow("uncommitted-source");
  });

  it("recusa fonte relevante untracked sem expor caminho", () => {
    const directory = createGitRepository();
    writeFileSync(join(directory, "scripts", "new-lib.mjs"), "export const value = true;\n");

    expect(() => assertCommittedSourceState(directory, ["scripts/new-lib.mjs"]))
      .toThrow("uncommitted-source");
  });

  it("calcula digest deterministico independentemente da ordem dos arquivos", () => {
    const directory = createGitRepository();
    writeFileSync(join(directory, "scripts", "lib.mjs"), "export const stable = true;\n");

    const first = calculateSourceDigest(directory, ["scripts/runner.mjs", "scripts/lib.mjs"]);
    const second = calculateSourceDigest(directory, ["scripts/lib.mjs", "scripts/runner.mjs"]);

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toBe(first);
  });
});
