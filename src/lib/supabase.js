/**
 * ============================================
 * KRIOU DOCS - Supabase Client
 * ============================================
 * Cliente singleton do Supabase.
 * Importe { supabase } ou { isSupabaseConfigured } onde precisar.
 *
 * SEGURANCA:
 * - Usa a chave "anon" (publica) — segura para expor no client-side.
 * - A chave "service_role" NUNCA deve ser usada no frontend.
 * - RLS (Row Level Security) e a unica barreira entre usuarios.
 *
 * CONTRATO DE AMBIENTE:
 * - Local pode ficar offline somente com VITE_ALLOW_OFFLINE=true.
 * - Preview usa Supabase de homologacao e nunca o project-ref de producao.
 * - Producao exige o project-ref de producao.
 * - A validacao roda no build e novamente ao iniciar o cliente.
 *
 * LOGS: Prefixo [supabase] para facilitar filtragem.
 *
 * ERRO CRITICO: Em producao, a ausencia de credenciais joga excecao
 * com prefixo [supabase] — a aplicacao nao deve iniciar sem banco.
 * ============================================
 */

import { createClient } from "@supabase/supabase-js";
import { resolveClientEnvironment } from "../config/environment";

const environment = resolveClientEnvironment(import.meta.env);

if (!environment.supabaseConfigured) {
  console.warn(
    "[supabase] Modo offline local habilitado; autenticacao e persistencia remota estao indisponiveis.",
  );
}

const effectiveUrl = environment.supabaseUrl || "https://placeholder.supabase.co";
const effectiveKey = environment.supabaseKey || "placeholder-key";

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Indica se o Supabase esta configurado com credenciais reais.
 * Use isso para condicionar funcionalidades que precisam de auth.
 *
 * Exemplo:
 *   import { isSupabaseConfigured } from "../lib/supabase";
 *   if (isSupabaseConfigured) { /* ... *\/ }
 */
export const isSupabaseConfigured = environment.supabaseConfigured;
