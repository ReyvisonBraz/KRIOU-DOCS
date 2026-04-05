/**
 * ============================================
 * KRIOU DOCS - Editor Page Component
 * ============================================
 * 7-step resume creation wizard with form
 * handling, validation, and step navigation.
 */

import React, { useState, useCallback, memo } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Input, Textarea, Select, Badge, Tag, FieldHint, QuickSuggestion, ExperienceTypeSelector, FieldWithIcon, VisualExample, QuickFillCard, AppNavbar, AppStepper, BottomNavigation, ErrorMessage, SaveIndicator } from "../components/UI";
import { STEPS, STEP_DESCRIPTIONS, SKILLS_OPTIONS, LANGUAGE_LEVELS, EDUCATION_STATUS, FIELD_HINTS } from "../data/constants";
import { validateStep, getStepStatus } from "../utils/validation";
import { LABEL_STYLE, ERROR_STYLE } from "../constants/styles";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";

// ─── Sub-componentes memoizados ───────────────────────────────────────────────
// Evitam re-render dos itens não editados quando qualquer campo do array muda.

const ExperienciaItem = memo(({ exp, index, total, onUpdate, onRemove, labelStyle }) => (
  <div
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
      {total > 1 && (
        <button
          onClick={() => onRemove(index)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, marginLeft: 12 }}
        >
          Remover
        </button>
      )}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Empresa</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_empresa.placeholder} value={exp.empresa} onChange={(e) => onUpdate(index, "empresa", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Cargo</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_cargo.placeholder} value={exp.cargo} onChange={(e) => onUpdate(index, "cargo", e.target.value)} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Período</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_periodo.placeholder} value={exp.periodo} onChange={(e) => onUpdate(index, "periodo", e.target.value)} />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Descrição</label>
        <textarea className="input-field" rows={3} placeholder={FIELD_HINTS.experiencia_descricao.placeholder} value={exp.descricao} onChange={(e) => onUpdate(index, "descricao", e.target.value)} style={{ resize: "vertical" }} />
      </div>
    </div>
  </div>
));

