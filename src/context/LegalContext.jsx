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
import { DEBOUNCE_AUTOSAVE_MS, SAVE_FEEDBACK_DELAY_MS } from "../constants/timing";

export const LegalContext = createContext(null);

export const LegalProvider = ({ children, userId, isLoading, onSaveStatus }) => {
  const [documentType, setDocumentType]     = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [legalFormData, setLegalFormData]   = useState({});
  const [disabledFields, setDisabledFields] = useState({});

  const autosaveTimerRef = useRef(null);

  // ─── Auto-save com debounce ───
  const debouncedLegalSave = useCallback((data, uid) => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = setTimeout(() => {
      onSaveStatus?.("saving");
      StorageService.saveDraft(sanitizeFormData(data), uid, "legal");
      setTimeout(() => onSaveStatus?.("saved"), SAVE_FEEDBACK_DELAY_MS);
    }, DEBOUNCE_AUTOSAVE_MS);
  }, [onSaveStatus]);

  useEffect(() => {
    if (!isLoading && Object.keys(legalFormData).length > 0) {
      debouncedLegalSave(legalFormData, userId);
    }
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [legalFormData, userId, isLoading, debouncedLegalSave]);

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
    StorageService.clearDraft(userId, "legal");
    StorageService.clearLegalFormData();
  }, [userId]);

  const value = {
    documentType, setDocumentType,
    selectedVariant, setSelectedVariant,
    legalFormData, setLegalFormData,
    disabledFields, setDisabledFields,
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
