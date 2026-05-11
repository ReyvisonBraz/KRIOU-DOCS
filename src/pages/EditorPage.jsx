import React, { useState, useCallback, memo } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Input, Textarea, Select, Badge, Tag, FieldHint, QuickSuggestion, ExperienceTypeSelector, FieldWithIcon, VisualExample, QuickFillCard, AppNavbar, AppStepper, BottomNavigation, ErrorMessage, SaveIndicator, ConfirmDialog } from "../components/UI";
import { STEPS, STEP_DESCRIPTIONS, SKILLS_OPTIONS, LANGUAGE_LEVELS, EDUCATION_STATUS, FIELD_HINTS } from "../data/constants";
import { validateStep } from "../utils/validation";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useConfirm } from "../hooks/useConfirm";

const labelClass = "block text-[13px] font-semibold text-text-dim mb-1.5 tracking-[0.01em] font-body";
const errorClass = "flex items-center gap-1.5 text-coral font-medium text-xs mt-1.5 ml-1";
const inputErrorClass = "input-field-error";
const stepContainerClass = "animate-fade-in flex flex-col";

const ExperienciaItem = memo(({ exp, index, total, onUpdate, onRemove }) => (
  <div className="surface-card p-5 md:p-6 relative shadow-[0_1px_4px_rgba(0,0,0,0.16)] transition-all duration-300 hover:shadow-[0_3px_14px_rgba(0,0,0,0.22)] hover:border-border-hover">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-coral/10 flex items-center justify-center text-xs font-bold text-coral font-display">
          {index + 1}
        </div>
        <span className="text-sm font-bold text-coral font-display tracking-tight">Experiência</span>
      </div>
      {total > 1 && (
        <button
          onClick={() => onRemove(index)}
          className="touch-target text-xs font-semibold text-text-muted hover:text-coral transition-colors uppercase tracking-wider rounded-lg focus-ring"
        >
          Remover
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className={labelClass}>Empresa</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_empresa.placeholder} value={exp.empresa} onChange={(e) => onUpdate(index, "empresa", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Cargo</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_cargo.placeholder} value={exp.cargo} onChange={(e) => onUpdate(index, "cargo", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Período</label>
        <input className="input-field" placeholder={FIELD_HINTS.experiencia_periodo.placeholder} value={exp.periodo} onChange={(e) => onUpdate(index, "periodo", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Descrição das Atividades</label>
        <textarea className="input-field resize-y min-h-[100px]" rows={3} placeholder={FIELD_HINTS.experiencia_descricao.placeholder} value={exp.descricao} onChange={(e) => onUpdate(index, "descricao", e.target.value)} />
      </div>
    </div>
  </div>
));

const FormacaoItem = memo(({ form, index, total, onUpdate, onRemove }) => (
  <div className="surface-card p-5 md:p-6 relative shadow-[0_1px_4px_rgba(0,0,0,0.16)] transition-all duration-300 hover:shadow-[0_3px_14px_rgba(0,0,0,0.22)] hover:border-border-hover">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center text-xs font-bold text-teal font-display">
          {index + 1}
        </div>
        <span className="text-sm font-bold text-teal font-display tracking-tight">Formação</span>
      </div>
      {total > 1 && (
        <button onClick={() => onRemove(index)} className="touch-target text-xs font-semibold text-text-muted hover:text-coral transition-colors uppercase tracking-wider rounded-lg focus-ring">
          Remover
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <label className={labelClass}>Instituição de Ensino</label>
        <input className="input-field" placeholder="Ex: Universidade de São Paulo" value={form.instituicao} onChange={(e) => onUpdate(index, "instituicao", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Curso</label>
        <input className="input-field" placeholder="Ex: Engenharia de Software" value={form.curso} onChange={(e) => onUpdate(index, "curso", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <div className="relative">
          <select className="input-field appearance-none pr-10" value={form.status} onChange={(e) => onUpdate(index, "status", e.target.value)}>
            {EDUCATION_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Icon name="ChevronDown" className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>
      <div className="md:col-span-2">
        <label className={labelClass}>Período Mês/Ano</label>
        <input className="input-field" placeholder="Ex: 2018 - 2022" value={form.periodo} onChange={(e) => onUpdate(index, "periodo", e.target.value)} />
      </div>
    </div>
  </div>
));

const IdiomaItem = memo(({ idioma, index, total, onUpdate, onRemove }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 surface-card p-5 md:p-6 relative shadow-[0_1px_4px_rgba(0,0,0,0.16)] transition-all duration-300 hover:shadow-[0_3px_14px_rgba(0,0,0,0.22)] hover:border-border-hover">
    <div>
      <label className={labelClass}>Idioma</label>
      <input className="input-field" placeholder="Ex: Inglês" value={idioma.idioma} onChange={(e) => onUpdate(index, "idioma", e.target.value)} />
    </div>
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelClass + " mb-0"}>Nível</label>
        {total > 1 && (
          <button onClick={() => onRemove(index)} className="text-[11px] uppercase tracking-wider font-semibold text-text-muted hover:text-coral transition-colors rounded-lg focus-ring touch-target">
            Remover
          </button>
        )}
      </div>
      <div className="relative">
        <select className="input-field appearance-none pr-10" value={idioma.nivel} onChange={(e) => onUpdate(index, "nivel", e.target.value)}>
          {LANGUAGE_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
        </select>
        <Icon name="ChevronDown" className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  </div>
));

const EditorPage = () => {
  const { navigate, selectedTemplate, currentStep, setCurrentStep, formData, updateForm, saveStatus, lastSaved } = useApp();

  const [stepErrors, setStepErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const isDirty = saveStatus === "saving" || saveStatus === "idle";
  useUnsavedChanges(isDirty);

  const currentStepData = STEPS[currentStep];

  const getFieldError = (field) => {
    if (!showErrors || !stepErrors[field]) return null;
    return stepErrors[field];
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={`${stepContainerClass} gap-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="md:col-span-2">
                <FieldWithIcon icon="user" label="Nome Completo *" tip="Como aparece nos seus documentos">
                  <input
                    className={`input-field ${getFieldError("nome") ? inputErrorClass : ""}`}
                    placeholder={FIELD_HINTS.nome.placeholder}
                    value={formData.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                  />
                </FieldWithIcon>
                {getFieldError("nome") && <div className={errorClass}><Icon name="AlertCircle" className="w-3.5 h-3.5" />{getFieldError("nome")}</div>}
                <VisualExample type="nome" />
              </div>
              <div>
                <FieldWithIcon icon="email" label="E-mail *" tip="Email que você checa todo dia">
                  <input
                    className={`input-field ${getFieldError("email") ? inputErrorClass : ""}`}
                    type="email"
                    placeholder={FIELD_HINTS.email.placeholder}
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                  />
                </FieldWithIcon>
                {getFieldError("email") && <div className={errorClass}><Icon name="AlertCircle" className="w-3.5 h-3.5" />{getFieldError("email")}</div>}
              </div>
              <div>
                <FieldWithIcon icon="phone" label="Telefone / Whats *" tip="Com DDD para contato direto">
                  <input
                    className={`input-field ${getFieldError("telefone") ? inputErrorClass : ""}`}
                    placeholder={FIELD_HINTS.telefone.placeholder}
                    value={formData.telefone}
                    onChange={(e) => updateForm("telefone", e.target.value)}
                  />
                </FieldWithIcon>
                {getFieldError("telefone") && <div className={errorClass}><Icon name="AlertCircle" className="w-3.5 h-3.5" />{getFieldError("telefone")}</div>}
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
                <FieldWithIcon icon="linkedin" label="LinkedIn (opcional)" tip="Se não tem, deixe vazio">
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

      case 1:
        return (
          <div className={`${stepContainerClass} gap-6`}>
            <div className="surface-card p-6 md:p-7">
              <div>
                <FieldWithIcon icon="target" label="Objetivo Profissional *" tip="O que você busca na sua carreira atualmente?">
                  <textarea
                    className={`input-field min-h-[152px] resize-y leading-relaxed ${getFieldError("objetivo") ? inputErrorClass : ""}`}
                    placeholder={FIELD_HINTS.objetivo.placeholder}
                    value={formData.objetivo}
                    onChange={(e) => updateForm("objetivo", e.target.value)}
                  />
                </FieldWithIcon>
                {getFieldError("objetivo") && <div className={errorClass}><Icon name="AlertCircle" className="w-3.5 h-3.5" />{getFieldError("objetivo")}</div>}
              </div>
              <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                <QuickFillCard
                  title="Em dúvida? Veja exemplos"
                  examples={[
                    { level: "Iniciante", text: "Busco minha primeira oportunidade engajado em aprender rápido e somar na equipe de vendas." },
                    { level: "Intermediário", text: "Profissional de Marketing Pleno buscando aplicar meus conhecimentos analíticos para aumentar resultados de campanhas digitais." },
                    { level: "Avançado", text: "Gestor Comercial Sênior focando em otimizar processos em empresas tech atuantes no mercado nacional." },
                  ]}
                  onSelect={(text) => updateForm("objetivo", text)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`${stepContainerClass} gap-5`}>
            <FieldHint
              hint={FIELD_HINTS.experiencia_empresa.hint}
              example={FIELD_HINTS.experiencia_empresa.examples?.[0]}
              whereFind={FIELD_HINTS.experiencia_empresa.whatIfNeverWorked}
              skipLabel={FIELD_HINTS.experiencia_empresa.skipLabel}
            />
            <div className="flex flex-col gap-4 mt-1">
              {formData.experiencias.map((exp, index) => (
                <ExperienciaItem key={index} exp={exp} index={index} total={formData.experiencias.length} onUpdate={updateExperiencia} onRemove={removeExperiencia} />
              ))}
            </div>
            <button
              onClick={addExperiencia}
              className="touch-target w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-transparent border-2 border-dashed border-border/60 text-text-muted font-semibold text-[15px] transition-all duration-300 hover:border-coral/40 hover:text-coral hover:bg-coral/[0.04] active:scale-[0.99] focus-ring"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Adicionar Nova Experiência
            </button>
          </div>
        );

      case 3:
        return (
          <div className={`${stepContainerClass} gap-5`}>
            <FieldHint
              hint={FIELD_HINTS.formacao_curso.hint}
              example={FIELD_HINTS.formacao_curso.examples?.[0]}
              whereFind={FIELD_HINTS.formacao_curso.whatIfStudying}
            />
            <div className="flex flex-col gap-4 mt-1">
              {formData.formacoes.map((form, index) => (
                <FormacaoItem key={index} form={form} index={index} total={formData.formacoes.length} onUpdate={updateFormacao} onRemove={removeFormacao} />
              ))}
            </div>
            <button
              onClick={addFormacao}
              className="touch-target w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-transparent border-2 border-dashed border-border/60 text-text-muted font-semibold text-[15px] transition-all duration-300 hover:border-teal/40 hover:text-teal hover:bg-teal/[0.04] active:scale-[0.99] focus-ring"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Adicionar Nova Formação
            </button>
          </div>
        );

      case 4:
        return (
          <div className={`${stepContainerClass} gap-5`}>
            <div className="surface-card p-6 md:p-7">
              <FieldHint hint={FIELD_HINTS.habilidades.hint} whereFind={FIELD_HINTS.habilidades.categories?.basic} />
              <p className="text-sm font-medium text-text-muted mt-2 mb-5">Selecione suas habilidades chave ou ferramentas dominadas:</p>
              <div className="flex flex-wrap gap-2.5">
                {SKILLS_OPTIONS.map((skill) => {
                  const isActive = formData.habilidades.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`touch-target px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 cursor-pointer select-none border tracking-tight
                        ${isActive
                          ? 'bg-coral text-white border-coral shadow-[0_2px_12px_rgba(244,63,94,0.28)] hover:shadow-[0_4px_20px_rgba(244,63,94,0.38)] hover:bg-coral-hover active:scale-[0.96]'
                          : 'bg-surface-2 border-border text-text-muted hover:border-coral/40 hover:text-text-dim hover:bg-surface-3 active:scale-[0.96]'}`}
                    >
                      {isActive && <span className="mr-1.5 text-xs">✓</span>}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={`${stepContainerClass} gap-5`}>
            <FieldHint hint={FIELD_HINTS.idiomas.tip} whereFind="Seja honesto ao avaliar seu nível. Lembre-se que as empresas podem testar a fluência." />
            <div className="flex flex-col gap-4 mt-1">
              {formData.idiomas.map((idioma, index) => (
                <IdiomaItem key={index} idioma={idioma} index={index} total={formData.idiomas.length} onUpdate={updateIdioma} onRemove={removeIdioma} />
              ))}
            </div>
            <button
              onClick={addIdioma}
              className="touch-target w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-transparent border-2 border-dashed border-border/60 text-text-muted font-semibold text-[15px] transition-all duration-300 hover:border-border-hover hover:text-text-dim hover:bg-surface-2/50 active:scale-[0.99] focus-ring"
            >
              <Icon name="Plus" className="w-4 h-4" />
              Adicionar Novo Idioma
            </button>
          </div>
        );

      case 6:
        return (
          <div className={`${stepContainerClass} gap-5`}>
            <div className="surface-card p-6 md:p-7">
              <FieldHint hint={FIELD_HINTS.extras.hint} example={FIELD_HINTS.extras.examples?.[0]} whereFind={FIELD_HINTS.extras.whatIsRelevant} />
              <div className="mt-3">
                <label className={labelClass}>Cursos Extras, Certificações e Informações Adicionais</label>
                <textarea
                  className="input-field min-h-[160px] resize-y mt-1.5"
                  placeholder={FIELD_HINTS.extras.placeholder}
                  value={formData.cursos}
                  onChange={(e) => updateForm("cursos", e.target.value)}
                />
              </div>
              <div className="mt-4" style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <QuickSuggestion
                  label="Sugestões rápidas"
                  suggestions={FIELD_HINTS.extras.examples?.slice(0, 4)}
                  onSelect={(text) => updateForm("cursos", formData.cursos ? `${formData.cursos}\n${text}` : text)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    const validation = validateStep(currentStep, formData);
    if (!validation.valid) {
      setStepErrors(validation.errors);
      setShowErrors(true);
      return;
    }

    setStepErrors({});
    setShowErrors(false);

    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("preview");
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("dashboard", { replace: true });
    }
  };

  const handleGoHome = async () => {
    const hasContent = formData?.nome?.trim();
    if (!hasContent) {
      navigate("dashboard", { replace: true });
      return;
    }
    const confirmed = await requestConfirm({
      title: "Sair do editor",
      message: "Seu progresso foi salvo automaticamente. Deseja voltar ao Dashboard?",
      confirmLabel: "Ir ao Dashboard",
      cancelLabel: "Continuar editando",
      danger: false,
    });
    if (confirmed) navigate("dashboard", { replace: true });
  };

  const handleStepClick = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const completedSteps = new Set(STEPS.map((_, i) => i).filter((i) => i < currentStep));

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <AppNavbar
        title={`Currículo — ${selectedTemplate?.name || "Padrão"}`}
        leftAction={
          <button
            onClick={handlePrevious}
            className="touch-target flex items-center gap-1.5 text-text-muted hover:text-text transition-colors bg-transparent border-none cursor-pointer rounded-lg focus-ring"
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
            <span className="text-[13px] font-semibold tracking-wide hidden sm:inline font-body">
              {isFirstStep ? "Dashboard" : "Voltar"}
            </span>
          </button>
        }
        rightAction={
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleGoHome}
              className="touch-target text-text-muted hover:text-text transition-colors rounded-xl hover:bg-surface-2 hidden md:flex focus-ring"
            >
              <Icon name="Home" className="w-5 h-5" />
            </button>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <button
              onClick={() => navigate("preview")}
              className="touch-target inline-flex items-center gap-2 bg-coral text-white font-bold text-[13px] md:text-[14px] px-4 py-2.5 rounded-xl border-none cursor-pointer transition-all duration-250 shadow-[0_2px_10px_rgba(244,63,94,0.28)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.38)] hover:bg-coral-hover active:scale-[0.97] focus-ring"
            >
              <Icon name="Eye" className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        }
      >
        {/* Stepper — scroll horizontal no mobile, visível em todos os tamanhos */}
        <AppStepper steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps} />
      </AppNavbar>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-8" style={{ paddingBottom: "130px" }}>
        <div className="animate-slide-right mb-8 md:mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <span className="text-coral text-sm font-bold font-display tracking-wider uppercase bg-coral/10 px-3 py-1 rounded-lg">
              Etapa {currentStep + 1} de {STEPS.length}
            </span>
            <span className="text-text-muted text-sm font-medium font-body hidden sm:inline">
              {currentStepData?.icon && <Icon name={currentStepData.icon} className="w-4 h-4 inline mr-1" />}
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-2 text-text tracking-tight">
            {currentStepData.label}
          </h2>
          <p className="text-text-muted text-[15px] font-body leading-relaxed">{STEP_DESCRIPTIONS[currentStep]}</p>
        </div>

        {renderStepContent()}
      </div>

      <BottomNavigation
        onBack={handlePrevious}
        onNext={isLastStep ? () => navigate("preview") : handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        nextLabel={isLastStep ? "Visualizar Currículo" : undefined}
      />

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditorPage;
