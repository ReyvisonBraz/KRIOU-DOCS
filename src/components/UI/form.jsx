/**
 * ============================================
 * KRIOU DOCS - Componentes de Formulário
 * ============================================
 * Input, Textarea, Select
 *
 * Design: Luxury Refined + Bold Editorial
 * Fundo navy profundo (#090914 → #14142B),
 * accent coral (#F43F5E), detalhes dourados (#D4AF37)
 *
 * @module components/ui/form
 */

import React from "react";
import { Icon } from "../Icons";

// -- Tokens de design tipográfico --
const T = {
  display: "'Outfit', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

// =============================================================================
// CSS global injetado uma única vez para pseudo-classes e estados interativos
// =============================================================================
const STYLE_ID = "kriou-form-global";

const ensureFormStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    /* ================================================================
       Input
       ================================================================ */
    .kriou-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      min-height: 44px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
    }
    .kriou-input-wrap:hover {
      border-color: var(--border-hover);
    }
    .kriou-input-wrap:focus-within {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.15);
    }
    .kriou-input-wrap.has-error {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.1);
    }
    .kriou-input-wrap.has-error:focus-within {
      box-shadow: 0 0 0 3px rgba(244,63,94,0.22);
    }

    .kriou-input-el {
      flex: 1;
      min-height: 44px;
      padding: 10px 14px;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      font-family: ${T.body};
      color: var(--text);
      width: 100%;
      box-sizing: border-box;
    }
    .kriou-input-el::placeholder {
      color: var(--text-faint);
    }
    .kriou-input-wrap.has-icon .kriou-input-el {
      padding-left: 0;
    }

    /* Ícone dentro do input */
    .kriou-input-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      height: 44px;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    /* ================================================================
       Textarea
       ================================================================ */
    .kriou-textarea-el {
      display: block;
      width: 100%;
      min-height: 44px;
      padding: 12px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      outline: none;
      font-size: 14px;
      font-family: ${T.body};
      color: var(--text);
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      line-height: 1.5;
    }
    .kriou-textarea-el:hover {
      border-color: var(--border-hover);
    }
    .kriou-textarea-el:focus {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.15);
      outline: none;
    }
    .kriou-textarea-el.has-error {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.1);
    }
    .kriou-textarea-el.has-error:focus {
      box-shadow: 0 0 0 3px rgba(244,63,94,0.22);
    }
    .kriou-textarea-el::placeholder {
      color: var(--text-faint);
    }

    /* ================================================================
       Select
       ================================================================ */
    .kriou-select-wrap {
      position: relative;
    }
    .kriou-select-el {
      display: block;
      width: 100%;
      min-height: 44px;
      padding: 10px 44px 10px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      outline: none;
      font-size: 14px;
      font-family: ${T.body};
      color: var(--text);
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    .kriou-select-el:hover {
      border-color: var(--border-hover);
    }
    .kriou-select-el:focus {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.15);
      outline: none;
    }
    .kriou-select-el.has-error {
      border-color: var(--coral);
      box-shadow: 0 0 0 3px rgba(244,63,94,0.1);
    }
    .kriou-select-el.has-error:focus {
      box-shadow: 0 0 0 3px rgba(244,63,94,0.22);
    }
    /* Cor do texto do placeholder/opção selecionada */
    .kriou-select-el option {
      background: var(--surface);
      color: var(--text);
    }

    /* Seta customizada do select */
    .kriou-select-chevron {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      pointer-events: none;
    }

    /* ================================================================
       Label
       ================================================================ */
    .kriou-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-dim);
      margin-bottom: 6px;
      font-family: ${T.body};
      letter-spacing: 0.01em;
    }

    /* ================================================================
       Mensagem de erro
       ================================================================ */
    .kriou-field-error {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      font-size: 12px;
      font-weight: 500;
      color: var(--coral);
      font-family: ${T.body};
    }
  `;
  document.head.appendChild(el);
};

// =============================================================================
// Rótulo de campo reutilizável com indicador de obrigatoriedade
// =============================================================================
const FieldLabel = ({ htmlFor, label, required }) => {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className="kriou-label">
      {label}
      {required && (
        <>
          <span aria-hidden="true" style={{ color: "var(--coral)", marginLeft: 2 }}>
            *
          </span>
          <span
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
            }}
          >
            {" "}
            (obrigatório)
          </span>
        </>
      )}
    </label>
  );
};

/* ====================== Input ====================== */
export const Input = ({
  label,
  error,
  icon,
  className = "",
  style,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  ...props
}) => {
  ensureFormStyles();

  const inputId =
    id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);

  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />

      {/* Container do input */}
      <div
        className={[
          "kriou-input-wrap",
          hasError && "has-error",
          hasIcon && "has-icon",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {hasIcon && (
          <span className="kriou-input-icon">
            <Icon name={icon} style={{ width: 18, height: 18 }} />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className="kriou-input-el"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {/* Mensagem de erro */}
      {hasError && (
        <p id={`${inputId}-error`} className="kriou-field-error" role="alert">
          <Icon
            name="AlertCircle"
            style={{ width: 13, height: 13, flexShrink: 0 }}
          />
          {error}
        </p>
      )}
    </div>
  );
};

/* ====================== Textarea ====================== */
export const Textarea = ({
  label,
  error,
  className = "",
  style,
  id,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
  ...props
}) => {
  ensureFormStyles();

  const textareaId =
    id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel htmlFor={textareaId} label={label} required={required} />

      <textarea
        id={textareaId}
        className={`kriou-textarea-el ${hasError ? "has-error" : ""} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={style}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${textareaId}-error` : undefined}
        {...props}
      />

      {hasError && (
        <p id={`${textareaId}-error`} className="kriou-field-error" role="alert">
          <Icon
            name="AlertCircle"
            style={{ width: 13, height: 13, flexShrink: 0 }}
          />
          {error}
        </p>
      )}
    </div>
  );
};

/* ====================== Select ====================== */
export const Select = ({
  label,
  error,
  options = [],
  className = "",
  style,
  id,
  value,
  onChange,
  required = false,
  ...props
}) => {
  ensureFormStyles();

  const selectId =
    id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const hasError = Boolean(error);

  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel htmlFor={selectId} label={label} required={required} />

      <div className="kriou-select-wrap">
        <select
          id={selectId}
          className={`kriou-select-el ${hasError ? "has-error" : ""} ${className}`}
          value={value}
          onChange={onChange}
          style={style}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((opt, index) => {
            // Suporta string simples e objeto { value, label }
            const isObj = typeof opt === "object" && opt !== null;
            const optValue = isObj ? opt.value : opt;
            const optLabel = isObj ? opt.label : opt;
            return (
              <option key={isObj ? optValue : index} value={optValue}>
                {optLabel}
              </option>
            );
          })}
        </select>

        {/* Seta customizada */}
        <span className="kriou-select-chevron" aria-hidden="true">
          <Icon name="ChevronDown" style={{ width: 16, height: 16 }} />
        </span>
      </div>

      {hasError && (
        <p id={`${selectId}-error`} className="kriou-field-error" role="alert">
          <Icon
            name="AlertCircle"
            style={{ width: 13, height: 13, flexShrink: 0 }}
          />
          {error}
        </p>
      )}
    </div>
  );
};
