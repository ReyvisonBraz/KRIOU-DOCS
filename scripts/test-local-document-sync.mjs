import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const account = {
  email: "document.sync@kriou.local",
  password: "Kriou-Document-Sync-2026!",
};

const status = JSON.parse(execFileSync("supabase", ["status", "--output", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}));
const backend = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authenticated = createClient(status.API_URL, status.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: directory, error: directoryError } = await backend.auth.admin.listUsers({ perPage: 1000 });
assert.ifError(directoryError);
let user = directory.users.find(({ email }) => email === account.email);
if (!user) {
  const { data, error } = await backend.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  });
  assert.ifError(error);
  user = data.user;
}

const { error: signInError } = await authenticated.auth.signInWithPassword(account);
assert.ifError(signInError);
await backend.from("document_drafts").delete().eq("user_id", user.id);
await backend.from("documents").delete().eq("user_id", user.id);

const { data: document, error: insertError } = await authenticated
  .from("documents")
  .insert({ user_id: user.id, type: "resume", title: "Teste de lixeira", status: "finalizado" })
  .select("id, deleted_at")
  .single();
assert.ifError(insertError);
assert.equal(document.deleted_at, null);

const { data: trashed, error: trashError } = await authenticated
  .from("documents")
  .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
  .eq("id", document.id)
  .eq("user_id", user.id)
  .select("id, deleted_at")
  .single();
assert.ifError(trashError);
assert(trashed.deleted_at, "Documento não foi movido para a lixeira.");

const { data: activeDocuments, error: activeError } = await authenticated
  .from("documents")
  .select("id")
  .eq("user_id", user.id)
  .is("deleted_at", null);
assert.ifError(activeError);
assert.equal(activeDocuments.length, 0, "Documento na lixeira apareceu entre os ativos.");

const { error: restoreError } = await authenticated
  .from("documents")
  .update({ deleted_at: null, deleted_by: null })
  .eq("id", document.id)
  .eq("user_id", user.id);
assert.ifError(restoreError);

const { error: draftInsertError } = await authenticated.from("document_drafts").upsert({
  user_id: user.id,
  type: "resume",
  data: { nome: "Rascunho que não pode voltar" },
  current_step: 1,
}, { onConflict: "user_id,type" });
assert.ifError(draftInsertError);

const { error: draftDeleteError } = await authenticated
  .from("document_drafts")
  .delete()
  .eq("user_id", user.id)
  .eq("type", "resume");
assert.ifError(draftDeleteError);
const { count: draftCount, error: draftCountError } = await authenticated
  .from("document_drafts")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);
assert.ifError(draftCountError);
assert.equal(draftCount, 0, "Rascunho permaneceu na nuvem após a exclusão.");

const { data: permanentlyDeleted, error: permanentError } = await authenticated
  .from("documents")
  .delete()
  .eq("id", document.id)
  .eq("user_id", user.id)
  .select("id");
assert.ifError(permanentError);
assert.equal(permanentlyDeleted.length, 1, "Exclusão definitiva não foi confirmada.");

console.log("[Document Sync] lixeira, restauração, rascunho e exclusão definitiva validados localmente.");
