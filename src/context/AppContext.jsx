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
import {
  PAGE_TO_PATH,
  PUBLIC_PAGES,
  RESTORABLE_PAGES,
  resolveHistoryIndex,
  resolveInitialPage,
  resolvePopstatePage,
} from "../domain/navigation";

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTOS
// ═══════════════════════════════════════════════════════════════════════════════

const NavigationContext = createContext(null);
const UIContext         = createContext(null);

// ─── Paginas que fazem sentido restaurar apos refresh ─────────────────────────
// Regras de rota ficam em domain/navigation para serem testáveis sem React.

// ─── Paginas publicas (nao requerem autenticacao) ────────────────────────────
// PUBLIC_PAGES importado do domínio de navegação.

// ─── Mapeamento pagina ↔ path ────────────────────────────────────────────────
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

  const getInitialPage = () => resolveInitialPage(pathname, hash);

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const isPopstateRef = useRef(false);
  const historyIndexRef = useRef(resolveHistoryIndex(window.history.state));

  useEffect(() => {
    if (!Number.isInteger(window.history.state?.appIndex)) {
      window.history.replaceState(
        { ...window.history.state, page: getInitialPage(), appIndex: historyIndexRef.current },
        "",
        window.location.href,
      );
    }
  // O estado inicial do histórico é preparado uma única vez.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── navigate ──────────────────────────────────────────────────────────────
  // @param {string} page — nome da pagina (ex: "dashboard", "editor")
  // @param {Object} [options] — { replace: boolean } para substituir a entrada
  //   atual no historico (usado apos OAuth callback para limpar /auth/callback).
  const navigate = useCallback((page, options = {}) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);

    const path = PAGE_TO_PATH[page] || "/";

    if (options.replace) {
      window.history.replaceState({ page, appIndex: historyIndexRef.current }, "", path);
    } else if (!isPopstateRef.current) {
      historyIndexRef.current += 1;
      window.history.pushState({ page, appIndex: historyIndexRef.current }, "", path);
    }

    if (RESTORABLE_PAGES.has(page)) {
      StorageService.savePage(page);
    } else {
      StorageService.clearPage();
    }
  }, []);

  // ─── goBack — Volta no historico real do navegador ────────────────────────
  // Usado por botoes de "Voltar" para nao poluir o historico com entradas
  // duplicadas. Se nao houver historico suficiente, navega para o fallback.
  const goBack = useCallback((fallbackPage = "dashboard") => {
    if (historyIndexRef.current > 0) {
      window.history.back();
    } else {
      navigate(fallbackPage, { replace: true });
    }
  }, [navigate]);

  // ─── popstate (botao voltar/avancar do navegador) ─────────────────────────
  useEffect(() => {
    const handlePopstate = (event) => {
      historyIndexRef.current = resolveHistoryIndex(event.state);
      isPopstateRef.current = true;
      setCurrentPage(resolvePopstatePage(event.state, window.location.pathname));
      window.scrollTo(0, 0);
      isPopstateRef.current = false;
    };

    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, goBack }}>
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

        // Cria cards virtuais para rascunhos salvos via auto-save que nao
        // tem card correspondente (ex: curriculos salvos apenas via saveDraft)
        const resumeDraft = StorageService.loadDraft(userId, "resume");
        const legalDraft  = StorageService.loadDraft(userId, "legal");

        const hasResumeCard = merged.some(d => d.status === "rascunho" && d.type === "resume");
        if (!hasResumeCard && resumeDraft && Object.keys(resumeDraft).length > 2) {
          const now = new Date();
          merged.push({
            id: `draft-resume-${userId}`,
            title: resumeDraft.nome || "Currículo (Rascunho)",
            type: "resume",
            status: "rascunho",
            draft: { formData: resumeDraft, selectedTemplate: null, currentStep: 0 },
            _draftOrigin: "autoSave",
            date: now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
            userId,
          });
        }

        const hasLegalCard = merged.some(d => d.status === "rascunho" && d.type !== "resume");
        if (!hasLegalCard && legalDraft && Object.keys(legalDraft).length > 2) {
          const now = new Date();
          merged.push({
            id: `draft-legal-${userId}`,
            title: "Documento Jurídico (Rascunho)",
            type: "legal",
            status: "rascunho",
            draft: { legalFormData: legalDraft, documentType: null, selectedVariant: null, disabledFields: {}, legalStep: 1 },
            _draftOrigin: "autoSave",
            date: now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
            userId,
          });
        }

        setUserDocuments(merged);
      } catch (err) {
        console.error("[AppBootstrap][ERRO] fetchAll falhou:", err.message);
        const localDocs = StorageService.loadDocuments(userId);
        if (Array.isArray(localDocs) && localDocs.length > 0) {
          setUserDocuments(localDocs);
        }
      }

      try {
        const cloudResume = await DocumentService.loadDraft(userId, "resume");
        const localResume = StorageService.loadDraft(userId, "resume");
        const resumeData = cloudResume?.data || localResume;
        if (resumeData) setFormData(resumeData);

        const cloudLegal = await DocumentService.loadDraft(userId, "legal");
        const localLegal = StorageService.loadDraft(userId, "legal");
        const legalData = cloudLegal?.data || localLegal;
        if (legalData) setLegalFormData(legalData);
      } catch (err) {
        console.error("[AppBootstrap][ERRO] loadDraft falhou:", err.message);
        const resumeDraft = StorageService.loadDraft(userId, "resume");
        if (resumeDraft) setFormData(resumeDraft);
        const legalDraft = StorageService.loadDraft(userId, "legal");
        if (legalDraft) setLegalFormData(legalDraft);
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
    goBack: nav.goBack,

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
    saveDocument:     (data, options) => resume.saveDocument(data, legal.documentType, resume.selectedTemplate, { id: legal.selectedVariant, name: legal.selectedVariant }, options),
    updateDocument:   (id, data, options) => resume.updateDocument(id, data, legal.documentType, resume.selectedTemplate, { id: legal.selectedVariant, name: legal.selectedVariant }, options),
    editingDocId:     resume.editingDocId,        setEditingDocId: resume.setEditingDocId,
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
