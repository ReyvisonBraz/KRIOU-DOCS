/**
 * ============================================
 * KRIOU DOCS - Application Context (Orquestrador)
 * ============================================
 * Compõe AuthContext + ResumeContext + LegalContext
 * e expõe useApp() com a API unificada.
 *
 * Auth: Supabase (Google OAuth) — sem localStorage de sessão.
 * Documentos: carregados do Supabase após login.
 * Drafts: permanecem em localStorage (zero latência de rede).
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { APP_INIT_DELAY_MS } from "../constants/timing";
import { AuthProvider, useAuth } from "./AuthContext";
import { ResumeProvider, useResume } from "./ResumeContext";
import { LegalProvider, useLegal } from "./LegalContext";

// ─── Contextos de navegação e UI ─────────────────────────────────────────────

const NavigationContext = createContext(null);
const UIContext         = createContext(null);

// Páginas válidas que podem ser restauradas após atualização
const RESTORABLE_PAGES = new Set([
  "dashboard", "legalEditor", "editor", "templates", "profile", "preview", "checkout",
]);

const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    // Detecta callback do Google OAuth na URL
    if (window.location.pathname === "/auth/callback") return "authCallback";
    return "landing";
  });

  const isPopstateRef = useRef(false);

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

// ─── Bootstrap: hidrata providers com dados do Supabase ──────────────────────

const AppBootstrap = ({ children }) => {
  const { userId, isAuthLoading }        = useAuth();
  const { setFormData, setUserDocuments } = useResume();
  const { setLegalFormData }              = useLegal();
  const { navigate, currentPage }         = useContext(NavigationContext);
  const { setIsLoading, setProfile }      = useContext(UIContext);

  useEffect(() => {
    // Aguarda Supabase resolver a sessão antes de inicializar
    if (isAuthLoading) return;

    // Páginas de autenticação/onboarding gerenciam sua própria navegação — não interferir
    const isAuthPage = currentPage === "authCallback" || currentPage === "completeProfile"
                    || currentPage === "welcome"
                    || window.location.pathname === "/auth/callback";

    const init = async () => {
      if (userId) {
        // Carrega perfil do usuário (nome, sobrenome)
        try {
          const prof = await DocumentService.fetchProfile();
          if (prof) setProfile(prof);
        } catch (err) {
          console.error("[AppBootstrap] Erro ao carregar perfil:", err);
        }

        // Carrega documentos finalizados do Supabase
        try {
          const docs = await DocumentService.fetchAll();
          if (docs.length > 0) setUserDocuments(docs);
        } catch (err) {
          console.error("[AppBootstrap] Erro ao carregar documentos:", err);
        }

        // Carrega drafts do localStorage (rápido, sem latência)
        const resumeDraft = StorageService.loadDraft(userId, "resume");
        if (resumeDraft) setFormData(resumeDraft);

        const legalDraft = StorageService.loadDraft(userId, "legal");
        if (legalDraft) setLegalFormData(legalDraft);

        // Só redireciona se NÃO estiver em página de autenticação
        if (!isAuthPage) {
          const savedPage  = StorageService.loadPage();
          const targetPage = (savedPage && RESTORABLE_PAGES.has(savedPage)) ? savedPage : "dashboard";
          setTimeout(() => navigate(targetPage), APP_INIT_DELAY_MS);
        }
      }

      setIsLoading(false);
    };

    if (!isAuthPage) {
      init();
    } else if (userId) {
      // Em páginas de auth com userId: carrega dados mas não redireciona
      init();
    } else {
      setIsLoading(false);
    }
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
