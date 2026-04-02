/**
 * ============================================
 * KRIOU DOCS - Editor Page Component
 * ============================================
 * 7-step resume creation wizard with form
 * handling, validation, and step navigation.
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Input, Textarea, Select, Badge, Tag } from "../components/UI";
import { STEPS, STEP_DESCRIPTIONS, SKILLS_OPTIONS, LANGUAGE_LEVELS, EDUCATION_STATUS } from "../data/constants";
import { validateStep, getStepStatus } from "../utils/validation";

/**
 * EditorPage - Resume creation wizard with 7 steps
 */
const EditorPage = () => {
  const {
    navigate,
    selectedTemplate,
    currentStep,
    setCurrentStep,
    formData,
    updateForm,
    saveStatus,
  } = useApp();

  // ─── Estado de Validação ───
  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  /**
   * Current step definition
   */
  const currentStepData = STEPS[currentStep];

  /**
   * Validate current step and return status
   */
  const getCurrentStepValidation = () => {
    return getStepStatus(currentStep, formData);
  };

  /**
   * Toggle skill selection
   * @param {string} skill - Skill to toggle
   */
  const toggleSkill = (skill) => {
    const hasSkill = formData.habilidades.includes(skill);
    if (hasSkill) {
      updateForm("habilidades", formData.habilidades.filter((s) => s !== skill));
    } else {
      updateForm("habilidades", [...formData.habilidades, skill]);
    }
  };

  /**
   * Add new experience entry
   */
  const addExperiencia = () => {
    updateForm("experiencias", [
      ...formData.experiencias,
      { empresa: "", cargo: "", periodo: "", descricao: "" },
    ]);
  };

  /**
   * Update specific experience field
   * @param {number} index - Experience index
   * @param {string} field - Field to update
   * @param {string} value - New value
   */
  const updateExperiencia = (index, field, value) => {
    const updated = [...formData.experiencias];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("experiencias", updated);
  };

  /**
   * Remove experience entry
   * @param {number} index - Experience index to remove
   */
  const removeExperiencia = (index) => {
    if (formData.experiencias.length > 1) {
      const updated = formData.experiencias.filter((_, i) => i !== index);
      updateForm("experiencias", updated);
    }
  };

  /**
   * Add new education entry
   */
  const addFormacao = () => {
    updateForm("formacoes", [
      ...formData.formacoes,
      { instituicao: "", curso: "", periodo: "", status: "Cursando" },
    ]);
  };

  /**
   * Update specific education field
   * @param {number} index - Education index
   * @param {string} field - Field to update
   * @param {string} value - New value
   */
  const updateFormacao = (index, field, value) => {
    const updated = [...formData.formacoes];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("formacoes", updated);
  };

  /**
   * Remove education entry
   * @param {number} index - Education index to remove
   */
  const removeFormacao = (index) => {
    if (formData.formacoes.length > 1) {
      const updated = formData.formacoes.filter((_, i) => i !== index);
      updateForm("formacoes", updated);
    }
  };

  /**
   * Add new language entry
   */
  const addIdioma = () => {
    updateForm("idiomas", [...formData.idiomas, { idioma: "", nivel: "Básico" }]);
  };

  /**
   * Update specific language field
   * @param {number} index - Language index
   * @param {string} field - Field to update
   * @param {string} value - New value
   */
  const updateIdioma = (index, field, value) => {
    const updated = [...formData.idiomas];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("idiomas", updated);
  };

  /**
   * Remove language entry
   * @param {number} index - Language index to remove
   */
  const removeIdioma = (index) => {
    if (formData.idiomas.length > 1) {
      const updated = formData.idiomas.filter((_, i) => i !== index);
      updateForm("idiomas", updated);
    }
  };

  /**
   * Label style for form fields
   */
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: 6,
    display: "block",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  /**
   * Error message style
   */
  const errorStyle = {
    fontSize: 11,
    color: "var(--coral)",
    marginTop: 4,
  };

  /**
   * Get error message for a field
   */
  const getFieldError = (field) => {
    if (!showErrors || !stepErrors[field]) return null;
    return stepErrors[field];
  };

  /**
   * Step objective suggestions
   */
  const objectiveSuggestions = ["Desenvolvedor", "Designer", "Analista", "Gerente"];

  /**
   * Render step content based on current step index
   * @returns {JSX.Element} Step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      // ─── Etapa 0: Dados Pessoais ───
      case 0:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Nome Completo *</label>
                <input
                  className="input-field"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => updateForm("nome", e.target.value)}
                  style={getFieldError("nome") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                />
                {getFieldError("nome") && <div style={errorStyle}>{getFieldError("nome")}</div>}
              </div>
              <div>
                <label style={labelStyle}>E-mail *</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  style={getFieldError("email") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                />
                {getFieldError("email") && <div style={errorStyle}>{getFieldError("email")}</div>}
              </div>
              <div>
                <label style={labelStyle}>Telefone *</label>
                <input
                  className="input-field"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => updateForm("telefone", e.target.value)}
                  style={getFieldError("telefone") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                />
                {getFieldError("telefone") && <div style={errorStyle}>{getFieldError("telefone")}</div>}
              </div>
              <div>
                <label style={labelStyle}>Cidade / Estado</label>
                <input
                  className="input-field"
                  placeholder="São Paulo, SP"
                  value={formData.cidade}
                  onChange={(e) => updateForm("cidade", e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn</label>
                <input
                  className="input-field"
                  placeholder="linkedin.com/in/seu-perfil"
                  value={formData.linkedin}
                  onChange={(e) => updateForm("linkedin", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      // ─── Etapa 1: Objetivo ───
      case 1:
        return (
          <div className="animate-fadeIn">
            <label style={labelStyle}>Objetivo Profissional *</label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Ex: Desenvolvedor Full Stack com 5 anos de experiência buscando posição de liderança técnica..."
              value={formData.objetivo}
              onChange={(e) => updateForm("objetivo", e.target.value)}
              style={getFieldError("objetivo") ? { resize: "vertical", borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : { resize: "vertical" }}
            />
            {getFieldError("objetivo") && <div style={errorStyle}>{getFieldError("objetivo")}</div>}
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sugestões:</span>
              {objectiveSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => updateForm("objetivo", `Profissional de ${suggestion} com experiência buscando novos desafios...`)}
                  style={{ background: "var(--surface-3)", border: "none", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "var(--teal)", cursor: "pointer" }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        );

      // ─── Etapa 2: Experiência ───
      case 2:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {formData.experiencias.map((exp, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: "var(--surface-2)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral)", marginBottom: 12 }}>
                  Experiência {index + 1}
                  {formData.experiencias.length > 1 && (
                    <button
                      onClick={() => removeExperiencia(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        marginLeft: 12,
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Empresa</label>
                    <input
                      className="input-field"
                      placeholder="Nome da empresa"
                      value={exp.empresa}
                      onChange={(e) => updateExperiencia(index, "empresa", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Cargo</label>
                    <input
                      className="input-field"
                      placeholder="Seu cargo"
                      value={exp.cargo}
                      onChange={(e) => updateExperiencia(index, "cargo", e.target.value)}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Período</label>
                    <input
                      className="input-field"
                      placeholder="Jan 2022 - Atual"
                      value={exp.periodo}
                      onChange={(e) => updateExperiencia(index, "periodo", e.target.value)}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Descrição</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="Descreva suas principais atividades e conquistas..."
                      value={exp.descricao}
                      onChange={(e) => updateExperiencia(index, "descricao", e.target.value)}
                      style={{ resize: "vertical" }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="secondary" icon="Plus" onClick={addExperiencia} style={{ border: "2px dashed var(--border)", background: "none" }}>
              Adicionar Experiência
            </Button>
          </div>
        );

      // ─── Etapa 3: Formação ───
      case 3:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {formData.formacoes.map((form, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: "var(--surface-2)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)", marginBottom: 12 }}>
                  Formação {index + 1}
                  {formData.formacoes.length > 1 && (
                    <button
                      onClick={() => removeFormacao(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 12,
                        marginLeft: 12,
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Instituição</label>
                    <input
                      className="input-field"
                      placeholder="Universidade / Escola"
                      value={form.instituicao}
                      onChange={(e) => updateFormacao(index, "instituicao", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Curso</label>
                    <input
                      className="input-field"
                      placeholder="Nome do curso"
                      value={form.curso}
                      onChange={(e) => updateFormacao(index, "curso", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Período</label>
                    <input
                      className="input-field"
                      placeholder="2018 - 2022"
                      value={form.periodo}
                      onChange={(e) => updateFormacao(index, "periodo", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select
                      className="input-field"
                      value={form.status}
                      onChange={(e) => updateFormacao(index, "status", e.target.value)}
                    >
                      {EDUCATION_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="secondary" icon="Plus" onClick={addFormacao} style={{ border: "2px dashed var(--border)", background: "none" }}>
              Adicionar Formação
            </Button>
          </div>
        );

      // ─── Etapa 4: Habilidades ───
      case 4:
        return (
          <div className="animate-fadeIn">
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
              Selecione suas habilidades ou adicione novas:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SKILLS_OPTIONS.map((skill) => {
                const isActive = formData.habilidades.includes(skill);
                return (
                  <Tag key={skill} active={isActive} onClick={() => toggleSkill(skill)}>
                    {isActive && "✓ "}
                    {skill}
                  </Tag>
                );
              })}
            </div>
          </div>
        );

      // ─── Etapa 5: Idiomas ───
      case 5:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {formData.idiomas.map((idioma, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  padding: 16,
                  background: "var(--surface-2)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <label style={labelStyle}>Idioma</label>
                  <input
                    className="input-field"
                    placeholder="Ex: Inglês"
                    value={idioma.idioma}
                    onChange={(e) => updateIdioma(index, "idioma", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nível</label>
                  <select
                    className="input-field"
                    value={idioma.nivel}
                    onChange={(e) => updateIdioma(index, "nivel", e.target.value)}
                  >
                    {LANGUAGE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  {formData.idiomas.length > 1 && (
                    <button
                      onClick={() => removeIdioma(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 11,
                        marginTop: 8,
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="secondary" icon="Plus" onClick={addIdioma} style={{ border: "2px dashed var(--border)", background: "none" }}>
              Adicionar Idioma
            </Button>
          </div>
        );

      // ─── Etapa 6: Extras ───
      case 6:
        return (
          <div className="animate-fadeIn">
            <label style={labelStyle}>Cursos, Certificações e Informações Adicionais</label>
            <textarea
              className="input-field"
              rows={5}
              placeholder="Liste cursos extracurriculares, certificações, trabalho voluntário, projetos pessoais..."
              value={formData.cursos}
              onChange={(e) => updateForm("cursos", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Check if current step is first
   */
  const isFirstStep = currentStep === 0;

  /**
   * Check if current step is last
   */
  const isLastStep = currentStep === STEPS.length - 1;

  /**
   * Handle next step navigation with validation
   */
  const handleNext = () => {
    // Validar etapa atual antes de avançar
    const validation = validateStep(currentStep, formData);
    
    if (!validation.valid) {
      setStepErrors(validation.errors);
      setShowErrors(true);
      return;
    }
    
    // Limpar erros e avançar
    setStepErrors({});
    setShowErrors(false);
    
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("preview");
    }
  };

  /**
   * Handle previous step navigation
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handle step click navigation (from stepper)
   * @param {number} step - Step to navigate to
   */
  const handleStepClick = (step) => {
    // Apenas permite voltar para etapas concluídas ou etapa atual
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── Top Navigation Bar ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left: Back button and step info */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("templates")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                Currículo — {selectedTemplate?.name || "Modelo"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Etapa {currentStep + 1} de {STEPS.length}
              </div>
            </div>
          </div>

          {/* Right: Save status and preview button */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: saveStatus === "saved" ? "var(--success)" : "var(--gold)" }}>
              {saveStatus === "saving" ? (
                <>
                  <span style={{ animation: "typing 1s infinite" }}>●</span> Salvando...
                </>
              ) : (
                <>
                  <Icon name="Check" className="w-4 h-4" /> Salvo
                </>
              )}
            </div>
            <Button variant="primary" size="small" icon="Eye" onClick={() => navigate("preview")}>
              Preview
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Main Content Area ─── */}
      <div style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "24px 24px 100px", width: "100%" }}>
        {/* ─── Stepper Navigation ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 36, overflowX: "auto", padding: "4px 0" }}>
          {STEPS.map((step, index) => {
            const IconComponent = Icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <div
                key={index}
                onClick={() => handleStepClick(index)}
                style={{ display: "flex", alignItems: "center", gap: 4, cursor: isCompleted || index === currentStep ? "pointer" : "not-allowed", flexShrink: 0, opacity: isCompleted || index === currentStep ? 1 : 0.5 }}
              >
                {/* Step Circle */}
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
                    <Icon name={step.icon} className="w-4 h-4" style={{ opacity: isActive ? 1 : 0.4 }} />
                  )}
                </div>

                {/* Step Label */}
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

                {/* Step Connector */}
                {index < STEPS.length - 1 && (
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

        {/* ─── Step Title Section ─── */}
        <div className="animate-slideRight" key={currentStep} style={{ marginBottom: 28 }}>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {currentStepData.label}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{STEP_DESCRIPTIONS[currentStep]}</p>
        </div>

        {/* ─── Step Content ─── */}
        {renderStepContent()}
      </div>

      {/* ─── Bottom Navigation ─── */}
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
              onClick={() => navigate("preview")}
              icon="Eye"
              iconPosition="right"
              style={{ animation: "pulse-glow 2s infinite" }}
            >
              Visualizar Currículo
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

export default EditorPage;