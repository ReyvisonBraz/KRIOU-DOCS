import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
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
  owner: {
    email: "owner.e2e@kriou.local",
    password: "Kriou-E2E-Owner-2026!",
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

async function resetTestMfa(status, account) {
  const backend = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: usersData, error: usersError } =
    await backend.auth.admin.listUsers({ perPage: 1000 });
  assert.ifError(usersError);

  const user = usersData.users.find(({ email }) => email === account.email);
  assert(user, `Conta local de teste ausente: ${account.email}`);

  const { data: factorsData, error: factorsError } =
    await backend.auth.admin.mfa.listFactors({ userId: user.id });
  assert.ifError(factorsError);

  for (const factor of factorsData.factors) {
    const { error } = await backend.auth.admin.mfa.deleteFactor({
      userId: user.id,
      id: factor.id,
    });
    assert.ifError(error);
  }
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

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bits = value.toUpperCase().replace(/=+$/g, "")
    .split("")
    .map((character) => alphabet.indexOf(character).toString(2).padStart(5, "0"))
    .join("");
  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function currentTotp(secret) {
  const counter = BigInt(Math.floor(Date.now() / 1000 / 30));
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(counter);
  const digest = createHmac("sha1", decodeBase32(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(binary).padStart(6, "0");
}

const status = localSupabaseStatus();
await resetTestMfa(status, accounts.owner);
const [userSession, adminSession, ownerSession] = await Promise.all([
  sessionFor(status, accounts.user),
  sessionFor(status, accounts.admin),
  sessionFor(status, accounts.owner),
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

const ownerAal1Token = ownerSession.token;
const { data: ownerEnrollment, error: ownerEnrollmentError } =
  await ownerSession.supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Owner integration ${randomUUID()}`,
  });
assert.ifError(ownerEnrollmentError);
const { error: ownerVerifyError } =
  await ownerSession.supabase.auth.mfa.challengeAndVerify({
    factorId: ownerEnrollment.id,
    code: currentTotp(ownerEnrollment.totp.secret),
  });
assert.ifError(ownerVerifyError);
const { data: ownerSessionData, error: refreshedOwnerError } =
  await ownerSession.supabase.auth.getSession();
assert.ifError(refreshedOwnerError);
const ownerAal2Token = ownerSessionData.session?.access_token;
assert(ownerAal2Token, "Sessão owner não foi elevada para AAL2.");

const { data: targetUserData, error: targetUserError } =
  await userSession.supabase.auth.getUser();
assert.ifError(targetUserError);
const roleOperationId = randomUUID();
const roleChangeBody = {
  targetUserId: targetUserData.user.id,
  role: "support",
  reason: "Validar mudança transacional de papel no ambiente local",
  operationId: roleOperationId,
};

const adminCannotManageRoles = await invoke(status, "admin-access", adminSession.token, {
  method: "POST",
  body: roleChangeBody,
});
assert.equal(adminCannotManageRoles.status, 403);

const ownerWithoutMfa = await invoke(status, "admin-access", ownerAal1Token, {
  method: "POST",
  body: roleChangeBody,
});
assert.equal(ownerWithoutMfa.status, 403);
assert.equal((await ownerWithoutMfa.json()).code, "mfa_required");

const ownerPromotionBlocked = await invoke(status, "admin-access", ownerAal2Token, {
  method: "POST",
  body: { ...roleChangeBody, role: "owner", operationId: randomUUID() },
});
assert.equal(ownerPromotionBlocked.status, 400);

const { data: ownerUserData, error: ownerUserError } =
  await ownerSession.supabase.auth.getUser();
assert.ifError(ownerUserError);
const ownerSelfChange = await invoke(status, "admin-access", ownerAal2Token, {
  method: "POST",
  body: {
    ...roleChangeBody,
    targetUserId: ownerUserData.user.id,
    role: "admin",
    operationId: randomUUID(),
  },
});
assert.equal(ownerSelfChange.status, 403);

const roleChange = await invoke(status, "admin-access", ownerAal2Token, {
  method: "POST",
  body: roleChangeBody,
});
assert.equal(roleChange.status, 200, await roleChange.text());

const repeatedRoleChange = await invoke(status, "admin-access", ownerAal2Token, {
  method: "POST",
  body: roleChangeBody,
});
const repeatedRoleChangeBody = await repeatedRoleChange.json();
assert.equal(repeatedRoleChange.status, 200, JSON.stringify(repeatedRoleChangeBody));
assert.equal(repeatedRoleChangeBody.idempotent, true);

const backend = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: targetAuthorization, error: targetAuthorizationError } =
  await backend.rpc("kriou_admin_authorization", { actor_id: targetUserData.user.id });
assert.ifError(targetAuthorizationError);
assert.equal(targetAuthorization.role, "support");

const { count: auditCount, error: auditCountError } = await backend
  .from("admin_audit_events")
  .select("id", { count: "exact", head: true })
  .eq("operation_id", roleOperationId)
  .eq("action", "admin.role.change");
assert.ifError(auditCountError);
assert.equal(auditCount, 1, "Operação repetida duplicou a auditoria.");

const removeRole = await invoke(status, "admin-access", ownerAal2Token, {
  method: "POST",
  body: { ...roleChangeBody, role: "none", operationId: randomUUID() },
});
assert.equal(removeRole.status, 200, await removeRole.text());

console.log(
  "[Security] Edge Functions validam capacidades, AAL2 e papéis transacionais.",
);
