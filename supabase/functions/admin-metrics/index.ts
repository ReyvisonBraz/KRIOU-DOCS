/**
 * ============================================
 * KRIOU DOCS — Admin Metrics API
 * ============================================
 * Edge Function protegida: exige usuário autenticado
 * com role === "admin" (equivalente a app/api/admin/metrics/route.ts).
 *
 * GET /admin-metrics?period=30d
 *
 * Períodos: 7d | 30d | 90d | 1y | all (padrão: 30d)
 * Respostas:
 *   200 — métricas do período
 *   401 — não autenticado
 *   403 — autenticado, mas não é admin
 *   400 — período inválido
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";
import { calculateMetrics, isMetricsPeriod } from "../_shared/metrics.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "GET") return json({ error: "Método não permitido" }, 405);

  try {
    // ── Autenticação (Supabase Auth) ──
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    // ── Autorização: apenas ADMIN ──
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return json({ error: "Acesso restrito a administradores" }, 403);
    }

    // ── Período via query parameter ──
    const url = new URL(req.url);
    const rawPeriod = url.searchParams.get("period") || "30d";

    if (!isMetricsPeriod(rawPeriod)) {
      return json({ error: "Período inválido. Use 7d, 30d, 90d, 1y ou all." }, 400);
    }

    // ── Cálculo das métricas ──
    const metrics = await calculateMetrics(supabase, rawPeriod);
    return json(metrics, 200);
  } catch (err) {
    console.error("[admin-metrics] Erro interno", err instanceof Error ? err.message : "desconhecido");
    return json({ error: "Erro interno ao calcular métricas" }, 500);
  }
});
