/**
 * ============================================
 * KRIOU DOCS - Legal Helper Components
 * ============================================
 * VariantSelector, SectionHeader, LegalHelpButton,
 * OptionalFieldToggle, ClientNoteBanner, LegalFieldRenderer
 *
 * Design: Luxury Refined + Bold Editorial
 * Colors: --navy, --coral (#F43F5E), --gold (#D4AF37), --teal (#14B8A6)
 * Typography: 'Outfit' display, 'Plus Jakarta Sans' body
 *
 * @module components/ui/legal-helpers
 */

import React from "react";

/* ───────────────────────────────────────────
 * Shared style constants
 * ─────────────────────────────────────────── */
const fontDisplay = "var(--font-display)";
const fontBody = "var(--font-body)";

const focusRing = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--coral), 0 0 0 4px rgba(244,63,94,0.2)",
};

const touchTarget = { minHeight: 44, minWidth: 44 };

/* ───────────────────────────────────────────
 * 1. VariantSelector
 * ─────────────────────────────────────────── */
export const VariantSelector = ({ variants, selected, onSelect }) => {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {variants.map((variant) => {
        const isActive = selected === variant.id;
        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant.id)}
            style={{
              flex: "1 1 200px",
              maxWidth: 280,
              padding: "18px 20px",
              borderRadius: 12,
              border: isActive
                ? "2px solid var(--coral)"
                : "1px solid var(--border)",
              background: isActive ? "var(--surface-2)" : "var(--surface)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              position: "relative",
              outline: "none",
              ...touchTarget,
            }}
            onFocus={(e) => {
              Object.assign(e.currentTarget.style, focusRing);
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.background = "var(--surface-2)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {/* Radio indicator */}
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: isActive
                  ? "2px solid var(--coral)"
                  : "2px solid var(--border)",
                background: isActive ? "var(--coral)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
            >
              {isActive && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#fff",
                  }}
                />
              )}
            </div>

            <div style={{ fontSize: 24, marginBottom: 10, lineHeight: 1 }}>
              {variant.icon}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                fontFamily: fontDisplay,
                color: isActive ? "var(--coral)" : "var(--text)",
                marginBottom: 4,
                transition: "color 0.2s ease",
              }}
            >
              {variant.name}
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: fontBody,
                color: "var(--text-muted)",
                lineHeight: 1.5,
              }}
            >
              {variant.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ───────────────────────────────────────────
 * 2. SectionHeader
 * ─────────────────────────────────────────── */
export const SectionHeader = ({ title, subtitle, icon, number }) => {
  const icons = {
    user: "👤",
    money: "💰",
    building: "🏠",
    calendar: "📅",
    description: "📝",
    location: "📍",
    car: "🚗",
    help: "❓",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "18px 0 14px",
        borderBottom: "1px solid var(--border)",
        marginBottom: 20,
        marginTop: number > 1 ? 32 : 0,
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icons[icon] || "📄"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {number && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: fontDisplay,
                color: "var(--gold)",
                background: "rgba(212,175,55,0.1)",
                padding: "3px 10px",
                borderRadius: 6,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              SEÇÃO {number}
            </span>
          )}
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              fontFamily: fontDisplay,
              color: "var(--text)",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: 13,
              fontFamily: fontBody,
              color: "var(--text-muted)",
              margin: "5px 0 0",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────
 * 3. LegalHelpButton
 * ─────────────────────────────────────────── */
export const LegalHelpButton = ({ helpText, label }) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", display: "inline-flex" }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-label={label ? `Ajuda: ${label}` : "Ver ajuda"}
        aria-expanded={open}
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          border: open
            ? "2px solid var(--coral)"
            : "1px solid var(--border)",
          background: open ? "var(--coral)" : "var(--surface-2)",
          color: open ? "#fff" : "var(--text-muted)",
          fontSize: 16,
          fontWeight: 700,
          fontFamily: fontDisplay,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          flexShrink: 0,
          outline: "none",
        }}
        onFocus={(e) => {
          if (!open) {
            Object.assign(e.currentTarget.style, focusRing);
          }
        }}
        onBlur={(e) => {
          if (!open) {
            e.currentTarget.style.boxShadow = "none";
          }
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--coral)";
            e.currentTarget.style.color = "var(--coral)";
            e.currentTarget.style.background = "rgba(244,63,94,0.08)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.background = "var(--surface-2)";
          }
        }}
      >
        ?
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 320,
            maxWidth: "calc(100vw - 48px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 16,
            zIndex: 100,
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
            animation: "scale-in 0.2s ease-out both",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 16 }}>💡</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: fontDisplay,
                color: "var(--coral)",
                flex: 1,
              }}
            >
              {label ? `Ajuda: ${label}` : "Ajuda"}
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar ajuda"
              style={{
                ...touchTarget,
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 16,
                padding: "4px 8px",
                borderRadius: 6,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                outline: "none",
                transition: "color 0.15s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.color = "var(--coral)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--coral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              ✕
            </button>
          </div>

          {/* Help content */}
          {helpText ? (
            <div
              style={{
                fontSize: 13,
                fontFamily: fontBody,
                color: "var(--text-dim)",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}
            >
              {helpText}
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                fontFamily: fontBody,
                color: "var(--text-muted)",
                fontStyle: "italic",
              }}
            >
              Nenhuma dica disponível para este campo.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ───────────────────────────────────────────
 * 4. OptionalFieldToggle
 * ─────────────────────────────────────────── */
export const OptionalFieldToggle = ({ label, checked, onChange, ...rest }) => {
  return (
    <button
      onClick={onChange}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px 6px 8px",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: checked ? "var(--surface-2)" : "rgba(72,72,102,0.12)",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: fontBody,
        color: checked ? "var(--text-dim)" : "var(--text-muted)",
        transition: "all 0.2s ease",
        outline: "none",
        ...touchTarget,
        minHeight: 36,
      }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, focusRing);
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Toggle switch */}
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 12,
          background: checked ? "var(--coral)" : "var(--surface-3)",
          position: "relative",
          transition: "background 0.2s ease",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            transition: "left 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      <span>{checked ? label || "Preencher este campo" : "Campo desabilitado"}</span>
    </button>
  );
};

