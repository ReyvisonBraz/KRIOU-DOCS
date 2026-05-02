/**
 * ============================================
 * KRIOU DOCS - Auth Context (Supabase)
 * ============================================
 * Gerencia sessao via Supabase Auth + Google OAuth.
 *
 * FLUXO:
 *   1. getSession() na montagem — restaura sessao existente
 *   2. onAuthStateChange — escuta login/logout/refresh em tempo real
 *   3. signInWithGoogle — inicia fluxo OAuth
 *   4. logout — limpa sessao
 *
 * ESTADOS:
 *   - isAuthLoading=true  → sessao ainda nao resolvida (mostra spinner)
 *   - isAuthLoading=false + userId     → usuario autenticado
 *   - isAuthLoading=false + userId=null → usuario nao autenticado
 *
 * SEGURANCA:
 * - Sessao gerenciada pelo Supabase (localStorage) — nao armazenamos
 *   tokens manualmente.
 * - Nao usar saveSession/loadSession do StorageService (deprecated).
 *
 * LOGS: Prefixo [AuthContext] para facilitar filtragem.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession]             = useState(null);
  const [user, setUser]                   = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ─── Inicializacao ──────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setSession(session);
        setUser(session.user ?? null);
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      console.log(`[AuthContext] onAuthStateChange: ${event}`, session?.user?.email ?? "sem user");
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Login com Google ───────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    console.log("[AuthContext] signInWithGoogle: iniciando OAuth...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("[AuthContext][ERRO] signInWithGoogle:", error.message);
      throw error;
    }
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // ─── Metadados do usuario ────────────────────────────────────────────────────
  const rawMeta = user?.raw_user_meta_data || {};
  const meta = user?.user_metadata || rawMeta;

  const userId      = user?.id ?? null;
  const displayName = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "Usuario";
  const avatarUrl   = meta?.avatar_url ?? null;
  const email       = user?.email ?? null;

  const value = {
    session,
    user,
    userId,
    displayName,
    avatarUrl,
    email,
    isAuthLoading,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("[AuthContext] useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};