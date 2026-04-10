/**
 * ============================================
 * KRIOU DOCS - Legal Helper Components
 * ============================================
 * VariantSelector, SectionHeader, LegalHelpButton,
 * OptionalFieldToggle, ClientNoteBanner, LegalFieldRenderer
 *
 * @module components/ui/legal-helpers
 */

import React from "react";

/**
 * VariantSelector - Seletor de variante do documento
 */
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
              padding: "16px 20px",
              borderRadius: 14,
              border: isActive ? "2px solid var(--teal)" : "2px solid var(--border)",
              background: isActive
                ? "linear-gradient(135deg, rgba(0,210,211,0.12) 0%, rgba(0,210,211,0.04) 100%)"
                : "var(--surface-2)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.25s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--teal)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {isActive && (
              <div style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--teal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "var(--navy)",
                fontWeight: 700,
              }}>
                ✓
              </div>
            )}
            <div style={{ fontSize: 28, marginBottom: 8 }}>{variant.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? "var(--teal)" : "var(--text)", marginBottom: 4 }}>
              {variant.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
              {variant.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

/**
 * SectionHeader - Cabeçalho de seção do formulário jurídico
 */
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
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "18px 0 12px",
      borderBottom: "2px solid var(--border)",
      marginBottom: 20,
      marginTop: number > 1 ? 32 : 0,
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "linear-gradient(135deg, rgba(0,210,211,0.15) 0%, rgba(83,52,131,0.15) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        flexShrink: 0,
      }}>
        {icons[icon] || "📄"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {number && (
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--teal)",
              background: "rgba(0,210,211,0.1)",
              padding: "2px 8px",
              borderRadius: 6,
            }}>
              SEÇÃO {number}
            </span>
          )}
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{title}</h3>
        </div>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};

/**
 * LegalHelpButton - Botão de ajuda destacado para campos jurídicos
 */
