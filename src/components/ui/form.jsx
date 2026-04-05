/**
 * ============================================
 * KRIOU DOCS - UI Form Components
 * ============================================
 * Input, Textarea, Select
 *
 * @module components/ui/form
 */

import React from "react";

/**
 * Input - Text input component with label
 */
export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  style = {},
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}{required && <span aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`input-field ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={style}
        aria-required={required || undefined}
        {...props}
      />
    </div>
  );
};

/**
 * Textarea - Multi-line text input
 */
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  required = false,
  className = "",
  style = {},
  id,
  ...props
}) => {
  const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label htmlFor={textareaId} className="label">
          {label}{required && <span aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`input-field ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ resize: "vertical", ...style }}
        aria-required={required || undefined}
        {...props}
      />
    </div>
  );
};

/**
 * Select - Dropdown select component
 */
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  className = "",
  style = {},
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label htmlFor={selectId} className="label">
          {label}{required && <span aria-hidden="true"> *</span>}
          {required && <span className="sr-only"> (obrigatório)</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`input-field ${className}`}
        value={value}
        onChange={onChange}
        style={style}
        aria-required={required || undefined}
        {...props}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};
