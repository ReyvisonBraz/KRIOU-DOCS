/**
 * ============================================
 * KRIOU DOCS - Legal Editor Page (Redesenhado)
 * ============================================
 * Wizard de 5 passos para documentos jurídicos:
 *
 * 1. Escolha do tipo de documento
 * 2. Escolha da variante (ex: Imóvel vs Veículo)
 * 3. Preenchimento por seções com ajuda
 * 4. Revisão dos dados
 * 5. Preview + Checkout
 *
 * Funcionalidades:
 * - Seletor de variantes (sem duplicar documento)
 * - Botões de ajuda destacados em cada campo
 * - Exemplos de preenchimento inline
 * - Toggle para desabilitar campos opcionais
 * - Observações separadas (cliente vs interno)
 * - Formulário organizado por seções
 */

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
import { generateMockFormData } from "../utils/mockData";
import {
  LEGAL_DOCUMENTS,
  getDocumentById,
  getAvailableDocuments,
  getSectionsForVariant,
  validateFields,
  getDocumentBody,
} from "../data/legalDocuments";

// ─── Steps do wizard ───
const STEPS = [
  { label: "Tipo de Documento", key: "type" },
  { label: "Variação", key: "variant" },
  { label: "Preencher Dados", key: "fill" },
  { label: "Revisão", key: "review" },
  { label: "Visualizar", key: "preview" },
];

