import { supabase } from "../lib/supabase";

/**
 * Acessa o endpoint protegido de métricas do painel admin.
 * O token de sessão é anexado automaticamente pelo Supabase client;
 * o edge function revalida autenticação e papel ADMIN (401/403).
 */
export const MetricsService = {
  async getMetrics(period = "30d") {
    const { data, error } = await supabase.functions.invoke(
      `admin-metrics?period=${encodeURIComponent(period)}`
    );

    if (error) throw new Error(error.message || "Falha ao carregar métricas");
    if (data?.error) throw new Error(data.error);

    return data;
  },
};
