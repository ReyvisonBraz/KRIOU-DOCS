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

async function tokenFor(status, account) {
  const supabase = createClient(status.API_URL, status.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword(account);
  assert.ifError(error);
  assert(data.session?.access_token);
  return data.session.access_token;
}

async function invoke(status, path, token) {
  return fetch(`${status.API_URL}/functions/v1/${path}`, {
    method: "GET",
    headers: {
      apikey: status.ANON_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

const status = localSupabaseStatus();
const [userToken, adminToken] = await Promise.all([
  tokenFor(status, accounts.user),
  tokenFor(status, accounts.admin),
]);

for (const path of ["admin?action=stats", "admin-metrics?period=30d"]) {
  const unauthenticated = await invoke(status, path);
  assert.equal(unauthenticated.status, 401, `${path} não bloqueou visitante.`);

  const insufficient = await invoke(status, path, userToken);
  assert.equal(insufficient.status, 403, `${path} não bloqueou usuário comum.`);

  const authorized = await invoke(status, path, adminToken);
  assert.equal(
    authorized.status,
    200,
    `${path} rejeitou administrador: ${await authorized.text()}`,
  );
}

console.log(
  "[Security] Edge Functions administrativas retornam 401/403/200 conforme a capacidade.",
);
