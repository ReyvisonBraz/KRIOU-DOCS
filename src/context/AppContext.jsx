/**
 * ============================================
 * KRIOU DOCS - Application Context (Orquestrador)
 * ============================================
 * Compõe AuthContext + ResumeContext + LegalContext
 * e expõe useApp() com a API unificada.
 *
 * FLUXO DE INICIALIZACAO:
 *   1. NavigationProvider — define pagina atual baseada na URL
 *   2. AuthProvider — restaura sessao Supabase (getSession)
 *   3. InnerProviders → AppBootstrap — carrega profile + documentos + drafts
 *
 * Auth: Supabase (Google OAuth) — sessa gerenciada pelo Supabase, nao localStorage.
 * Documentos: carregados do Supabas apos login.
 * Drafts: permanecem em localStorage (zero latência de rede).
 *
 * LOGS: Todos os logs seguem o padrao [NomeDoModulo] mensagem
 * para facilitar filtragem no console do browser.
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
// NavigationContext: currentPage + navigate
// UIContext: isLoading, checkoutComplete, saveStatus, profile
// ═══════════════════════════════════════════════════════════════════════════════

const NavigationContext = createContext(null);
const UIContext         = createContext(null);

// ─── Páginas restauráveia apos refresh ──────────────────────────────────────
// NOTA: So paginas que fazem sentido restaurar (evita voltar pra landing
// apos F5). Landing, login, authCallback NAO devem ser restauradas.
const RESTORABLE_PAGES = new Set([
  "dashboard", "legalEditor", "editor", "templates", "profile", "preview", "checkout",
]);

// ─── NavigationProvider ───────────────────────────────────────────────────────
// Gerencia a navegacao SPA (sem router externo) via history.pushState.
// A URL real nunca muda — usamos pushState com estado interno.
// Isso significa que F5 sempre cai na mesma URL (ex: /) e o estado
// e restaurado do localStorage se a pagina for restaurável.
const NavigationProvider = ({ children }) => {
  const pathname = window.location.pathname;
  const [currentPage, setCurrentPage] = useState(() => {
    if (pathname === "/auth/callback") return "authCallback";
    return "landing";
  });

  const isPopstateRef = useRef(false);

  // ─── navigate ────────────────────────────────────────────────────────────────
  // @param {string} page — nome da pagina (ex: "dashboard", "editor")
  // Salva pagina restaurável no localStorage para recovery apos refresh.
  // NOTA: window.location.pathname nunca muda — sempre pusha a URL atual.
  // Isso é intencional (SPA sem rotas reais), mas significa que nao da para
  // compartilhar links de paginas internas.
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);

    if (!isPopstateRef.current) {
      window.history.pushState({ page }, "", window.location.pathname);
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
      setCurrentPage(page || "landing");
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
// AppBootstrap é executado uma vez quando isAuthLoading muda de true para false.
// Fluxo:
//   1. Aguarda AuthProvider resolver sessao (isAuthLoading)
//   2. Se usuario logado: carrega profile, documentos, drafts do Supabase
//   3. Redireciona para pagina salva ou dashboard
//   4. Em paginas de auth (authCallback, completeProfile): carrega dados mas
//      NAO redireciona (a propria pagina gerencia navegacao)
//
// PONTO DE FALHA CONHECIDO: Se fetchProfile() falhar (ex: rede), o usuario
// fica sem profile na UI mas ainda consegue navegar. Isso é intencional —
// o erro nao deve bloquear o uso do app.
// ═══════════════════════════════════════════════════════════════════════════════

const AppBootstrap = ({ children }) => {
  const { userId, isAuthLoading }        = useAuth();
  const { setFormData, setUserDocuments } = useResume();
  const { setLegalFormData }              = useLegal();
  const { navigate, currentPage }         = useContext(NavigationContext);
  const { setIsLoading, setProfile }      = useContext(UIContext);

  // ─── Efeito principal de inicializacao ──────────────────────────────────────
  // Dispara quando isAuthLoading muda (sessao resolvida ou timeout)
  useEffect(() => {
    // [GUARDA] Aguarda Supabase resolver a sessao antes de inicializar
    if (isAuthLoading) {
      return;
    }

    // [GUARDA] Paginas de auth gerenciam propria navegacao — nao interferir
    // NOTA: "welcome" NAO esta aqui intencionalmente — usuario logado na
    // welcome page ainda precisa carregar perfil e docs em background.
    // Se adicionar "welcome" aqui, o bootstrap sera pulado e o usuario
    // na welcome page nao tera dados carregados ao navegar para dashboard.
    const isAuthPage = currentPage === "authCallback"
                    || currentPage === "completeProfile"
                    || window.location.pathname === "/auth/callback";

    // ─── init() — carrega todos os dados do usuario ──────────────────────────
    const init = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      // ETAPA 1: Perfil do usuario
      try {
        const prof = await DocumentService.fetchProfile();
        if (prof) {
          setProfile(prof);
        } else {
          // Perfil pode ser null se o trigger handle_new_user nao criou
          // (ex: usuario criado antes do trigger existir)
        }
      } catch (err) {
        // [ERRO] Falha ao carregar perfil — nao critico, usuario continua
        console.error("[AppBootstrap][ERRO] fetchProfile falhou:", err.message);
      }

      // ETAPA 2: Documentos finalizados do Supabase
      try {
        const docs = await DocumentService.fetchAll(userId);
        if (docs.length > 0) setUserDocuments(docs);
      } catch (err) {
        // [ERRO] Falha ao carregar documentos — nao critico
        console.error("[AppBootstrap][ERRO] fetchAll falhou:", err.message);
      }

      // ETAPA 3: Drafts do localStorage (rapido, sem latencia de rede)
      try {
        const resumeDraft = StorageService.loadDraft(userId, "resume");
        if (resumeDraft) setFormData(resumeDraft);

        const legalDraft = StorageService.loadDraft(userId, "legal");
        if (legalDraft) setLegalFormData(legalDraft);
      } catch (err) {
        // [ERRO] Falha ao ler drafts do localStorage — raro, mas pode
        // ocorrer se o localStorage estiver corrompido.
        console.error("[AppBootstrap][ERRO] loadDraft falhou:", err.message);
      }

      // ETAPA 4: Redirecionamento (so para paginas nao-auth)
      if (!isAuthPage) {
        const savedPage  = StorageService.loadPage();
        const targetPage = (savedPage && RESTORABLE_PAGES.has(savedPage)) ? savedPage : "dashboard";
        setTimeout(() => navigate(targetPage), APP_INIT_DELAY_MS);
      }
    };

    // ─── Decisao de inicializacao ────────────────────────────────────────────
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

// ─── AppProvider principal ────────────────────────────────────────────────────

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
    // Navegação
    currentPage: nav.currentPage,
    navigate: nav.navigate,

    // Auth (Supabase)
    userId:          auth.userId,
    displayName:     auth.displayName,
    avatarUrl:       auth.avatarUrl,
    email:           auth.email,
    isAuthLoading:   auth.isAuthLoading,
    signInWithGoogle: auth.signInWithGoogle,
    logout,

    // Resume
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

    // Legal
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

    // UI
    isLoading:         ui.isLoading,
    checkoutComplete:  ui.checkoutComplete,       setCheckoutComplete: ui.setCheckoutComplete,
    profile:           ui.profile,                setProfile: ui.setProfile,
  };
};

export default AppContext;
