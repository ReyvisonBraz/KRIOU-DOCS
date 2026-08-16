import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EXPECTED_RLS_ERROR = "42501";
const SAFE_ERROR_CODE = /^[A-Z0-9_]{1,16}$/;

export const SEC21_EXECUTION_SOURCE_FILES = Object.freeze([
  "package-lock.json",
  "scripts/verify-production-rls.mjs",
  "scripts/lib/production-rls-verification.mjs",
  "src/config/supabase-public-key.js",
]);

export function assertCommittedSourceState(
  root,
  files = SEC21_EXECUTION_SOURCE_FILES,
  runGit = execFileSync,
) {
  const status = runGit(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all", "--", ...files],
    { cwd: root, encoding: "utf8" },
  );
  if (status.length !== 0) throw new Error("uncommitted-source");
}

export function calculateSourceDigest(
  root,
  files = SEC21_EXECUTION_SOURCE_FILES,
  readFile = readFileSync,
) {
  const hash = createHash("sha256");
  for (const file of [...files].sort()) {
    const content = readFile(`${root}/${file}`);
    hash.update(`${file.length}:${file}:`);
    hash.update(`${content.length}:`);
    hash.update(content);
  }
  return hash.digest("hex");
}

export class StopConditionError extends Error {
  constructor(code, scenario, result = null) {
    super("SEC2.1 interrompido por uma condição de parada.");
    this.name = "StopConditionError";
    this.code = code;
    this.scenario = scenario;
    this.result = result;
  }
}

export function sanitizeErrorCode(error) {
  const candidate = typeof error?.code === "string" ? error.code.toUpperCase() : "";
  return SAFE_ERROR_CODE.test(candidate) ? candidate : null;
}

function normalizeRows(data) {
  if (!data) return [];
  return (Array.isArray(data) ? data : [data]).map((row) => ({
    id: typeof row?.id === "string" ? row.id : null,
    ownerId: typeof row?.user_id === "string" ? row.user_id : row?.id || null,
  }));
}

function normalizeQueryResult(result) {
  const rows = normalizeRows(result?.data);
  return {
    rowCount: rows.length,
    ownerIds: rows.map((row) => row.ownerId).filter(Boolean),
    errorCode: sanitizeErrorCode(result?.error),
  };
}

function applyExactFilters(query, filters) {
  let filtered = query;
  for (const [column, value] of Object.entries(filters)) {
    filtered = filtered.eq(column, value);
  }
  return filtered;
}

