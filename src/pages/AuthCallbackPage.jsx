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
 * TIMEOUT: watchdog independente de 15 segundos — mesmo que getSession()
 * fique pendente, redireciona para login com { replace: true }.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";

const POLL_INTERVAL_MS = 500;
const GIVE_UP_MS = 15000;
const LOG_PREFIX = "[AuthCallback]";

const AuthCallbackPage = ({ onNavigate }) => {
  const pollTimer = useRef(null);
  const watchdogTimer = useRef(null);
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
    let sessionAccepted = false;
    let terminal = false;
    let subscription = null;
    let subscriptionReady = false;
    let unsubscribeRequested = false;
    let subscriptionUnsubscribed = false;
    log("Montado", window.location.href);

    const clearPollTimer = () => {
      if (pollTimer.current !== null) {
        clearTimeout(pollTimer.current);
        pollTimer.current = null;
      }
    };

    const clearWatchdogTimer = () => {
      if (watchdogTimer.current !== null) {
        clearTimeout(watchdogTimer.current);
        watchdogTimer.current = null;
      }
    };

    // Hardening defensivo: embora o SDK atual entregue callbacks de auth de
    // forma assíncrona, se um callback ocorrer durante o próprio registro,
    // guardamos a intenção e cancelamos assim que a subscription existir.
    const unsubscribeAuth = () => {
      if (subscriptionUnsubscribed) return;
      if (!subscriptionReady) {
        unsubscribeRequested = true;
        return;
      }

      subscription?.unsubscribe();
      subscriptionUnsubscribed = true;
    };

    const stopSessionSearch = () => {
      clearPollTimer();
      clearWatchdogTimer();
    };

    const stopAll = () => {
      stopSessionSearch();
      unsubscribeAuth();
    };

    const finishNavigation = (page, nextStatus = null, nextError = null) => {
      if (terminal || cancelled) return;
      terminal = true;
      stopAll();
      if (nextStatus) setStatus(nextStatus);
      if (nextError) setError(nextError);
      onNavigate(page, { replace: true });
    };

    // ─── resolve() — decisao de rota pos-login ────────────────────────────
    //
    // Perfil incompleto → completeProfile (coletar nome/sobrenome/CPF)
    // Perfil completo + onboarding nao visto → welcome (tour)
    // Perfil completo + onboarding visto → dashboard
    //
    // Todas usam { replace: true } para limpar /auth/callback do historico.
    const resolve = async (session, source) => {
      if (sessionAccepted || terminal || cancelled) return;
      sessionAccepted = true;
      stopSessionSearch();
      log(`resolve() chamado de: ${source} (tentativa ${pollAttempts.current})`,
        { userId: session?.user?.id });

      setStatus("Login confirmado! Verificando perfil...");
      log("Sessao OK", { email: session.user?.email });

      try {
        const profile = await DocumentService.fetchProfile();
        if (terminal || cancelled) return;
        log("Profile fetched", profile);

        if (!DocumentService.isProfileComplete(profile)) {
          // ─── Novo usuario ou perfil incompleto → coletar dados ───────────
          log("Perfil incompleto → completeProfile");
          finishNavigation("completeProfile", "Complete seu cadastro...");
        } else {
          // ─── Perfil completo — verificar onboarding ───────────────────────
          const onboardingKey = `kriou_onboarding_${session.user.id}_seen`;
          const seenOnboarding = localStorage.getItem(onboardingKey);

          if (!seenOnboarding) {
            log("Perfil completo, onboarding NAO visto → welcome");
            finishNavigation("welcome", "Preparando tour...");
          } else {
            log("Perfil completo, onboarding visto → dashboard");
            finishNavigation("dashboard", "Redirecionando...");
          }
        }
      } catch (err) {
        if (terminal || cancelled) return;
        log("ERRO ao buscar perfil", err.message);
        // Fallback fail-open existente: a indisponibilidade do perfil não
        // bloqueia um usuário já autenticado de acessar o dashboard.
        finishNavigation("dashboard", "Erro ao carregar perfil. Redirecionando...");
      }
    };

    // ─── Polling: chama getSession() a cada POLL_INTERVAL_MS ──────────────
    const poll = async () => {
      if (sessionAccepted || terminal || cancelled) return;
      pollAttempts.current++;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (sessionAccepted || terminal || cancelled) return;
        if (session) {
          log(`getSession() OK na tentativa ${pollAttempts.current}`, { email: session.user?.email });
          resolve(session, `poll-${pollAttempts.current}`);
          return;
        }
      } catch (err) {
        if (sessionAccepted || terminal || cancelled) return;
        log(`getSession() erro na tentativa ${pollAttempts.current}`, err.message);
      }

      pollTimer.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    watchdogTimer.current = setTimeout(() => {
      if (sessionAccepted || terminal || cancelled) return;
      log(`GIVE UP apos ${pollAttempts.current} tentativas em ${GIVE_UP_MS / 1000}s`);
      finishNavigation(
        "login",
        null,
        "Tempo esgotado. Verifique sua conexao e tente novamente.",
      );
    }, GIVE_UP_MS);
    poll();

    // ─── Listener: caminho rapido complementar ──────────────────────────────
    const authState = supabase.auth.onAuthStateChange((event, session) => {
      if (terminal || cancelled) return;
      log(`onAuthStateChange: ${event}`, session ? `userId=${session.user?.id}` : "sem sessao");

      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
        resolve(session, `event-${event}`);
      } else if (event === "SIGNED_OUT") {
        log("SIGNED_OUT recebido, redirecionando para login");
        finishNavigation("login");
      }
    });
    subscription = authState.data.subscription;
    subscriptionReady = true;
    if (unsubscribeRequested) unsubscribeAuth();

    return () => {
      cancelled = true;
      stopAll();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy gap-6 p-8">
      <div className="w-14 h-14 border-[3px] border-coral/30 border-t-coral rounded-full animate-spin" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-text text-lg font-semibold">{error ? "Ops!" : status}</p>
        {error && <p className="text-text-muted text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
