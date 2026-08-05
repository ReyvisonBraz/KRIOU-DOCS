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

import React, { useId } from "react";
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
      border: 1px solid var(--control-border);
      border-radius: 12px;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      overflow: hidden;
    }
    .kriou-input-wrap:not(.is-disabled):hover {
      border-color: var(--border-hover);
    }
    .kriou-input-wrap:focus-within {
      border-color: var(--focus-ring);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 18%, transparent);
    }
    .kriou-input-wrap.has-error {
      border-color: var(--status-danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 12%, transparent);
    }
    .kriou-input-wrap.has-error:focus-within {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 18%, transparent);
    }
    .kriou-input-wrap.is-disabled {
      background: var(--surface-2);
      border-color: var(--border);
      opacity: 0.72;
    }

    .kriou-input-el {
      flex: 1;
      min-height: 44px;
      padding: 10px 14px;
      background: transparent;
      border: none;
      outline: none;
      font-size: var(--font-size-body);
      font-family: ${T.body};
      color: var(--text);
      width: 100%;
      box-sizing: border-box;
    }
    .kriou-input-el::placeholder {
      color: var(--text-faint);
    }
    .kriou-input-el:disabled {
      cursor: not-allowed;
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
      border: 1px solid var(--control-border);
      border-radius: 12px;
      outline: none;
      font-size: var(--font-size-body);
      font-family: ${T.body};
      color: var(--text);
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      line-height: 1.5;
    }
    .kriou-textarea-el:not(:disabled):hover {
      border-color: var(--border-hover);
    }
    .kriou-textarea-el:focus {
      border-color: var(--focus-ring);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 18%, transparent);
      outline: none;
    }
    .kriou-textarea-el.has-error {
      border-color: var(--status-danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 12%, transparent);
    }
    .kriou-textarea-el.has-error:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 18%, transparent);
    }
    .kriou-textarea-el::placeholder {
      color: var(--text-faint);
    }
    .kriou-textarea-el:disabled,
    .kriou-select-el:disabled {
      background: var(--surface-2);
      border-color: var(--border);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.72;
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
      border: 1px solid var(--control-border);
      border-radius: 12px;
      outline: none;
      font-size: var(--font-size-body);
      font-family: ${T.body};
      color: var(--text);
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    .kriou-select-el:not(:disabled):hover {
      border-color: var(--border-hover);
    }
    .kriou-select-el:focus {
      border-color: var(--focus-ring);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus-ring) 18%, transparent);
      outline: none;
    }
    .kriou-select-el.has-error {
      border-color: var(--status-danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 12%, transparent);
    }
    .kriou-select-el.has-error:focus {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-danger) 18%, transparent);
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
      font-size: var(--font-size-small);
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
      font-size: var(--font-size-caption);
      font-weight: 500;
      color: var(--status-danger);
      font-family: ${T.body};
    }
    .kriou-field-description {
      margin: 6px 0 0;
      font-size: var(--font-size-caption);
      line-height: 1.5;
      color: var(--text-muted);
      font-family: ${T.body};
    }

    /* ================================================================
       Checkbox
       ================================================================ */
    .kriou-checkbox-label {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-height: 44px;
      padding: 10px 12px;
      border: 1px solid var(--control-border);
      border-radius: 12px;
      background: var(--surface);
      color: var(--text-dim);
      font-family: ${T.body};
      font-size: var(--font-size-small);
      font-weight: 600;
      line-height: 1.5;
      cursor: pointer;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .kriou-checkbox-label:hover {
      border-color: var(--border-hover);
      background: var(--surface-2);
    }
    .kriou-checkbox-input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      pointer-events: none;
    }
    .kriou-checkbox-control {
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
      margin-top: 1px;
      border: 2px solid var(--control-border);
      border-radius: 6px;
      background: var(--surface);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: transparent;
      box-sizing: border-box;
      transition: all 0.15s ease;
    }
    .kriou-checkbox-input:checked + .kriou-checkbox-control {
      background: var(--action-primary);
      border-color: var(--action-primary);
      color: var(--on-action);
    }
    .kriou-checkbox-input:focus-visible + .kriou-checkbox-control {
      outline: 2px solid var(--focus-ring);
      outline-offset: 3px;
    }
    .kriou-checkbox-label.is-disabled {
      background: var(--surface-2);
      border-color: var(--border);
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.72;
    }
    .kriou-checkbox-label.has-error {
      border-color: var(--status-danger);
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
        <span aria-hidden="true" style={{ color: "var(--coral)", marginLeft: 2 }}>
          *
        </span>
      )}
    </label>
  );
};

const describedByIds = (...ids) => ids.filter(Boolean).join(" ") || undefined;

const controlId = (prefix, explicitId, generatedId) =>
  explicitId || `${prefix}-${generatedId.replace(/:/g, "")}`;

