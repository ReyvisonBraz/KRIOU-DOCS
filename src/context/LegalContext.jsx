/**
 * ============================================
 * KRIOU DOCS - Legal Context
 * ============================================
 * Gerencia documentos juridicos: tipo, variante,
 * campos do formulario e auto-save.
 *
 * RESPONSABILIDADES:
 * - Document type selection (ex: compra-venda, locacao)
 * - Variant selection (ex: com garantia, sem garantia)
 * - Formulario do documento juridico (legalFormData)
 * - Auto-save de draft (via useAutoSave hook)
 * - Campos desabilitados (disabledFields — para variantes especificas)
 * - Steps do wizard juridico (legalStep)
 *
 * FLUXO DE SELECAO:
 *   1. Usuario seleciona tipo → selectDocumentType(tipo)
 *   2. Usuario seleciona variante → setSelectedVariant(var)
 *   3. Campos aparecem com base na variante
 *   4. Preenchimento → useAutoSave → StorageService.saveDraft
 *
 * LOGS: Prefixo [LegalContext] para facilitar filtragem.
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
  const [legalStep, setLegalStep]             = useState(0);

  // Ref que impede auto-save durante carregamento inicial
  const isReadyRef = useRef(false);

  useEffect(() => {
    if (!isLoading) isReadyRef.current = true;
  }, [isLoading]);

  // Funcao de auto-save — so persiste quando pronto e com dados
  const saveFn = useCallback((data) => {
    if (!isReadyRef.current || Object.keys(data).length === 0) return;
    StorageService.saveDraft(sanitizeFormData(data), userId, "legal");
  }, [userId]);

  const { saveStatus, triggerSave } = useAutoSave(legalFormData, saveFn);

  // Repassa saveStatus ao UIContext (AppContext) para exibicao global
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
    triggerSave,
  };

  return <LegalContext.Provider value={value}>{children}</LegalContext.Provider>;
};

export const useLegal = () => {
  const ctx = useContext(LegalContext);
  if (!ctx) throw new Error("[LegalContext] useLegal deve ser usado dentro de LegalProvider");
  return ctx;
};