export const LegalHelpButton = ({ hint, example, whereFind, label }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        title="Clique para ver ajuda sobre este campo"
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          border: open ? "2px solid var(--teal)" : "2px solid rgba(0,210,211,0.5)",
          background: open
            ? "linear-gradient(135deg, var(--teal) 0%, #00a8a9 100%)"
            : "linear-gradient(135deg, rgba(0,210,211,0.18) 0%, rgba(0,210,211,0.08) 100%)",
          color: open ? "#fff" : "var(--teal)",
          fontSize: 15,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          flexShrink: 0,
          boxShadow: open ? "0 2px 8px rgba(0,210,211,0.4)" : "none",
          letterSpacing: "-0.5px",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--teal)";
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,210,211,0.3) 0%, rgba(0,210,211,0.12) 100%)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,210,211,0.25)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "rgba(0,210,211,0.5)";
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(0,210,211,0.18) 0%, rgba(0,210,211,0.08) 100%)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        ?
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 90,
            }}
          />
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 8,
            width: 320,
            maxWidth: "calc(100vw - 48px)",
            background: "var(--surface)",
            border: "2px solid var(--teal)",
            borderRadius: 14,
            padding: 18,
            zIndex: 100,
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>
                Ajuda: {label}
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            {hint && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  O que é isso?
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                  {hint}
                </div>
              </div>
            )}

            {example && (
              <div style={{
                padding: 12,
                background: "var(--surface-2)",
                borderRadius: 10,
                border: "1px dashed var(--border)",
                marginBottom: 12,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  Exemplo de preenchimento
                </div>
                <div style={{
                  fontSize: 14,
                  color: "var(--teal)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                }}>
                  "{example}"
                </div>
              </div>
            )}

            {whereFind && (
              <div style={{
                padding: 10,
                background: "rgba(249,168,37,0.08)",
                borderRadius: 8,
                border: "1px solid rgba(249,168,37,0.2)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", marginBottom: 4 }}>
                  📋 Onde encontrar
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {whereFind}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * OptionalFieldToggle - Toggle para desabilitar campo opcional
 */
export const OptionalFieldToggle = ({ enabled, onToggle, label }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: enabled ? "var(--surface-2)" : "rgba(136,136,168,0.08)",
        cursor: "pointer",
        fontSize: 12,
        color: "var(--text-muted)",
        transition: "all 0.2s",
        opacity: enabled ? 1 : 0.6,
      }}
    >
      <div style={{
        width: 34,
        height: 18,
        borderRadius: 10,
        background: enabled ? "var(--teal)" : "var(--surface-3)",
        position: "relative",
        transition: "all 0.2s",
        border: "1px solid " + (enabled ? "var(--teal)" : "var(--border)"),
        flexShrink: 0,
      }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 1,
          left: enabled ? 17 : 1,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
      <span>
        {enabled ? label || "Preencher este campo" : "Campo desabilitado"}
      </span>
    </button>
  );
};

/**
 * ClientNoteBanner - Banner de observação para o cliente
 * Sempre visível — informações importantes não devem ficar escondidas atrás de um clique.
 */
export const ClientNoteBanner = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(249,168,37,0.1) 0%, rgba(249,168,37,0.04) 100%)",
      border: "2px solid rgba(249,168,37,0.45)",
      borderRadius: 14,
      padding: "16px 20px",
      marginBottom: 24,
    }}>
      {/* Cabeçalho sempre visível */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "rgba(249,168,37,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>
          ⚠️
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#f9a825", letterSpacing: "0.01em" }}>
          Leia antes de preencher
        </span>
      </div>

      {/* Notas sempre expandidas */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notes.map((note, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 10,
            padding: "10px 14px",
            background: "rgba(249,168,37,0.07)",
            borderRadius: 9,
            border: "1px solid rgba(249,168,37,0.2)",
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.6,
          }}>
            <span style={{
              color: "#f9a825", fontWeight: 800, flexShrink: 0,
              fontSize: 16, lineHeight: 1.4,
            }}>
              {i + 1}.
            </span>
            {note}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * LegalFieldRenderer - Renderiza um campo jurídico com ajuda, exemplo e toggle opcional
 */
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
  const hasHelp = fieldDef.hint || fieldDef.example || fieldDef.whereFind;

  return (
    <div style={{
      marginBottom: 18,
      opacity: isDisabled ? 0.45 : 1,
      transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <label style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          flex: 1,
        }}>
          {fieldDef.label}
          {fieldDef.required && <span style={{ color: "var(--coral)", marginLeft: 4 }}>*</span>}
          {isOptional && !fieldDef.required && (
            <span style={{
              fontSize: 10,
              color: "var(--text-muted)",
              fontWeight: 400,
              textTransform: "none",
              marginLeft: 6,
            }}>
              (opcional)
            </span>
          )}
        </label>

        {hasHelp && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: "var(--teal)", fontWeight: 600, letterSpacing: "0.02em" }}>
              ver dica
            </span>
            <LegalHelpButton
              hint={fieldDef.hint}
              example={fieldDef.example}
              whereFind={fieldDef.whereFind}
              label={fieldDef.label}
            />
          </div>
        )}
      </div>

      {isOptional && (
        <div style={{ marginBottom: 8 }}>
          <OptionalFieldToggle
            enabled={!isDisabled}
            onToggle={onToggleDisabled}
            label="Preencher este campo"
          />
        </div>
      )}

      {!isDisabled && (
        <>
          {fieldDef.type === "textarea" ? (
            <textarea
              className="input-field"
              rows={4}
              placeholder={fieldDef.placeholder || `Digite ${fieldDef.label.toLowerCase()}`}
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={{
                resize: "vertical",
                ...(error ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}),
              }}
            />
          ) : fieldDef.type === "select" ? (
            <select
              className="input-field"
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={error ? { borderColor: "var(--coral)" } : {}}
            >
              <option value="">Selecione...</option>
              {fieldDef.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : fieldDef.type === "date" ? (
            <input
              className="input-field"
              type="date"
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={error ? { borderColor: "var(--coral)" } : {}}
            />
          ) : fieldDef.type === "cpf" ? (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || "000.000.000-00"}
              value={value || ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                let formatted = raw;
                if (raw.length > 9) {
                  formatted = raw.slice(0, 3) + "." + raw.slice(3, 6) + "." + raw.slice(6, 9) + "-" + raw.slice(9);
                } else if (raw.length > 6) {
                  formatted = raw.slice(0, 3) + "." + raw.slice(3, 6) + "." + raw.slice(6);
                } else if (raw.length > 3) {
                  formatted = raw.slice(0, 3) + "." + raw.slice(3);
                }
                onChange(fieldDef.key, formatted);
              }}
              style={error ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
            />
          ) : fieldDef.type === "money" ? (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || "R$ 0,00"}
              value={value || ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const formatted = raw ? "R$ " + (parseInt(raw) / 100).toFixed(2).replace(".", ",") : "";
                onChange(fieldDef.key, formatted);
              }}
              style={error ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
            />
          ) : (
            <input
              className="input-field"
              type="text"
              placeholder={fieldDef.placeholder || `Digite ${fieldDef.label.toLowerCase()}`}
              value={value || ""}
              onChange={(e) => onChange(fieldDef.key, e.target.value)}
              style={error ? { borderColor: "var(--coral)", boxShadow: "0 0 0 3px rgba(233,69,96,0.15)" } : {}}
            />
          )}

          {fieldDef.example && !error && value === "" && fieldDef.type !== "select" && fieldDef.type !== "date" && (
            <div style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}>
              <span style={{ color: "var(--teal)", fontWeight: 600 }}>Ex:</span>
              {fieldDef.example}
            </div>
          )}

          {error && (
            <div style={{ fontSize: 11, color: "var(--coral)", marginTop: 4 }}>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};
