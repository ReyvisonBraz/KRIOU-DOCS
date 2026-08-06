import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const accounts = [
  { email: "document.owner@kriou.local", password: "Kriou-Document-Owner-2026!", role: "user" },
  { email: "document.admin@kriou.local", password: "Kriou-Document-Admin-2026!", role: "admin" },
];

const status = JSON.parse(execFileSync("supabase", ["status", "--output", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}));

function client(key) {
  return createClient(status.API_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const backend = client(status.SERVICE_ROLE_KEY);
const { data: directory, error: directoryError } = await backend.auth.admin.listUsers({ perPage: 1000 });
assert.ifError(directoryError);

const actors = [];
for (const account of accounts) {
  let user = directory.users.find(({ email }) => email === account.email);
  if (!user) {
    const { data, error } = await backend.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });
    assert.ifError(error);
    user = data.user;
  } else {
    const { error } = await backend.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
    });
    assert.ifError(error);
  }

  const { error: profileError } = await backend
    .from("profiles")
    .update({ role: account.role })
    .eq("id", user.id);
  assert.ifError(profileError);

  const authenticated = client(status.ANON_KEY);
  const { error: signInError } = await authenticated.auth.signInWithPassword(account);
  assert.ifError(signInError);
  await authenticated.from("document_drafts").delete().eq("user_id", user.id);
  await authenticated.from("documents").delete().eq("user_id", user.id);
  actors.push({ user, authenticated });
}

const [owner, admin] = actors;
const { data: document, error: insertError } = await owner.authenticated
  .from("documents")
  .insert({ user_id: owner.user.id, type: "resume", title: "Teste de lixeira", status: "finalizado" })
  .select("id, deleted_at")
  .single();
assert.ifError(insertError);
assert.equal(document.deleted_at, null);

const { error: forgedActorError } = await owner.authenticated
  .from("documents")
  .update({ deleted_at: new Date().toISOString(), deleted_by: admin.user.id })
  .eq("id", document.id);
assert(forgedActorError, "Proprietário conseguiu atribuir a exclusão a outro usuário.");

const { data: trashed, error: trashError } = await owner.authenticated
  .from("documents")
  .update({ deleted_at: new Date().toISOString(), deleted_by: owner.user.id })
  .eq("id", document.id)
  .eq("user_id", owner.user.id)
  .select("id, deleted_at, deleted_by")
  .single();
assert.ifError(trashError);
assert.equal(trashed.deleted_by, owner.user.id);

const { data: adminVisible, error: adminReadError } = await admin.authenticated
  .from("documents")
  .select("id")
  .eq("id", document.id);
assert.ifError(adminReadError);
assert.equal(adminVisible.length, 0, "Administrador viu documento de outro usuário via RLS.");

const { data: adminRestore, error: adminRestoreError } = await admin.authenticated
  .from("documents")
  .update({ deleted_at: null, deleted_by: null })
  .eq("id", document.id)
  .select("id");
assert.ifError(adminRestoreError);
assert.equal(adminRestore.length, 0, "Administrador restaurou documento de outro usuário.");

const { data: adminDelete, error: adminDeleteError } = await admin.authenticated
  .from("documents")
  .delete()
  .eq("id", document.id)
  .select("id");
assert.ifError(adminDeleteError);
assert.equal(adminDelete.length, 0, "Administrador excluiu documento de outro usuário.");

const { data: activeDocuments, error: activeError } = await owner.authenticated
  .from("documents")
  .select("id")
  .is("deleted_at", null);
assert.ifError(activeError);
assert.equal(activeDocuments.length, 0, "Documento na lixeira apareceu entre os ativos.");

const { error: restoreError } = await owner.authenticated
  .from("documents")
  .update({ deleted_at: null, deleted_by: null })
  .eq("id", document.id)
  .eq("user_id", owner.user.id);
assert.ifError(restoreError);

const { error: draftInsertError } = await owner.authenticated.from("document_drafts").upsert({
  user_id: owner.user.id,
  type: "resume",
  data: { nome: "Rascunho que não pode voltar" },
  current_step: 1,
}, { onConflict: "user_id,type" });
assert.ifError(draftInsertError);

const { error: draftDeleteError } = await owner.authenticated
  .from("document_drafts")
  .delete()
  .eq("user_id", owner.user.id)
  .eq("type", "resume");
assert.ifError(draftDeleteError);
const { count: draftCount, error: draftCountError } = await owner.authenticated
  .from("document_drafts")
  .select("*", { count: "exact", head: true });
assert.ifError(draftCountError);
assert.equal(draftCount, 0, "Rascunho permaneceu na nuvem após a exclusão.");

const { data: permanentlyDeleted, error: permanentError } = await owner.authenticated
  .from("documents")
  .delete()
  .eq("id", document.id)
  .eq("user_id", owner.user.id)
  .select("id");
assert.ifError(permanentError);
assert.equal(permanentlyDeleted.length, 1, "Exclusão definitiva não foi confirmada.");

console.log("[Document Sync] lixeira individual, integridade, isolamento de admin e rascunhos validados.");
