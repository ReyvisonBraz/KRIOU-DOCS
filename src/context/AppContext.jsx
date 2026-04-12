/**
 * ============================================
 * KRIOU DOCS - Application Context (Orquestrador)
 * ============================================
 * Compõe AuthContext + ResumeContext + LegalContext
 * e expõe useApp() com a API unificada que todos
 * os componentes já usam. Zero breaking change.
 *
 * Estrutura interna:
 *   AuthProvider   → userId, loginStep, phone, login, logout
 *   ResumeProvider → formData, templates, saveStatus, documents
 *   LegalProvider  → legalFormData, documentType, variants
 *
 * @module context/AppContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import StorageService from "../utils/storage";
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
  const [currentPage, setCurrentPage] = useState("landing");

  // Ref para evitar pushState recursivo quando o popstate dispara setCurrentPage
  const isPopstateRef = useRef(false);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);

    // Empurra uma entrada no histórico do browser (permite botão Voltar)
    // mas só quando a navegação veio do app (não de um evento popstate)
    if (!isPopstateRef.current) {
      window.history.pushState({ page }, "", window.location.pathname);
    }

    // Persiste no localStorage para restaurar após F5
    if (RESTORABLE_PAGES.has(page)) {
      StorageService.savePage(page);
    } else {
      StorageService.clearPage();
    }
  }, []);

  // Escuta o botão Voltar / Avançar do browser
  useEffect(() => {
    const handlePopstate = (event) => {
      const page = event.state?.page;
      if (page) {
        isPopstateRef.current = true;
        setCurrentPage(page);
        window.scrollTo(0, 0);
        isPopstateRef.current = false;
      } else {
        // Sem estado (entrada inicial sem pushState) → vai para landing
        isPopstateRef.current = true;
        setCurrentPage("landing");
        window.scrollTo(0, 0);
        isPopstateRef.current = false;
      }
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

// ─── Bootstrap: lê localStorage e hidrata os providers filhos ────────────────

const AppBootstrap = ({ children }) => {
  const { setUserId, setUserData, setLoginStep } = useAuth();
  const { setFormData, setUserDocuments }                = useResume();
  const { setLegalFormData }                             = useLegal();
  const { navigate }                                     = useContext(NavigationContext);
  const { setIsLoading, setSaveStatus }                  = useContext(UIContext);

  useEffect(() => {
    const init = () => {
      if (StorageService.isAvailable()) {
        const savedSession    = StorageService.loadSession(null);
        const currentUserId   = savedSession?.userId || null;

        if (currentUserId) {
          setUserId(currentUserId);

          const docs = StorageService.loadDocuments(currentUserId);
          if (docs.length > 0) setUserDocuments(docs);

          const resumeDraft = StorageService.loadDraft(currentUserId, "resume");
          if (resumeDraft) setFormData(resumeDraft);

          const legalDraft = StorageService.loadDraft(currentUserId, "legal");
          if (legalDraft) setLegalFormData(legalDraft);

          setUserData({ nome: savedSession.displayName || "", sobrenome: "", cpf: "" });
          setLoginStep(2);

          // Restaura a última página visitada; cai no dashboard se não houver
          const savedPage = StorageService.loadPage();
          const targetPage = (savedPage && RESTORABLE_PAGES.has(savedPage)) ? savedPage : "dashboard";
          setTimeout(() => navigate(targetPage), 500);
        } else {
          const savedFormData = StorageService.loadFormData();
          if (savedFormData) setFormData(savedFormData);

          const savedLegalFormData = StorageService.loadLegalFormData();
          if (savedLegalFormData) setLegalFormData(savedLegalFormData);
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(init, APP_INIT_DELAY_MS);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
};

// ─── InnerProviders: lê userId do AuthContext e passa para dependentes ────────
// Necessário porque ResumeProvider/LegalProvider dependem de userId,
// que só existe após AuthProvider estar montado.

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

  return (
    <UIContext.Provider value={{ isLoading, setIsLoading, checkoutComplete, setCheckoutComplete, saveStatus, setSaveStatus }}>
      <NavigationProvider>
        <NavigationContext.Consumer>
          {({ navigate }) => (
            <AuthProvider onNavigate={navigate}>
              <InnerProviders isLoading={isLoading} setSaveStatus={setSaveStatus}>
                {children}
              </InnerProviders>
            </AuthProvider>
          )}
        </NavigationContext.Consumer>
      </NavigationProvider>
    </UIContext.Provider>
  );
};

// ─── AppContext unificado — mantém API existente de useApp() ─────────────────

const AppContext = createContext(null);

/**
 * useApp — Hook unificado. Agrega todos os sub-contextos numa única
 * interface para zero breaking change nos componentes existentes.
 */
export const useApp = () => {
  const nav    = useContext(NavigationContext);
  const ui     = useContext(UIContext);
  const auth   = useAuth();
  const resume = useResume();
  const legal  = useLegal();

  if (!nav || !ui || !auth || !resume || !legal) {
    throw new Error("useApp must be used within AppProvider");
  }

  // Wrappers que precisam de userId atualizado no momento da chamada
  const logout = useCallback(() => {
    auth.logout(auth.userId);
  }, [auth]);

  return {
    // Navegação
    currentPage: nav.currentPage,
    navigate: nav.navigate,

    // Auth
    loginStep: auth.loginStep,   setLoginStep: auth.setLoginStep,
    phone: auth.phone,           setPhone: auth.setPhone,
    otp: auth.otp,               setOtp: auth.setOtp,
    userData: auth.userData,     setUserData: auth.setUserData,
    userId: auth.userId,
    login: auth.login,
    logout,

    // Resume
    selectedTemplate: resume.selectedTemplate,   setSelectedTemplate: resume.setSelectedTemplate,
    templates: resume.templates,
    currentStep: resume.currentStep,             setCurrentStep: resume.setCurrentStep,
    formData: resume.formData,                   setFormData: resume.setFormData,
    updateForm: resume.updateForm,
    resetForm: () => resume.resetForm(legal.resetLegalForm),
    saveStatus: resume.saveStatus,
    lastSaved: resume.lastSaved,
    triggerSave: resume.triggerSave,
    userDocuments: resume.userDocuments,         setUserDocuments: resume.setUserDocuments,
    saveDocument: (data) => resume.saveDocument(data, legal.documentType, resume.selectedTemplate),
    filter: resume.filter,                       setFilter: resume.setFilter,

    // Legal
    documentType: legal.documentType,            setDocumentType: legal.setDocumentType,
    selectedVariant: legal.selectedVariant,      setSelectedVariant: legal.setSelectedVariant,
    legalFormData: legal.legalFormData,          setLegalFormData: legal.setLegalFormData,
    disabledFields: legal.disabledFields,        setDisabledFields: legal.setDisabledFields,
    legalStep: legal.legalStep,                  setLegalStep: legal.setLegalStep,
    legalDocumentTypes: legal.legalDocumentTypes,
    updateLegalField: legal.updateLegalField,
    selectDocumentType: legal.selectDocumentType,
    resetLegalForm: legal.resetLegalForm,
    triggerLegalSave: legal.triggerSave,

    // UI
    isLoading: ui.isLoading,
    checkoutComplete: ui.checkoutComplete,       setCheckoutComplete: ui.setCheckoutComplete,
  };
};

export default AppContext;
