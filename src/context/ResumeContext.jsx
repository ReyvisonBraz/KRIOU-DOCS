/**
 * ============================================
 * KRIOU DOCS - Resume Context
 * ============================================
 * Gerencia formulario de curriculo, templates,
 * auto-save e documentos do usuario.
 *
 * RESPONSABILIDADES:
 * - Estado do formulario de curriculo (INITIAL_FORM_DATA)
 * - Templates disponiveis (RESUME_TEMPLATES)
 * - Steps do wizard (currentStep)
 * - Auto-save de draft (via useAutoSave hook)
 * - Documentos finalizados (userDocuments)
 * - Salvamento de documento no Supabase (saveDocument)
 *
 * FLUXO DE SAVE:
 *   onChange → useAutoSave (debounce 1500ms) → StorageService.saveDraft
 *   "Finalizar" → saveDocument() → DocumentService.insert → Supabase
 *
 * LOGS: Prefixo [ResumeContext] para facilitar filtragem.
 * ERROS: saveDocument joga excecao — o chamador (page) deve tratar.
 *
 * @module context/ResumeContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { INITIAL_FORM_DATA, RESUME_TEMPLATES } from "../data/constants";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { sanitizeFormData } from "../utils/sanitization";
import { useAutoSave } from "../hooks/useAutoSave";

export const ResumeContext = createContext(null);

export const ResumeProvider = ({ children, userId, isLoading }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep]           = useState(0);
  const [formData, setFormData]                 = useState(INITIAL_FORM_DATA);
  const [userDocuments, setUserDocuments]       = useState([]);
  const [filter, setFilter]                     = useState("todos");

  // Ref que impede auto-save durante o carregamento inicial
  // Isso evita sobrescrever drafts carregados pelo AppBootstrap
  const isReadyRef = useRef(false);

  useEffect(() => {
    if (!isLoading) isReadyRef.current = true;
  }, [isLoading]);

  // Funcao de auto-save — so persiste quando o provider esta pronto
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

  // ─── saveDocument — Salva documento finalizado no Supabase ──────────────
  // Diferenca entre resume e legal: documentData carrega os campos corretos
  // O param documentType quando existe indica documento juridico.
  const saveDocument = useCallback(async (documentData, documentType, selectedTpl, variantData) => {
    const docType = documentType ? "legal" : "resume";

    const docPayload = {
      type:              docType,
      title:             documentData.nome || documentData.title || documentType?.name || "Documento",
      template:          selectedTpl || null,
      templateId:        selectedTpl?.id || null,
      templateName:      selectedTpl?.name || documentType?.name || "Padrao",
      status:            "finalizado",
      formData:          docType === "resume" ? documentData : null,
      legalData:         docType === "legal"  ? documentData : null,
      documentType:      documentType?.id   || null,
      documentTypeName:  documentType?.name  || null,
      variantId:         variantData?.id     || null,
      variantName:      variantData?.name   || null,
      variant:          variantData         || null,
    };

    try {
      const newDoc = await DocumentService.insert(docPayload, userId);
      setUserDocuments((prev) => [...prev, newDoc]);
      StorageService.clearDraft(userId, docType);

      return newDoc;
    } catch (err) {
      // [ResumeContext][ERRO] Falha ao salvar documento finalizado
      console.error("[ResumeContext][ERRO] saveDocument:", err.message);
      throw err;
    }
  }, [userId]);

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
  if (!ctx) throw new Error("[ResumeContext] useResume deve ser usado dentro de ResumeProvider");
  return ctx;
};
