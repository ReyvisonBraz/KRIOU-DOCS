/**
 * ============================================
 * KRIOU DOCS - Componentes de Layout
 * ============================================
 * Design System: Luxury Refined | Bold Editorial
 * Cores: Navy (#090914), Coral (#F43F5E), Gold (#D4AF37), Teal (#14B8A6)
 * Tipografia: Outfit (display) + Plus Jakarta Sans (body)
 *
 * Componentes: Navbar, GlassPanel, AppNavbar, AppStepper, BottomNavigation
 *
 * @module components/ui/layout
 */

import React from "react";
import { Icon } from "../Icons";

/* ───────────────────────────────────────────
   Navbar — Barra de navegação base
   ─────────────────────────────────────────── */
export const Navbar = ({ children, className = "", style = {}, ...props }) => (
  <nav
    className={`sticky top-0 z-50 backdrop-blur-xl bg-[var(--navy)]/92 border-b border-white/[0.04] ${className}`}
    style={style}
    {...props}
  >
    {children}
  </nav>
);

/* ───────────────────────────────────────────
   GlassPanel — Card premium (sem glass, mais sólido)
   ─────────────────────────────────────────── */
export const GlassPanel = ({ children, className = "", style = {}, ...props }) => (
  <div
    className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.18)] ${className}`}
    style={{ padding: 24, ...style }}
    {...props}
  >
    {children}
  </div>
);

/* ───────────────────────────────────────────
   AppNavbar — Navbar reutilizável das páginas
   ───────────────────────────────────────────
   @param {string}    title        - Título centralizado
   @param {ReactNode} leftAction   - Ação à esquerda (ex: voltar)
   @param {ReactNode} rightAction  - Ação à direita (ex: salvar)
   @param {ReactNode} children     - Conteúdo extra abaixo (ex: stepper)
   @param {object}    style        - Estilo inline extra no container
   ─────────────────────────────────────────── */
export const AppNavbar = ({ title, leftAction, rightAction, children, style }) => (
  <div
    className="sticky top-0 z-[100] backdrop-blur-xl bg-[var(--navy)]/92 border-b border-white/[0.04]"
    style={style}
  >
    {/* Linha principal: ação esquerda | título | ação direita */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px 10px 12px",
        maxWidth: 600,
        margin: "0 auto",
        gap: 12,
        minHeight: 52,
      }}
    >
      {/* Slot esquerdo — touch target >= 44px */}
      <div
        style={{
          minWidth: 44,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        {leftAction || <span />}
      </div>

      {/* Título — Outfit bold, tracking ajustado */}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.9375rem",
          letterSpacing: "-0.01em",
          color: "var(--text)",
          textAlign: "center",
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </span>

      {/* Slot direito — touch target >= 44px */}
      <div
        style={{
          minWidth: 44,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {rightAction || <span />}
      </div>
    </div>

    {/* Conteúdo extra (ex: stepper de etapas) */}
    {children && (
      <div style={{ padding: "0 16px 10px", maxWidth: 600, margin: "0 auto" }}>
        {children}
      </div>
    )}
  </div>
);

/* ───────────────────────────────────────────
   AppStepper — Indicador de etapas do wizard
   ───────────────────────────────────────────
   @param {Array}    steps          - Array de { label, key }
   @param {number}   currentStep    - Índice da etapa atual (0‑based)
   @param {Function} onStepClick    - Callback ao clicar em etapa concluída
   @param {Set}      completedSteps - Set de índices das etapas concluídas
   ─────────────────────────────────────────── */
export const AppStepper = ({
  steps = [],
  currentStep = 0,
  onStepClick,
  completedSteps = new Set(),
}) => (
  <nav
    aria-label={`Etapa ${currentStep + 1} de ${steps.length}: ${steps[currentStep]?.label || ""}`}
    style={{
      display: "flex",
      overflowX: "auto",
      gap: 1,
      padding: "2px 0",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}
  >
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = completedSteps.has(index);
      const isClickable = isCompleted && onStepClick;
      const isReached = index <= currentStep || isCompleted;

      return (
        <button
          key={step.key || index}
          onClick={() => isClickable && onStepClick(index)}
          type="button"
          aria-current={isActive ? "step" : undefined}
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 12,
            border: "none",
            cursor: isClickable ? "pointer" : "default",
            background: isActive
              ? "rgba(244,63,94,0.10)"
              : isReached
                ? "rgba(255,255,255,0.02)"
                : "transparent",
            transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            minWidth: 44,
            minHeight: 44,
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--navy)]"
        >
          {/* Círculo indicador */}
          <span
            aria-hidden="true"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              background: isActive
                ? "var(--coral)"
                : isCompleted
                  ? "var(--success)"
                  : "rgba(255,255,255,0.06)",
              color: isActive || isCompleted ? "#fff" : "var(--text-muted)",
              boxShadow: isActive
                ? "0 0 18px rgba(244,63,94,0.35)"
                : isCompleted
                  ? "0 0 8px rgba(16,185,129,0.25)"
                  : "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {isCompleted && !isActive ? (
              <Icon name="Check" className="w-3.5 h-3.5" />
            ) : (
              index + 1
            )}
          </span>

          {/* Label da etapa */}
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: isActive ? 600 : 500,
              fontFamily: "var(--font-body)",
              letterSpacing: "-0.005em",
              color: isActive
                ? "var(--coral)"
                : isReached
                  ? "var(--text-dim)"
                  : "var(--text-muted)",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
              lineHeight: 1.3,
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
 * ============================================
 * BottomNavigation — Navegação inferior do wizard
 * ============================================
 *
 * IMPORTANTE: O callback `onBack` é genérico —
 * cada página injeta seu próprio handler.
 * Este componente NÃO contém navegação fixa.
 *
 * @param {Function}  onBack        - Callback de voltar (handler da página)
 * @param {Function}  onNext        - Callback de avançar
 * @param {boolean}   isFirstStep   - Oculta botão "Voltar" se true
 * @param {boolean}   isLastStep    - Altera label para "Finalizar"
 * @param {string}    nextLabel     - Label customizado do botão avançar
 * @param {ReactNode} extraContent  - Conteúdo auxiliar (ex: progresso)
 * @param {Function}  onSaveLater   - Callback de salvar rascunho
 * @param {object}    style         - Estilo inline extra no container
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
}) => {
  const [hovered, setHovered] = React.useState(null);

  const setFocus = (key) => setHovered(key);
  const clearFocus = () => setHovered(null);

  const btnBase = {
    minWidth: 44,
    minHeight: 44,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: "0.8125rem",
    letterSpacing: "-0.01em",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "rgba(9,9,20,0.94)",
        borderTop: "1px solid rgba(212,175,55,0.08)",
        boxShadow:
          "0 -8px 40px rgba(0,0,0,0.5), 0 -1px 0 rgba(212,175,55,0.04)",
        padding: "10px 16px calc(10px + env(safe-area-inset-bottom, 0px))",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          maxWidth: 600,
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        {/* ─── Botão Voltar: transparente com borda ouro ─── */}
        {!isFirstStep && (
          <button
            type="button"
            onClick={onBack}
            onMouseEnter={() => setFocus("back")}
            onMouseLeave={clearFocus}
            onFocus={() => setFocus("back")}
            onBlur={clearFocus}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
            aria-label="Voltar à etapa anterior"
            style={{
              flex: "0 0 auto",
              ...btnBase,
              padding: "11px 18px",
              border: `1.5px solid ${
                hovered === "back"
                  ? "rgba(212,175,55,0.40)"
                  : "rgba(255,255,255,0.10)"
              }`,
              background:
                hovered === "back"
                  ? "rgba(212,175,55,0.07)"
                  : "transparent",
              color:
                hovered === "back"
                  ? "var(--gold)"
                  : "var(--text-dim)",
              transform: hovered === "back" ? "translateX(-1px)" : "none",
            }}
          >
            <Icon name="ChevronLeft" className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        )}

        {/* ─── Botão Salvar: tom ouro-âmbar ─── */}
        {onSaveLater && !isFirstStep && (
          <button
            type="button"
            onClick={onSaveLater}
            onMouseEnter={() => setFocus("save")}
            onMouseLeave={clearFocus}
            onFocus={() => setFocus("save")}
            onBlur={clearFocus}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
            title="Salvar rascunho"
            aria-label="Salvar rascunho"
            style={{
              flex: "0 0 auto",
              ...btnBase,
              padding: "11px 16px",
              gap: 6,
              border: `1.5px solid ${
                hovered === "save"
                  ? "rgba(212,175,55,0.55)"
                  : "rgba(212,175,55,0.18)"
              }`,
              background:
                hovered === "save"
                  ? "rgba(212,175,55,0.13)"
                  : "rgba(212,175,55,0.04)",
              color:
                hovered === "save"
                  ? "var(--gold)"
                  : "rgba(212,175,55,0.62)",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="Bookmark" className="w-4 h-4" />
            <span>Salvar</span>
          </button>
        )}

        {/* ─── Botão Avançar / Finalizar: gradiente coral ─── */}
        <button
          type="button"
          onClick={onNext}
          onMouseEnter={() => setFocus("next")}
          onMouseLeave={clearFocus}
          onFocus={() => setFocus("next")}
          onBlur={clearFocus}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
          aria-label={
            nextLabel ||
            (isLastStep ? "Finalizar formulário" : "Avançar para próxima etapa")
          }
          style={{
            flex: 1,
            ...btnBase,
            justifyContent: "center",
            padding: "14px 24px",
            gap: 10,
            border: "none",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            letterSpacing: "-0.005em",
            background:
              hovered === "next"
                ? "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)"
                : "linear-gradient(135deg, #F43F5E 0%, #E4324D 100%)",
            color: "#fff",
            boxShadow:
              hovered === "next"
                ? "0 8px 32px rgba(244,63,94,0.45)"
                : "0 4px 16px rgba(244,63,94,0.30)",
            transform: hovered === "next" ? "scale(1.01)" : "scale(1)",
          }}
        >
          {nextLabel || (isLastStep ? "Finalizar" : "Avançar")}
          {!isLastStep && <Icon name="ChevronRight" className="w-4 h-4" />}
        </button>
      </div>

      {/* Conteúdo extra (ex: barra de progresso) */}
      {extraContent && (
        <div style={{ maxWidth: 600, margin: "8px auto 0" }}>
          {extraContent}
        </div>
      )}
    </div>
  );
};
