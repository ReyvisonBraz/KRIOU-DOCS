/**
 * ============================================
 * KRIOU DOCS - Application Context
 * ============================================
 * Global state management using React Context
 * for handling navigation, forms, and user data.
 * Integrates with localStorage for data persistence.
 * 
 * @module context/AppContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { INITIAL_FORM_DATA, RESUME_TEMPLATES, LEGAL_DOCUMENT_TYPES } from "../data/constants";
import StorageService from "../utils/storage";

/**
 * AppContext - Main application state provider
 * Manages: navigation, form data, user session, templates
 */
const AppContext = createContext(null);

/**
 * AppProvider - Wraps the application with global state
 */
export const AppProvider = ({ children }) => {
  // ─── Estado de Navegação ───
  const [currentPage, setCurrentPage] = useState("landing");

  // ─── Estado de Autenticação ───
  const [loginStep, setLoginStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // ─── Estado de Modelo e Editor ───
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // ─── Estado do Formulário ───
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState("saved");

  // ─── Estado do Dashboard ───
  const [filter, setFilter] = useState("todos");
  const [userDocuments, setUserDocuments] = useState([]);

  // ─── Estado de Documentos Legais ───
  const [documentType, setDocumentType] = useState(null);
  const [legalFormData, setLegalFormData] = useState({});
  const legalDocumentTypes = LEGAL_DOCUMENT_TYPES;

  // ─── Estado do Checkout ───
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // ─── Estado de Carregamento ───
  const [isLoading, setIsLoading] = useState(true);

  // ─── Inicializar app - Carregar dados persistidos ───
  useEffect(() => {
    const initializeApp = () => {
      // Verificar disponibilidade de armazenamento
      if (StorageService.isAvailable()) {
        // Carregar dados do formulário salvos
        const savedFormData = StorageService.loadFormData();
        if (savedFormData) {
          setFormData(savedFormData);
        }

        // Carregar dados do formulário legal
        const savedLegalFormData = StorageService.loadLegalFormData();
        if (savedLegalFormData) {
          setLegalFormData(savedLegalFormData);
        }

        // Carregar documentos salvos
        const savedDocuments = StorageService.loadDocuments();
        if (savedDocuments.length > 0) {
          setUserDocuments(savedDocuments);
        }

        // Carregar sessão salva (se o usuário estava logado)
        const savedSession = StorageService.loadSession();
        if (savedSession && savedSession.isAuthenticated) {
          setPhone(savedSession.phone || "");
          setLoginStep(2);
          setTimeout(() => {
            setCurrentPage("dashboard");
          }, 500);
        }
      }
      setIsLoading(false);
    };

    // Pequeno atraso para garantir a montagem do componente
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  // ─── Auto-salvar dados do formulário quando mudar ───
  useEffect(() => {
    if (!isLoading && StorageService.isAvailable()) {
      // Salvar com debounce
      const timer = setTimeout(() => {
        StorageService.saveFormData(formData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, isLoading]);

  // ─── Auto-salvar dados do formulário legal quando mudar ───
  useEffect(() => {
    if (!isLoading && StorageService.isAvailable()) {
      const timer = setTimeout(() => {
        StorageService.saveLegalFormData(legalFormData);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [legalFormData, isLoading]);

  // ─── Auxiliar de Navegação ───
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  // ─── Simulação de Auto-salvar ───
  const triggerSave = useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1200);
  }, []);

  // ─── Auxiliar de Atualização do Formulário ───
  const updateForm = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    triggerSave();
  }, [triggerSave]);

  // ─── Resetar Formulário ───
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    setSelectedTemplate(null);
    setLegalFormData({});
    setDocumentType(null);
    StorageService.saveFormData(INITIAL_FORM_DATA);
    StorageService.clearLegalFormData();
  }, []);

  // ─── Resetar Formulário Legal ───
  const resetLegalForm = useCallback(() => {
    setLegalFormData({});
    setDocumentType(null);
    setCurrentStep(0);
    StorageService.clearLegalFormData();
  }, []);

  // ─── Atualizar Dados do Documento Legal ───
  const updateLegalField = useCallback((field, value) => {
    setLegalFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ─── Selecionar Tipo de Documento ───
  const selectDocumentType = useCallback((type) => {
    setDocumentType(type);
    setLegalFormData({});
    setCurrentStep(0);
  }, []);

  // ─── Salvar Documento (quando o checkout for concluído) ───
  const saveDocument = useCallback((documentData) => {
    const newDoc = {
      id: Date.now(),
      ...documentData,
      date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      status: "finalizado",
    };
    
    const updatedDocs = [...userDocuments, newDoc];
    setUserDocuments(updatedDocs);
    StorageService.saveDocuments(updatedDocs);
    
    return newDoc;
  }, [userDocuments]);

  // ─── Login ───
  const login = useCallback((phoneNumber) => {
    setPhone(phoneNumber);
    setLoginStep(2);
    
    // Salvar sessão
    if (StorageService.isAvailable()) {
      StorageService.saveSession({
        isAuthenticated: true,
        phone: phoneNumber,
        loginTime: new Date().toISOString(),
      });
    }
    
    setTimeout(() => navigate("dashboard"), 1500);
  }, [navigate]);

  // ─── Logout ───
  const logout = useCallback(() => {
    setLoginStep(0);
    setOtp(["", "", "", "", "", ""]);
    setPhone("");
    StorageService.clearSession();
    navigate("landing");
  }, [navigate]);

  // ─── Valor do Context ───
  const value = {
    // Navegação
    currentPage,
    navigate,

    // Autenticação
    loginStep,
    setLoginStep,
    phone,
    setPhone,
    otp,
    setOtp,
    login,
    logout,

    // Modelos
    selectedTemplate,
    setSelectedTemplate,
    templates: RESUME_TEMPLATES,

    // Editor
    currentStep,
    setCurrentStep,

    // Formulário
    formData,
    setFormData,
    updateForm,
    resetForm,
    saveStatus,

    // Dashboard
    filter,
    setFilter,
    userDocuments,
    setUserDocuments,
    saveDocument,

    // Documentos Legais
    documentType,
    setDocumentType,
    legalFormData,
    setLegalFormData,
    updateLegalField,
    selectDocumentType,
    legalDocumentTypes,
    resetLegalForm,

    // Checkout
    checkoutComplete,
    setCheckoutComplete,

    // Carregamento
    isLoading,

    // Actions
    triggerSave,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * useApp - Hook to access global application context
 * @returns {Object} Application context state and actions
 * @throws {Error} If used outside AppProvider
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

// ─── Export for use in components ───
export default AppContext;