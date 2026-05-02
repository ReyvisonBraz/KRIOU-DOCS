/**
 * ============================================
 * KRIOU DOCS - Application Context (Orquestrador)
 * ============================================
 * Compoe AuthContext + ResumeContext + LegalContext
 * e expoe useApp() com a API unificada.
 *
 * FLUXO DE INICIALIZACAO (ordem de execucao):
 *
 *   1. NavigationProvider — define pagina inicial baseada na URL
 *      - Se Tem hash OAuth (#access_token) → authCallback
 *      - Se URL e /auth/callback (sem hash, refresh) → authCallback
 *      - Se URL mapeada no PATH_TO_PAGE → pagina correspondente
 *      - Senao → landing
 *
 *   2. AuthProvider — restaura sessao Supabase (getSession)
 *      - isAuthLoading=true ate resolver
 *      - Seta userId/session quando autenticado
 *
 *   3. AppBootstrap — carrega dados do usuario apos auth resolvida
 *      - Se NAO autenticado: para loading, sem redirect
 *      - Se autenticado E em pagina de auth (authCallback/completeProfile):
 *        nao redirect — essas paginas gerenciam a si mesmas
 *      - Se autenticado E em pagina publica (landing/login):
 *        redirect para dashboard (usuario ja logado nao precisa ver landing)
 *      - Se autenticado E em pagina interna (dashboard, editor, etc):
 *        carrega dados, fica onde esta
 *
 *   4. AuthCallbackPage — resolve sessao apos OAuth
 *      - Polling getSession() + listener onAuthStateChange
 *      - Verifica perfil: incompleto → completeProfile
 *      - Verifica onboarding: nao visto → welcome
 *      - Perfil completo + onboarding visto → dashboard
 *
 *   5. CompleteProfilePage — coleta nome/sobrenome/CPF
 *      - Salva no Supabase via DocumentService.updateProfile()
 *      - onNavigate("welcome") → WelcomePage
 *
 *   6. WelcomePage — tour de onboarding (1x)
 *      - Salva kriou_onboarding_{userId}_seen no localStorage
 *      - navigate("dashboard") → DashboardPage
 *
 * PAGINAS PUBLICAS (acessiveis sem login):
 *   landing, login, authCallback
 *
 * PAGINAS PROTEGIDAS (requerem autenticacao):
 *   dashboard, templates, editor, preview, checkout,
 *   profile, legalEditor, completeProfile, welcome
 *
 * LOGS: Todos os logs seguem o padrao [NomeDoModulo] mensagem.
 *
 * ERROS: Erros criticos jogam excecao com prefixo [KRIOU_ERRO].
 * Erros nao-criticos sao logados com console.error e prefixo [ERRO].
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { APP_INIT_DELAY_MS } from "../constants/timing";
import { AuthProvider, useAuth } from "./AuthContext";
import { ResumeProvider, useResume } from "./ResumeContext";
import { LegalProvider, useLegal } from "./LegalContext";

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTOS
// ═══════════════════════════════════════════════════════════════════════════════

const NavigationContext = createContext(null);
const UIContext         = createContext(null);

// ─── Paginas que fazem sentido restaurar apos refresh ─────────────────────────
const RESTORABLE_PAGES = new Set([
  "dashboard", "legalEditor", "editor", "templates", "profile", "preview", "checkout",
]);

// ─── Paginas publicas (nao requerem autenticacao) ────────────────────────────
const PUBLIC_PAGES = new Set(["landing", "login", "authCallback"]);

// ─── Mapeamento pagina ↔ path ────────────────────────────────────────────────
const PAGE_TO_PATH = {
  landing:         "/",
  login:           "/login",
  authCallback:    "/auth/callback",
  completeProfile: "/complete-profile",
  welcome:         "/welcome",
  dashboard:       "/dashboard",
  templates:       "/templates",
  editor:          "/editor",
  preview:         "/preview",
  checkout:        "/checkout",
  profile:         "/profile",
  legalEditor:     "/legal-editor",
};

const PATH_TO_PAGE = Object.fromEntries(
  Object.entries(PAGE_TO_PATH).map(([k, v]) => [v, k])
);

// ─── NavigationProvider ───────────────────────────────────────────────────────
// Gerencia a navegacao SPA via history.pushState/replaceState.
//
// DETECCAO DE OAUTH: Se a URL contiver parametros de autenticacao
// (access_token, refresh_token, type=recovery, error_description)
// em qualquer pathname, forca a pagina "authCallback".
//
// RESTAURACAO VIA URL: Ao carregar a pagina, detecta qual pagina
// mostrar baseado no pathname.
const NavigationProvider = ({ children }) => {
  const pathname = window.location.pathname;
  const hash = window.location.hash;

  const hasAuthHash = hash.includes("access_token")
                   || hash.includes("refresh_token")
                   || hash.includes("type=recovery")
                   || hash.includes("error_description");

  console.log(
    "[NavigationProvider] Inicializando:",
    { pathname, hash: hash?.slice(0, 50), hasAuthHash }
  );

  const getInitialPage = () => {
    if (hasAuthHash || pathname === "/auth/callback") return "authCallback";
    if (pathname === "/" || pathname === "") return "landing";
    return PATH_TO_PAGE[pathname] || "landing";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const isPopstateRef = useRef(false);

  // ─── navigate ──────────────────────────────────────────────────────────────
  // @param {string} page — nome da pagina (ex: "dashboard", "editor")
  // @param {Object} [options] — { replace: boolean } para substituir a entrada
  //   atual no historico (usado apos OAuth callback para limpar /auth/callback).
  const navigate = useCallback((page, options = {}) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);

    const path = PAGE_TO_PATH[page] || "/";

    if (options.replace) {
      window.history.replaceState({ page }, "", path);
    } else if (!isPopstateRef.current) {
      window.history.pushState({ page }, "", path);
    }

    if (RESTORABLE_PAGES.has(page)) {
      StorageService.savePage(page);
    } else {
      StorageService.clearPage();
    }
  }, []);

  // ─── popstate (botao voltar/avancar do navegador) ─────────────────────────
  useEffect(() => {
    const handlePopstate = (event) => {
      const page = event.state?.page;
      isPopstateRef.current = true;
      setCurrentPage(page || PATH_TO_PAGE[window.location.pathname] || "landing");
      window.scrollTo(0, 0);
      isPopstateRef.current = false;
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════════════════════
// AppBootstrap e executado quando a sessao e resolvida (isAuthLoading=false).
//
// Tabela de decisao:
//
//   | Autenticado? | Pagina atual    | Acao                                    |
//   |-------------|-----------------|-----------------------------------------|
//   | Nao         | qualquer       | setIsLoading(false), sem redirect       |
//   | Sim         | authCallback   | carrega dados, NAO redirect             |
//   | Sim         | completeProfile| carrega dados, NAO redirect             |
//   | Sim         | welcome        | carrega dados, NAO redirect              |
//   | Sim         | landing/login  | redirect → dashboard                   |
//   | Sim         | pagina interna | carrega dados, FICA onde esta          |
//
// Paginas de auth (authCallback, completeProfile, welcome) gerenciam
// propria navegacao — o bootstrap apenas carrega dados em background.
// ═══════════════════════════════════════════════════════════════════════════════

const AUTH_PAGES = new Set(["authCallback", "completeProfile", "welcome"]);

const AppBootstrap = ({ children }) => {
  const { userId, isAuthLoading } = useAuth();
  const { setFormData, setUserDocuments } = useResume();
  const { setLegalFormData }              = useLegal();
  const { navigate, currentPage }         = useContext(NavigationContext);
  const { setIsLoading, setProfile }      = useContext(UIContext);

  useEffect(() => {
    if (isAuthLoading) return;

    console.log(
      "[AppBootstrap] Efeito disparado:",
      { userId: userId?.slice(0, 8), isAuthLoading, currentPage }
    );

    const isAuthPage   = AUTH_PAGES.has(currentPage);
    const isPublicPage = PUBLIC_PAGES.has(currentPage);

    const init = async () => {
      // ─── Usuario NAO autenticado ──────────────────────────────────────────
      if (!userId) {
        console.log("[AppBootstrap] Nao autenticado, nada a carregar");
        setIsLoading(false);

        // Se esta em pagina protegida, manda pra landing
        if (!isPublicPage && !isAuthPage) {
          console.log("[AppBootstrap] Pagina protegida sem auth → landing");
          navigate("landing", { replace: true });
        }
        return;
      }

      // ─── Usuario autenticado — carregar dados ─────────────────────────────
      console.log("[AppBootstrap] Autenticado, carregando dados...");

      try {
        const prof = await DocumentService.fetchProfile();
        if (prof) {
          console.log("[AppBootstrap] Perfil carregado:", { nome: prof.nome, profileComplete: DocumentService.isProfileComplete(prof) });
          setProfile(prof);
        } else {
          console.log("[AppBootstrap] Perfil nao encontrado");
        }
      } catch (err) {
        console.error("[AppBootstrap][ERRO] fetchProfile falhou:", err.message);
      }

      try {
        const supaDocs = await DocumentService.fetchAll(userId);
        const localDocs = StorageService.loadDocuments(userId);
        const localDrafts = Array.isArray(localDocs)
          ? localDocs.filter(d => d.status === "rascunho")
          : [];
        const merged = [...supaDocs, ...localDrafts];
        setUserDocuments(merged);
      } catch (err) {
        console.error("[AppBootstrap][ERRO] fetchAll falhou:", err.message);
        const localDocs = StorageService.loadDocuments(userId);
        if (Array.isArray(localDocs) && localDocs.length > 0) {
          setUserDocuments(localDocs);
        }
      }

      try {
        const resumeDraft = StorageService.loadDraft(userId, "resume");
        if (resumeDraft) setFormData(resumeDraft);
        const legalDraft = StorageService.loadDraft(userId, "legal");
        if (legalDraft) setLegalFormData(legalDraft);
      } catch (err) {
        console.error("[AppBootstrap][ERRO] loadDraft falhou:", err.message);
      }

      // ─── Redirecionamento pos-login ──────────────────────────────────────
      if (isAuthPage) {
        // authCallback/completeProfile/welcome gerenciam propria navegacao
        console.log("[AppBootstrap] Pagina de auth, sem redirect");
      } else if (isPublicPage) {
        // Usuario autenticado em landing/login → dashboard
        console.log("[AppBootstrap] Autenticado em pagina publica → dashboard");
        const targetPage = "dashboard";
        setTimeout(() => navigate(targetPage), APP_INIT_DELAY_MS);
      } else {
        // Pagina interna (dashboard, editor, etc.) — fica onde esta
        console.log("[AppBootstrap] Pagina interna, fica onde esta");
      }

      setIsLoading(false);
    };

    init();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, userId]);

  return children;
};

// ─── InnerProviders ───────────────────────────────────────────────────────────

const InnerProviders = ({ children, isLoading, setSaveStatus }) => {
  const { userId } = useAuth();

  return (
    <ResumeProvider userId={userId} isLoading={isLoading}>
      <LegalProvider userId={userId} isLoading={isLoading} onSaveStatus={setSaveStatus}>
        <AppBootstrap>
          {children}
        </AppBootstrap>
      </LegalProvider>
    </ResumeProvider>
  );
};

// ─── AppProvider principal ─────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading]               = useState(true);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [saveStatus, setSaveStatus]             = useState("saved");
  const [profile, setProfile]                   = useState(null);

  return (
    <UIContext.Provider value={{ isLoading, setIsLoading, checkoutComplete, setCheckoutComplete, saveStatus, setSaveStatus, profile, setProfile }}>
      <NavigationProvider>
        <AuthProvider>
          <InnerProviders isLoading={isLoading} setSaveStatus={setSaveStatus}>
            {children}
          </InnerProviders>
        </AuthProvider>
      </NavigationProvider>
    </UIContext.Provider>
  );
};

// ─── useApp — Hook unificado ──────────────────────────────────────────────────

const AppContext = createContext(null);

export const useApp = () => {
  const nav    = useContext(NavigationContext);
  const ui     = useContext(UIContext);
  const auth   = useAuth();
  const resume = useResume();
  const legal  = useLegal();

  if (!nav || !ui || !auth || !resume || !legal) {
    throw new Error("useApp must be used within AppProvider");
  }

  const logout = useCallback(async () => {
    StorageService.clearPage();
    await auth.logout();
    nav.navigate("landing");
  }, [auth, nav]);

  return {
    currentPage: nav.currentPage,
    navigate: nav.navigate,

    userId:          auth.userId,
    displayName:     auth.displayName,
    avatarUrl:       auth.avatarUrl,
    email:           auth.email,
    isAuthLoading:   auth.isAuthLoading,
    signInWithGoogle: auth.signInWithGoogle,
    logout,

    selectedTemplate: resume.selectedTemplate,   setSelectedTemplate: resume.setSelectedTemplate,
    templates:        resume.templates,
    currentStep:      resume.currentStep,         setCurrentStep: resume.setCurrentStep,
    formData:         resume.formData,            setFormData: resume.setFormData,
    updateForm:       resume.updateForm,
    resetForm:        () => resume.resetForm(legal.resetLegalForm),
    saveStatus:       resume.saveStatus,
    lastSaved:        resume.lastSaved,
    triggerSave:      resume.triggerSave,
    userDocuments:    resume.userDocuments,        setUserDocuments: resume.setUserDocuments,
    saveDocument:     (data) => resume.saveDocument(data, legal.documentType, resume.selectedTemplate, { id: legal.selectedVariant, name: legal.selectedVariant }),
    filter:           resume.filter,              setFilter: resume.setFilter,

    documentType:      legal.documentType,        setDocumentType: legal.setDocumentType,
    selectedVariant:   legal.selectedVariant,     setSelectedVariant: legal.setSelectedVariant,
    legalFormData:     legal.legalFormData,       setLegalFormData: legal.setLegalFormData,
    disabledFields:    legal.disabledFields,      setDisabledFields: legal.setDisabledFields,
    legalStep:         legal.legalStep,           setLegalStep: legal.setLegalStep,
    legalDocumentTypes: legal.legalDocumentTypes,
    updateLegalField:  legal.updateLegalField,
    selectDocumentType: legal.selectDocumentType,
    resetLegalForm:    legal.resetLegalForm,
    triggerLegalSave:  legal.triggerSave,

    isLoading:         ui.isLoading,
    checkoutComplete:  ui.checkoutComplete,       setCheckoutComplete: ui.setCheckoutComplete,
    profile:           ui.profile,                setProfile: ui.setProfile,
  };
};

export default AppContext;