/**
 * ============================================
 * KRIOU DOCS - Legal Context
 * ============================================
 * Gerencia documentos jurídicos: tipo, variante,
 * campos do formulário e auto-save.
 *
 * @module context/LegalContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { LEGAL_DOCUMENT_TYPES } from "../data/constants";
import StorageService from "../utils/storage";
import { sanitizeFormData } from "../utils/sanitization";
import { useAutoSave } from "../hooks/useAutoSave";

export const LegalContext = createContext(null);

export const LegalProvider = ({ children, userId, isLoading, onSaveStatus }) => {
  const [documentType, setDocumentType]       = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [legalFormData, setLegalFormData]     = useState({});
  const [disabledFields, setDisabledFields]   = useState({});
  // Step próprio do editor jurídico — isolado do currentStep do currículo
  const [legalStep, setLegalStep]             = useState(0);

  // Ref para bloquear auto-save durante carregamento inicial
  const isReadyRef = useRef(false);

  useEffect(() => {
    if (!isLoading) isReadyRef.current = true;
  }, [isLoading]);

  // Função de save passada ao hook — só persiste quando há dados e está pronto
  const saveFn = useCallback((data) => {
    if (!isReadyRef.current || Object.keys(data).length === 0) return;
    StorageService.saveDraft(sanitizeFormData(data), userId, "legal");
  }, [userId]);

  const { saveStatus } = useAutoSave(legalFormData, saveFn);

  // Repassa saveStatus ao contexto pai (UIContext) via callback
  useEffect(() => {
    onSaveStatus?.(saveStatus);
  }, [saveStatus, onSaveStatus]);

  const updateLegalField = useCallback((field, value) => {
    setLegalFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const selectDocumentType = useCallback((type) => {
    setDocumentType(type);
    setLegalFormData({});
  }, []);

  const resetLegalForm = useCallback(() => {
    setLegalFormData({});
    setDocumentType(null);
    setSelectedVariant(null);
    setDisabledFields({});
    setLegalStep(0);
    StorageService.clearDraft(userId, "legal");
    StorageService.clearLegalFormData();
  }, [userId]);

  const value = {
    documentType, setDocumentType,
    selectedVariant, setSelectedVariant,
    legalFormData, setLegalFormData,
    disabledFields, setDisabledFields,
    legalStep, setLegalStep,
    legalDocumentTypes: LEGAL_DOCUMENT_TYPES,
    updateLegalField, selectDocumentType, resetLegalForm,
  };

  return <LegalContext.Provider value={value}>{children}</LegalContext.Provider>;
};

export const useLegal = () => {
  const ctx = useContext(LegalContext);
  if (!ctx) throw new Error("useLegal must be used within LegalProvider");
  return ctx;
};