/* ───────────────────────────────────────────
 * 5. ClientNoteBanner
 * ─────────────────────────────────────────── */
export const ClientNoteBanner = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div
      style={{
        background: "rgba(212,175,55,0.06)",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: 14,
        padding: "18px 22px",
        marginBottom: 24,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(212,175,55,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            flexShrink: 0,
          }}
        >
          ⚠️
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            fontFamily: fontDisplay,
            color: "var(--gold)",
            letterSpacing: "0.01em",
          }}
        >
          Leia antes de preencher
        </span>
      </div>

      {/* Notes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.map((note, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "10px 14px",
              background: "rgba(212,175,55,0.05)",
              borderRadius: 9,
              border: "1px solid rgba(212,175,55,0.15)",
              fontSize: 13,
              fontFamily: fontBody,
              color: "var(--text)",
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                color: "var(--gold)",
                fontWeight: 700,
                flexShrink: 0,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {i + 1}.
            </span>
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────
 * 6. LegalFieldRenderer
 * ─────────────────────────────────────────── */

/**
 * Composes a formatted help text from the field definition's rich help properties.
 */
const composeHelpText = (fieldDef) => {
  const sections = [];

  if (fieldDef.hint) {
    sections.push(`📖 O que é isso?\n${fieldDef.hint}`);
  }
  if (fieldDef.example) {
    sections.push(`✏️ Exemplo de preenchimento\n"${fieldDef.example}"`);
  }
  if (fieldDef.whyImportant) {
    sections.push(`🔒 Por que é importante?\n${fieldDef.whyImportant}`);
  }
  if (fieldDef.whatHappensIfEmpty) {
    sections.push(`⚠️ Se não preencher?\n${fieldDef.whatHappensIfEmpty}`);
  }
  if (fieldDef.whereFind) {
    sections.push(`📋 Onde encontrar\n${fieldDef.whereFind}`);
  }

  return sections.join("\n\n");
};

/**
 * Formats a raw string as a Brazilian phone number: (XX) XXXXX-XXXX
 */
const formatPhone = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Formats a raw string as a Brazilian CEP: XXXXX-XXX
 */
const formatCep = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

/**
 * Formats a raw string as a Brazilian CPF: XXX.XXX.XXX-XX
 */
const formatCpf = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6)
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

/**
 * Parses a raw numeric string as Brazilian currency (R$ X.XXX,XX).
 */
