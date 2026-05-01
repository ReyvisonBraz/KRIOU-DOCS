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
 * AMBIENTE DE DEV:
 * - Sem .env.local configurado, o cliente usa placeholders para nao crashar.
 * - isSupabaseConfigured retorna false, permitindo condicionar features.
 * - Nao tenta fazer chamadas reais ao Supabase em modo offline.
 *
 * LOGS: Prefixo [supabase] para facilitar filtragem.
 *
 * ERRO CRITICO: Em producao, a ausencia de credenciais joga excecao
 * com prefixo [supabase] — a aplicacao nao deve iniciar sem banco.
 * ============================================
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isDev = import.meta.env.DEV;
const hasCredentials =
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseKey.includes("placeholder");

if (!supabaseUrl || !supabaseKey) {
  if (!isDev) {
    throw new Error(
      "[supabase][ERRO_CRITICO] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sao obrigatorias. Verifique o arquivo .env.local"
    );
  } else {
    console.warn(
      "[supabase] Credenciais nao configuradas. Rodando em modo offline (sem autenticacao). Configure .env.local para usar funcionalidades que precisam de login."
    );
  }
}

const effectiveUrl = supabaseUrl || "https://placeholder.supabase.co";
const effectiveKey = supabaseKey || "placeholder-key";

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
export const isSupabaseConfigured = hasCredentials;
