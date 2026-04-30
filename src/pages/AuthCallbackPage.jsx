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
import { useAuth } from "../context/AuthContext";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);
  const [status, setStatus] = useState("Iniciando...");
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState([]);
  const { user } = useAuth();

  const log = (msg, data) => {
    console.log(`[AuthCallback] ${msg}`, data ?? "");
    setDebug((prev) => [...prev, { time: new Date().toISOString().slice(11, 23), msg, data }]);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    log("Mounted", window.location.href);

    const resolve = async (session, source) => {
      if (handled.current) return;
      handled.current = true;
      log(`resolve() called from: ${source}`, { userId: session?.user?.id });

      if (!session) {
        log("ERRO: sessão null");
        setError("Sessão não encontrada. Tentando novamente...");
        setTimeout(() => onNavigate("login"), 2000);
        return;
      }

      setStatus("Sessão encontrada! Buscando perfil...");
      log("Sessão OK", { email: session.user?.email });

      try {
        const profile = await DocumentService.fetchProfile();
        log("Profile fetched", profile);

        if (!DocumentService.isProfileComplete(profile)) {
          setStatus("Perfil incompleto - redirecionando...");
          log("Perfil incompleto, indo pra completeProfile");
          onNavigate("completeProfile");
        } else {
          setStatus("Login completo! Redirecionando...");
          log("Perfil completo, indo pra dashboard");
          const seen = localStorage.getItem(`kriou_onboarding_${session.user.id}_seen`);
          onNavigate(seen ? "dashboard" : "welcome");
        }
      } catch (err) {
        log("Erro ao buscar perfil", err);
        setStatus("Erro ao carregar dados - indo para dashboard...");
        onNavigate("dashboard");
      }
    };

    const timeout = setTimeout(() => {
      if (handled.current) return;
      log("TIMEOUT - 8s sem resposta");
      const hash = window.location.hash;
      log("URL hash:", hash);

      if (hash.includes("access_token")) {
        log("Hash com access_token detectado, recarregando...");
        window.location.reload();
      } else {
        log("Sem hash, verificando user do contexto...", user);
        if (user) {
          log("User disponível no contexto, navegando para dashboard");
          onNavigate("dashboard");
        } else {
          log("Nenhum user, redirecionando para login");
          onNavigate("login");
        }
      }
    }, 8000);

    // Primeira verificação: olha contexto de auth (pode já ter sessão)
    if (user) {
      log("User já disponível no AuthContext", user.id);
    }

    // 1. Tenta pegar sessão salva
    supabase.auth.getSession().then(({ data: { session } }) => {
      log("getSession() result:", session ? "OK" : "NULL");
      if (session) {
        clearTimeout(timeout);
        resolve(session, "getSession");
      }
    });

    // 2. Escuta eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      log("onAuthStateChange:", event, session ? "with session" : "without session");
      if (event === "SIGNED_IN" && session) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(session, "onAuthStateChange");
      } else if (event === "SIGNED_OUT") {
        log("SIGNED_OUT event");
        onNavigate("login");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [onNavigate, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-4 p-8">
      <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-text-muted text-lg font-medium">{status}</p>
      {error && (
        <p className="text-coral text-sm">{error}</p>
      )}
      <div className="mt-8 p-4 bg-surface-2 rounded-lg max-w-md text-left w-full">
        <p className="text-text-muted text-xs mb-2 font-bold">Debug:</p>
        <div className="text-text-muted text-xs font-mono space-y-1 max-h-48 overflow-y-auto">
          {debug.map((d, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-500">[{d.time}]</span>
              <span className="text-coral">{d.msg}</span>
              {d.data !== undefined && <span className="text-gray-400">{JSON.stringify(d.data)}</span>}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => { log("Manual retry"); window.location.reload(); }}
        className="mt-4 px-6 py-2 bg-coral/20 text-coral rounded-xl text-sm hover:bg-coral/30 transition"
      >
        Forçar recarregamento
      </button>
      <div className="mt-4 p-4 bg-surface-2 rounded-lg max-w-md text-left">
        <p className="text-text-muted text-xs mb-2">Dicas:</p>
        <ul className="text-text-muted text-xs list-disc list-inside space-y-1">
          <li>Aguarde alguns segundos após selecionar a conta Google</li>
          <li>Verifique se não ficou preso em aba do Google</li>
          <li>Se ficar preso, clique em "Forçar recarregamento"</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
