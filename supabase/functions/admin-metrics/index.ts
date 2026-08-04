/**
 * ============================================
 * KRIOU DOCS — Admin Metrics API
 * ============================================
 * Edge Function protegida: exige usuário autenticado com a capacidade privada
 * admin.dashboard.read.
 *
 * GET /admin-metrics?period=30d
 *
 * Períodos: 7d | 30d | 90d | 1y | all (padrão: 30d)
 * Respostas:
 *   200 — métricas do período
 *   401 — não autenticado
 *   403 — autenticado, mas sem capacidade suficiente
 *   400 — período inválido
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  createAdminClient,
  getAdminAuthorization,
  hasAdminCapability,
} from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";
import { calculateMetrics, isMetricsPeriod } from "../_shared/metrics.ts";

function diagnosticError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  if (error && typeof error === "object") {
    const candidate = error as Record<string, unknown>;
    return {
      code: typeof candidate.code === "string" ? candidate.code : undefined,
      message: typeof candidate.message === "string" ? candidate.message : "erro não identificado",
      details: typeof candidate.details === "string" ? candidate.details : undefined,
      hint: typeof candidate.hint === "string" ? candidate.hint : undefined,
    };
  }

  return { message: String(error) };
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "GET") return json({ error: "Método não permitido" }, 405);

  try {
    // ── Autenticação (Supabase Auth) ──
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    const authorization = await getAdminAuthorization(supabase, user.id);
    if (!hasAdminCapability(authorization, "admin.dashboard.read")) {
      return json({ error: "Capacidade administrativa insuficiente" }, 403);
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
    // Não registra tokens, payloads nem conteúdo documental. Erros estruturados
    // do PostgREST são preservados para tornar incidentes diagnosticáveis.
    console.error("[admin-metrics] Erro interno", diagnosticError(err));
    return json({ error: "Erro interno ao calcular métricas" }, 500);
  }
});
