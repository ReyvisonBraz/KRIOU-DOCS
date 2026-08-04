import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const accounts = [
  {
    email: "security.a@kriou.local",
    password: "Kriou-Security-A-2026!",
    nome: "Security A",
  },
  {
    email: "security.b@kriou.local",
    password: "Kriou-Security-B-2026!",
    nome: "Security B",
  },
];

function localSupabaseStatus() {
  try {
    return JSON.parse(
      execFileSync("supabase", ["status", "--output", "json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    throw new Error(
      "Supabase local indisponível. Execute `supabase start` antes do teste de segurança.",
    );
  }
}

function client(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAccount(adminClient, account) {
  const { data: usersData, error: listError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });
  assert.ifError(listError);

  let user = usersData.users.find(({ email }) => email === account.email);
  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });
    assert.ifError(error);
    user = data.user;
  } else {
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
    });
    assert.ifError(error);
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ nome: account.nome, role: "user", onboarding_done: true })
    .eq("id", user.id);
  assert.ifError(profileError);

  return user;
}

async function authenticatedClient(status, account) {
  const authenticated = client(status.API_URL, status.ANON_KEY);
  const { error } = await authenticated.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  assert.ifError(error);
  return authenticated;
}

async function seedOwnedRows(authenticated, userId, suffix) {
  const { data: document, error: documentError } = await authenticated
    .from("documents")
    .insert({
      user_id: userId,
      type: "resume",
      title: `Security document ${suffix}`,
      status: "draft",
    })
    .select("id")
    .single();
  assert.ifError(documentError);

  const { data: draft, error: draftError } = await authenticated
    .from("document_drafts")
    .upsert(
      {
        user_id: userId,
        type: suffix === "A" ? "resume" : "legal",
        data: { securityTest: suffix },
        current_step: 1,
      },
      { onConflict: "user_id,type" },
    )
    .select("id")
    .single();
  assert.ifError(draftError);

  return { documentId: document.id, draftId: draft.id };
}

async function assertVisibleIds(authenticated, table, ownId, otherId) {
  const { data, error } = await authenticated
    .from(table)
    .select("id")
    .in("id", [ownId, otherId]);
  assert.ifError(error);
  assert.equal(data.length, 1);
  assert.equal(data[0].id, ownId);
}

const status = localSupabaseStatus();
const backend = client(status.API_URL, status.SERVICE_ROLE_KEY);
const users = await Promise.all(
  accounts.map((account) => ensureAccount(backend, account)),
);
const [clientA, clientB] = await Promise.all(
  accounts.map((account) => authenticatedClient(status, account)),
);

const [rowsA, rowsB] = await Promise.all([
  seedOwnedRows(clientA, users[0].id, "A"),
  seedOwnedRows(clientB, users[1].id, "B"),
]);

await assertVisibleIds(clientA, "profiles", users[0].id, users[1].id);
await assertVisibleIds(clientA, "documents", rowsA.documentId, rowsB.documentId);
await assertVisibleIds(clientA, "document_drafts", rowsA.draftId, rowsB.draftId);
await assertVisibleIds(clientB, "profiles", users[1].id, users[0].id);
await assertVisibleIds(clientB, "documents", rowsB.documentId, rowsA.documentId);
await assertVisibleIds(clientB, "document_drafts", rowsB.draftId, rowsA.draftId);

const { error: roleEscalationError } = await clientA
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", users[0].id);
assert(roleEscalationError, "Usuário comum conseguiu alterar o próprio papel.");

const { data: crossUpdate, error: crossUpdateError } = await clientA
  .from("documents")
  .update({ title: "Cross-account update" })
  .eq("id", rowsB.documentId)
  .select("id");
assert.ifError(crossUpdateError);
assert.equal(crossUpdate.length, 0, "Usuário A alterou documento do usuário B.");

const { data: auditRead, error: auditReadError } = await clientA
  .from("admin_audit_events")
  .select("id")
  .limit(1);
assert(
  auditReadError || auditRead.length === 0,
  "Usuário autenticado conseguiu ler auditoria administrativa.",
);

const operationId = randomUUID();
const { data: audit, error: auditInsertError } = await backend
  .from("admin_audit_events")
  .insert({
    operation_id: operationId,
    request_id: `security-${operationId}`,
    actor_id: users[0].id,
    action: "security.baseline",
    target_type: "security_test",
    target_id: users[1].id,
    reason: "Validar imutabilidade append-only no ambiente local",
    result: "success",
  })
  .select("id, reason")
  .single();
assert.ifError(auditInsertError);

const { error: auditUpdateError } = await backend
  .from("admin_audit_events")
  .update({ reason: "Tentativa de sobrescrita" })
  .eq("id", audit.id);
assert(auditUpdateError, "Backend normal conseguiu alterar evento de auditoria.");

const { error: auditDeleteError } = await backend
  .from("admin_audit_events")
  .delete()
  .eq("id", audit.id);
assert(auditDeleteError, "Backend normal conseguiu apagar evento de auditoria.");

const { data: preservedAudit, error: preservedAuditError } = await backend
  .from("admin_audit_events")
  .select("reason")
  .eq("id", audit.id)
  .single();
assert.ifError(preservedAuditError);
assert.equal(
  preservedAudit.reason,
  "Validar imutabilidade append-only no ambiente local",
);

const { data: userAuthorization, error: userAuthorizationError } =
  await backend.rpc("kriou_admin_authorization", { actor_id: users[0].id });
assert.ifError(userAuthorizationError);
assert.equal(userAuthorization, null, "Usuário comum recebeu capacidades administrativas.");

const { error: promoteLegacyError } = await backend
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", users[1].id);
assert.ifError(promoteLegacyError);

const { data: synced, error: syncError } = await backend.rpc(
  "kriou_admin_sync_legacy_assignment",
  { target_user_id: users[1].id },
);
assert.ifError(syncError);
assert.equal(synced, true);

const { data: adminAuthorization, error: adminAuthorizationError } =
  await backend.rpc("kriou_admin_authorization", { actor_id: users[1].id });
assert.ifError(adminAuthorizationError);
assert.equal(adminAuthorization.role, "admin");
assert(adminAuthorization.capabilities.includes("admin.dashboard.read"));
assert(adminAuthorization.capabilities.includes("admin.legacy.read"));
assert(!adminAuthorization.capabilities.includes("roles.manage"));

const { error: exposedAuthorizationError } = await clientA.rpc(
  "kriou_admin_authorization",
  { actor_id: users[1].id },
);
assert(
  exposedAuthorizationError,
  "Cliente autenticado conseguiu consultar capacidades administrativas.",
);

console.log(
  "[Security] RLS, capacidades privadas, autoelevação e auditoria append-only comprovadas.",
);
