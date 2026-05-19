import React, { useState } from "react";
import { Icon } from "../Icons";

// ── Design tokens ──
const EASE = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
const RAD = "14px";
const RAD_SM = "10px";
const TOQUE = 44;

// ── Níveis de requisito ──
const LEVELS = {
  minimo: {
    id: "minimo",
    label: "Mínimo",
    icon: "Minus",
    color: "var(--text-muted)",
    desc: "Apenas campos obrigatórios para funcionar",
    bg: "var(--surface-3)",
    ring: "var(--text-faint)",
  },
  essencial: {
    id: "essencial",
    label: "Essencial",
    icon: "Check",
    color: "var(--gold)",
    desc: "O necessário para um documento seguro",
    bg: "rgba(212,175,55,0.1)",
    ring: "var(--gold)",
  },
  completo: {
    id: "completo",
    label: "Completo",
    icon: "Star",
    color: "var(--coral)",
    desc: "Todos os campos para máxima proteção",
    bg: "rgba(244,63,94,0.08)",
    ring: "var(--coral)",
  },
};

// ── Mini-ícone de dash p/ nível mínimo ──
const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor" />
  </svg>
);

// ── Ícone de fechar ──
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Mini círculo indicador ──
const CircleIcon = ({ color, size = 8 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
    }}
  />
);

