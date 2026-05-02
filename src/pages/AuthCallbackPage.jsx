/**
 * ============================================
 * KRIOU DOCS - Auth Callback Page
 * ============================================
 * Pagina intermediaria para onde o Google redireciona apos OAuth.
 *
 * FLUXO COMPLETO POS-LOGIN:
 *
 *   1. Google redireciona para /auth/callback#access_token=...
 *   2. Supabase detecta o hash e processa o token
 *   3. AuthCallbackPage monta, faz polling de getSession()
 *      ate achar, tambem escuta onAuthStateChange
 *   4. Quando sessao encontrada:
 *      a) Perfil incompleto (sem nome/sobrenome/CPF)
 *         → onNavigate("completeProfile")
 *      b) Perfil completo + onboarding NAO visto
 *         → onNavigate("welcome")
 *      c) Perfil completo + onboarding JA visto
 *         → onNavigate("dashboard")
 *   5. Todas as navegacoes usam { replace: true } para limpar
 *      /auth/callback do historico do navegador.
 *
 * ESTRATEGIA DE POLLING:
 *   Como AuthCallbackPage e lazy-loaded, o SIGNED_IN pode disparar
 *   antes do componente montar. Por isso usamos polling ativo de
 *   getSession() como mecanismo principal, com onAuthStateChange
 *   como caminho rapido complementar.
 *
 * TIMEOUT: 15 segundos — se a sessao nao for encontrada,
 * redireciona para login com { replace: true }.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";

const POLL_INTERVAL_MS = 500;
const GIVE_UP_MS = 15000;
const LOG_PREFIX = "[AuthCallback]";

const AuthCallbackPage = ({ onNavigate }) => {
  const handled = useRef(false);
  const pollTimer = useRef(null);
  const pollAttempts = useRef(0);
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState("Verificando login...");
  const [error, setError] = useState(null);

  const log = useCallback((msg, data) => {
    const elapsed = ((Date.now() - startedAt.current) / 1000).toFixed(1);
    console.log(`${LOG_PREFIX} [+${elapsed}s] ${msg}`, data ?? "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    log("Montado", window.location.href);

    // ─── resolve() — decisao de rota pos-login ────────────────────────────
    //
    // Perfil incompleto → completeProfile (coletar nome/sobrenome/CPF)
    // Perfil completo + onboarding nao visto → welcome (tour)
    // Perfil completo + onboarding visto → dashboard
    //
    // Todas usam { replace: true } para limpar /auth/callback do historico.
    const resolve = async (session, source) => {
      if (handled.current || cancelled) return;
      handled.current = true;
      log(`resolve() chamado de: ${source} (tentativa ${pollAttempts.current})`,
        { userId: session?.user?.id });

      if (!session) {
        log("ERRO: sessao null");
        setError("Sessao nao encontrada. Tente fazer login novamente.");
        setTimeout(() => onNavigate("login", { replace: true }), 2000);
        return;
      }

      setStatus("Login confirmado! Verificando perfil...");
      log("Sessao OK", { email: session.user?.email });

      try {
        const profile = await DocumentService.fetchProfile();
        log("Profile fetched", profile);

        if (!DocumentService.isProfileComplete(profile)) {
          // ─── Novo usuario ou perfil incompleto → coletar dados ───────────
          setStatus("Complete seu cadastro...");
          log("Perfil incompleto → completeProfile");
          onNavigate("completeProfile", { replace: true });
        } else {
          // ─── Perfil completo — verificar onboarding ───────────────────────
          const onboardingKey = `kriou_onboarding_${session.user.id}_seen`;
          const seenOnboarding = localStorage.getItem(onboardingKey);

          if (!seenOnboarding) {
            setStatus("Preparando tour...");
            log("Perfil completo, onboarding NAO visto → welcome");
            onNavigate("welcome", { replace: true });
          } else {
            setStatus("Redirecionando...");
            log("Perfil completo, onboarding visto → dashboard");
            onNavigate("dashboard", { replace: true });
          }
        }
      } catch (err) {
        log("ERRO ao buscar perfil", err.message);
        setStatus("Erro ao carregar perfil. Redirecionando...");
        onNavigate("dashboard", { replace: true });
      }
    };

    // ─── Polling: chama getSession() a cada POLL_INTERVAL_MS ──────────────
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

      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        log(`GIVE UP apos ${pollAttempts.current} tentativas em ${GIVE_UP_MS / 1000}s`);
        setError("Tempo esgotado. Verifique sua conexao e tente novamente.");
        onNavigate("login", { replace: true });
        return;
      }

      pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    // ─── Listener: caminho rapido complementar ──────────────────────────────
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-6 p-8">
      <div className="w-14 h-14 border-[3px] border-coral/30 border-t-coral rounded-full animate-spin" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-white text-lg font-semibold">{error ? "Ops!" : status}</p>
        {error && <p className="text-text-muted text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AuthCallbackPage;