export function createSupabaseIdentityOperations(client) {
  const query = async (table, columns, filters) => {
    const request = applyExactFilters(client.from(table).select(columns), filters);
    return normalizeQueryResult(await request);
  };

  const mutate = async (table, action, payload, columns, filters) => {
    let request = client.from(table)[action](payload);
    request = applyExactFilters(request, filters);
    return normalizeQueryResult(await request.select(columns));
  };

  return {
    async signIn(credentials) {
      const { data, error } = await client.auth.signInWithPassword(credentials);
      return {
        userId: typeof data?.user?.id === "string" ? data.user.id : null,
        errorCode: sanitizeErrorCode(error),
      };
    },

    async signOut() {
      const { error } = await client.auth.signOut({ scope: "local" });
      return { errorCode: sanitizeErrorCode(error) };
    },

    readOwnProfile(id) {
      return query("profiles", "id", { id });
    },

    readSensitiveProfile(id) {
      // cpf/phone sao solicitados para provar que nem essas colunas atravessam a RLS.
      // O adapter descarta os valores e devolve somente id/contagem.
      return query("profiles", "id,cpf,phone", { id });
    },

    updateProfileIdentity(id) {
      // Atribuir o mesmo id nao altera valor algum. A migration 016 tambem revoga
      // UPDATE(id), portanto o caminho esperado e zero linhas ou 42501.
      return mutate("profiles", "update", { id }, "id", { id });
    },

    insertProfileIdentity(id) {
      // INSERT simples contra a PK existente nunca pode sobrescrever o perfil.
      return normalizeMutation(client.from("profiles").insert({ id }), "id");
    },

    readDocument(id) {
      return query("documents", "id,user_id", { id });
    },

    insertDocument(payload) {
      return normalizeMutation(client.from("documents").insert(payload), "id,user_id");
    },

    updateDocument(id, values) {
      return mutate("documents", "update", values, "id,user_id", { id });
    },

    deleteDocument(id) {
      return mutate("documents", "delete", undefined, "id,user_id", { id });
    },

    readDraft(id) {
      return query("document_drafts", "id,user_id", { id });
    },

    insertDraft(payload) {
      return normalizeMutation(client.from("document_drafts").insert(payload), "id,user_id");
    },

    updateDraft(id, values) {
      return mutate("document_drafts", "update", values, "id,user_id", { id });
    },

    deleteDraft(id) {
      return mutate("document_drafts", "delete", undefined, "id,user_id", { id });
    },

    async cleanupDocuments(ids, ownerId) {
      if (!Array.isArray(ids) || ids.length === 0) return emptyResult();
      const result = await client
        .from("documents")
        .delete()
        .in("id", ids)
        .eq("user_id", ownerId)
        .select("id,user_id");
      return normalizeQueryResult(result);
    },

    async cleanupDrafts(ids, ownerId) {
      if (!Array.isArray(ids) || ids.length === 0) return emptyResult();
      const result = await client
        .from("document_drafts")
        .delete()
        .in("id", ids)
        .eq("user_id", ownerId)
        .select("id,user_id");
      return normalizeQueryResult(result);
    },

    async verifyDocumentsAbsent(ids, ownerId) {
      if (!Array.isArray(ids) || ids.length === 0) return emptyResult();
      const result = await client
        .from("documents")
        .select("id,user_id")
        .in("id", ids)
        .eq("user_id", ownerId);
      return normalizeQueryResult(result);
    },

    async verifyDraftsAbsent(ids, ownerId) {
      if (!Array.isArray(ids) || ids.length === 0) return emptyResult();
      const result = await client
        .from("document_drafts")
        .select("id,user_id")
        .in("id", ids)
        .eq("user_id", ownerId);
      return normalizeQueryResult(result);
    },
  };
}

async function normalizeMutation(request, columns) {
  return normalizeQueryResult(await request.select(columns));
}

function emptyResult() {
  return { rowCount: 0, ownerIds: [], errorCode: null };
}

function identityAlias(runId, userId) {
  return createHash("sha256").update(`${runId}:${userId}`).digest("hex").slice(0, 16);
}

function safeCommit(commit) {
  return typeof commit === "string" && /^[a-f0-9]{7,40}$/i.test(commit) ? commit : "unknown";
}

function safeDigest(digest) {
  return typeof digest === "string" && /^[a-f0-9]{64}$/i.test(digest) ? digest : "unknown";
}

function record(report, name, status, result = emptyResult()) {
  report.scenarios.push({
    name,
    status,
    row_count: Number.isInteger(result.rowCount) ? result.rowCount : 0,
    error_code: result.errorCode || null,
  });
}

function stop(code, scenario, result = null) {
  throw new StopConditionError(code, scenario, result);
}

function requireNoError(result, scenario) {
  if (result.errorCode) stop("unexpected_response", scenario, result);
}

function requireOwnRow(result, ownerId, scenario) {
  requireNoError(result, scenario);
  if (result.rowCount !== 1 || result.ownerIds.some((id) => id !== ownerId)) {
    stop("ownership_mismatch", scenario, result);
  }
}

function requireNoReadRows(result, scenario) {
  requireNoError(result, scenario);
  if (result.rowCount !== 0) stop("cross_identity_leak", scenario, result);
}

function requireNoWriteRows(result, scenario) {
  requireNoError(result, scenario);
  if (result.rowCount !== 0) stop("cross_identity_write", scenario, result);
}

function requireRlsRejection(result, scenario) {
  if (result.rowCount !== 0) stop("cross_identity_write", scenario, result);
  if (result.errorCode !== EXPECTED_RLS_ERROR) stop("unexpected_response", scenario, result);
}

