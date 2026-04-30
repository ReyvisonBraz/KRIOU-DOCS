/**
 * ============================================
 * KRIOU DOCS - Auth Callback Page
 * ============================================
 * Página intermediária que o Google redireciona após OAuth.
 * Aguarda a sessão Supabase ser estabelecida, verifica se o
 * perfil está completo e redireciona para a página correta.
 */

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);
  const [status, setStatus] = useState("Iniciando...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const resolve = async (session) => {
      if (handled.current) return;
      handled.current = true;
      setStatus("Verificando sessão...");

      if (!session) {
        console.error("[AuthCallback] SEM SESSÃO - redirecionando para login");
        setError("Sessão não encontrada. Tentando novamente...");
        setTimeout(() => onNavigate("login"), 2000);
        return;
      }

      setStatus("Sessão encontrada! Buscando perfil...");
      console.log("[AuthCallback] Session OK, user:", session.user?.id);

      try {
        const profile = await DocumentService.fetchProfile();
        console.log("[AuthCallback] Profile:", profile);
        
        if (!DocumentService.isProfileComplete(profile)) {
          setStatus("Perfil incompleto - redirecionando...");
          console.log("[AuthCallback] Perfil incompleto, indo pra completeProfile");
          onNavigate("completeProfile");
        } else {
          setStatus("Login completo! Redirecionando...");
          console.log("[AuthCallback] Perfil completo, indo pra dashboard");
          const seen = localStorage.getItem(`kriou_onboarding_${session.user.id}_seen`);
          onNavigate(seen ? "dashboard" : "welcome");
        }
      } catch (err) {
        console.error("[AuthCallback] Erro ao buscar perfil:", err);
        setStatus("Erro ao carregar dados - indo para dashboard...");
        onNavigate("dashboard");
      }
    };

    const timeout = setTimeout(() => {
      if (handled.current) return;
      console.log("[AuthCallback] Timeout de 5s, verificando URL e recarregando...");
      // Tenta verificar se há hash de OAuth na URL
      const hasOAuthHash = window.location.hash.includes("access_token");
      if (hasOAuthHash) {
        console.log("[AuthCallback] Hash OAuth detectado, recarregando...");
        window.location.reload();
      } else {
        console.log("[AuthCallback] Sem hash OAuth, redirecionando para login");
        onNavigate("login");
      }
    }, 5000);

    // 1. Primeiro tenta pegar sessão já salva
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AuthCallback] getSession:", session ? "OK" : "NULL");
      if (session) {
        clearTimeout(timeout);
        resolve(session);
      }
    });

    // 2. Depois escuta eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[AuthCallback] Auth event:", event, session ? "with session" : "without session");
      if (event === "SIGNED_IN" && session) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(session);
      } else if (event === "SIGNED_OUT") {
        console.log("[AuthCallback] Sign out detectado");
        onNavigate("login");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [onNavigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-4 p-8">
      <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-text-muted text-lg font-medium">{status}</p>
      {error && (
        <p className="text-coral text-sm">{error}</p>
      )}
      <div className="mt-8 p-4 bg-surface-2 rounded-lg max-w-md text-left">
        <p className="text-text-muted text-xs mb-2">Dicas:</p>
        <ul className="text-text-muted text-xs list-disc list-inside space-y-1">
          <li>Aguarde alguns segundos após selecionar a conta Google</li>
          <li>Se ficar parado, pressione F5 para recarregar</li>
          <li>Verifique se pop-ups estão desbloqueados</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
