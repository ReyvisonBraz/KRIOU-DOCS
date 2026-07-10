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
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