function requireZeroOrSafeProfileFailure(result, scenario) {
  if (result.rowCount !== 0) stop("cross_identity_write", scenario, result);
  if (result.errorCode && !new Set(["42501", "23505"]).has(result.errorCode)) {
    stop("unexpected_response", scenario, result);
  }
}

function createManifest(runId, userAId) {
  return {
    runId,
    ownerId: userAId,
    documentIds: [randomUUID(), randomUUID()],
    draftIds: [randomUUID(), randomUUID()],
  };
}

async function runRecorded(report, name, action, assertion) {
  const result = await action();
  assertion(result, name);
  record(report, name, "passed", result);
  return result;
}

async function cleanupRun({ report, opsA, manifest }) {
  let cleanupOk = true;
  const cleanupSteps = [
    [
      "cleanup.documents_exact_ids",
      () => opsA.cleanupDocuments(manifest.documentIds, manifest.ownerId),
      () => true,
    ],
    [
      "cleanup.drafts_exact_ids",
      () => opsA.cleanupDrafts(manifest.draftIds, manifest.ownerId),
      () => true,
    ],
    [
      "cleanup.verify_documents_absent",
      () => opsA.verifyDocumentsAbsent(manifest.documentIds, manifest.ownerId),
      (result) => result.rowCount === 0,
    ],
    [
      "cleanup.verify_drafts_absent",
      () => opsA.verifyDraftsAbsent(manifest.draftIds, manifest.ownerId),
      (result) => result.rowCount === 0,
    ],
  ];

  for (const [name, action, assertion] of cleanupSteps) {
    try {
      const result = await action();
      if (result.errorCode || !assertion(result)) {
        cleanupOk = false;
        record(report, name, "failed", result);
      } else {
        record(report, name, "passed", result);
      }
    } catch {
      cleanupOk = false;
      record(report, name, "failed");
    }
  }

  return cleanupOk;
}

