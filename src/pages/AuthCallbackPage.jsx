/**
 * ============================================
 * KRIOU DOCS - Auth Callback Page
 * ============================================
 * Pagina intermediaria para onde o Google redireciona apos OAuth.
 *
 * FLUXO:
 *   1. Usuario faz login com Google na LoginPage
 *   2. Google redireciona para /auth/callback#access_token=...
 *   3. Supabase detecta o hash e processa o token (async, module-level)
 *   4. AuthCallbackPage monta, faz polling de getSession() ate achar,
 *      tambem escuta onAuthStateChange (SIGNED_IN / INITIAL_SESSION)
 *
 * ESTRATEGIA DE POLLING:
 *   Como AuthCallbackPage e lazy-loaded, o SIGNED_IN pode disparar
 *   antes do componente montar. Por isso usamos polling ativo de
 *   getSession() como mecanismo principal, com onAuthStateChange
 *   como caminho rapido complementar.
 *
 * TIMEOUT: 15 segundos — se a sessao nao for encontrada, redireciona
 * para login.
 *
 * LOGS: Prefixo [AuthCallback] para facilitar debug.
 * ============================================
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";

// ─── Constantes ──────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 500;
const GIVE_UP_MS = 15000;
const LOG_PREFIX = "[AuthCallback]";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);
  const pollTimer = useRef(null);
  const pollAttempts = useRef(0);
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState("Iniciando...");
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState([]);

  // Logger estruturado com timestamp para facilitar correlacao de eventos
  const log = useCallback((msg, data) => {
    const timestamp = new Date().toISOString().slice(11, 23);
    const elapsed = ((Date.now() - startedAt.current) / 1000).toFixed(1);
    console.log(`${LOG_PREFIX} [+${elapsed}s] ${msg}`, data ?? "");
    setDebug((prev) => [...prev, { time: timestamp, msg, data }]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    log("Montado", window.location.href);

    // ─── resolve() — funcao unica de redirecionamento ──────────────────────
    const resolve = async (session, source) => {
      if (handled.current || cancelled) return;
      handled.current = true;
      log(`resolve() chamado de: ${source} (tentativa ${pollAttempts.current})`,
        { userId: session?.user?.id });

      if (!session) {
        log("ERRO: sessao null");
        setError("Sessao nao encontrada.");
        setTimeout(() => onNavigate("login", { replace: true }), 2000);
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
          onNavigate("completeProfile", { replace: true });
        } else {
          setStatus("Login completo! Redirecionando...");
          log("Perfil completo, indo para dashboard");
          const seen = localStorage.getItem(`kriou_onboarding_${session.user.id}_seen`);
          onNavigate(seen ? "dashboard" : "welcome", { replace: true });
        }
      } catch (err) {
        log("ERRO ao buscar perfil", err.message);
        setStatus("Erro ao carregar dados — indo para dashboard...");
        onNavigate("dashboard", { replace: true });
      }
    };

    // ─── Polling: chama getSession() a cada POLL_INTERVAL_MS ──────────────
    // Este e o mecanismo PRINCIPAL. Como o componente e lazy-loaded,
    // o SIGNED_IN pode ja ter disparado antes da montagem. O polling
    // garante que encontramos a sessao mesmo nesse cenario.
    const poll = async () => {
      if (handled.current || cancelled) return;
      pollAttempts.current++;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          log(`getSession() OK na tentativa ${pollAttempts.current}`, { email: session.user?.email });
          resolve(session, `poll-${pollAttempts.current}`);
          return;
        }
      } catch (err) {
        log(`getSession() erro na tentativa ${pollAttempts.current}`, err.message);
      }

      // Verifica se ja passou do tempo maximo
      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        log(`GIVE UP apos ${pollAttempts.current} tentativas em ${GIVE_UP_MS / 1000}s`);
        setError("Tempo esgotado. Verifique sua conexao.");
        onNavigate("login", { replace: true });
        return;
      }

      // Agenda proxima tentativa
      pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    // Inicia polling imediatamente
    poll();

    // ─── Listener: caminho rapido complementar ────────────────────────────
    // Captura SIGNED_IN, INITIAL_SESSION e TOKEN_REFRESHED para resolver
    // mais rapido que o polling. Nao depende de user do contexto (que
    // causa re-render e mata o listener).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current || cancelled) return;
      log(`onAuthStateChange: ${event}`, session ? `userId=${session.user?.id}` : "sem sessao");

      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        clearTimeout(pollTimer.current);
        subscription.unsubscribe();
        resolve(session, `event-${event}`);
      } else if (event === "SIGNED_OUT") {
        log("SIGNED_OUT recebido, redirecionando para login");
        clearTimeout(pollTimer.current);
        onNavigate("login", { replace: true });
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(pollTimer.current);
      subscription.unsubscribe();
    };
    // Nao incluir user/onNavigate/log nas deps: o efeito deve rodar
    // uma unica vez na montagem. Incluir qualquer dependencia que mude
    // causaria re-execucao e mataria o listener/polling ativo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
