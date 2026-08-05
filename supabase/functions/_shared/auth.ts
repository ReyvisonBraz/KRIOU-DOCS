import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    throw new Error("Configuração do Supabase ausente");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function authenticate(req: Request, supabase: ReturnType<typeof createAdminClient>) {
  const token = accessToken(req);

  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

export function accessToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

export async function getAuthenticatorAssuranceLevel(
  req: Request,
  supabase: ReturnType<typeof createAdminClient>,
) {
  const token = accessToken(req);
  if (!token) return null;

  const { data, error } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel(token);
  if (error) throw new Error("Falha ao validar nível de autenticação");

  return data.currentLevel === "aal2" ? "aal2" : "aal1";
}

export async function hasAal2(
  req: Request,
  supabase: ReturnType<typeof createAdminClient>,
) {
  return (await getAuthenticatorAssuranceLevel(req, supabase)) === "aal2";
}

export type AdminRole = "support" | "finance" | "admin" | "owner";

export type AdminAuthorization = {
  role: AdminRole;
  capabilities: string[];
};

export async function getAdminAuthorization(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<AdminAuthorization | null> {
  const { data, error } = await supabase.rpc("kriou_admin_authorization", {
    actor_id: userId,
  });

  if (error) throw new Error("Falha ao consultar autorização administrativa");
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const candidate = data as Record<string, unknown>;
  if (
    !["support", "finance", "admin", "owner"].includes(String(candidate.role)) ||
    !Array.isArray(candidate.capabilities) ||
    !candidate.capabilities.every((item) => typeof item === "string")
  ) {
    throw new Error("Contrato de autorização administrativa inválido");
  }

  return {
    role: candidate.role as AdminRole,
    capabilities: candidate.capabilities,
  };
}

export function hasAdminCapability(
  authorization: AdminAuthorization | null,
  capability: string,
) {
  return authorization?.capabilities.includes(capability) === true;
}