/**
 * LegalEditorPage - Wizard completo para documentos jurídicos
 */
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
  } = useApp();

  // ─── Estado local ───
  const [selectedDoc, setSelectedDoc] = useState(documentType || null);
  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // ─── Refs para scroll ───
  const bottomNavRef = useRef(null);
  const contentRef = useRef(null);

  // ─── Scroll para botão de navegação ───
  const scrollToNavigation = useCallback(() => {
    setTimeout(() => {
      if (bottomNavRef.current) {
        bottomNavRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  }, []);

  // ─── Scroll para o topo do conteúdo ───
  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ─── Effect para scroll quando muda de etapa ───
  useEffect(() => {
    scrollToTop();
    scrollToNavigation();
  }, [currentStep, scrollToTop, scrollToNavigation]);

  // ─── Confirm dialog ───
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  // ─── Aviso de alterações não salvas ───
  const isDirty = saveStatus === "saving" || saveStatus === "idle";
  useUnsavedChanges(isDirty);

  // ─── Documentos disponíveis ───
  const availableDocs = getAvailableDocuments();

  // ─── Seções da variante atual ───
  const currentSections = selectedDoc && selectedVariant
    ? getSectionsForVariant(selectedDoc.id, selectedVariant)
    : [];

  // ─── Handlers ───
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

  const handleSelectVariant = (variantId) => {
    setSelectedVariant(variantId);
    setStepErrors({});
    setShowErrors(false);
    scrollToNavigation();
  };

  const handleUpdateField = useCallback((key, value) => {
    setLegalFormData((prev) => ({ ...prev, [key]: value }));
  }, [setLegalFormData]);

  const handleToggleDisabled = (key) => {
    setDisabledFields((prev) => ({ ...prev, [key]: !prev[key] }));
    // Limpar valor se desabilitou
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

  // ─── Preencher com dados fictícios para demonstração ───
  const handleFillDemo = () => {
    const mockData = generateMockFormData(selectedDoc.id, selectedVariant, currentSections);
    setLegalFormData(mockData);
    setDisabledFields({});
    setStepErrors({});
    setShowErrors(false);
    showToast.success("Dados de demonstração preenchidos! Avance para visualizar o documento.");
  };

  // ─── Navegação ───
  const handleNext = () => {
    if (currentStep === 0 && !selectedDoc) return;

    if (currentStep === 1) {
      if (!selectedVariant) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const validation = validateFields(
        selectedDoc.id,
        selectedVariant,
        legalFormData,
        disabledFields
      );
      if (!validation.valid) {
        setStepErrors(validation.errors);
        setShowErrors(true);
        // Scroll para o primeiro erro
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

  // ─── Salvar para depois e ir ao dashboard ───
  const handleSaveLater = async () => {
    await triggerLegalSave();
    navigate("dashboard");
    showToast.success("Rascunho salvo! Você pode continuar de onde parou.");
  };

  // ─── Ir para Home com confirmação se houver dados ───
  const handleGoHome = async () => {
    const hasDraft = Object.keys(legalFormData).length > 0 || currentStep > 0;
    if (!hasDraft) {
      navigate("dashboard");
      return;
    }
    const confirmed = await requestConfirm({
      title: "Sair do editor",
      message: "Seu rascunho será salvo automaticamente. Deseja voltar ao início?",
      confirmLabel: "Salvar e sair",
      cancelLabel: "Continuar editando",
      danger: false,
    });
    if (confirmed) {
      navigate("dashboard");
      showToast.success("Rascunho salvo!");
    }
  };

  // ─── Variante selecionada (objeto completo) ───
  const currentVariantObj = selectedDoc?.variants?.find((v) => v.id === selectedVariant);

  // ─── Render: Step 0 - Escolha do tipo de documento ───
  const renderDocTypeSelection = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Qual documento você precisa?
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Selecione o tipo de documento jurídico que deseja criar
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {availableDocs.map((doc, index) => (
          <Card
            key={doc.id}
            className="animate-fadeUp"
            onClick={() => handleSelectDoc(doc)}
            style={{
              cursor: "pointer",
              padding: 24,
              animationDelay: `${index * 0.08}s`,
              border: "2px solid var(--border)",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(0,210,211,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon name={doc.icon} className="w-6 h-6" style={{ color: "var(--teal)" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{doc.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{doc.description}</p>
                {doc.variants.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {doc.variants.map((v) => (
                      <span key={v.id} style={{
                        fontSize: 11, padding: "3px 10px",
                        background: "var(--surface-3)", borderRadius: 100,
                        color: "var(--text-muted)",
                      }}>
                        {v.icon} {v.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ─── Render: Step 1 - Escolha da variante ───
  const renderVariantSelection = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 28 }}>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          {selectedDoc?.name}
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Escolha a variação do documento. Cada opção adapta os campos automaticamente.
        </p>
        {selectedDoc?.legislation && (
          <div style={{
            marginTop: 12, fontSize: 12, color: "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>⚖️</span>
            {selectedDoc.legislation}
          </div>
        )}
      </div>

      <VariantSelector
        variants={selectedDoc?.variants || []}
        selected={selectedVariant}
        onSelect={setSelectedVariant}
      />

      {/* Preview do que muda */}
      {currentVariantObj && (
        <div style={{
          marginTop: 28, padding: 20,
          background: "var(--surface-2)", borderRadius: 14,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{currentVariantObj.icon}</span>
            {currentVariantObj.name}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Este documento terá as seguintes seções:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {currentSections.map((section, i) => (
              <span key={section.id} style={{
                fontSize: 12, padding: "6px 14px",
                background: "var(--surface-3)", borderRadius: 8,
                color: "var(--text)",
                display: "flex", alignItems: "center", gap: 6,
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

  // ─── Render: Step 2 - Preenchimento por seções ───
  const renderFillForm = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Preencha os Dados
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          {selectedDoc?.name} — {currentVariantObj?.name}
        </p>
        <p style={{
          fontSize: 12, color: "var(--text-muted)", marginTop: 6,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>💡</span>
          Campos com <span style={{ color: "var(--coral)", fontWeight: 700 }}>*</span> são obrigatórios.
          Campos opcionais podem ser desabilitados com o toggle.
          Clique no botão <strong style={{ color: "var(--teal)" }}>?</strong> para ver ajuda.
        </p>

        {/* Banner de demonstração */}
        <div style={{
          marginTop: 16,
          padding: "14px 18px",
          background: "linear-gradient(135deg, rgba(0,210,211,0.08) 0%, rgba(108,99,255,0.08) 100%)",
          border: "1.5px dashed var(--teal)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎭</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0 }}>
                Preencher com dados de demonstração
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Pré-visualize o documento com dados fictícios antes de preencher os seus.
              </p>
            </div>
          </div>
          <button
            onClick={handleFillDemo}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 18px",
              background: "var(--teal)", color: "#fff",
              border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,210,211,0.3)",
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <Icon name="Wand2" className="w-4 h-4" />
            Preencher Demo
          </button>
        </div>
      </div>

      {/* Observações do cliente */}
      <ClientNoteBanner notes={selectedDoc?.clientNotes} />

      {/* Seções do formulário */}
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

  // ─── Render: Step 3 - Revisão ───
  const renderReview = () => (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Revise os Dados
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Verifique se tudo está correto antes de gerar o documento
        </p>
      </div>

      {/* Header do documento */}
      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(0,210,211,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={selectedDoc?.icon} className="w-6 h-6" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 18 }}>{selectedDoc?.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge variant="teal">{currentVariantObj?.icon} {currentVariantObj?.name}</Badge>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Documento Jurídico</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Dados por seção */}
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
            }}>
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

      {/* Status de validação */}
      <div style={{
        marginTop: 16, padding: 14,
        background: "rgba(0,200,151,0.1)", borderRadius: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="Check" className="w-5 h-5" style={{ color: "var(--success)" }} />
        <span style={{ fontSize: 14, color: "var(--success)", fontWeight: 600 }}>
          Todos os campos obrigatórios estão preenchidos
        </span>
      </div>
    </div>
  );

  // ─── Render: Step 4 - Preview ───
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
            <div key={i} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#111", lineHeight: 1.8, textAlign: "justify" }}>
                <strong>CLÁUSULA {block.number} – {block.title}</strong>
              </p>
              {block.text && (
                <p style={{ fontSize: 13, color: "#222", lineHeight: 1.8, textAlign: "justify", marginTop: 4 }}>
                  {block.text}
                </p>
              )}
              {block.paragraphs && (
                <div style={{ marginTop: 4 }}>
                  {block.paragraphs.map((p, j) => (
                    <p key={j} style={{
                      fontSize: 13, color: "#222", lineHeight: 1.8,
                      paddingLeft: p.startsWith("I") || p.startsWith("V") ? 16 : 0,
                      marginBottom: 2,
                    }}>
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );

        case "closing":
          return (
            <p key={i} style={{
              fontSize: 13, color: "#222", lineHeight: 1.8,
              textAlign: "justify", marginTop: 24, marginBottom: 16,
            }}>
              {block.text}
            </p>
          );

        case "date":
          return (
            <p key={i} style={{
              fontSize: 13, color: "#222", marginBottom: 32, marginTop: 8,
            }}>
              {block.text}
            </p>
          );

        case "signatures":
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: `repeat(${block.parties.length}, 1fr)`,
              gap: 32, marginTop: 16, marginBottom: 32,
            }}>
              {block.parties.map((party, j) => (
                <div key={j} style={{ textAlign: "center" }}>
                  <div style={{
                    borderBottom: "1px solid #333",
                    paddingBottom: 4,
                    marginBottom: 6,
                    minHeight: 40,
                  }} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#333" }}>{party.role}</p>
                  <p style={{ fontSize: 12, color: "#555" }}>{party.name}</p>
                </div>
              ))}
            </div>
          );

        case "witnesses":
          return (
            <div key={i} style={{ marginTop: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 16 }}>
                TESTEMUNHAS:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                {Array.from({ length: block.count }).map((_, j) => (
                  <div key={j}>
                    <div style={{ borderBottom: "1px solid #999", marginBottom: 4, minHeight: 32 }} />
                    <p style={{ fontSize: 11, color: "#555" }}>
                      {j + 1}ª Testemunha — Nome: _____________________________ RG: _______________
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    // Fallback: mostra campos organizados por seção quando não há body definido
    const renderFallback = () => (
      <>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111", textTransform: "uppercase" }}>
            {selectedDoc?.name}
          </h3>
          <p style={{ fontSize: 13, color: "#666" }}>{currentVariantObj?.name}</p>
          <div style={{ width: 60, height: 2, background: "#333", margin: "12px auto 0" }} />
        </div>
        {currentSections.map((section) => {
          const filled = section.fields.filter(
            (f) => !disabledFields[f.key] && legalFormData[f.key]?.trim()
          );
          if (!filled.length) return null;
          return (
            <div key={section.id} style={{ marginBottom: 20 }}>
              <h4 style={{
                fontSize: 12, fontWeight: 700, color: "#444",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderBottom: "1px solid #eee", paddingBottom: 6, marginBottom: 10,
              }}>
                {section.title}
              </h4>
              {filled.map((f) => (
                <div key={f.key} style={{ display: "flex", gap: 8, marginBottom: 5, paddingLeft: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#555", minWidth: "38%" }}>{f.label}:</span>
                  <span style={{ fontSize: 13, color: "#333" }}>{legalFormData[f.key]}</span>
                </div>
              ))}
            </div>
          );
        })}
      </>
    );

    return (
      <div className="animate-fadeIn">
        <div style={{ marginBottom: 24 }}>
          <h2 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            Visualização do Documento
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Revise o documento final antes de gerar o PDF
          </p>
        </div>

        <Card style={{ padding: "48px 56px", background: "white", color: "#1a1a1a", fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {hasBody
            ? docBody.map((block, i) => renderBlock(block, i))
            : renderFallback()
          }

          {/* Legislação */}
          {selectedDoc?.legislation && (
            <div style={{
              marginTop: 32, padding: 12,
              background: "#f8f8f8", borderRadius: 6,
              fontSize: 11, color: "#888", textAlign: "center",
              fontFamily: "sans-serif",
            }}>
              Base Legal: {selectedDoc.legislation}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 24, paddingTop: 14,
            borderTop: "1px solid #ddd", textAlign: "center",
            fontFamily: "sans-serif",
          }}>
            <p style={{ fontSize: 10, color: "#aaa" }}>
              Documento gerado por Kriou Docs — {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </Card>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Button variant="primary" icon="Download" onClick={() => navigate("checkout")}
            style={{ padding: "14px 32px", fontSize: 15 }}>
            Finalizar e Gerar PDF
          </Button>
        </div>
      </div>
    );
  };

  // ─── Render step content ───
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

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const completedSteps = new Set(STEPS.map((_, i) => i).filter((i) => i < currentStep));

  const navTitle = selectedDoc
    ? selectedDoc.name + (currentVariantObj && currentStep > 1 ? ` — ${currentVariantObj.name}` : "")
    : "Documento Jurídico";

  const filledCount = currentStep === 2 && selectedDoc && selectedVariant
    ? Object.keys(legalFormData).filter((k) => legalFormData[k] && legalFormData[k].trim() !== "").length
    : null;

  const nextLabel = isLastStep
    ? "Gerar PDF"
    : currentStep === 2
    ? "Revisar"
    : "Avançar";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── Top Navigation ─── */}
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

      {/* ─── Main Content ─── */}
      <div ref={contentRef} className="page-container" style={{ flex: 1, maxWidth: 920, margin: "0 auto", padding: "24px 24px 120px", width: "100%" }}>
        {renderStepContent()}
      </div>

      {/* ─── Bottom Navigation ─── */}
      <div ref={bottomNavRef}>
        <BottomNavigation
          onBack={handlePrevious}
          onNext={isLastStep ? () => navigate("checkout") : handleNext}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          nextLabel={nextLabel}
          onSaveLater={handleSaveLater}
          extraContent={
            filledCount !== null && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--teal)", fontWeight: 700 }}>{filledCount}</span>
                campos preenchidos
              </div>
            )
          }
        />
      </div>

      {/* ─── Confirm Dialog (Home / Sair) ─── */}
      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default LegalEditorPage;