const formatMonetary = (raw) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const numeric = parseInt(digits, 10) / 100;
  return numeric.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const LegalFieldRenderer = ({
  fieldDef,
  value,
  onChange,
  error,
  disabled,
  onToggleDisabled,
}) => {
  const isOptional = fieldDef.disableable && !fieldDef.required;
  const isDisabled = disabled;
  const hasHelp =
    fieldDef.hint ||
    fieldDef.example ||
    fieldDef.whereFind ||
    fieldDef.whyImportant ||
    fieldDef.whatHappensIfEmpty;

  const helpText = hasHelp ? composeHelpText(fieldDef) : "";

  /* Build shared input style, merging error state */
  const inputErrorStyle = error
    ? {
        borderColor: "var(--coral)",
        boxShadow: "0 0 0 3px rgba(244,63,94,0.15)",
      }
    : {};

  return (
    <div
      style={{
        marginBottom: 18,
        opacity: isDisabled ? 0.4 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: fontBody,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            flex: 1,
          }}
        >
          {fieldDef.label}
          {fieldDef.required && (
            <span style={{ color: "var(--coral)", marginLeft: 3 }}>*</span>
          )}
          {isOptional && !fieldDef.required && (
            <span
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontWeight: 400,
                textTransform: "none",
                marginLeft: 6,
                letterSpacing: "0",
              }}
            >
              (opcional)
            </span>
          )}
        </label>

        {hasHelp && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: fontBody,
                color: "var(--coral)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              ver dica
            </span>
            <LegalHelpButton helpText={helpText} label={fieldDef.label} />
          </div>
        )}
      </div>

      {/* Optional toggle */}
      {isOptional && (
        <div style={{ marginBottom: 8 }}>
          <OptionalFieldToggle
            checked={!isDisabled}
            onChange={onToggleDisabled}
            label="Preencher este campo"
          />
        </div>
      )}

      {/* Disabled notice */}
      {isDisabled && fieldDef.whatHappensIfEmpty && (
        <div
          style={{
            fontSize: 12,
            fontFamily: fontBody,
            color: "var(--text-muted)",
            padding: "8px 12px",
            background: "rgba(20,184,166,0.05)",
            borderRadius: 8,
            border: "1px solid rgba(20,184,166,0.12)",
            lineHeight: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 13 }}>ℹ️</span>
          {fieldDef.whatHappensIfEmpty}
        </div>
      )}

      {/* Input rendering */}
      {!isDisabled && (
        <>
          {fieldDef.type === "textarea" ? (
            <textarea
              className="input-field"
              rows={4}
              placeholder={
                fieldDef.placeholder ||
                `Digite ${fieldDef.label.toLowerCase()}`
              }
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={{ resize: "vertical", ...inputErrorStyle }}
            />
          ) : fieldDef.type === "select" ? (
            <select
              className="input-field"
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={inputErrorStyle}
            >
              <option value="">Selecione...</option>
              {fieldDef.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : fieldDef.type === "date" ? (
            <input
              className="input-field"
              type="date"
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={inputErrorStyle}
            />
          ) : fieldDef.type === "email" ? (
            <input
              className="input-field"
              type="email"
              placeholder={fieldDef.placeholder || "email@exemplo.com"}
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={inputErrorStyle}
            />
          ) : fieldDef.type === "phone" ? (
            <input
              className="input-field"
              type="tel"
              placeholder={fieldDef.placeholder || "(XX) XXXXX-XXXX"}
              value={value || ""}
              onChange={(e) =>
                onChange(fieldDef.key, formatPhone(e.target.value))
              }
              style={inputErrorStyle}
            />
          ) : fieldDef.type === "cep" ? (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || "00000-000"}
              value={value || ""}
              onChange={(e) =>
                onChange(fieldDef.key, formatCep(e.target.value))
              }
              style={inputErrorStyle}
            />
          ) : fieldDef.type === "cpf" ? (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || "000.000.000-00"}
              value={value || ""}
              onChange={(e) =>
                onChange(fieldDef.key, formatCpf(e.target.value))
              }
              style={inputErrorStyle}
            />
          ) : fieldDef.type === "monetary" || fieldDef.type === "money" ? (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || "R$ 0,00"}
              value={value || ""}
              onChange={(e) =>
                onChange(fieldDef.key, formatMonetary(e.target.value))
              }
              style={inputErrorStyle}
            />
          ) : (
            /* default: text */
            <input
              className="input-field"
              type="text"
              placeholder={
                fieldDef.placeholder ||
                `Digite ${fieldDef.label.toLowerCase()}`
              }
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={inputErrorStyle}
            />
          )}

          {/* Inline example hint */}
          {fieldDef.example &&
            !error &&
            (value === "" || value === undefined) &&
            fieldDef.type !== "select" &&
            fieldDef.type !== "date" && (
              <div
                style={{
                  fontSize: 11,
                  fontFamily: fontBody,
                  color: "var(--text-muted)",
                  marginTop: 5,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    color: "var(--teal)",
                    fontWeight: 600,
                  }}
                >
                  Ex:
                </span>
                {fieldDef.example}
              </div>
            )}

          {/* Error message */}
          {error && (
            <div
              style={{
                fontSize: 11,
                fontFamily: fontBody,
                color: "var(--coral)",
                marginTop: 5,
              }}
            >
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};
