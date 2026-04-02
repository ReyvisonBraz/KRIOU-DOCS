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

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
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
  const [userData, setUserData] = useState({ nome: "", sobrenome: "", cpf: "" });
  const [userId, setUserId] = useState(null);

  // ─── Estado de Modelo e Editor ───
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // ─── Estado do Formulário ───
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

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

  // ─── Refs para autosave ───
  const autosaveTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // ─── Função de salvamento com debounce ───
  const debouncedSave = useCallback((data, type, userId) => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    
    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      
      if (type === "resume") {
        StorageService.saveDraft(data, userId, "resume");
      } else if (type === "legal") {
        StorageService.saveDraft(data, userId, "legal");
      } else if (type === "session") {
        StorageService.saveSession(data);
      }
      
      setTimeout(() => {
        setSaveStatus("saved");
        setLastSaved(new Date());
      }, 800);
    }, 1500);
  }, []);

  // ─── Inicializar app - Carregar dados persistidos ───
  useEffect(() => {
    const initializeApp = () => {
      if (StorageService.isAvailable()) {
        // Carregar sessão salva primeiro para obter userId
        const savedSession = StorageService.loadSession(userId);
        const currentUserId = savedSession?.userId || null;
        
        if (currentUserId) {
          setUserId(currentUserId);
          
          // Carregar documentos do usuário específico
          const docs = StorageService.loadDocuments(currentUserId);
          if (docs.length > 0) {
            setUserDocuments(docs);
          }
          
          // Carregar drafts do usuário
          const resumeDraft = StorageService.loadDraft(currentUserId, "resume");
          if (resumeDraft) {
            setFormData(resumeDraft);
          }
          
          const legalDraft = StorageService.loadDraft(currentUserId, "legal");
          if (legalDraft) {
            setLegalFormData(legalDraft);
          }
          
          // Restaurar sessão
          setPhone(savedSession.phone || "");
          setUserData({
            nome: savedSession.nome || "",
            sobrenome: savedSession.sobrenome || "",
            cpf: savedSession.cpf || ""
          });
          setLoginStep(2);
          
          setTimeout(() => {
            setCurrentPage("dashboard");
          }, 500);
        } else {
          // Usuário não logado - carregar dados de guest
          const savedFormData = StorageService.loadFormData();
          if (savedFormData) {
            setFormData(savedFormData);
          }

          const savedLegalFormData = StorageService.loadLegalFormData();
          if (savedLegalFormData) {
            setLegalFormData(savedLegalFormData);
          }
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, []);

  // ─── Auto-salvar dados do formulário (resume) ───
  useEffect(() => {
    if (!isLoading && !isFirstRender.current) {
      debouncedSave(formData, "resume", userId);
    }
    isFirstRender.current = false;
    
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [formData, userId, isLoading, debouncedSave]);

  // ─── Auto-salvar dados do formulário legal ───
  useEffect(() => {
    if (!isLoading && !isFirstRender.current && Object.keys(legalFormData).length > 0) {
      debouncedSave(legalFormData, "legal", userId);
    }
  }, [legalFormData, userId, isLoading, debouncedSave]);

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
    StorageService.clearDraft(userId, "resume");
    StorageService.clearDraft(userId, "legal");
    StorageService.saveFormData(INITIAL_FORM_DATA);
    StorageService.clearLegalFormData();
  }, [userId]);

  // ─── Resetar Formulário Legal ───
  const resetLegalForm = useCallback(() => {
    setLegalFormData({});
    setDocumentType(null);
    setCurrentStep(0);
    StorageService.clearDraft(userId, "legal");
    StorageService.clearLegalFormData();
  }, [userId]);

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
    const docType = documentType ? "legal" : "resume";
    
    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      ...documentData,
      type: docType,
      template: selectedTemplate?.name || documentType?.name || "Padrão",
      date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      createdAt: new Date().toISOString(),
      status: "finalizado",
      userId: userId,
    };
    
    const updatedDocs = [...userDocuments, newDoc];
    setUserDocuments(updatedDocs);
    StorageService.saveDocuments(updatedDocs, userId);
    
    // Limpar draft após finalizar
    if (docType === "resume") {
      StorageService.clearDraft(userId, "resume");
    } else {
      StorageService.clearDraft(userId, "legal");
    }
    
    return newDoc;
  }, [userDocuments, userId, documentType, selectedTemplate]);

  // ─── Login ───
  const login = useCallback((phoneNumber, userDataInput) => {
    const newUserId = phoneNumber.replace(/\D/g, "");
    
    setUserId(newUserId);
    setPhone(phoneNumber);
    setUserData(userDataInput || { nome: "", sobrenome: "", cpf: "" });
    setLoginStep(2);
    
    if (StorageService.isAvailable()) {
      // Primeiro, migrar dados legacy se existirem
      StorageService.migrateLegacyData(newUserId);
      
      // Depois salvar sessão
      StorageService.saveSession({
        isAuthenticated: true,
        userId: newUserId,
        phone: phoneNumber,
        nome: userDataInput?.nome || "",
        sobrenome: userDataInput?.sobrenome || "",
        cpf: userDataInput?.cpf || "",
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
    setUserData({ nome: "", sobrenome: "", cpf: "" });
    StorageService.clearSession(userId);
    navigate("landing");
  }, [navigate, userId]);

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
    userData,
    setUserData,
    userId,
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
    lastSaved,

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