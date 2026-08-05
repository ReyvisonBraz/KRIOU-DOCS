/**
 * ============================================
 * KRIOU DOCS — Primitivos de UI Premium
 * ============================================
 * Componentes base refinados com design editorial de luxo.
 * Paleta: navy profundo (#090914), coral (#F43F5E), ouro (#D4AF37).
 * Tipografia: Outfit (display) + Plus Jakarta Sans (corpo).
 *
 * Princípios:
 * - Sem glassmorphism, sem texto gradiente, sem bordas laterais
 * - Alvos de toque >= 44×44px em todo elemento interativo
 * - Estados de foco visíveis em todos os elementos
 * - CSS custom properties + estilos inline para máxima controlabilidade
 *
 * @module components/ui/primitives
 */

import React, { useState } from "react";
import { Icon } from "../Icons";

// ============================================================
// INJEÇÃO GLOBAL DE ESTILOS (executa apenas no client, uma vez)
// ============================================================
let estilosInjetados = false;
const injetaEstilos = () => {
  if (typeof document === "undefined" || estilosInjetados) return;
  const el = document.createElement("style");
  el.setAttribute("data-kriou-primitives", "");
  el.textContent = [
    // Keyframes do spinner
    "@keyframes kriou-spin{to{transform:rotate(360deg)}}",
    // Anel de foco via teclado — aplicado em elementos interativos
    ".kf:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}",
  ].join("");
  document.head.appendChild(el);
  estilosInjetados = true;
};

// ============================================================
// TOKENS CONSTANTES DE DESIGN
// ============================================================
const RAD     = "12px";   // border-radius padrão
const RAD_LG  = "16px";   // border-radius amplo (cards)
const RAD_SM  = "8px";    // border-radius reduzido (botão small)
const EASE    = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
const TOQUE   = 44;       // alvo mínimo WCAG 2.1 AA

// ============================================================
// BUTTON
// ============================================================
export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  loadingLabel = "Carregando",
  type = "button",
  onClick,
  className = "",
  style = {},
  onMouseEnter: userMouseEnter,
  onMouseLeave: userMouseLeave,
  "aria-label": ariaLabel,
  ...props
}) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);
  const inactive = disabled || loading;

  // Mapa de estilos base por variante
  const mapaVariante = {
    primary: {
      background: hover && !inactive ? "var(--action-accent-hover)" : "var(--action-accent)",
      color: "var(--on-action)",
      fontWeight: 700,
      boxShadow: hover && !inactive
        ? "0 8px 24px rgba(201,54,89,0.24)"
        : "0 4px 14px rgba(201,54,89,0.18)",
      transform: hover && !inactive ? "translateY(-1px)" : "translateY(0)",
    },
    secondary: {
      background: hover && !inactive ? "var(--surface-3)" : "var(--surface-2)",
      color: hover && !inactive ? "var(--text)" : "var(--text-dim)",
      border: `1px solid ${
        hover && !inactive ? "var(--text-muted)" : "var(--control-border)"
      }`,
    },
    ghost: {
      background: hover && !inactive ? "var(--surface-2)" : "transparent",
      color: hover && !inactive ? "var(--text)" : "var(--text-muted)",
    },
    danger: {
      background: "var(--danger)",
      color: "var(--on-action)",
      fontWeight: 700,
      filter: hover && !inactive ? "brightness(1.12)" : "none",
    },
  };

  // Mapa de estilos por tamanho
  const mapaTamanho = {
    small:  { padding: "8px 18px", fontSize: 14, minHeight: TOQUE },
    medium: { padding: "12px 28px", fontSize: 16, minHeight: 48 },
  };

  const sv = mapaVariante[variant] || mapaVariante.primary;
  const st = mapaTamanho[size] || mapaTamanho.medium;

  return (
    <button
      type={type}
      className={["kf", className].filter(Boolean).join(" ")}
      disabled={inactive}
      aria-busy={loading || undefined}
      aria-label={loading ? loadingLabel : ariaLabel}
      onClick={onClick}
      onMouseEnter={(e) => { setHover(true); userMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHover(false); userMouseLeave?.(e); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: size === "small" ? RAD_SM : RAD,
        cursor: loading ? "wait" : disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.01em",
        opacity: inactive ? 0.62 : 1,
        transition: EASE,
        outline: "none",
        border: "none",
        minWidth: TOQUE,
        ...sv,
        ...st,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderRightColor: "transparent",
            animation: "kriou-spin 0.7s linear infinite",
            flexShrink: 0,
          }}
        />
      )}
      {!loading && icon && iconPosition === "left"  && <Icon name={icon} className="w-4 h-4" aria-hidden="true" />}
      {children}
      {!loading && icon && iconPosition === "right" && <Icon name={icon} className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
};

