import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const accounts = {
  user: {
    email: "user.e2e@kriou.local",
    password: "Kriou-E2E-User-2026!",
  },
  admin: {
    email: "admin.e2e@kriou.local",
    password: "Kriou-E2E-Admin-2026!",
  },
};

function localSupabaseStatus() {
  try {
    return JSON.parse(
      execFileSync("supabase", ["status", "--output", "json"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    throw new Error("Supabase local indisponível.");
  }
}

async function sessionFor(status, account) {
  const supabase = createClient(status.API_URL, status.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword(account);
  assert.ifError(error);
  assert(data.session?.access_token);
  return { supabase, token: data.session.access_token };
}

async function invoke(status, path, token, options = {}) {
  return fetch(`${status.API_URL}/functions/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: status.ANON_KEY,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
}

const status = localSupabaseStatus();
const [userSession, adminSession] = await Promise.all([
  sessionFor(status, accounts.user),
  sessionFor(status, accounts.admin),
]);

for (const path of ["admin?action=stats", "admin-metrics?period=30d"]) {
  const unauthenticated = await invoke(status, path);
  assert.equal(unauthenticated.status, 401, `${path} não bloqueou visitante.`);

  const insufficient = await invoke(status, path, userSession.token);
  assert.equal(insufficient.status, 403, `${path} não bloqueou usuário comum.`);

  const authorized = await invoke(status, path, adminSession.token);
  assert.equal(
    authorized.status,
    200,
    `${path} rejeitou administrador: ${await authorized.text()}`,
  );
}

async function createUnpaidDocument(session, label) {
  const { data: userData, error: userError } = await session.supabase.auth.getUser();
  assert.ifError(userError);
  const { data, error } = await session.supabase
    .from("documents")
    .insert({
      user_id: userData.user.id,
      type: "resume",
      title: `MFA security gate ${label}`,
      status: "draft",
    })
    .select("id")
    .single();
  assert.ifError(error);
  return data.id;
}

const [userDocumentId, adminDocumentId] = await Promise.all([
  createUnpaidDocument(userSession, "user"),
  createUnpaidDocument(adminSession, "admin"),
]);

const userDownload = await invoke(
  status,
  "authorize-download",
  userSession.token,
  { method: "POST", body: { documentId: userDocumentId } },
);
assert.equal(userDownload.status, 409, "Usuário acessou documento não pago.");

const adminWithoutMfa = await invoke(
  status,
  "authorize-download",
  adminSession.token,
  { method: "POST", body: { documentId: adminDocumentId } },
);
assert.equal(adminWithoutMfa.status, 403, "Admin AAL1 usou exceção de download.");
assert.equal((await adminWithoutMfa.json()).code, "mfa_required");

await Promise.all([
  userSession.supabase.from("documents").delete().eq("id", userDocumentId),
  adminSession.supabase.from("documents").delete().eq("id", adminDocumentId),
]);

console.log(
  "[Security] Edge Functions validam capacidades e bloqueiam exceção AAL1 sem MFA.",
);