export async function executeProductionRlsVerification({
  opsA,
  opsB,
  credentialsA,
  credentialsB,
  expectedUserAId,
  expectedUserBId,
  projectRef,
  commit,
  sourceDigest,
  manifestStore,
  runId = randomUUID(),
  timestamp = new Date().toISOString(),
}) {
  const report = {
    schema_version: 1,
    timestamp,
    run_id: runId,
    project_ref: projectRef,
    commit: safeCommit(commit),
    source_digest: safeDigest(sourceDigest),
    status: "running",
    stop_code: null,
    identities: {},
    scenarios: [],
    records_cleanup: "not_started",
    accounts_cleanup: "dashboard_required",
  };

  let signedInA = false;
  let signedInB = false;
  let manifest = null;
  let manifestPersisted = false;

  try {
    const authA = await opsA.signIn(credentialsA);
    if (authA.errorCode || authA.userId !== expectedUserAId) {
      stop("identity_mismatch", "auth.identity_a");
    }
    signedInA = true;
    record(report, "auth.identity_a", "passed", { ...emptyResult(), rowCount: 1 });

    const authB = await opsB.signIn(credentialsB);
    if (authB.errorCode || authB.userId !== expectedUserBId || authB.userId === authA.userId) {
      stop("identity_mismatch", "auth.identity_b");
    }
    signedInB = true;
    record(report, "auth.identity_b", "passed", { ...emptyResult(), rowCount: 1 });

    report.identities = {
      a: identityAlias(runId, authA.userId),
      b: identityAlias(runId, authB.userId),
    };

    await runRecorded(
      report,
      "profiles.a_reads_own",
      () => opsA.readOwnProfile(authA.userId),
      (result, name) => requireOwnRow(result, authA.userId, name),
    );
    await runRecorded(
      report,
      "profiles.b_cannot_read_a_sensitive_columns",
      () => opsB.readSensitiveProfile(authA.userId),
      requireNoReadRows,
    );
    await runRecorded(
      report,
      "profiles.b_cannot_update_a",
      () => opsB.updateProfileIdentity(authA.userId),
      requireZeroOrSafeProfileFailure,
    );
    await runRecorded(
      report,
      "profiles.b_cannot_insert_as_a",
      () => opsB.insertProfileIdentity(authA.userId),
      requireZeroOrSafeProfileFailure,
    );

    manifest = createManifest(runId, authA.userId);
    await manifestStore.persist(manifest);
    manifestPersisted = true;

    const shortRunId = runId.slice(0, 8);

    const [documentId, forgedDocumentId] = manifest.documentIds;
    await runRecorded(
      report,
      "documents.a_creates_own",
      () => opsA.insertDocument({
        id: documentId,
        user_id: authA.userId,
        type: "legal",
        title: `SEC21-${runId}`,
        status: "draft",
        legal_data: { sec21_run_id: runId, synthetic: true },
      }),
      (result, name) => requireOwnRow(result, authA.userId, name),
    );
    await runRecorded(
      report,
      "documents.b_cannot_read_a",
      () => opsB.readDocument(documentId),
      requireNoReadRows,
    );
    await runRecorded(
      report,
      "documents.b_cannot_update_a",
      () => opsB.updateDocument(documentId, { title: `SEC21-B-FORGE-${shortRunId}` }),
      requireNoWriteRows,
    );
    await runRecorded(
      report,
      "documents.b_cannot_delete_a",
      () => opsB.deleteDocument(documentId),
      requireNoWriteRows,
    );
    await runRecorded(
      report,
      "documents.b_cannot_insert_as_a",
      () => opsB.insertDocument({
        id: forgedDocumentId,
        user_id: authA.userId,
        type: "legal",
        title: `SEC21-B-FORGE-${runId}`,
        status: "draft",
        legal_data: { sec21_run_id: runId, synthetic: true },
      }),
      requireRlsRejection,
    );

    const [draftId, forgedDraftId] = manifest.draftIds;
    await runRecorded(
      report,
      "drafts.a_creates_own",
      () => opsA.insertDraft({
        id: draftId,
        user_id: authA.userId,
        type: "legal",
        data: { sec21_run_id: runId, synthetic: true },
        current_step: 0,
      }),
      (result, name) => requireOwnRow(result, authA.userId, name),
    );
    await runRecorded(
      report,
      "drafts.b_cannot_read_a",
      () => opsB.readDraft(draftId),
      requireNoReadRows,
    );
    await runRecorded(
      report,
      "drafts.b_cannot_update_a",
      () => opsB.updateDraft(draftId, { current_step: 1 }),
      requireNoWriteRows,
    );
    await runRecorded(
      report,
      "drafts.b_cannot_delete_a",
      () => opsB.deleteDraft(draftId),
      requireNoWriteRows,
    );
    await runRecorded(
      report,
      "drafts.b_cannot_insert_as_a",
      () => opsB.insertDraft({
        id: forgedDraftId,
        user_id: authA.userId,
        type: "resume",
        data: { sec21_run_id: runId, synthetic: true },
        current_step: 0,
      }),
      requireRlsRejection,
    );

    report.status = "passed_records_pending_account_cleanup";
  } catch (error) {
    if (error instanceof StopConditionError) {
      report.status = "stopped";
      report.stop_code = error.code;
      record(report, error.scenario, "stopped", error.result || emptyResult());
    } else {
      report.status = "failed";
      report.stop_code = "internal_error";
    }
  } finally {
    if (signedInA && manifestPersisted) {
      const cleanupOk = await cleanupRun({ report, opsA, manifest });
      report.records_cleanup = cleanupOk ? "verified" : "failed";
      if (!cleanupOk) {
        report.status = "blocked_cleanup_failed";
        report.stop_code = "cleanup_failed";
      }
    }

    if (signedInB) {
      try {
        await opsB.signOut();
      } catch {
        // Sessao nao e evidencia e nenhum detalhe de erro deve sair no relatorio.
      }
    }
    if (signedInA) {
      try {
        await opsA.signOut();
      } catch {
        // Sessao nao e evidencia e nenhum detalhe de erro deve sair no relatorio.
      }
    }
  }

  return report;
}
