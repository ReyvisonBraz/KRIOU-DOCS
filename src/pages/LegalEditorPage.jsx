import React, { useState, useCallback, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useConfirm } from "../hooks/useConfirm";
import { Icon } from "../components/Icons";
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
} from "../components/UI";
import showToast from "../utils/toast";
import StorageService from "../utils/storage";
import { generateMockFormData } from "../utils/mockData";
import {
  getAvailableDocuments,
  getSectionsForVariant,
  validateFields,
  getDocumentBody,
} from "../data/legalDocuments";

const STEPS = [
  { label: "Tipo", key: "type", icon: "FileText" },
  { label: "Variação", key: "variant", icon: "GitBranch" },
  { label: "Preencher", key: "fill", icon: "Edit" },
  { label: "Revisão", key: "review", icon: "Check" },
  { label: "Visualizar", key: "preview", icon: "Eye" },
];

const DocTypeCard = ({ doc, onClick, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        padding: 24,
        border: isSelected ? "2px solid var(--teal)" : "1.5px solid var(--border)",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 12px 32px rgba(0,210,211,0.15)" : "none",
      }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 80,
        height: 80,
        background: "linear-gradient(135deg, rgba(0,210,211,0.1) 0%, transparent 100%)",
        borderRadius: "0 8px 0 80px",
      }} />
      
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: isSelected ? "rgba(0,210,211,0.15)" : "rgba(0,210,211,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s ease",
        }}>
          <Icon 
            name={doc.icon} 
            className="w-6 h-6" 
            style={{ 
              color: isSelected ? "var(--teal)" : "var(--teal)",
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s ease",
            }} 
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{doc.name}</h3>
            {isSelected && (
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon name="Check" className="w-3 h-3" style={{ color: "white" }} />
              </div>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: doc.variants?.length > 1 ? 12 : 0 }}>
            {doc.description || "Documento jurídico para uso profissional"}
          </p>
          
          {doc.variants?.length > 1 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {doc.variants.map((v) => (
                <span key={v.id} style={{
                  fontSize: 11, 
                  padding: "3px 10px",
                  background: "var(--surface-2)", 
                  borderRadius: 100,
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}>
                  {v.icon} {v.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

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

  const availableDocs = getAvailableDocuments();
  const currentSections = selectedDoc && selectedVariant
    ? getSectionsForVariant(selectedDoc.id, selectedVariant)
    : [];

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setDocumentType(doc);
    setSelectedVariant(doc.defaultVariant);
    setLegalFormData({});
    setDisabledFields({});
    setStepErrors({});
    setShowErrors(false);
    setCurrentStep(1);
    scrollToNavigation();
  };

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
    if (currentStep === 0 && !selectedDoc) return;
    if (currentStep === 1 && !selectedVariant) return;

    if (currentStep === 2) {
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
      const newCard = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
        title,
        type: selectedDoc.id,
        template: variantObj?.name || selectedDoc.name,
        date: dateLabel,
        status: "rascunho",
        draft: draftSnapshot,
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
      message: selectedDoc
        ? "Deseja salvar o rascunho e sair? Você poderá continuar de onde parou."
        : "Deseja sair? Você ainda não selecionou um tipo de documento.",
      confirmLabel: selectedDoc ? "Salvar e sair" : "Sair",
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

  const nextLabel = isLastStep ? "Gerar PDF" : currentStep === 2 ? "Revisar" : "Avançar";
  const navTitle = selectedDoc
    ? selectedDoc.name + (currentVariantObj && currentStep > 1 ? ` — ${currentVariantObj.name}` : "")
    : "Documento Jurídico";

  const renderDocTypeSelection = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Qual documento você precisa?
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
          Selecione o tipo de documento jurídico que deseja criar
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {availableDocs.map((doc) => (
          <DocTypeCard
            key={doc.id}
            doc={doc}
            onClick={() => handleSelectDoc(doc)}
            isSelected={selectedDoc?.id === doc.id}
          />
        ))}
      </div>
    </div>
  );

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
            <div key={i} style={{ textAlign: "center", marginBottom: 28 }}>
              <h3 style={{
                fontSize: 17, fontWeight: 800, color: "#111",
                textTransform: "uppercase", letterSpacing: "0.05em",
                lineHeight: 1.4,
              }}>
                {block.text}
              </h3>
              <div style={{ width: 60, height: 2, background: "#222", margin: "12px auto 0" }} />
            </div>
          );
        case "paragraph":
          return (
            <p key={i} style={{
              fontSize: 13, color: "#222", lineHeight: 1.8,
              textAlign: "justify", marginBottom: 16,
            }}>
              {block.text}
            </p>
          );
        case "clause":
          return (
            <div key={i} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111", lineHeight: 1.6, textAlign: "justify", marginBottom: 8 }}>
                CLÁUSULA {block.number} — {block.title.toUpperCase()}
              </p>
              {block.text && (
                <p style={{ fontSize: 14, color: "#222", lineHeight: 1.6, textAlign: "justify", marginBottom: 12, paddingLeft: 8 }}>
                  {block.text}
                </p>
              )}
              {block.paragraphs && (
                <div style={{ paddingLeft: 24 }}>
                  {block.paragraphs.map((p, j) => (
                    <p key={j} style={{ fontSize: 14, color: "#222", lineHeight: 1.6, textAlign: "justify", marginBottom: 6 }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        case "closing":
          return (
            <p key={i} style={{ fontSize: 14, color: "#222", lineHeight: 1.6, textAlign: "justify", marginTop: 24, marginBottom: 16 }}>
              {block.text}
            </p>
          );
        case "date":
          return (
            <p key={i} style={{ fontSize: 14, color: "#222", marginBottom: 32, marginTop: 16 }}>
              {block.text}
            </p>
          );
        case "signatures":
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${block.parties.length}, 1fr)`, gap: 32, marginTop: 40, marginBottom: 40 }}>
              {block.parties.map((party, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "1px solid #000", marginBottom: 8, minHeight: 40 }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#000" }}>{party.role}</p>
                  <p style={{ fontSize: 12, color: "#444" }}>{party.name}</p>
                </div>
              ))}
            </div>
          );
        case "witnesses":
          return (
            <div key={i} style={{ marginTop: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#000", marginBottom: 16 }}>TESTEMUNHAS:</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                {Array.from({ length: block.count }).map((_, j) => (
                  <div key={j}>
                    <div style={{ borderBottom: "1px solid #ccc", marginBottom: 4, minHeight: 32 }} />
                    <p style={{ fontSize: 11, color: "#666" }}>{j + 1}ª Testemunha — Nome/RG</p>
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
      <div style={{ padding: 40 }}>
        <h3 style={{ textAlign: "center", marginBottom: 30 }}>{selectedDoc?.name}</h3>
        {currentSections.map((s) => (
          <div key={s.id} style={{ marginBottom: 15 }}>
            <h4 style={{ fontSize: 12, textTransform: "uppercase", color: "#666", marginBottom: 8 }}>{s.title}</h4>
            {s.fields.map((f) => (
              <div key={f.key} style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{f.label}:</span>
                <span>{legalFormData[f.key] || "—"}</span>
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
            Visualização do Documento
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Revise o documento final antes de gerar o PDF
          </p>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.03)",
          maxWidth: 760,
          margin: "0 auto",
          overflow: "hidden",
        }}>
          <div style={{ height: 5, background: "linear-gradient(90deg, #0f2041 0%, #00b4b4 100%)" }} />

          <div style={{
            padding: "52px 68px 60px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#1a1a1a",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
              background: "linear-gradient(180deg, #00b4b4 0%, rgba(0,180,180,0) 100%)",
            }} />

            {hasBody ? docBody.map((block, i) => renderBlock(block, i)) : renderFallback()}

            {selectedDoc?.legislation && (
              <div style={{
                marginTop: 36, padding: "10px 16px",
                background: "#f5f7fb", borderRadius: 6,
                borderLeft: "3px solid #0f2041",
                fontSize: 10.5, color: "#666",
                fontFamily: "system-ui, sans-serif",
              }}>
                <strong style={{ color: "#0f2041" }}>Base Legal:</strong> {selectedDoc.legislation}
              </div>
            )}

            <div style={{
              marginTop: 24, paddingTop: 14,
              borderTop: "1px solid #e8e8e8", textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}>
              <p style={{ fontSize: 9.5, color: "#bbb", letterSpacing: "0.04em" }}>
                DOCUMENTO GERADO POR KRIOU DOCS · {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase()}
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
      case 0: return renderDocTypeSelection();
      case 1: return renderVariantSelection();
      case 2: return renderFillForm();
      case 3: return renderReview();
      case 4: return renderPreview();
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppNavbar
        title={navTitle}
        leftAction={
          <button
            onClick={() => isFirstStep ? navigate("dashboard") : handlePrevious()}
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
        {currentStep > 0 && (
          <AppStepper
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(i) => i < currentStep && setCurrentStep(i)}
            completedSteps={completedSteps}
          />
        )}
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
            currentStep === 2 && (
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
    </div>
  );
};

export default LegalEditorPage;
