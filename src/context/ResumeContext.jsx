/**
 * ============================================
 * KRIOU DOCS - Resume Context
 * ============================================
 * Gerencia o formulário de currículo, templates,
 * auto-save e documentos do usuário.
 *
 * @module context/ResumeContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { INITIAL_FORM_DATA, RESUME_TEMPLATES } from "../data/constants";
import StorageService from "../utils/storage";
import { sanitizeFormData } from "../utils/sanitization";
import { useAutoSave } from "../hooks/useAutoSave";

export const ResumeContext = createContext(null);

export const ResumeProvider = ({ children, userId, isLoading }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep]           = useState(0);
  const [formData, setFormData]                 = useState(INITIAL_FORM_DATA);
  const [userDocuments, setUserDocuments]       = useState([]);
  const [filter, setFilter]                     = useState("todos");

  // Ref para bloquear auto-save durante carregamento inicial
  const isReadyRef = useRef(false);

  useEffect(() => {
    if (!isLoading) isReadyRef.current = true;
  }, [isLoading]);

  // Função de save passada ao hook — só persiste quando pronto
  const saveFn = useCallback((data) => {
    if (!isReadyRef.current) return;
    StorageService.saveDraft(sanitizeFormData(data), userId, "resume");
  }, [userId]);

  const { saveStatus, lastSaved, triggerSave } = useAutoSave(formData, saveFn);

  const updateForm = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback((legalResetFn) => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(0);
    setSelectedTemplate(null);
    StorageService.clearDraft(userId, "resume");
    StorageService.saveFormData(INITIAL_FORM_DATA);
    legalResetFn?.();
  }, [userId]);

  const saveDocument = useCallback((documentData, documentType, selectedTpl) => {
    const docType = documentType ? "legal" : "resume";

    const newDoc = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      ...documentData,
      type: docType,
      template: selectedTpl?.name || documentType?.name || "Padrão",
      date: new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      createdAt: new Date().toISOString(),
      status: "finalizado",
      userId,
    };

    const updatedDocs = [...userDocuments, newDoc];
    setUserDocuments(updatedDocs);
    StorageService.saveDocuments(updatedDocs, userId);
    StorageService.clearDraft(userId, docType);
    return newDoc;
  }, [userDocuments, userId]);

  const value = {
    selectedTemplate, setSelectedTemplate,
    templates: RESUME_TEMPLATES,
    currentStep, setCurrentStep,
    formData, setFormData, updateForm, resetForm,
    saveStatus, lastSaved, triggerSave,
    userDocuments, setUserDocuments, saveDocument,
    filter, setFilter,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
};
