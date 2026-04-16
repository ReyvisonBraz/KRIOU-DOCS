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
  const [user, setUser]                   = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Lê sessão existente salva pelo Supabase no localStorage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Escuta mudanças em tempo real (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Helpers de conveniência
  const userId      = user?.id ?? null;
  const displayName = user?.user_metadata?.full_name
                   || user?.user_metadata?.name
                   || user?.email?.split("@")[0]
                   || "Usuário";
  const avatarUrl   = user?.user_metadata?.avatar_url ?? null;
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
