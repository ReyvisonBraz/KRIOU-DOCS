/**
 * ============================================
 * KRIOU DOCS - Auth Callback Page
 * ============================================
 * Página intermediária que o Google redireciona após OAuth.
 * Aguarda a sessão Supabase ser estabelecida, verifica se o
 * perfil está completo e redireciona para a página correta.
 */

import React, { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);

  useEffect(() => {
    const resolve = async (session) => {
      if (handled.current) return;
      handled.current = true;

      if (!session) {
        onNavigate("login");
        return;
      }

      try {
        const profile = await DocumentService.fetchProfile();
        if (DocumentService.isProfileComplete(profile)) {
          onNavigate("dashboard");
        } else {
          onNavigate("completeProfile");
        }
      } catch {
        onNavigate("dashboard");
      }
    };

    // Tenta pegar sessão já processada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) resolve(session);
    });

    // Escuta o evento SIGNED_IN caso ainda esteja processando o token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        resolve(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [onNavigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-4">
      <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-text-muted text-sm">Finalizando autenticação...</p>
    </div>
  );
};

export default AuthCallbackPage;
