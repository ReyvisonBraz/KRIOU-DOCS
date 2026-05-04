import React, { useState, useCallback, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useConfirm } from "../hooks/useConfirm";
import { Icon } from "../components/Icons";
import { generateDocumentCode } from "../utils/documentCode";
import {
  Card,
  Button,
  Badge,
  VariantSelector,
  SectionHeader,
  LegalFieldRenderer,
  ClientNoteBanner,
  AppNavbar,
  BottomNavigation,
  SaveIndicator,
  ConfirmDialog,
  RequirementsModal,
} from "../components/UI";
import showToast from "../utils/toast";
import StorageService from "../utils/storage";
import { generateMockFormData } from "../utils/mockData";
import {
  getSectionsForVariant,
  validateFields,
  getDocumentBody,
} from "../data/legalDocuments";

const PARTY_KEYWORDS = [
  "vendedor", "comprador", "locador", "locatario", "outorgante", "outorgado",
  "doador", "donatario", "recebedor", "pagador", "companheiro",
  "autorizante", "menor", "acompanhante", "comodante", "comodatario", "permutante",
];

const SECTION_COLORS = [
  { bg: "rgba(244,63,94,0.10)", border: "rgba(244,63,94,0.25)", accent: "var(--coral)", iconBg: "rgba(244,63,94,0.12)" },
  { bg: "rgba(20,184,166,0.10)", border: "rgba(20,184,166,0.25)", accent: "var(--teal)", iconBg: "rgba(20,184,166,0.12)" },
  { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", accent: "#3B82F6", iconBg: "rgba(59,130,246,0.12)" },
  { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", accent: "#A855F7", iconBg: "rgba(168,85,247,0.12)" },
  { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", accent: "#F59E0B", iconBg: "rgba(245,158,11,0.12)" },
  { bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)", accent: "#22C55E", iconBg: "rgba(34,197,94,0.12)" },
  { bg: "rgba(236,72,153,0.10)", border: "rgba(236,72,153,0.25)", accent: "#EC4899", iconBg: "rgba(236,72,153,0.12)" },
  { bg: "rgba(14,165,233,0.10)", border: "rgba(14,165,233,0.25)", accent: "#0EA5E9", iconBg: "rgba(14,165,233,0.12)" },
];

const isPartySection = (id) => PARTY_KEYWORDS.some((kw) => id.includes(kw));

const getPartyInstances = (fields, prefix) => {
  const instances = [];
  for (let i = 0; i < 3; i++) {
    const hasInstance = fields.some((f) => f.key.startsWith(`${prefix}_${i}_`));
    if (hasInstance) {
      instances.push({
        index: i,
        fields: fields.filter((f) => f.key.startsWith(`${prefix}_${i}_`)),
      });
    }
  }
  if (instances.length === 0) {
    instances.push({ index: 0, fields });
  }
  return instances;
};

const labelClass = "block text-[13px] font-semibold text-text-dim mb-1.5 tracking-[0.01em] font-body";
const errorClass = "flex items-center gap-1.5 text-coral font-medium text-xs mt-1.5 ml-1";
const inputErrorClass = "input-field-error";

const LegalEditorPage = () => {
  const {
    navigate,
    legalStep: currentStep,
    setLegalStep: setCurrentStep,
    legalFormData,
    setLegalFormData,
    documentType,
    setDocumentType,
    selectedVariant,
    setSelectedVariant,
    disabledFields,
    setDisabledFields,
    saveStatus,
    lastSaved,
    triggerLegalSave,
    userDocuments,
    setUserDocuments,
    userId,
  } = useApp();

  const [selectedDoc, setSelectedDoc] = useState(documentType || null);
  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [expandedParties, setExpandedParties] = useState({});

  const bottomNavRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (documentType && documentType !== selectedDoc) {
      setSelectedDoc(documentType);
    }
  }, [documentType, selectedDoc]);

  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToTop(); }, [currentStep, scrollToTop]);

  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
  const isDirty = saveStatus === "saving" || saveStatus === "idle";
  useUnsavedChanges(isDirty);

  const currentSections = selectedDoc && selectedVariant
    ? getSectionsForVariant(selectedDoc.id, selectedVariant)
    : [];

  const steps = [];
  steps.push({ key: "variant", label: "Variação", icon: "GitBranch", color: SECTION_COLORS[0] });
  currentSections.forEach((section, i) => {
    const c = SECTION_COLORS[(i + 1) % SECTION_COLORS.length];
    steps.push({
      key: section.id, label: section.title, icon: section.icon || "FileText",
      color: c, isParty: isPartySection(section.id), sectionIndex: i,
    });
  });
  steps.push({ key: "review", label: "Revisão", icon: "Check", color: SECTION_COLORS[1] });
  steps.push({ key: "preview", label: "Visualizar", icon: "Eye", color: SECTION_COLORS[0] });

  const variantIndex = 0;
  const reviewIndex = steps.length - 2;
  const previewIndex = steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === previewIndex;
  const isVariantStep = currentStep === variantIndex;
  const isReviewStep = currentStep === reviewIndex;
  const isPreviewStep = currentStep === previewIndex;
  const isFillStep = !isVariantStep && !isReviewStep && !isPreviewStep;

  const currentStepObj = steps[currentStep];
  const currentSection = isFillStep ? currentSections[currentStepObj?.sectionIndex] : null;

  const handleUpdateField = useCallback((key, value) => {
    setLegalFormData((prev) => ({ ...prev, [key]: value }));
  }, [setLegalFormData]);

  const handleToggleDisabled = (key) => {
    setDisabledFields((prev) => ({ ...prev, [key]: !prev[key] }));
    if (!disabledFields[key]) {
      setLegalFormData((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleExpandParty = (id) => {
    setExpandedParties((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getFieldError = (key) => {
    if (!showErrors) return null;
    return stepErrors[key] || null;
  };

  const handleFillDemo = () => {
    const mockData = generateMockFormData(selectedDoc.id, selectedVariant, currentSections);
    setLegalFormData(mockData);
    setDisabledFields({});
    setStepErrors({});
    setShowErrors(false);
    showToast.success("Dados de demonstração preenchidos! Avance para visualizar o documento.");
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedVariant) return;
    if (isFillStep && currentSection) {
      const sectionFields = currentSection.fields.filter((f) => !disabledFields[f.key]);
      const validation = validateFields(selectedDoc.id, selectedVariant, legalFormData, disabledFields);
      const sectionErrors = {};
      sectionFields.forEach((f) => {
        if (validation.errors[f.key]) sectionErrors[f.key] = validation.errors[f.key];
      });
      if (Object.keys(sectionErrors).length > 0) {
        setStepErrors(sectionErrors);
        setShowErrors(true);
        const firstKey = Object.keys(sectionErrors)[0];
        const el = document.getElementById(`field-${firstKey}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      setStepErrors({});
      setShowErrors(false);
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowErrors(false);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
      setShowErrors(false);
    }
  };

  const handleSaveLater = () => {
    if (!selectedDoc) { navigate("dashboard", { replace: true }); return; }
    const variantObj = selectedDoc?.variants?.find((v) => v.id === selectedVariant);
    const draftSnapshot = {
      documentType: selectedDoc, selectedVariant, legalFormData,
      disabledFields, legalStep: currentStep,
    };
    const title = selectedDoc.name + (variantObj ? ` — ${variantObj.name}` : "");
    const now = new Date();
    const dateLabel = now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    const existingDraftIdx = (userDocuments || []).findIndex(
      (d) => d.status === "rascunho" && d.type === "legal" && d.documentType === selectedDoc.id && d._draftOrigin === "legalEditor"
    );
    let updated;
    if (existingDraftIdx >= 0) {
      updated = (userDocuments || []).map((d, i) =>
        i === existingDraftIdx ? { ...d, title, date: dateLabel, draft: draftSnapshot, updatedAt: now.toISOString() } : d
      );
    } else {
      const code = generateDocumentCode(userDocuments || [], selectedDoc.id);
      const newCard = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        title, type: "legal", documentType: selectedDoc.id,
        template: variantObj?.name || selectedDoc.name, date: dateLabel,
        status: "rascunho", draft: draftSnapshot, code,
        _draftOrigin: "legalEditor", createdAt: now.toISOString(), updatedAt: now.toISOString(), userId,
      };
      updated = [...(userDocuments || []), newCard];
    }
    setUserDocuments(updated);
    StorageService.saveDocuments(updated, userId);
    triggerLegalSave?.();
    navigate("dashboard", { replace: true });
    showToast.success("Rascunho salvo! Continue de onde parou a qualquer momento.");
  };

  const handleGoHome = async () => {
    const hasDraft = Object.keys(legalFormData).length > 0 || currentStep > 0;
    if (!hasDraft) { navigate("dashboard", { replace: true }); return; }
    const confirmed = await requestConfirm({
      title: "Sair do editor", message: "Deseja salvar o rascunho e sair? Você poderá continuar de onde parou.",
      confirmLabel: "Salvar e sair", cancelLabel: "Continuar editando", danger: false,
    });
    if (confirmed) handleSaveLater();
  };

  const currentVariantObj = selectedDoc?.variants?.find((v) => v.id === selectedVariant);
  const allRequiredFields = currentSections.flatMap((s) => s.fields.filter((f) => f.required && !disabledFields[f.key]));
  const filledRequired = allRequiredFields.filter((f) => legalFormData[f.key] && String(legalFormData[f.key]).trim() !== "");
  const allDone = filledRequired.length === allRequiredFields.length && allRequiredFields.length > 0;

  const completedSteps = new Set(steps.map((_, i) => i).filter((i) => i < currentStep));
  const navTitle = selectedDoc
    ? selectedDoc.name + (currentVariantObj && currentStep > 0 ? ` — ${currentVariantObj.name}` : "")
    : "Documento Jurídico";

  const getSectionFilledCount = (sectionId) => {
    if (sectionId === "variant" || sectionId === "review" || sectionId === "preview") return null;
    const sIdx = steps.findIndex(s => s.key === sectionId) - 1;
    if (sIdx < 0 || sIdx >= currentSections.length) return null;
    const section = currentSections[sIdx];
    const fields = section.fields.filter(f => !disabledFields[f.key]);
    const filled = fields.filter(f => legalFormData[f.key] && String(legalFormData[f.key]).trim() !== "");
    return { filled: filled.length, total: fields.length };
  };

  const nextLabel = isLastStep ? "Gerar PDF"
    : isReviewStep ? "Visualizar"
    : isVariantStep ? "Começar Preenchimento"
    : `Próximo: ${steps[currentStep + 1]?.label || ""}`;

  const renderStepIndicator = () => (
    <div className="le-step-indicator" style={{
      padding: "12px 16px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    }}>
      {steps.map((step, idx) => {
        const isCurrent = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isFuture = idx > currentStep;
        const fillCount = getSectionFilledCount(step.key);

        return (
          <button
            key={step.key}
            onClick={() => handleStepClick(idx)}
            disabled={isFuture}
            aria-label={`${step.label}${isCompleted ? " (concluído)" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 44,
              minHeight: 40,
              padding: "6px 14px",
              borderRadius: 100,
              border: isCurrent
                ? `2px solid ${step.color.accent}`
                : isCompleted
                ? "1.5px solid var(--success)"
                : "1.5px solid transparent",
              background: isCurrent ? `${step.color.accent}14` : isCompleted ? "rgba(16,185,129,0.08)" : "transparent",
              color: isCurrent ? step.color.accent : isCompleted ? "var(--success)" : "var(--text-faint)",
              fontSize: 12,
              fontWeight: isCurrent ? 700 : 500,
              cursor: isFuture ? "default" : "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.2s ease",
              opacity: isFuture ? 0.4 : 1,
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              if (!isFuture) { e.currentTarget.style.background = `${step.color.accent}18`; e.currentTarget.style.color = step.color.accent; }
            }}
            onMouseLeave={(e) => {
              if (!isCurrent && !isFuture) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isCompleted ? "var(--success)" : "var(--text-faint)"; }
              if (isCurrent) { e.currentTarget.style.background = `${step.color.accent}14`; e.currentTarget.style.color = step.color.accent; }
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>
              {isCompleted ? "✓" : step.icon ? "●" : `${idx + 1}`}
            </span>
            <span className="le-step-label" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
              {step.label}
            </span>
            {fillCount && (
              <span className="le-step-count" style={{
                fontSize: 10, fontWeight: 700,
                padding: "2px 6px", borderRadius: 8,
                background: "var(--surface-2)", color: "var(--text-muted)",
              }}>
                {fillCount.filled}/{fillCount.total}
              </span>
            )}
          </button>
        );
      })}
      {currentSections.length > 0 && !isReviewStep && !isPreviewStep && (
        <button
          onClick={handleFillDemo}
          title="Preencher com dados de demonstração"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 4,
            minWidth: 36,
            minHeight: 34,
            padding: "4px 12px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent",
            color: "var(--text-faint)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            fontFamily: "var(--font-body)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.12)"; e.currentTarget.style.color = "var(--teal)"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.25)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          <Icon name="Wand2" className="w-3.5 h-3.5" />
          <span className="le-step-label">Demo</span>
        </button>
      )}
    </div>
  );

  const renderVariantSelection = () => (
    <div style={{ animation: "fade-in 0.35s ease-out both" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 className="font-display le-title-mobile" style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>
          {selectedDoc?.name}
        </h2>
        <p className="le-desc-mobile" style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>
          Escolha a variação do documento. Cada opção adapta os campos automaticamente.
        </p>
        {selectedDoc?.legislation && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--surface)", borderRadius: 12, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-body)", border: "1px solid var(--border)" }}>
            <Icon name="Scale" className="w-4 h-4" style={{ color: "var(--teal)", flexShrink: 0 }} />
            {selectedDoc.legislation}
          </div>
        )}
        <button onClick={() => setShowRequirements(true)} aria-label="Ver requisitos do documento" className="le-req-btn"
          style={{ marginTop: 16, padding: "14px 24px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", borderRadius: 14, background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "var(--teal)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 48, transition: "all 0.2s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.16)"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(20,184,166,0.1)"; e.currentTarget.style.borderColor = "rgba(20,184,166,0.25)"; }}
        >
          <Icon name="ClipboardList" className="w-5 h-5" /> Ver requisitos do documento
        </button>
      </div>
      <div style={{ marginTop: 8, padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <Icon name="Info" className="w-5 h-5" style={{ color: "var(--coral)", flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: 0, fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
          <strong style={{ color: "var(--text)", fontWeight: 700 }}>Não sabe o que precisa?</strong>{" "}Clique acima para ver os requisitos mínimos, essenciais e completos.
        </p>
      </div>
      <VariantSelector variants={selectedDoc?.variants || []} selected={selectedVariant} onSelect={setSelectedVariant} />
      {currentVariantObj && currentSections.length > 0 && (
        <div style={{ marginTop: 24, padding: 20, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", color: "var(--text)" }}>
            <span style={{ fontSize: 20 }}>{currentVariantObj.icon}</span>
            {currentVariantObj.name}
            <Badge variant="teal" style={{ marginLeft: 8 }}>{currentSections.length} seções</Badge>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {currentSections.map((section, i) => (
              <span key={section.id} style={{ fontSize: 12, padding: "6px 14px", background: "var(--surface-2)", borderRadius: 10, color: "var(--text)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500, fontFamily: "var(--font-body)", border: "1px solid var(--border)" }}>
                <span style={{ color: "var(--teal)", fontWeight: 700, fontFamily: "var(--font-display)" }}>{i + 1}</span>
                {section.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPartySection = (section, sectionIndex) => {
    const stepColor = steps[sectionIndex + 1]?.color || SECTION_COLORS[0];
    const prefix = section.id;
    const instances = getPartyInstances(section.fields, prefix);

    return (
      <div style={{ animation: "fade-in 0.35s ease-out both" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: "var(--text)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: stepColor.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {section.icon || "👤"}
            </span>
            {section.title}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginLeft: 50 }}>
            Preencha os dados{instances.length > 1 ? ` do primeiro ${section.title.toLowerCase()}. Se houver mais, adicione abaixo.` : "."}
          </p>
        </div>

        <ClientNoteBanner notes={selectedDoc?.clientNotes} />

        {instances.map((instance, instIdx) => {
          const isExpanded = instIdx === 0 || expandedParties[`${section.id}_${instIdx}`];
          if (!isExpanded) {
            return (
              <div key={instIdx} style={{ marginBottom: 12 }}>
                <button
                  onClick={() => toggleExpandParty(`${section.id}_${instIdx}`)}
                  style={{
                    width: "100%", padding: "16px 20px", borderRadius: 14,
                    background: stepColor.bg, border: `1.5px dashed ${stepColor.border}`,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                    fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
                    color: stepColor.accent, minHeight: 52,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = stepColor.bg; }}
                >
                  <Icon name="Plus" className="w-5 h-5" />
                  Adicionar {section.title} {instIdx + 1}
                </button>
              </div>
            );
          }

          return (
            <div key={instIdx} className="le-party-card" style={{ marginBottom: 20 }}>
              <div style={{
                padding: 20, borderRadius: 16, background: "var(--surface)",
                border: `1.5px solid ${stepColor.border}`, position: "relative",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 16, paddingBottom: 12,
                  borderBottom: `1px solid ${stepColor.border}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: stepColor.accent, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 8, background: stepColor.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                      {instIdx + 1}
                    </span>
                    {section.title} {instIdx + 1}
                  </span>
                  {instIdx > 0 && (
                    <button
                      onClick={() => toggleExpandParty(`${section.id}_${instIdx}`)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--coral)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="le-field-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 20px" }}>
                  {instance.fields.map((fieldDef) => (
                    <div key={fieldDef.key} id={`field-${fieldDef.key}`}>
                      <LegalFieldRenderer
                        fieldDef={fieldDef}
                        value={legalFormData[fieldDef.key]}
                        onChange={handleUpdateField}
                        error={getFieldError(fieldDef.key)}
                        disabled={disabledFields[fieldDef.key]}
                        onToggleDisabled={() => handleToggleDisabled(fieldDef.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {instances.length < 3 && (
          <button
            onClick={() => toggleExpandParty(`${section.id}_${instances.length}`)}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 14,
              background: "transparent", border: `2px dashed ${stepColor.border}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
              color: stepColor.accent, minHeight: 48,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = stepColor.bg; e.currentTarget.style.borderColor = stepColor.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = stepColor.border; }}
          >
            <Icon name="Plus" className="w-5 h-5" />
            Adicionar outro{section.title.endsWith("a") ? "a" : ""} {section.title.toLowerCase()}
          </button>
        )}
      </div>
    );
  };

  const renderRegularSection = (section, sectionIndex) => {
    const stepColor = steps[sectionIndex + 1]?.color || SECTION_COLORS[0];

    return (
      <div style={{ animation: "fade-in 0.35s ease-out both" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: "var(--text)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: stepColor.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {section.icon || "📄"}
            </span>
            {section.title}
          </h2>
          {section.subtitle && (
            <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--font-body)", marginLeft: 50 }}>
              {section.subtitle}
            </p>
          )}
        </div>

        <ClientNoteBanner notes={selectedDoc?.clientNotes} />

        <div className="le-section-card" style={{
          padding: 20, borderRadius: 16, background: "var(--surface)",
          border: `1.5px solid ${stepColor.border}`,
        }}>
          <div className="le-field-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 20px" }}>
            {section.fields.map((fieldDef) => (
              <div key={fieldDef.key} id={`field-${fieldDef.key}`}>
                <LegalFieldRenderer
                  fieldDef={fieldDef}
                  value={legalFormData[fieldDef.key]}
                  onChange={handleUpdateField}
                  error={getFieldError(fieldDef.key)}
                  disabled={disabledFields[fieldDef.key]}
                  onToggleDisabled={() => handleToggleDisabled(fieldDef.key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFillForm = () => {
    if (!currentSection) return null;
    if (isPartySection(currentSection.id)) {
      return renderPartySection(currentSection, currentStepObj.sectionIndex);
    }
    return renderRegularSection(currentSection, currentStepObj.sectionIndex);
  };

  const renderReview = () => (
    <div style={{ animation: "fade-in 0.35s ease-out both" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Revise os Dados
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-dim)", fontFamily: "var(--font-body)", lineHeight: 1.5 }}>
          Verifique se tudo está correto antes de gerar o documento
        </p>
      </div>
      <Card style={{ padding: 20, marginBottom: 20, border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(20,184,166,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={selectedDoc?.icon} className="w-6 h-6" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 17, fontFamily: "var(--font-display)", color: "var(--text)", margin: 0 }}>{selectedDoc?.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <Badge variant="teal">{currentVariantObj?.icon} {currentVariantObj?.name}</Badge>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                {Object.keys(legalFormData).filter((k) => legalFormData[k] && legalFormData[k].trim() !== "").length} campos preenchidos
              </span>
            </div>
          </div>
        </div>
      </Card>
      {currentSections.map((section) => {
        const filledFields = section.fields.filter((f) => !disabledFields[f.key] && legalFormData[f.key] && legalFormData[f.key].trim() !== "");
        if (filledFields.length === 0) return null;
        return (
          <Card key={section.id} style={{ padding: 20, marginBottom: 16, border: "1px solid var(--border)", borderRadius: 16, background: "var(--surface)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
              <Icon name="Folder" className="w-4 h-4" /> {section.title}
            </h4>
            <div className="le-review-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
              {filledFields.map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3, fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: "0.04em" }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, wordBreak: "break-word", fontFamily: "var(--font-body)", color: "var(--text)", lineHeight: 1.4 }}>{legalFormData[f.key]}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      <div style={{ marginTop: 12, padding: 14, background: "rgba(16,185,129,0.08)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(16,185,129,0.18)" }}>
        <Icon name="CheckCircle" className="w-5 h-5" style={{ color: "var(--success)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: "var(--success)", fontWeight: 600, fontFamily: "var(--font-body)" }}>Todos os campos obrigatórios estão preenchidos</span>
      </div>
    </div>
  );

  const renderPreview = () => {
    const docBody = getDocumentBody(selectedDoc?.id, selectedVariant, legalFormData, disabledFields);
    const hasBody = docBody && docBody.length > 0;

    const renderBlock = (block, i) => {
      switch (block.type) {
        case "title":
          return (
            <div key={i} style={{ textAlign: "center", marginBottom: 28, marginTop: 4 }}>
              <h3 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 19, fontWeight: 700, color: "#161d26", textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.35, margin: 0 }}>{block.text}</h3>
              <div style={{ width: 50, height: 1.5, background: "var(--gold, #a58737)", margin: "14px auto 0", opacity: 0.7 }} />
            </div>
          );
        case "paragraph":
          return <p key={i} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, color: "#3a4048", lineHeight: 1.75, textAlign: "justify", textIndent: "1.5em", margin: "0 0 18px 0", wordBreak: "break-word" }}>{block.text}</p>;
        case "clause":
          return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: "var(--gold, #a58737)", whiteSpace: "nowrap" }}>CLÁUSULA {block.number}</span>
                <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, fontWeight: 700, color: "#161d26", textTransform: "uppercase", letterSpacing: "0.03em" }}>{block.title}</span>
              </div>
              <div style={{ width: "40%", height: 1, background: "var(--border, #d8d6ce)", marginBottom: 8, opacity: 0.5 }} />
              {block.text && <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14.5, color: "#3a4048", lineHeight: 1.7, textAlign: "justify", margin: "0 0 8px 0", wordBreak: "break-word" }}>{block.text}</p>}
              {block.paragraphs && (
                <div style={{ paddingLeft: 16 }}>
                  {block.paragraphs.map((p, j) => (
                    <p key={j} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14, color: "#3a4048", lineHeight: 1.65, textAlign: "justify", marginBottom: 4, wordBreak: "break-word" }}>{p}</p>
                  ))}
                </div>
              )}
            </div>
          );
        case "closing":
          return <p key={i} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 14.5, color: "#767b84", fontStyle: "italic", lineHeight: 1.7, textAlign: "justify", margin: "28px 0 12px 0", wordBreak: "break-word" }}>{block.text}</p>;
        case "date":
          return <p key={i} style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, color: "#3a4048", textAlign: "center", margin: "8px 0 36px 0" }}>{block.text}</p>;
        case "signatures":
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${block.parties.length}, 1fr)`, gap: 48, marginTop: 44, marginBottom: 20 }}>
              {block.parties.map((party, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1.5px dashed #b0ada5", marginBottom: 8, minHeight: 44 }} />
                  <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: "var(--gold, #a58737)", margin: "0 0 2px 0" }}>{party.role}</p>
                  <p style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13.5, color: "#3a4048", margin: 0 }}>{party.name}</p>
                </div>
              ))}
            </div>
          );
        case "witnesses":
          return (
            <div key={i} style={{ marginTop: 28 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: "#767b84", margin: "0 0 16px 0" }}>TESTEMUNHAS</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
                {Array.from({ length: block.count }).map((_, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--gold, #a58737)", background: "rgba(165,135,55,0.1)", width: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{j + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ borderBottom: "1px dashed #c5c2ba", marginBottom: 4, minHeight: 36 }} />
                      <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 10.5, color: "#a0a5ae", margin: 0 }}>Nome / CPF</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const renderFallback = () => (
      <div style={{ padding: 32 }}>
        <h3 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 19, fontWeight: 700, color: "#161d26", textAlign: "center", textTransform: "uppercase", marginBottom: 28 }}>{selectedDoc?.name}</h3>
        {currentSections.map((s) => (
          <div key={s.id} style={{ marginBottom: 20 }}>
            <h4 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--gold, #a58737)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px 0" }}>{s.title}</h4>
            {s.fields.map((f) => (
              <div key={f.key} style={{ display: "flex", gap: 12, fontSize: 14, marginBottom: 3, padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 600, color: "#767b84", minWidth: 120, fontSize: 12.5 }}>{f.label}:</span>
                <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#3a4048" }}>{legalFormData[f.key] || "\u2014"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ animation: "fade-in 0.35s ease-out both" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>Visualização do Documento</h2>
          <p style={{ fontSize: 14, color: "var(--text-dim)", fontFamily: "var(--font-body)" }}>Revise o documento final antes de gerar o PDF</p>
        </div>
        <div style={{ background: "#fcfbf9", borderRadius: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)", maxWidth: 780, margin: "0 auto", overflow: "hidden" }}>
          <div className="le-preview-pad" style={{ padding: "clamp(32px, 6vw, 60px) clamp(24px, 6vw, 64px) clamp(40px, 6vw, 64px)" }}>
            {hasBody ? docBody.map((block, i) => renderBlock(block, i)) : renderFallback()}
            {selectedDoc?.legislation && (
              <p style={{ marginTop: 36, padding: "12px 0", fontSize: 10.5, color: "#767b84", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontStyle: "italic" }}>
                <strong style={{ color: "#161d26", fontWeight: 700, fontStyle: "normal" }}>Base Legal:</strong> {selectedDoc.legislation}
              </p>
            )}
            <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #e8e6dc", textAlign: "center" }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: 9.5, color: "#bcb8ae", letterSpacing: "0.06em", margin: 0 }}>
                DOCUMENTO GERADO POR KRIOU DOCS · {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <button
            onClick={() => navigate("checkout")}
            style={{ padding: "16px 36px", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-body)", borderRadius: 14, background: "var(--coral)", border: "none", color: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, minHeight: 52, transition: "all 0.2s ease", boxShadow: "0 2px 12px rgba(244,63,94,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--coral-hover)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(244,63,94,0.45)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--coral)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(244,63,94,0.3)"; }}
          >
            <Icon name="Download" className="w-5 h-5" /> Finalizar e Gerar PDF
          </button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (isVariantStep) return renderVariantSelection();
    if (isReviewStep) return renderReview();
    if (isPreviewStep) return renderPreview();
    return renderFillForm();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--navy)" }}>
      <style>{`
        @media (max-width: 640px) {
          .le-step-label { display: none !important; }
          .le-step-count { display: none !important; }
          .le-step-indicator { padding: 8px 10px !important; gap: 4px !important; }
          .le-step-indicator button { padding: 4px 10px !important; min-width: 36px !important; min-height: 32px !important; font-size: 10px !important; }
          .le-content-pad { padding: 16px 12px 100px !important; }
          .le-section-card { padding: 14px !important; }
          .le-title-mobile { font-size: 20px !important; }
          .le-desc-mobile { font-size: 12px !important; }
          .le-req-btn { font-size: 12px !important; padding: 10px 16px !important; min-height: 40px !important; }
          .le-party-card { padding: 12px !important; }
          .le-field-grid { grid-template-columns: 1fr !important; }
          .le-review-grid { grid-template-columns: 1fr !important; }
          .le-preview-pad { padding: 24px 16px !important; }
          .le-bottombar-text { font-size: 10px !important; }
        }
      `}</style>
      <AppNavbar
        title={navTitle}
        leftAction={
          <button onClick={() => (isFirstStep ? navigate("templates", { replace: true }) : handlePrevious())} aria-label="Voltar"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, minWidth: 44, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={handleGoHome} aria-label="Ir para o início" title="Voltar ao dashboard"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10 }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
            >
              <Icon name="Home" className="w-5 h-5" />
            </button>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        }
      />

      {!isPreviewStep && currentSections.length > 0 && renderStepIndicator()}

      <div ref={contentRef} className="le-content-pad" style={{ flex: 1, maxWidth: 920, margin: "0 auto", padding: "24px 24px 120px", width: "100%" }}>
        {renderStepContent()}
      </div>

      <div ref={bottomNavRef}>
        <BottomNavigation
          onBack={handlePrevious}
          onNext={isLastStep ? () => navigate("checkout") : handleNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          nextLabel={nextLabel}
          onSaveLater={handleSaveLater}
          extraContent={
            isFillStep && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)" }}>
                <span style={{ color: currentStepObj?.color?.accent || "var(--teal)", fontWeight: 700, fontFamily: "var(--font-display)" }}>
                  {currentStepObj?.label}
                </span>
                {currentSection && (
                  <span>
                    ({currentSection.fields.filter(f => legalFormData[f.key] && String(legalFormData[f.key]).trim() !== "").length}/
                    {currentSection.fields.filter(f => !disabledFields[f.key]).length} campos)
                  </span>
                )}
              </div>
            )
          }
        />
      </div>

      <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      {showRequirements && (
        <RequirementsModal doc={selectedDoc} variant={currentVariantObj} onClose={() => setShowRequirements(false)} />
      )}
    </div>
  );
};

export default LegalEditorPage;
