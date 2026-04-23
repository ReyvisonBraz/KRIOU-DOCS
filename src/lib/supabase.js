/**
 * ============================================
 * KRIOU DOCS - Supabase Client
 * ============================================
 * Cliente singleton. Importe { supabase } onde precisar.
 *
 * Em ambiente de desenvolvimento sem credenciais configuradas,
 * o cliente é criado em modo "stub" para não derrubar a aplicação.
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
    // Em produção, a ausência de credenciais é um erro crítico
    throw new Error(
      "[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Verifique o arquivo .env.local"
    );
  } else {
    console.warn(
      "[supabase] ⚠️  Credenciais não configuradas. Rodando em modo offline (sem autenticação). Configure .env.local para usar funcionalidades que precisam de login."
    );
  }
}

// Em dev sem credenciais reais, usa placeholders para não crashar
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
 * Indica se o Supabase está configurado com credenciais reais.
 * Use isso para condicionar funcionalidades que precisam de auth.
 */
export const isSupabaseConfigured = hasCredentials;
