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
import { DEBOUNCE_AUTOSAVE_MS, SAVE_FEEDBACK_DELAY_MS } from "../constants/timing";

export const ResumeContext = createContext(null);

export const ResumeProvider = ({ children, userId, isLoading }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep]           = useState(0);
  const [formData, setFormData]                 = useState(INITIAL_FORM_DATA);
  const [saveStatus, setSaveStatus]             = useState("saved");
  const [lastSaved, setLastSaved]               = useState(null);
  const [userDocuments, setUserDocuments]       = useState([]);
  const [filter, setFilter]                     = useState("todos");

  // ─── Refs de auto-save ───
  const autosaveTimerRef = useRef(null);
  const isFirstRender    = useRef(true);

  // ─── Auto-save com debounce ───
  const debouncedSave = useCallback((data, uid) => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus("saving");
      StorageService.saveDraft(sanitizeFormData(data), uid, "resume");
      setTimeout(() => {
        setSaveStatus("saved");
        setLastSaved(new Date());
      }, SAVE_FEEDBACK_DELAY_MS);
    }, DEBOUNCE_AUTOSAVE_MS);
  }, []);

  useEffect(() => {
    if (isLoading || isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    debouncedSave(formData, userId);
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [formData, userId, isLoading, debouncedSave]);

  const triggerSave = useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1200);
  }, []);

  const updateForm = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    triggerSave();
  }, [triggerSave]);

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
