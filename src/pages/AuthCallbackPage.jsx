/**
 * ============================================
 * KRIOU DOCS - Auth Callback Page
 * ============================================
 * Pagina intermediaria para onde o Google redireciona apos OAuth.
 *
 * FLUXO:
 *   1. Usuario faz login com Google na LoginPage
 *   2. Google redireciona para /auth/callback#access_token=...
 *   3. Supabase detecta o hash e processa o token automaticamente
 *   4. AuthCallbackPage monta, tenta pegar sessao, e redireciona
 *
 * TIMEOUT: 8 segundos — se a sessao nao for estabelecida nesse tempo,
 * tenta fallback (reload se tiver hash, login se nao tiver).
 *
 * LOGS: Todos os logs usam prefixo [AuthCallback] para facilitar debug.
 * O painel de debug e visivel em todos os ambientes para auxiliar
 * na resolucao de problemas de autenticacao.
 *
 * PONTOS DE FALHA CONHECIDOS:
 * - Se o usuario bloquear popups do Google, o fluxo OAuth pode nunca completar
 * - Se o Supabase estiver lento, o timeout de 8s pode disparar antes da sessao
 * - Se o perfil nao existir (usuario antigo pre-trigger), fetchProfile retorna null
 * ============================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";
import { useAuth } from "../context/AuthContext";

// ─── Constantes ──────────────────────────────────────────────────────────────
const TIMEOUT_MS = 8000;
const LOG_PREFIX = "[AuthCallback]";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);
  const retryCountRef = useRef(0);
  const [status, setStatus] = useState("Iniciando...");
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState([]);
  const { user } = useAuth();

  // Ref para acessar user no timeout sem disparar re-render do efeito
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; });

  // Logger estruturado com timestamp para facilitar correlacao de eventos
  const log = useCallback((msg, data) => {
    const timestamp = new Date().toISOString().slice(11, 23);
    console.log(`${LOG_PREFIX} ${msg}`, data ?? "");
    setDebug((prev) => [...prev, { time: timestamp, msg, data }]);
  }, []);

  useEffect(() => {
    log("Montado", window.location.href);

    // ─── resolve() — funcao unica de redirecionamento ──────────────────────
    const resolve = async (session, source) => {
      if (handled.current) return;
      handled.current = true;
      log(`resolve() chamado de: ${source}`, { userId: session?.user?.id });

      if (!session) {
        log("ERRO: sessao null");
        setError("Sessao nao encontrada. Tentando novamente...");
        setTimeout(() => onNavigate("login"), 2000);
        return;
      }

      setStatus("Sessao encontrada! Buscando perfil...");
      log("Sessao OK", { email: session.user?.email });

      try {
        const profile = await DocumentService.fetchProfile();
        log("Profile fetched", profile);

        if (!DocumentService.isProfileComplete(profile)) {
          setStatus("Perfil incompleto — redirecionando...");
          log("Perfil incompleto, indo para completeProfile");
          onNavigate("completeProfile");
        } else {
          setStatus("Login completo! Redirecionando...");
          log("Perfil completo, indo para dashboard");
          const seen = localStorage.getItem(`kriou_onboarding_${session.user.id}_seen`);
          onNavigate(seen ? "dashboard" : "welcome");
        }
      } catch (err) {
        log("ERRO ao buscar perfil", err.message);
        setStatus("Erro ao carregar dados — indo para dashboard...");
        onNavigate("dashboard");
      }
    };

    // ─── Timeout de seguranca com retry ───────────────────────────────────
    // Em vez de recarregar a pagina (causava loop), faz polling do getSession.
    const timeout = setTimeout(async () => {
      if (handled.current) return;
      log(`TIMEOUT — ${TIMEOUT_MS}ms sem resposta (tentativa ${retryCountRef.current})`);
      const hash = window.location.hash;

      if (hash.includes("access_token") && retryCountRef.current < 3) {
        retryCountRef.current++;
        // Polling gentil: tenta getSession a cada 1s ate 3x antes de reload
        log(`Hash ainda presente, tentando polling getSession (${retryCountRef.current}/3)...`);
        for (let i = 0; i < 3; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          if (handled.current) return;
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            log("Polling getSession OK");
            resolve(session, "timeout-polling");
            return;
          }
        }
        // Esgotou polling com hash ainda presente — reload como ultimo recurso
        log("Polling esgotado, recarregando pagina");
        window.location.reload();
      } else {
        // Sem hash — ultima tentativa com getSession
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          log("Timeout fallback: sessao encontrada via getSession");
          resolve(session, "timeout-getSession");
        } else if (userRef.current) {
          // User no contexto mas sem sessao via getSession — ainda tenta resolve
          // Passando a sessao que esta no contexto (via AuthContext)
          log("Timeout: user no contexto, tentando resolve pela sessao do contexto");
          supabase.auth.getSession().then(({ data }) => {
            if (data.session) resolve(data.session, "timeout-context");
            else onNavigate("login");
          });
        } else {
          log("Nenhum user ou sessao disponivel, redirecionando para login");
          onNavigate("login");
        }
      }
    }, TIMEOUT_MS);

    // ─── Tentativa 1: sessao ja existente (getSession) ────────────────────
    supabase.auth.getSession().then(({ data: { session } }) => {
      log("getSession() resultado:", session ? "OK" : "NULL");
      if (session) {
        clearTimeout(timeout);
        resolve(session, "getSession");
      }
    });

    // ─── Tentativa 2: escuta evento SIGNED_IN ─────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      log("onAuthStateChange:", event, session ? "with session" : "without session");
      if (event === "SIGNED_IN" && session) {
        clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(session, "onAuthStateChange");
      } else if (event === "SIGNED_OUT") {
        log("SIGNED_OUT recebido");
        onNavigate("login");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // user intencionalmente fora do deps: se user mudar, o efeito
    // re-executaria e mataria o listener onAuthStateChange que recebeu
    // o SIGNED_IN. userRef garante acesso ao valor atualizado no timeout.
  }, [onNavigate, log]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-4 p-8">
      <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      <p className="text-text-muted text-lg font-medium">{status}</p>
      {error && (
        <p className="text-coral text-sm">{error}</p>
      )}
      <div className="mt-8 p-4 bg-surface-2 rounded-lg max-w-md text-left w-full">
        <p className="text-text-muted text-xs mb-2 font-bold">Debug (console):</p>
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
        onClick={() => { log("Retry manual"); window.location.reload(); }}
        className="mt-4 px-6 py-2 bg-coral/20 text-coral rounded-xl text-sm hover:bg-coral/30 transition"
      >
        Forcar recarregamento
      </button>
      <div className="mt-4 p-4 bg-surface-2 rounded-lg max-w-md text-left">
        <p className="text-text-muted text-xs mb-2">Dicas se ficar preso aqui:</p>
        <ul className="text-text-muted text-xs list-disc list-inside space-y-1">
          <li>Aguarde alguns segundos apos selecionar a conta Google</li>
          <li>Verifique se nao ficou preso em aba do Google (popup blocker)</li>
          <li>Se ficar preso, clique em "Forcar recarregamento"</li>
          <li>Verifique no console do navegador se ha erros de rede (F12 &#62; Console)</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