// ============================================================
// RequirementItem
// ============================================================
const RequirementItem = ({ label, color }) => (
  <div
    className="print-item"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "var(--surface-2)",
      borderRadius: RAD_SM,
      border: "1px solid var(--border)",
      minHeight: TOQUE,
    }}
  >
    <CircleIcon color={color} size={9} />
    <span
      style={{
        fontSize: 13,
        color: "var(--text)",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  </div>
);

// ============================================================
// getRequirementsByLevel
// ============================================================
function getRequirementsByLevel(doc, level) {
  const sections = doc.commonSections || [];
  const variantSections = doc.variantSections || {};
  const allVariantSections = Object.values(variantSections).flat();

  const allFields = [
    ...sections.flatMap((s) => s.fields || []),
    ...allVariantSections.flatMap((s) => s.fields || []),
  ];

  const obrigatorios = allFields
    .filter((f) => f.required)
    .map((f) => `${f.label}`);

  const opcionais = allFields
    .filter((f) => !f.required && !f.disableable)
    .map((f) => `${f.label}`);

  const extras = allFields
    .filter((f) => f.disableable)
    .map((f) => `${f.label}`);

  switch (level) {
    case "minimo":
      return {
        obrigatorios: obrigatorios.slice(0, Math.ceil(obrigatorios.length * 0.5)),
        opcionais: [],
        extras: [],
        count: Math.ceil(obrigatorios.length * 0.5),
      };
    case "essencial":
      return {
        obrigatorios,
        opcionais: opcionais.slice(0, Math.ceil(opcionais.length * 0.6)),
        extras: [],
        count: obrigatorios.length + Math.ceil(opcionais.length * 0.6),
      };
    case "completo":
      return {
        obrigatorios,
        opcionais,
        extras,
        count: obrigatorios.length + opcionais.length + extras.length,
      };
    default:
      return { obrigatorios, opcionais: [], extras: [], count: obrigatorios.length };
  }
}

// ============================================================
// RequirementsModal
// ============================================================
const RequirementsModal = ({ doc, variant, onClose }) => {
  const [selectedLevel, setSelectedLevel] = useState("essencial");

  if (!doc) return null;

  const spec = doc.spec || {};
  const requirements = getRequirementsByLevel(doc, selectedLevel);
  const active = LEVELS[selectedLevel];
  const today = new Date().toLocaleDateString("pt-BR");

  return (
    <div
      className="print-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(9,9,20,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      {/* ── Print Document (hidden on screen, visible on print) ── */}
      <div
        className="print-document"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "none" }}
      >
        {/* Print header */}
        <div style={{ textAlign: "center", marginBottom: "6mm", paddingBottom: "4mm", borderBottom: "2px solid #1a1a1a" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "18pt", color: "#1a1a1a", letterSpacing: "0.06em", marginBottom: "1mm" }}>
            KRIOU DOCS
          </div>
          <div style={{ fontSize: "10pt", fontWeight: 600, color: "#555" }}>
            Checklist de Requisitos
          </div>
        </div>

        {/* Document info */}
        <div style={{ margin: "4mm 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2mm 4mm" }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: "9pt", color: "#555" }}>Documento: </span>
              <span style={{ fontSize: "9pt", color: "#1a1a1a" }}>{doc.name || doc.title}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: "9pt", color: "#555" }}>Nivel: </span>
              <span style={{ fontSize: "9pt", fontWeight: 700, color: "#1a1a1a", textTransform: "uppercase" }}>{active.label}</span>
            </div>
            {variant ? (
              <div>
                <span style={{ fontWeight: 600, fontSize: "9pt", color: "#555" }}>Variante: </span>
                <span style={{ fontSize: "9pt", color: "#1a1a1a" }}>{variant.name}</span>
              </div>
            ) : null}
            <div>
              <span style={{ fontWeight: 600, fontSize: "9pt", color: "#555" }}>Data: </span>
              <span style={{ fontSize: "9pt", color: "#1a1a1a" }}>{today}</span>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "3mm 0" }} />

        {/* Count bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "3mm 0",
            padding: "2mm 3mm",
            background: "#f5f5f5",
            borderRadius: "2mm",
            border: "1px solid #ddd",
            breakInside: "avoid",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              background:
                active.color === "var(--text-muted)"
                  ? "#888"
                  : active.color === "var(--gold)"
                    ? "#d4af37"
                    : active.color === "var(--coral)"
                      ? "#e74c3c"
                      : "#333",
            }}
          />
          <span style={{ fontSize: "10pt", fontWeight: 700, color: "#1a1a1a" }}>
            {requirements.count} campos necessarios
          </span>
          <span
            style={{
              fontSize: "7pt",
              fontWeight: 800,
              color: "#555",
              textTransform: "uppercase",
              padding: "1mm 3mm",
              background: "#e8e8e8",
              borderRadius: "2mm",
              marginLeft: "auto",
              letterSpacing: "0.04em",
            }}
          >
            {active.label}
          </span>
        </div>

        {/* Obrigatorios */}
        {requirements.obrigatorios.length > 0 ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              <span
                style={{
                  fontSize: "9pt",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                OBRIGATORIOS ({requirements.obrigatorios.length})
              </span>
              <span style={{ fontSize: "7pt", color: "#888" }}>
                Nao funciona sem estes
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1mm 4mm" }}>
              {requirements.obrigatorios.map((req, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "1mm 0",
                    fontSize: "9pt",
                    color: "#1a1a1a",
                    breakInside: "avoid",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "#e74c3c",
                    }}
                  />
                  {req}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Opcionais */}
        {requirements.opcionais.length > 0 ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              <span
                style={{
                  fontSize: "9pt",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                OPCIONAIS ({requirements.opcionais.length})
              </span>
              <span style={{ fontSize: "7pt", color: "#888" }}>
                {selectedLevel === "completo"
                  ? "Recomendado para maxima seguranca"
                  : "Importantes para protecao completa"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1mm 4mm" }}>
              {requirements.opcionais.map((req, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "1mm 0",
                    fontSize: "9pt",
                    color: "#1a1a1a",
                    breakInside: "avoid",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "#20b4a6",
                    }}
                  />
                  {req}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Extras */}
        {requirements.extras.length > 0 ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              <span
                style={{
                  fontSize: "9pt",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                EXTRAS ({requirements.extras.length})
              </span>
              <span style={{ fontSize: "7pt", color: "#888" }}>
                Detalhes para documentos premium
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1mm 4mm" }}>
              {requirements.extras.map((req, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "1mm 0",
                    fontSize: "9pt",
                    color: "#1a1a1a",
                    breakInside: "avoid",
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "#d4af37",
                    }}
                  />
                  {req}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* When to use */}
        {spec.whenUse ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                fontSize: "9pt",
                fontWeight: 800,
                color: "#1a1a1a",
                textTransform: "uppercase",
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              QUANDO USAR ESTE DOCUMENTO
            </div>
            <div style={{ fontSize: "9pt", lineHeight: 1.6, color: "#333", padding: "0 1mm" }}>
              {spec.whenUse}
            </div>
          </div>
        ) : null}

        {/* Required docs */}
        {spec.requiredDocs && spec.requiredDocs.length > 0 ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                fontSize: "9pt",
                fontWeight: 800,
                color: "#1a1a1a",
                textTransform: "uppercase",
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              DOCUMENTOS NECESSARIOS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2mm", padding: "0 1mm" }}>
              {spec.requiredDocs.map((d, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "8pt",
                    padding: "1mm 3mm",
                    background: "#eaeaea",
                    borderRadius: "1mm",
                    color: "#444",
                    border: "1px solid #ddd",
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Tips */}
        {spec.tips && spec.tips.length > 0 ? (
          <div style={{ marginBottom: "4mm", breakInside: "avoid" }}>
            <div
              style={{
                fontSize: "9pt",
                fontWeight: 800,
                color: "#1a1a1a",
                textTransform: "uppercase",
                marginBottom: "2mm",
                padding: "1.5mm 3mm",
                background: "#f3f3f3",
                borderRadius: "1mm",
              }}
            >
              DICAS IMPORTANTES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm", padding: "0 1mm" }}>
              {spec.tips.map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 5,
                    fontSize: "9pt",
                    color: "#333",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Page footer (fixed for multi-page) */}
        <div
          className="print-page-footer"
          style={{
            marginTop: "6mm",
            padding: "3mm 0",
            borderTop: "1px solid #aaa",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "7pt",
            color: "#888",
          }}
        >
          <span>Kriou Docs</span>
          <span className="print-page-num">Pagina </span>
        </div>
      </div>

      {/* ── Modal card ── */}
      <div
        className="print-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "20px",
          maxWidth: 640,
          width: "100%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "28px 28px 20px 28px",
            borderBottom: "1px solid var(--border)",
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="kf print-hide"
            aria-label="Fechar"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: TOQUE,
              height: TOQUE,
              borderRadius: RAD_SM,
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              cursor: "pointer",
              transition: EASE,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <XIcon />
          </button>

          {/* Doc info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, paddingRight: 52 }}>
            <div
              className="print-doc-icon"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: RAD,
                background: `${active.color}18`,
                border: `2px solid ${active.color}30`,
                flexShrink: 0,
                color: active.color,
              }}
            >
              <Icon name="FileCheck" className="w-6 h-6" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2
                className="print-doc-title"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "var(--text)",
                  margin: "0 0 4px 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.name || doc.title}
              </h2>
              <p
                className="print-subtitle"
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: 0,
                  fontFamily: "var(--font-body)",
                }}
              >
                {variant ? `${variant.icon || ""} ${variant.name}` : "Verifique os requisitos"}
              </p>
            </div>
          </div>

          {/* ── Level tabs ── */}
          <div
            className="print-hide"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginTop: 20,
            }}
          >
            {Object.values(LEVELS).map((level) => {
              const isActive = selectedLevel === level.id;
              return (
                <button
                  key={level.id}
                  className="kf"
                  onClick={() => setSelectedLevel(level.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                    padding: "14px 16px",
                    borderRadius: RAD,
                    border: isActive
                      ? `2px solid ${level.color}`
                      : "2px solid transparent",
                    background: isActive
                      ? level.bg
                      : "var(--surface-2)",
                    cursor: "pointer",
                    transition: EASE,
                    textAlign: "left",
                    minHeight: 72,
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--border-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ color: isActive ? level.color : "var(--text-faint)", lineHeight: 0 }}>
                      {level.id === "minimo" ? <MinusIcon /> : <Icon name={level.icon} className="w-4 h-4" />}
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 800,
                        fontSize: 13,
                        color: isActive ? "var(--text)" : "var(--text-dim)",
                      }}
                    >
                      {level.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: isActive ? "var(--text-muted)" : "var(--text-faint)",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.3,
                    }}
                  >
                    {level.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body scrollable ── */}
        <div
          className="print-body"
          style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}
        >
          {/* Count bar */}
          <div
            className="print-count-bar"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
              padding: "12px 16px",
              background: active.bg,
              borderRadius: RAD_SM,
              border: `1px solid ${active.color}20`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {selectedLevel === "minimo" ? (
                <div style={{ color: "var(--text-dim)", lineHeight: 0 }}>
                  <MinusIcon />
                </div>
              ) : (
                <Icon
                  name={selectedLevel === "essencial" ? "Check" : "Star"}
                  className="w-5 h-5"
                  style={{ color: active.color }}
                />
              )}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--text)",
                }}
              >
                {requirements.count} campos
              </span>
            </div>
            <span
              className="print-level-badge"
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: 10,
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: "100px",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: `${active.color}20`,
                color: active.color === "var(--text-muted)" ? "var(--text-dim)" : active.color,
              }}
            >
              {active.label}
            </span>
          </div>

          {/* ── When to use (essencial only) ── */}
          {spec.whenUse && selectedLevel === "essencial" && (
            <div
              className="print-when-use"
              style={{
                padding: 16,
                background: "rgba(20,184,166,0.06)",
                borderRadius: RAD_SM,
                border: "1px solid rgba(20,184,166,0.16)",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Wand2" className="w-5 h-5" style={{ color: "var(--teal)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--teal)",
                  }}
                >
                  Quando usar este documento
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  lineHeight: 1.6,
                  margin: 0,
                  fontFamily: "var(--font-body)",
                }}
              >
                {spec.whenUse}
              </p>
            </div>
          )}

          {/* ── Obrigatórios ── */}
          {requirements.obrigatorios.length > 0 && (
            <div className="print-section" style={{ marginBottom: 18 }}>
              <div
                className="print-section-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  padding: "8px 14px",
                  background: "rgba(244,63,94,0.08)",
                  borderRadius: RAD_SM,
                }}
              >
                <span
                  className="print-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: "rgba(244,63,94,0.18)",
                    color: "var(--coral)",
                  }}
                >
                  OBRIGATÓRIO
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                  Não funciona sem estes
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.obrigatorios.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--coral)" />
                ))}
              </div>
            </div>
          )}

          {/* ── Opcionais ── */}
          {requirements.opcionais.length > 0 && selectedLevel !== "minimo" && (
            <div className="print-section" style={{ marginBottom: 18 }}>
              <div
                className="print-section-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  padding: "8px 14px",
                  background: "rgba(20,184,166,0.06)",
                  borderRadius: RAD_SM,
                }}
              >
                <span
                  className="print-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: "rgba(20,184,166,0.16)",
                    color: "var(--teal)",
                  }}
                >
                  OPCIONAL
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                  {selectedLevel === "completo"
                    ? "Recomendado para máxima segurança"
                    : "Importantes para proteção completa"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.opcionais.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--teal)" />
                ))}
              </div>
            </div>
          )}

          {/* ── Extras ── */}
          {selectedLevel === "completo" && requirements.extras.length > 0 && (
            <div className="print-section" style={{ marginBottom: 18 }}>
              <div
                className="print-section-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                  padding: "8px 14px",
                  background: "rgba(212,175,55,0.07)",
                  borderRadius: RAD_SM,
                }}
              >
                <span
                  className="print-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    background: "rgba(212,175,55,0.16)",
                    color: "var(--gold)",
                  }}
                >
                  EXTRAS
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
                  Detalhes para documentos premium
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.extras.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--gold)" />
                ))}
              </div>
            </div>
          )}

          {/* ── Required docs ── */}
          {spec.requiredDocs && spec.requiredDocs.length > 0 && (
            <div
              className="print-required"
              style={{
                marginTop: 20,
                padding: 18,
                background: "var(--surface-2)",
                borderRadius: RAD,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="FileText" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--text)",
                  }}
                >
                  Documentos necessários
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.requiredDocs.map((d, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "8px 14px",
                      background: "var(--surface-3)",
                      borderRadius: RAD_SM,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-body)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Tips ── */}
          {spec.tips && spec.tips.length > 0 && selectedLevel !== "minimo" && (
            <div
              className="print-tips"
              style={{
                marginTop: 18,
                padding: 18,
                background: "rgba(0,200,151,0.04)",
                borderRadius: RAD,
                border: "1px solid rgba(0,200,151,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="Wand2" className="w-5 h-5" style={{ color: "var(--success)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--success)",
                  }}
                >
                  Dicas importantes
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {spec.tips.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontSize: 13,
                      color: "var(--text)",
                      fontFamily: "var(--font-body)",
                      lineHeight: 1.5,
                    }}
                  >
                    <Icon
                      name="Check"
                      className="w-4 h-4"
                      style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }}
                    />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          className="print-hide"
          style={{
            display: "flex",
            gap: 12,
            padding: "18px 28px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <button
            className="kf"
            onClick={onClose}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 20px",
              borderRadius: RAD,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.01em",
              transition: EASE,
              outline: "none",
              border: "1px solid var(--border)",
              background: "var(--surface-3)",
              color: "var(--text-dim)",
              minHeight: TOQUE,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-3)";
              e.currentTarget.style.color = "var(--text-dim)";
            }}
          >
            Fechar
          </button>
          <button
            className="kf"
            onClick={() => window.print()}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px 20px",
              borderRadius: RAD,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.01em",
              transition: EASE,
              outline: "none",
              border: "none",
              background: active.color === "var(--text-muted)" ? "var(--surface-3)" : active.color,
              color: active.color === "var(--text-muted)" ? "var(--text-dim)" : "#fff",
              minHeight: TOQUE,
              boxShadow:
                active.color === "var(--text-muted)"
                  ? "none"
                  : `0 4px 16px ${active.color}30`,
            }}
            onMouseEnter={(e) => {
              if (active.color !== "var(--text-muted)") {
                e.currentTarget.style.filter = "brightness(1.12)";
                e.currentTarget.style.boxShadow = `0 6px 24px ${active.color}45`;
              }
            }}
            onMouseLeave={(e) => {
              if (active.color !== "var(--text-muted)") {
                e.currentTarget.style.filter = "brightness(1)";
                e.currentTarget.style.boxShadow = `0 4px 16px ${active.color}30`;
              }
            }}
          >
            <Icon name="Download" className="w-4 h-4" />
            Imprimir Checklist
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 15mm 20mm 15mm;
          }

          /* Hide everything on the page */
          body {
            visibility: hidden !important;
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Show only the print overlay */
          .print-overlay,
          .print-overlay * {
            visibility: visible !important;
          }
          .print-overlay {
            position: static !important;
            background: #fff !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            display: block !important;
            max-width: none !important;
            padding: 0 !important;
          }

          /* Hide interactive modal */
          .print-modal {
            display: none !important;
          }

          /* Show print document */
          .print-document {
            display: block !important;
            font-family: 'Plus Jakarta Sans', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            color: #1a1a1a !important;
          }
          .print-document * {
            text-shadow: none !important;
          }

          /* Page footer - fixed to bottom of every page */
          .print-page-footer {
            position: fixed !important;
            bottom: 0;
            left: 15mm;
            right: 15mm;
            display: flex !important;
            justify-content: space-between;
            padding: 3mm 0;
            border-top: 1px solid #aaa;
            font-size: 7pt;
            color: #888 !important;
            background: #fff !important;
          }
          .print-page-num::after {
            content: counter(page);
          }
        }
      `}</style>
    </div>
  );
};

export default RequirementsModal;
