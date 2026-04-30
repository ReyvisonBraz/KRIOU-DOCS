/**
 * ============================================
 * KRIOU DOCS - Auth Context (Supabase)
 * ============================================
 * Gerencia sessão via Supabase Auth + Google OAuth.
 * Substitui o fluxo mock de telefone/OTP.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession]             = useState(null);
  const [user, setUser]                 = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Lê sessão existente salva pelo Supabase no localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthContext] getSession:", session ? "OK" : "NULL");
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Escuta mudanças em tempo real (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthContext] onAuthStateChange:", event, session ? "with session" : "without session");
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    console.log("[AuthContext] signInWithGoogle called");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("[AuthContext] OAuth error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    console.log("[AuthContext] logout called");
    await supabase.auth.signOut();
  }, []);

  // Extrair metadados do usuário (Supabase pode guardar em raw_user_meta_data)
  const rawMeta = user?.raw_user_meta_data || {};
  const meta = user?.user_metadata || rawMeta;

  // Helpers de conveniência
  const userId      = user?.id ?? null;
  const displayName = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "Usuário";
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

  console.log("[AuthContext] render:", { userId, displayName, email, isAuthLoading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
