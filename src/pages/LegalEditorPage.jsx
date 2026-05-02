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
  AppStepper,
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

const STEPS = [
  { label: "Variação", key: "variant", icon: "GitBranch" },
  { label: "Preencher", key: "fill", icon: "Edit" },
  { label: "Revisão", key: "review", icon: "Check" },
  { label: "Visualizar", key: "preview", icon: "Eye" },
];

const SectionProgressBar = ({ requiredFilled, requiredTotal, allDone }) => {
  const progressPct = requiredTotal > 0 ? Math.round((requiredFilled / requiredTotal) * 100) : 0;

  const getProgressColor = () => {
    if (allDone) return "var(--success)";
    if (progressPct > 50) return "var(--teal)";
    if (progressPct > 0) return "var(--gold)";
    return "var(--coral)";
  };

  return (
    <div style={{
      marginTop: 16,
      padding: "16px 20px",
      borderRadius: 14,
      background: allDone
        ? "rgba(0,200,151,0.08)"
        : "rgba(255,255,255,0.03)",
      border: `1px solid ${allDone ? "rgba(0,200,151,0.25)" : "rgba(255,255,255,0.07)"}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: allDone ? "var(--success)" : "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          {allDone ? (
            <>
              <Icon name="Check" className="w-4 h-4" />
              Formulário completo!
            </>
          ) : (
            <>Campos obrigatórios — {requiredFilled} de {requiredTotal}</>
          )}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 800,
          color: getProgressColor(),
        }}>
          {progressPct}%
        </span>
      </div>
      <div style={{
        height: 6,
        borderRadius: 4,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${progressPct}%`,
          borderRadius: 4,
          background: getProgressColor(),
          transition: "width 0.4s ease, background 0.3s ease",
        }} />
      </div>
    </div>
  );
};

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

  const bottomNavRef = useRef(null);
  const contentRef = useRef(null);

  const scrollToNavigation = useCallback(() => {
    setTimeout(() => {
      if (bottomNavRef.current) {
        bottomNavRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  }, []);

  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [currentStep, scrollToTop]);

  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const isDirty = saveStatus === "saving" || saveStatus === "idle";
  useUnsavedChanges(isDirty);

  const currentSections = selectedDoc && selectedVariant
    ? getSectionsForVariant(selectedDoc.id, selectedVariant)
    : [];

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

    if (currentStep === 1) {
      const validation = validateFields(selectedDoc.id, selectedVariant, legalFormData, disabledFields);
      if (!validation.valid) {
        setStepErrors(validation.errors);
        setShowErrors(true);
        const firstErrorKey = Object.keys(validation.errors)[0];
        const el = document.getElementById(`field-${firstErrorKey}`);
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

  const handleSaveLater = () => {
    if (!selectedDoc) {
      navigate("dashboard");
      return;
    }

    const variantObj = selectedDoc?.variants?.find((v) => v.id === selectedVariant);
    const draftSnapshot = {
      documentType: selectedDoc,
      selectedVariant,
      legalFormData,
      disabledFields,
      legalStep: currentStep,
    };

    const title = selectedDoc.name + (variantObj ? ` — ${variantObj.name}` : "");
    const now = new Date();
    const dateLabel = now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

    const existingDraftIdx = (userDocuments || []).findIndex(
      (d) => d.status === "rascunho" && d.type === selectedDoc.id && d._draftOrigin === "legalEditor"
    );

    let updated;
    if (existingDraftIdx >= 0) {
      updated = (userDocuments || []).map((d, i) =>
        i === existingDraftIdx
          ? { ...d, title, date: dateLabel, draft: draftSnapshot, updatedAt: now.toISOString() }
          : d
      );
    } else {
      const code = generateDocumentCode(userDocuments || [], selectedDoc.id);
      const newCard = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        title,
        type: selectedDoc.id,
        documentType: selectedDoc.id,
        template: variantObj?.name || selectedDoc.name,
        date: dateLabel,
        status: "rascunho",
        draft: draftSnapshot,
        code,
        _draftOrigin: "legalEditor",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        userId,
      };
      updated = [...(userDocuments || []), newCard];
    }

    setUserDocuments(updated);
    StorageService.saveDocuments(updated, userId);
    triggerLegalSave?.();
    navigate("dashboard");
    showToast.success("Rascunho salvo! Continue de onde parou a qualquer momento.");
  };

  const handleGoHome = async () => {
    const hasDraft = Object.keys(legalFormData).length > 0 || currentStep > 0;
    if (!hasDraft) {
      navigate("dashboard");
      return;
    }
    const confirmed = await requestConfirm({
      title: "Sair do editor",
      message: "Deseja salvar o rascunho e sair? Você poderá continuar de onde parou.",
      confirmLabel: "Salvar e sair",
      cancelLabel: "Continuar editando",
      danger: false,
    });
    if (confirmed) handleSaveLater();
  };

  const currentVariantObj = selectedDoc?.variants?.find((v) => v.id === selectedVariant);

  const allRequiredFields = currentSections.flatMap((s) =>
    s.fields.filter((f) => f.required && !disabledFields[f.key])
  );
  const filledRequired = allRequiredFields.filter(
    (f) => legalFormData[f.key] && String(legalFormData[f.key]).trim() !== ""
  );
  const requiredTotal = allRequiredFields.length;
  const requiredFilled = filledRequired.length;
  const allDone = requiredFilled === requiredTotal && requiredTotal > 0;
  const filledCount = Object.keys(legalFormData).filter((k) => legalFormData[k] && legalFormData[k].trim() !== "").length;

  const completedSteps = new Set(STEPS.map((_, i) => i).filter((i) => i < currentStep));
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const nextLabel = isLastStep ? "Gerar PDF" : currentStep === 1 ? "Revisar" : "Avançar";
  const navTitle = selectedDoc
    ? selectedDoc.name + (currentVariantObj && currentStep > 0 ? ` — ${currentVariantObj.name}` : "")
    : "Documento Jurídico";

  const renderVariantSelection = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          {selectedDoc?.name}
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
          Escolha a variação do documento. Cada opção adapta os campos automaticamente.
        </p>
        {selectedDoc?.legislation && (
          <div style={{
            marginTop: 14,
            padding: "12px 16px",
            background: "var(--surface-2)",
            borderRadius: 10,
            fontSize: 12,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Icon name="Scale" className="w-4 h-4" style={{ color: "var(--teal)" }} />
            {selectedDoc.legislation}
          </div>
        )}

        <Button
          variant="primary"
          icon="ClipboardList"
          onClick={() => setShowRequirements(true)}
          style={{ marginTop: 16, padding: "14px 24px", fontSize: 14, fontWeight: 700 }}
        >
          Ver requisitos do documento
        </Button>
      </div>

      <div style={{
        marginTop: 16,
        padding: "16px 20px",
        background: "linear-gradient(135deg, rgba(233,69,96,0.08) 0%, rgba(0,210,211,0.08) 100%)",
        border: "1px solid rgba(233,69,96,0.15)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <Icon name="Info" className="w-5 h-5" style={{ color: "var(--coral)" }} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>Não sabe o que precisa?</strong> Clique acima para ver os requisitos mínimos, essenciais e completos.
        </p>
      </div>

      <VariantSelector
        variants={selectedDoc?.variants || []}
        selected={selectedVariant}
        onSelect={setSelectedVariant}
      />

      {currentVariantObj && currentSections.length > 0 && (
        <div style={{
          marginTop: 24,
          padding: 20,
          background: "var(--surface-2)",
          borderRadius: 14,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{currentVariantObj.icon}</span>
            {currentVariantObj.name}
            <Badge variant="teal" style={{ marginLeft: 8 }}>{currentSections.length} seções</Badge>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {currentSections.map((section, i) => (
              <span key={section.id} style={{
                fontSize: 12,
                padding: "6px 14px",
                background: "var(--surface-3)",
                borderRadius: 8,
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}>
                <span style={{ color: "var(--teal)", fontWeight: 700 }}>{i + 1}</span>
                {section.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFillForm = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          Preencha os Dados
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          {selectedDoc?.name} — {currentVariantObj?.name}
        </p>

        <div style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "var(--text-muted)",
        }}>
          <Icon name="Info" className="w-4 h-4" style={{ color: "var(--teal)" }} />
          Campos com <span style={{ color: "var(--coral)", fontWeight: 700 }}>*</span> são obrigatórios
        </div>

        <SectionProgressBar
          requiredFilled={requiredFilled}
          requiredTotal={requiredTotal}
          allDone={allDone}
        />

        <div style={{
          marginTop: 16,
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(0,210,211,0.06) 0%, rgba(108,99,255,0.06) 100%)",
          border: "1.5px dashed var(--teal)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="Wand2" className="w-6 h-6" style={{ color: "var(--teal)" }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                Preencher com dados de demonstração
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Pré-visualize o documento com dados fictícios
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="small"
            icon="Wand2"
            onClick={handleFillDemo}
            style={{ background: "var(--teal)", color: "white", border: "none" }}
          >
            Preencher Demo
          </Button>
        </div>
      </div>

      <ClientNoteBanner notes={selectedDoc?.clientNotes} />

      {currentSections.map((section, sectionIndex) => (
        <div key={section.id} style={{ marginBottom: 8 }}>
          <SectionHeader
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            number={sectionIndex + 1}
          />

          <div style={{
            padding: "0 4px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "0 20px",
          }}>
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
      ))}
    </div>
  );

  const renderReview = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Revise os Dados
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Verifique se tudo está correto antes de gerar o documento
        </p>
      </div>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(0,210,211,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={selectedDoc?.icon} className="w-6 h-6" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>{selectedDoc?.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge variant="teal">{currentVariantObj?.icon} {currentVariantObj?.name}</Badge>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {filledCount} campos preenchidos
              </span>
            </div>
          </div>
        </div>
      </Card>

      {currentSections.map((section) => {
        const filledFields = section.fields.filter(
          (f) => !disabledFields[f.key] && legalFormData[f.key] && legalFormData[f.key].trim() !== ""
        );
        if (filledFields.length === 0) return null;

        return (
          <Card key={section.id} style={{ padding: 20, marginBottom: 16 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, color: "var(--teal)",
              marginBottom: 14, paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Icon name="Folder" className="w-4 h-4" />
              {section.title}
            </h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}>
              {filledFields.map((f) => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, wordBreak: "break-word" }}>
                    {legalFormData[f.key]}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <div style={{
        marginTop: 16, padding: 14,
        background: "rgba(0,200,151,0.1)", borderRadius: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="CheckCircle" className="w-5 h-5" style={{ color: "var(--success)" }} />
        <span style={{ fontSize: 14, color: "var(--success)", fontWeight: 600 }}>
          Todos os campos obrigatórios estão preenchidos
        </span>
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
              <h3 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 19,
                fontWeight: 700,
                color: "#161d26",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.35,
                margin: 0,
              }}>
                {block.text}
              </h3>
              <div style={{
                width: 50,
                height: 1.5,
                background: "var(--gold, #a58737)",
                margin: "14px auto 0",
                opacity: 0.7,
              }} />
            </div>
          );
        case "paragraph":
          return (
            <p key={i} style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 15,
              color: "#3a4048",
              lineHeight: 1.75,
              textAlign: "justify",
              textIndent: "1.5em",
              margin: "0 0 18px 0",
              wordBreak: "break-word",
            }}>
              {block.text}
            </p>
          );
        case "clause":
          return (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--gold, #a58737)",
                  whiteSpace: "nowrap",
                }}>
                  CLÁUSULA {block.number}
                </span>
                <span style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#161d26",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}>
                  {block.title}
                </span>
              </div>
              <div style={{
                width: "40%",
                height: 1,
                background: "var(--border, #d8d6ce)",
                marginBottom: 8,
                opacity: 0.5,
              }} />
              {block.text && (
                <p style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 14.5,
                  color: "#3a4048",
                  lineHeight: 1.7,
                  textAlign: "justify",
                  margin: "0 0 8px 0",
                  wordBreak: "break-word",
                }}>
                  {block.text}
                </p>
              )}
              {block.paragraphs && (
                <div style={{ paddingLeft: 16 }}>
                  {block.paragraphs.map((p, j) => {
                    const isSubItem = /^[§IVX]+/.test(p.trim());
                    return (
                      <p key={j} style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: 14,
                        color: "#3a4048",
                        lineHeight: 1.65,
                        textAlign: "justify",
                        marginBottom: 4,
                        paddingLeft: isSubItem ? 12 : 0,
                        wordBreak: "break-word",
                      }}>
                        {p}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          );
        case "closing":
          return (
            <p key={i} style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 14.5,
              color: "#767b84",
              fontStyle: "italic",
              lineHeight: 1.7,
              textAlign: "justify",
              margin: "28px 0 12px 0",
              wordBreak: "break-word",
            }}>
              {block.text}
            </p>
          );
        case "date":
          return (
            <p key={i} style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 15,
              color: "#3a4048",
              textAlign: "center",
              margin: "8px 0 36px 0",
            }}>
              {block.text}
            </p>
          );
        case "signatures":
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: `repeat(${block.parties.length}, 1fr)`,
              gap: 48,
              marginTop: 44,
              marginBottom: 20,
            }}>
              {block.parties.map((party, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  <div style={{
                    borderBottom: "1.5px dashed #b0ada5",
                    marginBottom: 8,
                    minHeight: 44,
                  }} />
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--gold, #a58737)",
                    margin: "0 0 2px 0",
                  }}>
                    {party.role}
                  </p>
                  <p style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 13.5,
                    color: "#3a4048",
                    margin: 0,
                  }}>
                    {party.name}
                  </p>
                </div>
              ))}
            </div>
          );
        case "witnesses":
          return (
            <div key={i} style={{ marginTop: 28 }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#767b84",
                margin: "0 0 16px 0",
              }}>
                TESTEMUNHAS
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
              }}>
                {Array.from({ length: block.count }).map((_, j) => (
                  <div key={j} style={{ position: "relative" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--gold, #a58737)",
                        background: "rgba(165, 135, 55, 0.1)",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        {j + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          borderBottom: "1px dashed #c5c2ba",
                          marginBottom: 4,
                          minHeight: 36,
                        }} />
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                          fontSize: 10.5,
                          color: "#a0a5ae",
                          margin: 0,
                        }}>
                          Nome / CPF
                        </p>
                      </div>
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
        <h3 style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 19,
          fontWeight: 700,
          color: "#161d26",
          textAlign: "center",
          textTransform: "uppercase",
          marginBottom: 28,
        }}>
          {selectedDoc?.name}
        </h3>
        {currentSections.map((s) => (
          <div key={s.id} style={{ marginBottom: 20 }}>
            <h4 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--gold, #a58737)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: "0 0 6px 0",
            }}>
              {s.title}
            </h4>
            {s.fields.map((f) => (
              <div key={f.key} style={{
                display: "flex",
                gap: 12,
                fontSize: 14,
                marginBottom: 3,
                padding: "4px 0",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  color: "#767b84",
                  minWidth: 120,
                  fontSize: 12.5,
                }}>
                  {f.label}:
                </span>
                <span style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: "#3a4048",
                }}>
                  {legalFormData[f.key] || "\u2014"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    return (
      <div className="animate-fadeIn">
        <div style={{ marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            Visualizacao do Documento
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Revise o documento final antes de gerar o PDF
          </p>
        </div>

        <div style={{
          background: "#fcfbf9",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)",
          maxWidth: 780,
          margin: "0 auto",
          overflow: "hidden",
        }}>

          <div style={{
            padding: "clamp(32px, 6vw, 60px) clamp(24px, 6vw, 64px) clamp(40px, 6vw, 64px)",
          }}>
            {hasBody ? docBody.map((block, i) => renderBlock(block, i)) : renderFallback()}

            {selectedDoc?.legislation && (
              <p style={{
                marginTop: 36,
                padding: "12px 0",
                fontSize: 10.5,
                color: "#767b84",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontStyle: "italic",
              }}>
                <strong style={{
                  color: "#161d26",
                  fontWeight: 700,
                  fontStyle: "normal",
                }}>
                  Base Legal:
                </strong>{" "}
                {selectedDoc.legislation}
              </p>
            )}

            <div style={{
              marginTop: 28,
              paddingTop: 12,
              borderTop: "1px solid #e8e6dc",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 9.5,
                color: "#bcb8ae",
                letterSpacing: "0.06em",
                margin: 0,
              }}>
                DOCUMENTO GERADO POR KRIOU DOCS ·{" "}
                {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button
            variant="primary"
            icon="Download"
            onClick={() => navigate("checkout")}
            style={{ padding: "14px 32px", fontSize: 15 }}
          >
            Finalizar e Gerar PDF
          </Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderVariantSelection();
      case 1: return renderFillForm();
      case 2: return renderReview();
      case 3: return renderPreview();
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppNavbar
        title={navTitle}
        leftAction={
          <button
            onClick={() => isFirstStep ? navigate("templates") : handlePrevious()}
            aria-label="Voltar"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6 }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleGoHome}
              aria-label="Ir para o início"
              title="Voltar ao dashboard"
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}
            >
              <Icon name="Home" className="w-5 h-5" />
            </button>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>
        }
      >
        <AppStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(i) => i < currentStep && setCurrentStep(i)}
          completedSteps={completedSteps}
        />
      </AppNavbar>

      <div ref={contentRef} className="page-container" style={{ flex: 1, maxWidth: 920, margin: "0 auto", padding: "24px 24px 120px", width: "100%" }}>
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
            currentStep === 1 && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--teal)", fontWeight: 700 }}>{filledCount}</span>
                campos preenchidos
              </div>
            )
          }
        />
      </div>

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {showRequirements && (
        <RequirementsModal
          doc={selectedDoc}
          variant={currentVariantObj}
          onClose={() => setShowRequirements(false)}
        />
      )}
    </div>
  );
};

export default LegalEditorPage;
