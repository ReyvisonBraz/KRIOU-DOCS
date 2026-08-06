import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const accounts = [
  {
    role: "user",
    email: "user.e2e@kriou.local",
    password: "Kriou-E2E-User-2026!",
    nome: "Usuario",
  },
  {
    role: "admin",
    email: "admin.e2e@kriou.local",
    password: "Kriou-E2E-Admin-2026!",
    nome: "Admin",
  },
  {
    role: "owner",
    email: "owner.e2e@kriou.local",
    password: "Kriou-E2E-Owner-2026!",
    nome: "Owner",
  },
];

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
      "Supabase local indisponível. Execute `supabase start` antes do E2E autenticado.",
    );
  }
}

function storageState(apiUrl, session) {
  const projectRef = new URL(apiUrl).hostname.split(".")[0];
  const appOrigin = process.env.E2E_BASE_URL || "http://localhost:5173";
  return {
    cookies: [],
    origins: [
      {
        origin: appOrigin,
        localStorage: [
          {
            name: `sb-${projectRef}-auth-token`,
            value: JSON.stringify(session),
          },
        ],
      },
    ],
  };
}

const status = localSupabaseStatus();
const adminClient = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const publicClient = createClient(status.API_URL, status.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: usersData, error: listError } =
  await adminClient.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;

const authDirectory = path.resolve("e2e/.auth");
await mkdir(authDirectory, { recursive: true });
const accountIds = new Map();

for (const account of accounts) {
  let user = usersData.users.find((candidate) => candidate.email === account.email);

  if (user && account.role !== "user") {
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) throw error;
    user = null;
  }

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
    });
    if (error) throw error;
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      role: account.role === "user" ? "user" : "admin",
      nome: account.nome,
      sobrenome: "E2E",
      cpf: "00000000000",
      onboarding_done: true,
    })
    .eq("id", user.id);
  if (profileError) throw profileError;
  accountIds.set(account.role, user.id);

  if (account.role !== "user") {
    const { data: synced, error: syncError } = await adminClient.rpc(
      "kriou_admin_sync_legacy_assignment",
      { target_user_id: user.id },
    );
    if (syncError || !synced) {
      throw syncError || new Error("Papel administrativo privado não sincronizado");
    }
  }

  const { data: authData, error: authError } =
    await publicClient.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
  if (authError || !authData.session) {
    throw authError || new Error(`Sessão E2E não criada para ${account.role}`);
  }

  let storageSession = authData.session;
  if (account.role !== "user") {
    const { data: enrollment, error: enrollmentError } = await publicClient.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `${account.role} E2E local`,
    });
    if (enrollmentError) throw enrollmentError;

    const { error: verifyError } = await publicClient.auth.mfa.challengeAndVerify({
      factorId: enrollment.id,
      code: currentTotp(enrollment.totp.secret),
    });
    if (verifyError) throw verifyError;

    const { data: elevatedData, error: elevatedError } = await publicClient.auth.getSession();
    if (elevatedError || !elevatedData.session) {
      throw elevatedError || new Error(`Sessão AAL2 não criada para ${account.role}`);
    }
    storageSession = elevatedData.session;
  }

  await writeFile(
    path.join(authDirectory, `${account.role}.json`),
    `${JSON.stringify(storageState(status.API_URL, storageSession), null, 2)}\n`,
    { mode: 0o600 },
  );
}

// Documento determinístico para validar o ciclo da lixeira pelo navegador.
const userAccount = accounts.find(({ role }) => role === "user");
const userClient = createClient(status.API_URL, status.ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { error: userSignInError } = await userClient.auth.signInWithPassword({
  email: userAccount.email,
  password: userAccount.password,
});
if (userSignInError) throw userSignInError;
const { error: staleTrashFixtureError } = await userClient
  .from("documents")
  .delete()
  .eq("title", "Documento lixeira E2E");
if (staleTrashFixtureError) throw staleTrashFixtureError;
const { error: trashFixtureError } = await userClient.from("documents").insert({
  user_id: accountIds.get("user"),
  type: "resume",
  title: "Documento lixeira E2E",
  status: "finalizado",
});
if (trashFixtureError) throw trashFixtureError;

const sql = postgres(status.DB_URL, { max: 1 });
try {
  await sql.begin(async (transaction) => {
    await transaction`
      DELETE FROM private.admin_role_assignments
      WHERE user_id = ${accountIds.get("user")}::uuid
    `;

    await transaction`
      INSERT INTO private.admin_role_assignments (
        user_id, role, assigned_by, reason, created_at, updated_at
      ) VALUES (
        ${accountIds.get("admin")}::uuid,
        'admin',
        ${accountIds.get("owner")}::uuid,
        'Admin determinístico exclusivo do ambiente local de testes',
        now(),
        now()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET role = 'admin',
          assigned_by = excluded.assigned_by,
          reason = excluded.reason,
          updated_at = now()
    `;

    await transaction`
      INSERT INTO private.admin_role_assignments (
        user_id, role, assigned_by, reason, created_at, updated_at
      ) VALUES (
        ${accountIds.get("owner")}::uuid,
        'owner',
        ${accountIds.get("owner")}::uuid,
        'Owner determinístico exclusivo do ambiente local de testes',
        now(),
        now()
      )
      ON CONFLICT (user_id) DO UPDATE
      SET role = 'owner',
          assigned_by = excluded.assigned_by,
          reason = excluded.reason,
          updated_at = now()
    `;
  });
} finally {
  await sql.end();
}

console.log("[E2E] Sessões locais determinísticas criadas: user, admin e owner.");
