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
import { Card, Button, Input, Textarea, Select, Badge, Tag, FieldHint, QuickSuggestion, ExperienceTypeSelector, FieldWithIcon, VisualExample, QuickFillCard, AppNavbar, AppStepper, BottomNavigation, ErrorMessage, SaveIndicator, ConfirmDialog } from "../components/UI";
import { STEPS, STEP_DESCRIPTIONS, SKILLS_OPTIONS, LANGUAGE_LEVELS, EDUCATION_STATUS, FIELD_HINTS } from "../data/constants";
import { validateStep, getStepStatus } from "../utils/validation";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { useConfirm } from "../hooks/useConfirm";

// Labels e Errors formatados via Tailwind classes
const labelClass = "block text-[12px] font-bold text-text-muted mb-1.5 uppercase tracking-wide ml-1";
const errorClass = "text-coral font-semibold text-xs mt-1.5 ml-1";
const inputErrorClass = "border-coral ring-2 ring-coral/20";
const stepContainerClass = "animate-fadeIn flex flex-col gap-6";

// ─── Sub-componentes memoizados ───────────────────────────────────────────────

const ExperienciaItem = memo(({ exp, index, total, onUpdate, onRemove }) => (
  <div className="p-5 md:p-6 bg-surface/50 border border-border rounded-2xl relative shadow-sm group transition-colors hover:border-border/80">
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-bold text-coral flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-coral/10 flex items-center justify-center">
          {index + 1}
        </div>
        Experiência
      </div>
      {total > 1 && (
        <button
          onClick={() => onRemove(index)}
          className="text-xs font-bold text-text-muted hover:text-coral transition-colors px-2 py-1 uppercase tracking-wide"
        >
          Remover
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  <div className="p-5 md:p-6 bg-surface/50 border border-border rounded-2xl relative shadow-sm transition-colors hover:border-border/80">
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-bold text-teal flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-teal/10 flex items-center justify-center">
          {index + 1}
        </div>
        Formação
      </div>
      {total > 1 && (
        <button onClick={() => onRemove(index)} className="text-xs font-bold text-text-muted hover:text-coral transition-colors px-2 py-1 uppercase tracking-wide">
          Remover
        </button>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <select className="input-field appearance-none" value={form.status} onChange={(e) => onUpdate(index, "status", e.target.value)}>
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
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 md:p-6 bg-surface/50 border border-border rounded-2xl relative shadow-sm">
    <div>
      <label className={labelClass}>Idioma</label>
      <input className="input-field" placeholder="Ex: Inglês" value={idioma.idioma} onChange={(e) => onUpdate(index, "idioma", e.target.value)} />
    </div>
    <div>
      <div className="flex items-center justify-between">
        <label className={labelClass}>Nível</label>
        {total > 1 && (
          <button onClick={() => onRemove(index)} className="text-[11px] uppercase tracking-wide font-bold text-text-muted hover:text-coral transition-colors">
            Remover
          </button>
        )}
      </div>
      <div className="relative mt-1">
        <select className="input-field appearance-none" value={idioma.nivel} onChange={(e) => onUpdate(index, "nivel", e.target.value)}>
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
          <div className={stepContainerClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <FieldWithIcon icon="user" label="Nome Completo *" tip="Como aparece nos seus documentos">
                  <input
                    className={`input-field ${getFieldError("nome") ? inputErrorClass : ""}`}
                    placeholder={FIELD_HINTS.nome.placeholder}
                    value={formData.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                  />
                </FieldWithIcon>
                {getFieldError("nome") && <div className={errorClass}>{getFieldError("nome")}</div>}
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
                {getFieldError("email") && <div className={errorClass}>{getFieldError("email")}</div>}
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
                {getFieldError("telefone") && <div className={errorClass}>{getFieldError("telefone")}</div>}
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
          <div className={`${stepContainerClass} gap-8`}>
            <div>
              <FieldWithIcon icon="target" label="Objetivo Profissional *" tip="O que você busca na sua carreira atualmente?">
                <textarea
                  className={`input-field min-h-[140px] resize-y leading-relaxed ${getFieldError("objetivo") ? inputErrorClass : ""}`}
                  placeholder={FIELD_HINTS.objetivo.placeholder}
                  value={formData.objetivo}
                  onChange={(e) => updateForm("objetivo", e.target.value)}
                />
              </FieldWithIcon>
              {getFieldError("objetivo") && <div className={errorClass}>{getFieldError("objetivo")}</div>}
            </div>
            
            <QuickFillCard
              title="🎯 Não sabe direito o que escrever?"
              examples={[
                { level: "👶 Iniciante", text: "Busco minha primeira oportunidade engajado em aprender rápido e somar na equipe de vendas." },
                { level: "📈 Intermediário", text: "Profissional de Marketing Pleno buscando aplicar meus conhecimentos analíticos para aumentar resultados de campanhas digitais." },
                { level: "💼 Avançado", text: "Gestor Comercial Sênior focando em otimizar processos em empresas tech atuantes no mercado nacional." },
              ]}
              onSelect={(text) => updateForm("objetivo", text)}
            />
          </div>
        );

      case 2:
        return (
          <div className={stepContainerClass}>
            <FieldHint
              hint={FIELD_HINTS.experiencia_empresa.hint}
              example={FIELD_HINTS.experiencia_empresa.examples?.[0]}
              whereFind={FIELD_HINTS.experiencia_empresa.whatIfNeverWorked}
              skipLabel={FIELD_HINTS.experiencia_empresa.skipLabel}
            />
            <div className="flex flex-col gap-4">
              {formData.experiencias.map((exp, index) => (
                <ExperienciaItem key={index} exp={exp} index={index} total={formData.experiencias.length} onUpdate={updateExperiencia} onRemove={removeExperiencia} />
              ))}
            </div>
            <Button variant="secondary" icon="Plus" onClick={addExperiencia} className="border-dashed border-2 border-border/70 hover:border-coral bg-transparent hover:bg-coral/5 w-full justify-center mt-2 font-bold py-4">
              Adicionar Nova Experiência
            </Button>
          </div>
        );

      case 3:
        return (
          <div className={stepContainerClass}>
            <FieldHint
              hint={FIELD_HINTS.formacao_curso.hint}
              example={FIELD_HINTS.formacao_curso.examples?.[0]}
              whereFind={FIELD_HINTS.formacao_curso.whatIfStudying}
            />
            <div className="flex flex-col gap-4">
              {formData.formacoes.map((form, index) => (
                <FormacaoItem key={index} form={form} index={index} total={formData.formacoes.length} onUpdate={updateFormacao} onRemove={removeFormacao} />
              ))}
            </div>
            <Button variant="secondary" icon="Plus" onClick={addFormacao} className="border-dashed border-2 border-border/70 hover:border-teal bg-transparent hover:bg-teal/5 w-full justify-center mt-2 font-bold py-4">
              Adicionar Nova Formação
            </Button>
          </div>
        );

      case 4:
        return (
          <div className={stepContainerClass}>
            <FieldHint hint={FIELD_HINTS.habilidades.hint} whereFind={FIELD_HINTS.habilidades.categories?.basic} />
            <p className="text-sm font-medium text-text-muted">Selecione suas habilidades chave ou ferramentas dominadas:</p>
            <div className="flex flex-wrap gap-2.5">
              {SKILLS_OPTIONS.map((skill) => {
                const isActive = formData.habilidades.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer select-none
                      ${isActive ? 'bg-coral text-white border-coral shadow-md shadow-coral/20' : 'bg-surface border-border text-text-muted hover:border-coral/50'}`}
                  >
                    {isActive ? <span className="mr-1">✓</span> : null}{skill}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className={stepContainerClass}>
            <FieldHint hint={FIELD_HINTS.idiomas.tip} whereFind="Seja honesto ao avaliar seu nível. Lembre-se que as empresas podem testar a fluência." />
            <div className="flex flex-col gap-4">
              {formData.idiomas.map((idioma, index) => (
                <IdiomaItem key={index} idioma={idioma} index={index} total={formData.idiomas.length} onUpdate={updateIdioma} onRemove={removeIdioma} />
              ))}
            </div>
            <Button variant="secondary" icon="Plus" onClick={addIdioma} className="border-dashed border-2 border-border/70 hover:border-border bg-transparent hover:bg-surface-3 w-full justify-center mt-2 font-bold py-4">
              Adicionar Novo Idioma
            </Button>
          </div>
        );

      case 6:
        return (
          <div className={stepContainerClass}>
            <FieldHint hint={FIELD_HINTS.extras.hint} example={FIELD_HINTS.extras.examples?.[0]} whereFind={FIELD_HINTS.extras.whatIsRelevant} />
            <div className="mt-2">
              <label className={labelClass}>Cursos Extras, Certificações e Informações Adicionais</label>
              <textarea
                className="input-field min-h-[160px] resize-y mt-1.5"
                placeholder={FIELD_HINTS.extras.placeholder}
                value={formData.cursos}
                onChange={(e) => updateForm("cursos", e.target.value)}
              />
            </div>
            <QuickSuggestion
              label="💡 O que mais devo colocar?"
              suggestions={FIELD_HINTS.extras.examples?.slice(0, 4)}
              onSelect={(text) => updateForm("cursos", formData.cursos ? `${formData.cursos}\n${text}` : text)}
            />
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
      navigate("dashboard");
    }
  };

  const handleGoHome = async () => {
    const hasContent = formData?.nome?.trim();
    if (!hasContent) {
      navigate("dashboard");
      return;
    }
    const confirmed = await requestConfirm({
      title: "Sair do editor",
      message: "Seu progresso foi salvo automaticamente. Deseja voltar ao Dashboard?",
      confirmLabel: "Ir ao Dashboard",
      cancelLabel: "Continuar editando",
      danger: false,
    });
    if (confirmed) navigate("dashboard");
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
            className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors bg-transparent border-none cursor-pointer"
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
            <span className="text-[13px] font-semibold tracking-wide hidden sm:inline">{isFirstStep ? "Dashboard" : "Voltar"}</span>
          </button>
        }
        rightAction={
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={handleGoHome} className="p-2 text-text-muted hover:text-white transition-colors rounded-full hover:bg-surface-2 hidden md:block">
              <Icon name="Home" className="w-5 h-5" />
            </button>
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <Button variant="primary" size="small" icon="Eye" onClick={() => navigate("preview")} className="shadow-lg shadow-coral/20">
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </div>
        }
      >
        <div className="hidden md:block">
          <AppStepper steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} completedSteps={completedSteps} />
        </div>
      </AppNavbar>

      {/* Mobile Stepper injection if needed, omit to keep minimalistic top bar */}

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-[100px]">
        <div className="animate-slideRight mb-8 md:mb-10 text-center md:text-left">
          <h2 className="font-display text-2xl md:text-3xl font-black mb-2 text-white">
            {currentStepData.label}
          </h2>
          <p className="text-text-muted text-[15px]">{STEP_DESCRIPTIONS[currentStep]}</p>
        </div>

        {renderStepContent()}
      </div>

      <BottomNavigation
        onBack={handlePrevious}
        onNext={isLastStep ? () => navigate("preview") : handleNext}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        nextLabel={isLastStep ? "✓ Visualizar Mágica" : undefined}
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