// ============================================================
// ICON BUTTON
// ============================================================
export const IconButton = React.forwardRef(({
  icon,
  label,
  variant = "ghost",
  size = "medium",
  disabled = false,
  className = "",
  style = {},
  onMouseEnter: userMouseEnter,
  onMouseLeave: userMouseLeave,
  title,
  type = "button",
  ...props
}, ref) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);
  const accessibleLabel = label || props["aria-label"];
  const dimension = size === "large" ? 48 : TOQUE;

  const variants = {
    ghost: {
      background: hover && !disabled ? "var(--surface-2)" : "transparent",
      color: hover && !disabled ? "var(--text)" : "var(--text-muted)",
      border: "1px solid transparent",
    },
    secondary: {
      background: hover && !disabled ? "var(--surface-3)" : "var(--surface-2)",
      color: hover && !disabled ? "var(--text)" : "var(--text-dim)",
      border: `1px solid ${hover && !disabled ? "var(--border-hover)" : "var(--control-border)"}`,
    },
    accent: {
      background: hover && !disabled ? "var(--action-accent-hover)" : "var(--action-accent)",
      color: "var(--on-action)",
      border: "1px solid transparent",
    },
    danger: {
      background: hover && !disabled ? "var(--danger-soft)" : "transparent",
      color: "var(--danger)",
      border: "1px solid transparent",
    },
  };

  return (
    <button
      ref={ref}
      {...props}
      type={type}
      aria-label={accessibleLabel}
      title={title || label}
      disabled={disabled}
      className={["kf", className].filter(Boolean).join(" ")}
      onMouseEnter={(event) => {
        setHover(true);
        userMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setHover(false);
        userMouseLeave?.(event);
      }}
      style={{
        width: dimension,
        height: dimension,
        minWidth: dimension,
        minHeight: dimension,
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "var(--radius-control)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.42 : 1,
        transition: EASE,
        outline: "none",
        ...(variants[variant] || variants.ghost),
        ...style,
      }}
    >
      <Icon
        name={icon}
        aria-hidden="true"
        focusable="false"
        style={{ width: size === "large" ? 22 : 20, height: size === "large" ? 22 : 20 }}
      />
    </button>
  );
});

IconButton.displayName = "IconButton";

// ============================================================
// CARD
// ============================================================
export const Card = ({
  children,
  variant = "default",
  padding = "none",
  disabled = false,
  className = "",
  style = {},
  onClick,
  onKeyDown: userKeyDown,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);
  const interativo = typeof onClick === "function";
  const canInteract = interativo && !disabled;
  const variants = {
    default: { background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" },
    flat: { background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "none" },
    subtle: { background: "var(--surface-2)", border: "1px solid var(--border)", boxShadow: "none" },
    elevated: { background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-elevated)" },
  };
  const paddings = { none: 0, small: 12, medium: 20, large: 28 };
  const visual = variants[variant] || variants.default;

  // handlers compostos — preservam callbacks do usuário
  const handleMouseEnter = (e) => {
    setHover(canInteract);
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e) => {
    setHover(false);
    onMouseLeave?.(e);
  };
  const handleKeyDown = (e) => {
    userKeyDown?.(e);
    if (e.defaultPrevented) return;
    if ((e.key === "Enter" || e.key === " ") && canInteract) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={[canInteract ? "kf" : "", className].filter(Boolean).join(" ")}
      onClick={canInteract ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={interativo ? "button" : undefined}
      tabIndex={interativo ? 0 : undefined}
      aria-disabled={interativo && disabled ? true : undefined}
      onKeyDown={interativo ? handleKeyDown : undefined}
      style={{
        ...visual,
        background: hover && canInteract ? "var(--surface-2)" : visual.background,
        border: hover && canInteract ? "1px solid var(--border-hover)" : visual.border,
        borderRadius: RAD_LG,
        padding: paddings[padding] ?? paddings.none,
        cursor: disabled ? "not-allowed" : interativo ? "pointer" : "default",
        opacity: disabled ? 0.62 : 1,
        transition: EASE,
        boxShadow: hover && canInteract
          ? "var(--shadow-elevated)"
          : visual.boxShadow,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================
// BADGE
// ============================================================
export const Badge = ({
  children,
  variant = "default",
  className = "",
  style = {},
  ...props
}) => {
  injetaEstilos();

  // Variantes semânticas; aliases antigos preservam compatibilidade durante a migração.
  const mapaBadge = {
    accent:  { background: "var(--coral-light)", color: "var(--text-accent)" },
    info:    { background: "var(--status-info-soft)", color: "var(--status-info)" },
    success: { background: "var(--status-success-soft)", color: "var(--status-success)" },
    warning: { background: "var(--status-warning-soft)", color: "var(--status-warning)" },
    danger:  { background: "var(--status-danger-soft)", color: "var(--status-danger)" },
    coral:   { background: "var(--coral-light)", color: "var(--text-accent)" },
    teal:    { background: "var(--status-success-soft)", color: "var(--status-success)" },
    gold:    { background: "var(--status-warning-soft)", color: "var(--gold)" },
    default: { background: "var(--surface-3)", color: "var(--text-dim)" },
  };

  const s = mapaBadge[variant] || mapaBadge.default;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "100px",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        border: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
        ...s,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// ============================================================
// TAG
// ============================================================
export const Tag = ({
  children,
  className = "",
  style = {},
  onRemove,
  onMouseEnter: userMouseEnter,
  onMouseLeave: userMouseLeave,
  ...props
}) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);

  return (
    <span
      className={className}
      onMouseEnter={(e) => { setHover(true); userMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHover(false); userMouseLeave?.(e); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: hover ? "var(--surface-3)" : "var(--surface-2)",
        color: "var(--text-dim)",
        border: `1px solid ${
          hover ? "var(--border-hover)" : "var(--control-border)"
        }`,
        borderRadius: "100px",
        padding: "6px 14px",
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        transition: EASE,
        lineHeight: 1.4,
        ...style,
      }}
      {...props}
    >
      {children}
      {typeof onRemove === "function" && (
        <button
          onClick={onRemove}
          className="kf"
          aria-label="Remover"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 0,
            fontSize: 16,
            lineHeight: 1,
            transition: EASE,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

// ============================================================
// SPINNER
// ============================================================
export const Spinner = ({
  size = 24,
  className = "",
  style = {},
}) => {
  injetaEstilos();

  return (
    <div
      className={className}
      role="status"
      aria-label="Carregando"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "var(--coral)",
        animation: "kriou-spin 0.6s linear infinite",
        ...style,
      }}
    />
  );
};