const FieldMessages = ({ description, descriptionId, error, errorId }) => (
  <>
    {description && (
      <p id={descriptionId} className="kriou-field-description">
        {description}
      </p>
    )}
    {error && (
      <p id={errorId} className="kriou-field-error" role="alert">
        <Icon
          name="AlertCircle"
          aria-hidden="true"
          style={{ width: 13, height: 13, flexShrink: 0 }}
        />
        {error}
      </p>
    )}
  </>
);

/* ====================== Input ====================== */
export const Input = React.forwardRef(({
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
  disabled = false,
  description,
  containerClassName = "",
  containerStyle,
  "aria-describedby": externalDescribedBy,
  ...props
}, ref) => {
  ensureFormStyles();

  const generatedId = useId();
  const inputId = controlId("input", id, generatedId);
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <div className={containerClassName} style={{ marginBottom: 16, ...containerStyle }}>
      <FieldLabel htmlFor={inputId} label={label} required={required} />

      {/* Container do input */}
      <div
        className={[
          "kriou-input-wrap",
          hasError && "has-error",
          hasIcon && "has-icon",
          disabled && "is-disabled",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {hasIcon && (
          <span className="kriou-input-icon" aria-hidden="true">
            <Icon name={icon} style={{ width: 18, height: 18 }} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className="kriou-input-el"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedByIds(
            externalDescribedBy,
            description && descriptionId,
            hasError && errorId,
          )}
          {...props}
        />
      </div>

      <FieldMessages
        description={description}
        descriptionId={descriptionId}
        error={error}
        errorId={errorId}
      />
    </div>
  );
});

Input.displayName = "Input";

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
  disabled = false,
  description,
  containerClassName = "",
  containerStyle,
  "aria-describedby": externalDescribedBy,
  ...props
}) => {
  ensureFormStyles();

  const generatedId = useId();
  const textareaId = controlId("textarea", id, generatedId);
  const hasError = Boolean(error);
  const descriptionId = `${textareaId}-description`;
  const errorId = `${textareaId}-error`;

  return (
    <div className={containerClassName} style={{ marginBottom: 16, ...containerStyle }}>
      <FieldLabel htmlFor={textareaId} label={label} required={required} />

      <textarea
        id={textareaId}
        className={`kriou-textarea-el ${hasError ? "has-error" : ""} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={style}
        required={required}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedByIds(
          externalDescribedBy,
          description && descriptionId,
          hasError && errorId,
        )}
        {...props}
      />

      <FieldMessages
        description={description}
        descriptionId={descriptionId}
        error={error}
        errorId={errorId}
      />
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
  disabled = false,
  description,
  containerClassName = "",
  containerStyle,
  "aria-describedby": externalDescribedBy,
  ...props
}) => {
  ensureFormStyles();

  const generatedId = useId();
  const selectId = controlId("select", id, generatedId);
  const hasError = Boolean(error);
  const descriptionId = `${selectId}-description`;
  const errorId = `${selectId}-error`;

  return (
    <div className={containerClassName} style={{ marginBottom: 16, ...containerStyle }}>
      <FieldLabel htmlFor={selectId} label={label} required={required} />

      <div className="kriou-select-wrap">
        <select
          id={selectId}
          className={`kriou-select-el ${hasError ? "has-error" : ""} ${className}`}
          value={value}
          onChange={onChange}
          style={style}
          required={required}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedByIds(
            externalDescribedBy,
            description && descriptionId,
            hasError && errorId,
          )}
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

      <FieldMessages
        description={description}
        descriptionId={descriptionId}
        error={error}
        errorId={errorId}
      />
    </div>
  );
};

/* ====================== Checkbox ====================== */
export const Checkbox = ({
  label,
  description,
  error,
  id,
  required = false,
  disabled = false,
  containerClassName = "",
  containerStyle,
  "aria-describedby": externalDescribedBy,
  ...props
}) => {
  ensureFormStyles();

  const generatedId = useId();
  const checkboxId = controlId("checkbox", id, generatedId);
  const hasError = Boolean(error);
  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;

  return (
    <div className={containerClassName} style={{ marginBottom: 16, ...containerStyle }}>
      <label
        htmlFor={checkboxId}
        className={[
          "kriou-checkbox-label",
          disabled && "is-disabled",
          hasError && "has-error",
        ].filter(Boolean).join(" ")}
      >
        <input
          {...props}
          id={checkboxId}
          type="checkbox"
          required={required}
          disabled={disabled}
          className="kriou-checkbox-input"
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedByIds(
            externalDescribedBy,
            description && descriptionId,
            hasError && errorId,
          )}
        />
        <span className="kriou-checkbox-control" aria-hidden="true">
          <Icon name="Check" style={{ width: 14, height: 14 }} />
        </span>
        <span>
          {label}
          {required && <span aria-hidden="true" style={{ color: "var(--coral)", marginLeft: 2 }}>*</span>}
        </span>
      </label>
      <FieldMessages
        description={description}
        descriptionId={descriptionId}
        error={error}
        errorId={errorId}
      />
    </div>
  );
};
