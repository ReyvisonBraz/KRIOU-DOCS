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
    ".kf:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(244,63,94,.38)}",
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
  onClick,
  className = "",
  style = {},
  onMouseEnter: userMouseEnter,
  onMouseLeave: userMouseLeave,
  ...props
}) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);

  // Mapa de estilos base por variante
  const mapaVariante = {
    primary: {
      background: hover && !disabled ? "#e63950" : "var(--coral)",
      color: "#fff",
      fontWeight: 700,
      boxShadow: hover && !disabled
        ? "0 6px 24px rgba(244,63,94,0.42)"
        : "0 4px 16px rgba(244,63,94,0.32)",
      transform: hover && !disabled ? "translateY(-1px)" : "translateY(0)",
    },
    secondary: {
      background: hover && !disabled ? "var(--surface-3)" : "var(--surface-2)",
      color: hover && !disabled ? "var(--text)" : "var(--text-dim)",
      border: `1px solid ${
        hover && !disabled ? "var(--text-muted)" : "var(--border)"
      }`,
    },
    ghost: {
      background: hover && !disabled ? "var(--surface-2)" : "transparent",
      color: hover && !disabled ? "var(--text)" : "var(--text-muted)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      fontWeight: 700,
      filter: hover && !disabled ? "brightness(1.12)" : "none",
    },
  };

  // Mapa de estilos por tamanho
  const mapaTamanho = {
    small:  { padding: "8px 18px", fontSize: 13, minHeight: TOQUE },
    medium: { padding: "12px 28px", fontSize: 15, minHeight: 48 },
  };

  const sv = mapaVariante[variant] || mapaVariante.primary;
  const st = mapaTamanho[size] || mapaTamanho.medium;

  return (
    <button
      className={["kf", className].filter(Boolean).join(" ")}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={(e) => { setHover(true); userMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHover(false); userMouseLeave?.(e); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        borderRadius: size === "small" ? RAD_SM : RAD,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: "0.01em",
        opacity: disabled ? 0.42 : 1,
        transition: EASE,
        outline: "none",
        border: "none",
        minWidth: TOQUE,
        pointerEvents: disabled ? "none" : "auto",
        ...sv,
        ...st,
        ...style,
      }}
      {...props}
    >
      {icon && iconPosition === "left"  && <Icon name={icon} className="w-4 h-4" />}
      {children}
      {icon && iconPosition === "right" && <Icon name={icon} className="w-4 h-4" />}
    </button>
  );
};

// ============================================================
// CARD
// ============================================================
export const Card = ({
  children,
  className = "",
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  injetaEstilos();
  const [hover, setHover] = useState(false);
  const interativo = typeof onClick === "function";

  // handlers compostos — preservam callbacks do usuário
  const handleMouseEnter = (e) => {
    setHover(true);
    onMouseEnter?.(e);
  };
  const handleMouseLeave = (e) => {
    setHover(false);
    onMouseLeave?.(e);
  };
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && interativo) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={[interativo ? "kf" : "", className].filter(Boolean).join(" ")}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={interativo ? "button" : undefined}
      tabIndex={interativo ? 0 : undefined}
      onKeyDown={interativo ? handleKeyDown : undefined}
      style={{
        background: hover && interativo ? "var(--surface-2)" : "var(--surface)",
        border: `1px solid ${
          hover && interativo ? "var(--border-hover)" : "var(--border)"
        }`,
        borderRadius: RAD_LG,
        cursor: interativo ? "pointer" : "default",
        transition: EASE,
        boxShadow: hover && interativo
          ? "0 6px 28px rgba(0,0,0,0.28)"
          : "none",
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

  // Mapa de cores por variante — fundo translúcido + cor do texto
  const mapaBadge = {
    coral:   { background: "rgba(244,63,94,0.14)",  color: "var(--coral)" },
    teal:    { background: "rgba(20,184,166,0.14)",  color: "var(--teal)" },
    gold:    { background: "rgba(212,175,55,0.14)",  color: "var(--gold)" },
    default: { background: "var(--surface-3)",         color: "var(--text-muted)" },
  };

  const s = mapaBadge[variant] || mapaBadge.default;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 12px",
        borderRadius: "100px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        lineHeight: 1.4,
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
          hover ? "var(--border-hover)" : "var(--border)"
        }`,
        borderRadius: "100px",
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 500,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
