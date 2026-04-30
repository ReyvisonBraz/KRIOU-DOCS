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

      console.log("[AuthCallback] Session:", session);

      if (!session) {
        console.log("[AuthCallback] Sem sessão, redirecionando para login");
        onNavigate("login");
        return;
      }

      try {
        console.log("[AuthCallback] Buscando perfil...");
        const profile = await DocumentService.fetchProfile();
        console.log("[AuthCallback] Profile:", profile);
        
        if (!DocumentService.isProfileComplete(profile)) {
          console.log("[AuthCallback] Perfil incompleto, indo pra completeProfile");
          onNavigate("completeProfile");
        } else {
          console.log("[AuthCallback] Perfil completo, indo pra dashboard");
          const seen = localStorage.getItem(`kriou_onboarding_${session.user.id}_seen`);
          onNavigate(seen ? "dashboard" : "welcome");
        }
      } catch (err) {
        console.error("[AuthCallback] Erro:", err);
        onNavigate("dashboard");
      }
    };

    // Timeout fallback: se em 3s não resolver, recarrega a página
    const timeout = setTimeout(() => {
      console.log("[AuthCallback] Timeout! Recarregando página...");
      window.location.reload();
    }, 3000);

    // Tenta pegar sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthCallback] getSession result:", session ? "OK" : "NULL");
      if (session) {
        clearTimeout(timeout);
        resolve(session);
      }
    });

    // Escuta SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthCallback] Auth event:", event, session ? "with session" : "without session");
      if (event === "SIGNED_IN" && session) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(session);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [onNavigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-4">
      <div className="w-10 h-10 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-text-muted text-sm">Finalizando autenticação...</p>
      <p className="text-text-muted text-xs">Se demorar, aguarde...</p>
    </div>
  );
};

export default AuthCallbackPage;