const FormacaoItem = memo(({ form, index, total, onUpdate, onRemove, labelStyle }) => (
  <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teal)", marginBottom: 12 }}>
      Formação {index + 1}
      {total > 1 && (
        <button onClick={() => onRemove(index)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, marginLeft: 12 }}>
          Remover
        </button>
      )}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Instituição</label>
        <input className="input-field" placeholder="Universidade / Escola" value={form.instituicao} onChange={(e) => onUpdate(index, "instituicao", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Curso</label>
        <input className="input-field" placeholder="Nome do curso" value={form.curso} onChange={(e) => onUpdate(index, "curso", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Período</label>
        <input className="input-field" placeholder="2018 - 2022" value={form.periodo} onChange={(e) => onUpdate(index, "periodo", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Status</label>
        <select className="input-field" value={form.status} onChange={(e) => onUpdate(index, "status", e.target.value)}>
          {EDUCATION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>
));

const IdiomaItem = memo(({ idioma, index, total, onUpdate, onRemove, labelStyle }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 16, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--border)" }}>
    <div>
      <label style={labelStyle}>Idioma</label>
      <input className="input-field" placeholder="Ex: Inglês" value={idioma.idioma} onChange={(e) => onUpdate(index, "idioma", e.target.value)} />
    </div>
    <div>
      <label style={labelStyle}>Nível</label>
      <select className="input-field" value={idioma.nivel} onChange={(e) => onUpdate(index, "nivel", e.target.value)}>
        {LANGUAGE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
      </select>
      {total > 1 && (
        <button onClick={() => onRemove(index)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, marginTop: 8 }}>
          Remover
        </button>
      )}
    </div>
  </div>
));

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
    lastSaved,
  } = useApp();

  // ─── Estado de Validação ───
  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  // ─── Aviso de alterações não salvas ao fechar aba ───
  const isDirty = saveStatus === "saving" || saveStatus === "idle";
  useUnsavedChanges(isDirty);

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

  const toggleSkill = useCallback((skill) => {
    updateForm("habilidades", formData.habilidades.includes(skill)
      ? formData.habilidades.filter((s) => s !== skill)
      : [...formData.habilidades, skill]
    );
  }, [formData.habilidades, updateForm]);

  const addExperiencia = useCallback(() => {
    updateForm("experiencias", [...formData.experiencias, { empresa: "", cargo: "", periodo: "", descricao: "" }]);
  }, [formData.experiencias, updateForm]);

  const updateExperiencia = useCallback((index, field, value) => {
    const updated = [...formData.experiencias];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("experiencias", updated);
  }, [formData.experiencias, updateForm]);

  const removeExperiencia = useCallback((index) => {
    if (formData.experiencias.length > 1) {
      updateForm("experiencias", formData.experiencias.filter((_, i) => i !== index));
    }
  }, [formData.experiencias, updateForm]);

  const addFormacao = useCallback(() => {
    updateForm("formacoes", [...formData.formacoes, { instituicao: "", curso: "", periodo: "", status: "Cursando" }]);
  }, [formData.formacoes, updateForm]);

  const updateFormacao = useCallback((index, field, value) => {
    const updated = [...formData.formacoes];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("formacoes", updated);
  }, [formData.formacoes, updateForm]);

  const removeFormacao = useCallback((index) => {
    if (formData.formacoes.length > 1) {
      updateForm("formacoes", formData.formacoes.filter((_, i) => i !== index));
    }
  }, [formData.formacoes, updateForm]);

  const addIdioma = useCallback(() => {
    updateForm("idiomas", [...formData.idiomas, { idioma: "", nivel: "Básico" }]);
  }, [formData.idiomas, updateForm]);

  const updateIdioma = useCallback((index, field, value) => {
    const updated = [...formData.idiomas];
    updated[index] = { ...updated[index], [field]: value };
    updateForm("idiomas", updated);
  }, [formData.idiomas, updateForm]);

  const removeIdioma = useCallback((index) => {
    if (formData.idiomas.length > 1) {
      updateForm("idiomas", formData.idiomas.filter((_, i) => i !== index));
    }
  }, [formData.idiomas, updateForm]);

  // labelStyle e errorStyle centralizados em constants/styles.js
  const labelStyle = LABEL_STYLE;
  const errorStyle = ERROR_STYLE;

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
                <FieldWithIcon icon="user" label="Nome Completo *" tip="Como aparece nos seus documentos">
                  <input
                    className="input-field"
                    placeholder={FIELD_HINTS.nome.placeholder}
                    value={formData.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                    style={getFieldError("nome") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                  />
                </FieldWithIcon>
                {getFieldError("nome") && <div style={errorStyle}>{getFieldError("nome")}</div>}
                <VisualExample type="nome" />
              </div>
              <div>
                <FieldWithIcon icon="email" label="E-mail *" tip="Email que você usa com frequência">
                  <input
                    className="input-field"
                    type="email"
                    placeholder={FIELD_HINTS.email.placeholder}
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    style={getFieldError("email") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                  />
                </FieldWithIcon>
                {getFieldError("email") && <div style={errorStyle}>{getFieldError("email")}</div>}
              </div>
              <div>
                <FieldWithIcon icon="phone" label="Telefone *" tip="Com DDD para contato">
                  <input
                    className="input-field"
                    placeholder={FIELD_HINTS.telefone.placeholder}
                    value={formData.telefone}
                    onChange={(e) => updateForm("telefone", e.target.value)}
                    style={getFieldError("telefone") ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
                  />
                </FieldWithIcon>
                {getFieldError("telefone") && <div style={errorStyle}>{getFieldError("telefone")}</div>}
              </div>
              <div>
                <FieldWithIcon icon="location" label="Cidade / Estado">
                  <input
                    className="input-field"
                    placeholder={FIELD_HINTS.cidade.placeholder}
                    value={formData.cidade}
                    onChange={(e) => updateForm("cidade", e.target.value)}
                  />
                </FieldWithIcon>
              </div>
              <div>
                <FieldWithIcon icon="linkedin" label="LinkedIn (opicional)" tip="Se não tem, pode pular">
                  <input
                    className="input-field"
                    placeholder={FIELD_HINTS.linkedin.placeholder}
                    value={formData.linkedin}
                    onChange={(e) => updateForm("linkedin", e.target.value)}
                  />
                </FieldWithIcon>
              </div>
            </div>
          </div>
        );

      // ─── Etapa 1: Objetivo ───
      case 1:
        return (
          <div className="animate-fadeIn">
            <FieldWithIcon icon="target" label="Objetivo Profissional *" tip="O que você quer fazer na sua carreira?">
              <textarea
                className="input-field"
                rows={4}
                placeholder={FIELD_HINTS.objetivo.placeholder}
                value={formData.objetivo}
                onChange={(e) => updateForm("objetivo", e.target.value)}
                style={getFieldError("objetivo") ? { resize: "vertical", borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : { resize: "vertical" }}
              />
            </FieldWithIcon>
            {getFieldError("objetivo") && <div style={errorStyle}>{getFieldError("objetivo")}</div>}
            
            <QuickFillCard
              title="🎯 Não sabe o que escribir?"
              examples={[
                { level: "👶 Iniciante", text: "Busco minha primeira oportunidade de trabalho. Sou comunicativo e aprendo rápido." },
                { level: "📈 Intermediário", text: "Procuro uma posição na área de vendas onde posso desenvolver minhas habilidades de comunicação." },
                { level: "💼 Avançado", text: "Desenvolvedor Full Stack com 3 años de experiência, buscando posição de liderança técnica em empresa de tecnologia." },
              ]}
              onSelect={(text) => updateForm("objetivo", text)}
            />
          </div>
        );

      // ─── Etapa 2: Experiência ───
      case 2:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <FieldHint
              hint={FIELD_HINTS.experiencia_empresa.hint}
              example={FIELD_HINTS.experiencia_empresa.examples?.[0]}
              whereFind={FIELD_HINTS.experiencia_empresa.whatIfNeverWorked}
              skipLabel={FIELD_HINTS.experiencia_empresa.skipLabel}
            />
            {formData.experiencias.map((exp, index) => (
              <ExperienciaItem
                key={index}
                exp={exp}
                index={index}
                total={formData.experiencias.length}
                onUpdate={updateExperiencia}
                onRemove={removeExperiencia}
                labelStyle={labelStyle}
              />
            ))}
            <Button variant="secondary" icon="Plus" onClick={addExperiencia} style={{ border: "2px dashed var(--border)", background: "none" }}>
              + Adicionar Experiência
            </Button>
          </div>
        );

      // ─── Etapa 3: Formação ───
      case 3:
        return (
          <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {formData.formacoes.map((form, index) => (
              <FormacaoItem
                key={index}
                form={form}
                index={index}
                total={formData.formacoes.length}
                onUpdate={updateFormacao}
                onRemove={removeFormacao}
                labelStyle={labelStyle}
              />
            ))}
            <Button variant="secondary" icon="Plus" onClick={addFormacao} style={{ border: "2px dashed var(--border)", background: "none" }}>
              + Adicionar Formação
            </Button>
            <FieldHint
              hint={FIELD_HINTS.formacao_curso.hint}
              example={FIELD_HINTS.formacao_curso.examples?.[0]}
              whereFind={FIELD_HINTS.formacao_curso.whatIfStudying}
            />
          </div>
        );

      // ─── Etapa 4: Habilidades ───
      case 4:
        return (
          <div className="animate-fadeIn">
            <FieldHint
              hint={FIELD_HINTS.habilidades.hint}
              whereFind={FIELD_HINTS.habilidades.categories?.basic}
            />
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
            <FieldHint
              hint={FIELD_HINTS.idiomas.tip}
              whereFind="Seja honesto ao avaliar seu nível. Empresas podem testar."
            />
            {formData.idiomas.map((idioma, index) => (
              <IdiomaItem
                key={index}
                idioma={idioma}
                index={index}
                total={formData.idiomas.length}
                onUpdate={updateIdioma}
                onRemove={removeIdioma}
                labelStyle={labelStyle}
              />
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
            <FieldHint
              hint={FIELD_HINTS.extras.hint}
              example={FIELD_HINTS.extras.examples?.[0]}
              whereFind={FIELD_HINTS.extras.whatIsRelevant}
            />
            <label style={{ ...labelStyle, marginTop: 16, display: "block" }}>Cursos, Certificações e Informações Adicionais</label>
            <textarea
              className="input-field"
              rows={5}
              placeholder={FIELD_HINTS.extras.placeholder}
              value={formData.cursos}
              onChange={(e) => updateForm("cursos", e.target.value)}
              style={{ resize: "vertical" }}
            />
            <QuickSuggestion
              label="💡 Quer algumas ideias?"
              suggestions={FIELD_HINTS.extras.examples?.slice(0, 4)}
              onSelect={(text) => updateForm("cursos", formData.cursos ? `${formData.cursos}\n${text}` : text)}
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

  // Etapas concluídas para o AppStepper
  const completedSteps = new Set(
    STEPS.map((_, i) => i).filter((i) => i < currentStep)
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─── Top Navigation Bar (AppNavbar reutilizável) ─── */}
      <AppNavbar
        title={`Currículo — ${selectedTemplate?.name || "Modelo"}`}
        leftAction={
          <button
            onClick={() => navigate("templates")}
            aria-label="Voltar para modelos"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
            <span style={{ fontSize: 13 }}>Modelos</span>
          </button>
        }
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <Button variant="primary" size="small" icon="Eye" onClick={() => navigate("preview")}>
              Preview
            </Button>
          </div>
        }
      >
        {/* Stepper dentro da navbar */}
        <AppStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />
      </AppNavbar>

      {/* ─── Main Content Area ─── */}
      <div style={{ flex: 1, maxWidth: 860, margin: "0 auto", padding: "24px 24px 100px", width: "100%" }}>

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

      {/* ─── Bottom Navigation (BottomNavigation reutilizável) ─── */}
      <BottomNavigation
        onBack={handlePrevious}
        onNext={isLastStep ? () => navigate("preview") : handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        nextLabel={isLastStep ? "✓ Visualizar" : undefined}
      />
    </div>
  );
};

export default EditorPage;