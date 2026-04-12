/**
 * ============================================
 * KRIOU DOCS - UI Layout Components
 * ============================================
 * Navbar, GlassPanel, AppNavbar, AppStepper, BottomNavigation
 *
 * @module components/ui/layout
 */

import React from "react";
import { Icon } from "../Icons";

/**
 * Navbar - Navigation bar component
 */
export const Navbar = ({ children, className = "", style = {}, ...props }) => {
  return (
    <nav className={`glass ${className}`} style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", ...style }} {...props}>
      {children}
    </nav>
  );
};

/**
 * GlassPanel - Transparent glass-effect container
 */
export const GlassPanel = ({ children, className = "", style = {}, ...props }) => {
  return (
    <div className={`glass ${className}`} style={{ padding: 24, borderRadius: 16, ...style }} {...props}>
      {children}
    </div>
  );
};

/**
 * AppNavbar — Navbar glass reutilizável para todas as páginas.
 *
 * @param {string}    title        - Título centralizado
 * @param {ReactNode} leftAction   - Conteúdo à esquerda (ex: botão voltar)
 * @param {ReactNode} rightAction  - Conteúdo à direita (ex: botão salvar)
 * @param {ReactNode} children     - Conteúdo extra abaixo da linha principal (ex: stepper)
 * @param {object}    style        - Estilo extra no container
 */
export const AppNavbar = ({ title, leftAction, rightAction, children, style }) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(15, 15, 30, 0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <div style={{ minWidth: 80 }}>{leftAction || <span />}</div>

      <span
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-primary, #F0F0F5)",
          textAlign: "center",
          flex: 1,
        }}
      >
        {title}
      </span>

      <div style={{ minWidth: 80, display: "flex", justifyContent: "flex-end" }}>
        {rightAction || <span />}
      </div>
    </div>

    {children && <div style={{ padding: "0 16px 10px" }}>{children}</div>}
  </div>
);

/**
 * AppStepper — Indicador de etapas para wizards.
 *
 * @param {Array}    steps          - Array de { label, icon, key }
 * @param {number}   currentStep    - Índice da etapa atual (0-based)
 * @param {Function} onStepClick    - Callback ao clicar numa etapa concluída
 * @param {Set}      completedSteps - Set de índices das etapas concluídas
 */
export const AppStepper = ({ steps = [], currentStep = 0, onStepClick, completedSteps = new Set() }) => (
  <nav
    aria-label={`Etapa ${currentStep + 1} de ${steps.length}: ${steps[currentStep]?.label || ""}`}
    style={{
      display: "flex",
      overflowX: "auto",
      gap: 4,
      padding: "4px 0",
      scrollbarWidth: "none",
    }}
  >
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = completedSteps.has(index);
      const isClickable = isCompleted && onStepClick;

      return (
        <button
          key={step.key || index}
          onClick={() => isClickable && onStepClick(index)}
          aria-current={isActive ? "step" : undefined}
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            borderRadius: 10,
            border: "none",
            cursor: isClickable ? "pointer" : "default",
            background: isActive ? "rgba(233, 69, 96, 0.15)" : "transparent",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: isActive
                ? "var(--coral, #E94560)"
                : isCompleted
                ? "var(--success, #00C897)"
                : "rgba(255,255,255,0.08)",
              color: isActive || isCompleted ? "#fff" : "var(--text-muted, #8888A8)",
              transition: "background 0.2s",
            }}
          >
            {isCompleted && !isActive ? "✓" : index + 1}
          </div>

          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? "var(--coral, #E94560)"
                : isCompleted
                ? "var(--success, #00C897)"
                : "var(--text-muted, #8888A8)",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
            }}
          >
            {step.label}
          </span>
        </button>
      );
    })}
  </nav>
);

/**
 * BottomNavigation — Botões de navegação entre etapas do wizard.
 *
 * @param {Function} onBack       - Callback para voltar
 * @param {Function} onNext       - Callback para avançar
 * @param {boolean}  isFirstStep  - Oculta botão voltar na primeira etapa
 * @param {boolean}  isLastStep   - Muda label do botão de avançar
 * @param {string}   nextLabel    - Label personalizado para botão de avançar
 * @param {ReactNode} extraContent - Conteúdo extra (ex: indicador de progresso)
 */
export const BottomNavigation = ({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  nextLabel,
  extraContent,
  onSaveLater,
  style,
}) => (
  <div
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "rgba(15, 15, 30, 0.95)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 16px",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 10,
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {!isFirstStep && (
        <button
          onClick={onBack}
          style={{
            flex: "0 0 auto",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "var(--text-muted, #8888A8)",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="ChevronLeft" className="w-4 h-4" />
          Voltar
        </button>
      )}

      {onSaveLater && !isFirstStep && (
        <button
          onClick={onSaveLater}
          title="Salvar rascunho e sair"
          style={{
            flex: "0 0 auto",
            padding: "14px 14px",
            borderRadius: 14,
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "var(--text-muted, #8888A8)",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <Icon name="Bookmark" className="w-4 h-4" />
          <span className="save-later-label">Salvar</span>
        </button>
      )}

      <button
        onClick={onNext}
        style={{
          flex: 1,
          padding: "14px 20px",
          borderRadius: 14,
          border: "none",
          background: "var(--coral, #E94560)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
      >
        {nextLabel || (isLastStep ? "Finalizar" : "Próximo")}
        {!isLastStep && <Icon name="ChevronRight" className="w-4 h-4" />}
      </button>
    </div>

    {extraContent && (
      <div style={{ maxWidth: 600, margin: "8px auto 0" }}>{extraContent}</div>
    )}
  </div>
);
