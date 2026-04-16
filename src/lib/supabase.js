/**
 * ============================================
 * KRIOU DOCS - Supabase Client
 * ============================================
 * Cliente singleton. Importe { supabase } onde precisar.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "[supabase] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. Verifique o arquivo .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
