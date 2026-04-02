/**
 * ============================================
 * KRIOU DOCS - Legal Editor Page Component
 * ============================================
 * Wizard de 4 passos para criação de documentos
 * jurídicos (contratos, procuração, etc).
 * 
 * PASSOS:
 * 1. Escolha do tipo de documento
 * 2. Preenchimento dos campos
 * 3. Revisão dos dados
 * 4. Preview + Checkout
 * 
 * @module pages/LegalEditorPage
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Input, Textarea, Select, Badge } from "../components/UI";
import { LEGAL_DOCUMENT_TYPES, LEGAL_DOCUMENT_STEPS } from "../data/constants";

/**
 * LegalEditorPage - Wizard para documentos jurídicos
 */
const LegalEditorPage = () => {
  const {
    navigate,
    currentStep,
    setCurrentStep,
    saveStatus,
    legalFormData,
    setLegalFormData,
    updateLegalField,
    documentType,
    setDocumentType,
    resetLegalForm,
  } = useApp();

  // ─── Estado local ───
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // ───获取当前步骤数据 ───
  const currentStepData = LEGAL_DOCUMENT_STEPS[currentStep];

  // ─── 可用文档类型 ───
  const availableDocTypes = LEGAL_DOCUMENT_TYPES.filter(doc => doc.available);

  // ─── Função para atualizar campo ───
  const handleUpdateField = (field, value) => {
    setLegalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * 选择文档类型并进入下一步
   */
  const handleSelectDocType = (docType) => {
    setSelectedDocType(docType);
    setDocumentType(docType);
    setLegalFormData({});
    setCurrentStep(1);
  };

  /**
   * 验证当前步骤
   */
  const validateCurrentStep = () => {
    if (!selectedDocType) return { valid: true };
    
    const errors = {};
    const requiredFields = selectedDocType.fields.filter(f => f.required);
    
    requiredFields.forEach(field => {
      if (!legalFormData[field.key] || legalFormData[field.key].trim() === "") {
        errors[field.key] = `${field.label} é obrigatório`;
      }
    });

    return { valid: Object.keys(errors).length === 0, errors };
  };

  /**
   * 获取字段错误信息
   */
  const getFieldError = (field) => {
    if (!showErrors || !stepErrors[field]) return null;
    return stepErrors[field];
  };

  /**
   * 渲染第一步：选择文档类型
   */
  const renderStepContent = () => {
    switch (currentStep) {
      // ─── 步骤 0: 选择文档类型 ───
      case 0:
        return (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 32 }}>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                Escolha o Tipo de Documento
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Selecione o documento jurídico que deseja criar
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {availableDocTypes.map((docType, index) => (
                <Card
                  key={docType.id}
                  className="animate-fadeUp"
                  onClick={() => handleSelectDocType(docType)}
                  style={{
                    cursor: "pointer",
                    padding: 24,
                    animationDelay: `${index * 0.1}s`,
                    border: "2px solid var(--border)",
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--coral)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "rgba(233, 69, 96, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Icon name={docType.icon} className="w-6 h-6" style={{ color: "var(--coral)" }} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{docType.name}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{docType.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 不可用文档提示 */}
            <div style={{ marginTop: 32, padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
                <Icon name="Clock" className="w-4 h-4" style={{ marginRight: 6 }} />
                Mais documentos jurídicos em breve. Entre em contato para solicitar modelos específicos.
              </p>
            </div>
          </div>
        );

      // ─── 步骤 1: 填写字段 ───
      case 1:
        return (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                Preencha os Dados
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                {selectedDocType?.name} — Preencha todas as informações necessárias
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {selectedDocType?.fields.map((field) => (
                <div key={field.key}>
                  <label style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: 6,
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {field.label}
                    {field.required && <span style={{ color: "var(--coral)" }}> *</span>}
                  </label>
                  
                  {field.type === "textarea" ? (
                    <textarea
                      className="input-field"
                      rows={4}
                      placeholder={`Digite ${field.label.toLowerCase()}`}
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => handleUpdateField(field.key, e.target.value)}
                      style={getFieldError(field.key) ? { 
                        resize: "vertical", 
                        borderColor: "var(--coral)", 
                        boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" 
                      } : { resize: "vertical" }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className="input-field"
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => handleUpdateField(field.key, e.target.value)}
                      style={getFieldError(field.key) ? { borderColor: "var(--coral)" } : {}}
                    >
                      <option value="">Selecione...</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === "date" ? (
                    <input
                      className="input-field"
                      type="date"
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => handleUpdateField(field.key, e.target.value)}
                      style={getFieldError(field.key) ? { borderColor: "var(--coral)" } : {}}
                    />
                  ) : field.type === "cpf" ? (
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Digite o CPF (só números)"
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                        let formatted = value;
                        if (value.length > 9) {
                          formatted = value.slice(0, 3) + "." + value.slice(3, 6) + "." + value.slice(6, 9) + "-" + value.slice(9);
                        } else if (value.length > 6) {
                          formatted = value.slice(0, 3) + "." + value.slice(3, 6) + "." + value.slice(6);
                        } else if (value.length > 3) {
                          formatted = value.slice(0, 3) + "." + value.slice(3);
                        }
                        handleUpdateField(field.key, formatted);
                      }}
                      style={getFieldError(field.key) ? { 
                        borderColor: "var(--coral)", 
                        boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" 
                      } : {}}
                    />
                  ) : field.type === "money" ? (
                    <input
                      className="input-field"
                      type="text"
                      placeholder="R$ 0,00"
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const formatted = value ? "R$ " + (parseInt(value) / 100).toFixed(2).replace(".", ",") : "";
                        handleUpdateField(field.key, formatted);
                      }}
                      style={getFieldError(field.key) ? { 
                        borderColor: "var(--coral)", 
                        boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" 
                      } : {}}
                    />
                  ) : (
                    <input
                      className="input-field"
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={`Digite ${field.label.toLowerCase()}`}
                      value={legalFormData[field.key] || ""}
                      onChange={(e) => handleUpdateField(field.key, e.target.value)}
                      style={getFieldError(field.key) ? { 
                        borderColor: "var(--coral)", 
                        boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" 
                      } : {}}
                    />
                  )}
                  
                  {getFieldError(field.key) && (
                    <div style={{ fontSize: 11, color: "var(--coral)", marginTop: 4 }}>
                      {getFieldError(field.key)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      // ─── 步骤 2: 审核数据 ───
      case 2:
        return (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                Revise os Dados
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Verifique se todas as informações estão corretas antes de gerar o documento
              </p>
            </div>

            <Card style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(233, 69, 96, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon name={selectedDocType?.icon} className="w-5 h-5" style={{ color: "var(--coral)" }} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{selectedDocType?.name}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Documento Jurídico</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                {selectedDocType?.fields.map((field) => (
                  <div key={field.key}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, textTransform: "uppercase" }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {legalFormData[field.key] || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ marginTop: 16, padding: 12, background: "rgba(0, 200, 151, 0.1)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="Check" className="w-4 h-4" style={{ color: "var(--success)" }} />
              <span style={{ fontSize: 13, color: "var(--success)" }}>
                Todos os campos obrigatórios foram preenchidos
              </span>
            </div>
          </div>
        );

      // ─── 步骤 3: 预览 ───
      case 3:
        return (
          <div className="animate-fadeIn">
            <div style={{ marginBottom: 24 }}>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
                Visualização do Documento
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Revise o documento antes de finalizar
              </p>
            </div>

            {/* 文档预览 */}
            <Card style={{ padding: 32, background: "white", color: "#1a1a1a" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
                  {selectedDocType?.name}
                </h3>
                <div style={{ width: 60, height: 2, background: "#333", margin: "0 auto" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {selectedDocType?.fields.map((field) => (
                  <div key={field.key} style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#333", minWidth: "40%" }}>
                      {field.label}:
                    </span>
                    <span style={{ fontSize: 13, color: "#333" }}>
                      {legalFormData[field.key] || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #ddd", textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#666" }}>
                  Documento gerado por Kriou Docs • {new Date().toLocaleDateString("pt-BR")}
                </p>
              </div>
            </Card>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Button variant="primary" icon="Download" onClick={() => navigate("checkout")}>
                Finalizar e Gerar PDF
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── 检查是否第一步 ───
  const isFirstStep = currentStep === 0;

  // ─── 检查是否最后一步 ───
  const isLastStep = currentStep === LEGAL_DOCUMENT_STEPS.length - 1;

  /**
   * 处理下一步
   */
  const handleNext = () => {
    if (currentStep === 0) {
      if (!selectedDocType) {
        return;
      }
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1) {
      const validation = validateCurrentStep();
      
      if (!validation.valid) {
        setStepErrors(validation.errors);
        setShowErrors(true);
        return;
      }
      
      setStepErrors({});
      setShowErrors(false);
      setCurrentStep(2);
      return;
    }

    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("checkout");
    }
  };

  /**
   * 处理上一步
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * 处理步骤点击
   */
  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── 顶部导航栏 ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* 左侧：返回按钮和步骤信息 */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => isFirstStep ? navigate("dashboard") : handlePrevious()}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                Documento Jurídico — {selectedDocType?.name || "Selecione"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Etapa {currentStep + 1} de {LEGAL_DOCUMENT_STEPS.length}
              </div>
            </div>
          </div>

          {/* 右侧：保存状态 */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--success)" }}>
              <Icon name="Check" className="w-4 h-4" /> Salvo
            </div>
          </div>
        </div>
      </nav>

      {/* ─── 主内容区域 ─── */}
      <div style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "24px 24px 100px", width: "100%" }}>
        {/* ─── 步骤导航器 ─── */}
        {currentStep > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 36, overflowX: "auto", padding: "4px 0" }}>
            {LEGAL_DOCUMENT_STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div
                  key={index}
                  onClick={() => handleStepClick(index)}
                  style={{ display: "flex", alignItems: "center", gap: 4, cursor: isCompleted || index === currentStep ? "pointer" : "not-allowed", flexShrink: 0, opacity: isCompleted || index === currentStep ? 1 : 0.5 }}
                >
                  {/* 步骤圆圈 */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .3s",
                      background: isCompleted
                        ? "var(--success)"
                        : isActive
                        ? "var(--coral)"
                        : "var(--surface-2)",
                      border: isActive ? "2px solid var(--coral)" : "1px solid var(--border)",
                    }}
                  >
                    {isCompleted ? (
                      <Icon name="Check" className="w-4 h-4" />
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 700, color: isActive ? "white" : "var(--text-muted)" }}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* 步骤标签 */}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--text)" : "var(--text-muted)",
                      whiteSpace: "nowrap",
                      display: index < 3 || isActive ? "inline" : "none",
                    }}
                  >
                    {step.label}
                  </span>

                  {/* 步骤连接线 */}
                  {index < LEGAL_DOCUMENT_STEPS.length - 1 && (
                    <div
                      style={{
                        width: 20,
                        height: 2,
                        background: isPast ? "var(--success)" : "var(--border)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── 步骤内容 ─── */}
        {renderStepContent()}
      </div>

      {/* ─── 底部导航 ─── */}
      <div className="glass" style={{ position: "fixed", bottom: 0, left: 0, right: 0, borderTop: "1px solid var(--border)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="secondary"
            disabled={isFirstStep}
            onClick={handlePrevious}
            icon="ChevronLeft"
            iconPosition="left"
          >
            Anterior
          </Button>

          {isLastStep ? (
            <Button
              variant="primary"
              onClick={() => navigate("checkout")}
              icon="Eye"
              iconPosition="right"
              style={{ animation: "pulse-glow 2s infinite" }}
            >
              Visualizar Documento
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext} icon="ChevronRight" iconPosition="right">
              Próximo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalEditorPage;
