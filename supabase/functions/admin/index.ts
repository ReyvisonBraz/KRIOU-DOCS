// ============================================
// KRIOU DOCS — Admin API
// ============================================
// Supabase Edge Function protegida por service_role.
// Requer que o usuário seja admin (profile.role === 'admin').
//
// POST /admin  { action: "stats" }
// POST /admin  { action: "users", page, pageSize, search }
// POST /admin  { action: "user-docs", userId }
//
// A lógica de cada ação está em _shared/admin.ts, testável no Vitest.
// Este arquivo só cuida de CORS, autenticação e roteamento — mesmo padrão
// de authorize-download e export-user-data.
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";
import { getStats, getUserDocs, getUsers } from "../_shared/admin.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) return json({ error: "Perfil não encontrado" }, 403);
    if (profile.role !== "admin") return json({ error: "Acesso restrito a administradores" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    switch (action) {
      case "stats":
        return json(await getStats(supabase));

      case "users":
        return json(await getUsers(supabase, body));

      case "user-docs": {
        if (!body?.userId || typeof body.userId !== "string") {
          return json({ error: "userId é obrigatório" }, 400);
        }
        return json(await getUserDocs(supabase, body.userId));
      }

      default:
        return json({ error: "Ação inválida. Use: stats, users, user-docs" }, 400);
    }
  } catch (error) {
    console.error("[admin] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao processar solicitação administrativa" }, 500);
  }
});
