/**
 * ============================================
 * KRIOU DOCS — Resume Helper Components
 * ============================================
 * HelpTooltip, FieldWithHelp, OptionalFieldButton, FieldHint,
 * QuickSuggestion, ExperienceTypeSelector, FieldWithIcon,
 * VisualExample, QuickFillCard
 *
 * Design: Luxury Refined + Bold Editorial
 * Fundo navy profundo, accent coral (#F43F5E),
 * detalhes dourados (#D4AF37), teal (#14B8A6)
 *
 * @module components/ui/resume-helpers
 */

import React from "react";
import { Icon } from "../Icons";

// ============================================================
// TOKENS DE DESIGN
// ============================================================
const FONT = {
  display: "'Outfit', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};
const RAD = "12px";
const RAD_SM = "8px";
const RAD_PILL = "100px";
const EASE = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
const TOQUE = 44;

// ============================================================
// INJEÇÃO GLOBAL DE ESTILOS (pseudo-classes e foco)
// ============================================================
let stylesInjected = false;
const injectStyles = () => {
  if (typeof document === "undefined" || stylesInjected) return;
  const el = document.createElement("style");
  el.setAttribute("data-kriou-resume-helpers", "");
  el.textContent = [
    `/* FieldHint toggle */
    .rh-fieldhint-toggle:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(244,63,94,0.3);
    }
    .rh-fieldhint-toggle:hover { color: var(--coral); }

    /* QuickSuggestion pill */
    .rh-suggestion-pill:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(20,184,166,0.35);
    }
    .rh-suggestion-pill:hover {
      background: var(--coral);
      color: #fff;
      border-color: var(--coral);
    }

    /* ExperienceTypeSelector card */
    .rh-exp-card:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(244,63,94,0.3);
    }
    .rh-exp-card:hover {
      border-color: var(--coral);
      background: var(--surface-3);
    }

    /* QuickFillCard item */
    .rh-fill-item:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(244,63,94,0.3);
    }
    .rh-fill-item:hover {
      border-color: var(--teal);
      background: var(--surface-3);
    }

    /* Skip button */
    .rh-skip-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(244,63,94,0.25);
    }
    .rh-skip-btn:hover {
      border-color: var(--text-muted);
      background: var(--surface-3);
    }

    /* Optional field button */
    .rh-opt-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(244,63,94,0.25);
    }
  `.replace(/\s+/g, " "),
  ].join("");
  document.head.appendChild(el);
  stylesInjected = true;
};

// ==================================================================
// HELP TOOLTIP
// ==================================================================
export const HelpTooltip = ({ title }) => {
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        minHeight: 18,
        width: 18,
        height: 18,
        borderRadius: RAD_PILL,
        background: "var(--surface-3)",
        color: "var(--text-muted)",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: FONT.body,
        cursor: "help",
        marginLeft: 6,
        flexShrink: 0,
      }}
    >
      <Icon name="HelpCircle" className="w-3 h-3" />
    </span>
  );
};

// ==================================================================
// FIELD WITH HELP
// ==================================================================
export const FieldWithHelp = ({ label, children, help }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        {label}
        {help && <HelpTooltip {...help} />}
      </div>
      {children}
    </div>
  );
};

// ==================================================================
// OPTIONAL FIELD BUTTON
// ==================================================================
export const OptionalFieldButton = ({ onSkip, onFill, isSkipped }) => {
  React.useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      {isSkipped ? (
        <button
          onClick={onFill}
          className="rh-opt-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minHeight: TOQUE,
            padding: "6px 16px",
            background: "var(--surface-2)",
            border: "1px dashed var(--border)",
            borderRadius: RAD_SM,
            fontSize: 12,
            fontFamily: FONT.body,
            fontWeight: 600,
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: EASE,
          }}
        >
          <Icon name="Plus" className="w-3.5 h-3.5" />
          Preencher agora
        </button>
      ) : (
        <button
          onClick={onSkip}
          className="rh-opt-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: TOQUE,
            padding: "6px 0",
            background: "none",
            border: "none",
            fontSize: 12,
            fontFamily: FONT.body,
            fontWeight: 500,
            color: "var(--text-muted)",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            transition: EASE,
          }}
        >
          Não tenho / Preencher depois
        </button>
      )}
    </div>
  );
};

// ==================================================================
// FIELD HINT
// ==================================================================
export const FieldHint = ({ hint, example, whereFind, skipLabel, onSkip }) => {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="rh-fieldhint-toggle"
        aria-expanded={expanded}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minHeight: TOQUE,
          padding: "8px 14px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: RAD,
          color: "var(--teal)",
          fontSize: 13,
          fontFamily: FONT.body,
          fontWeight: 600,
          cursor: "pointer",
          transition: EASE,
          userSelect: "none",
        }}
      >
        <Icon name="Zap" className="w-4 h-4" style={{ flexShrink: 0 }} />
        {expanded ? "Ocultar dica" : "Ver dica"}
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
            fontSize: 10,
            marginLeft: -2,
          }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            background: "var(--surface-2)",
            borderRadius: RAD,
            border: "1px solid var(--border)",
            fontSize: 13,
            fontFamily: FONT.body,
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {hint && (
            <div style={{ color: "var(--text)", display: "flex", gap: 8 }}>
              <span style={{ color: "var(--coral)", fontWeight: 700, flexShrink: 0 }}>Dica</span>
              <span>{hint}</span>
            </div>
          )}

          {example && (
            <div
              style={{
                padding: 12,
                background: "var(--surface-3)",
                borderRadius: RAD_SM,
                borderLeft: `3px solid var(--teal)`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontFamily: FONT.body,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Exemplo
              </div>
              <div
                style={{
                  color: "var(--teal)",
                  fontFamily: FONT.body,
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                &ldquo;{example}&rdquo;
              </div>
            </div>
          )}

          {whereFind && (
            <div style={{ color: "var(--text-dim)", fontSize: 12, display: "flex", gap: 8 }}>
              <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>Onde encontrar</span>
              <span>{whereFind}</span>
            </div>
          )}

          {skipLabel && onSkip && (
            <button
              onClick={onSkip}
              className="rh-skip-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: TOQUE,
                width: "100%",
                padding: "10px 16px",
                background: "var(--surface-3)",
                border: "1px dashed var(--border)",
                borderRadius: RAD_SM,
                fontSize: 12,
                fontFamily: FONT.body,
                fontWeight: 600,
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: EASE,
              }}
            >
              <Icon name="EyeOff" className="w-4 h-4" />
              {skipLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ==================================================================
// QUICK SUGGESTION
// ==================================================================
export const QuickSuggestion = ({ suggestions, onSelect, label }) => {
  React.useEffect(() => { injectStyles(); }, []);

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontFamily: FONT.body,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            marginBottom: 10,
          }}
        >
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="rh-suggestion-pill"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              minHeight: TOQUE,
              padding: "8px 16px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: RAD_PILL,
              fontSize: 13,
              fontFamily: FONT.body,
              fontWeight: 600,
              color: "var(--text)",
              cursor: "pointer",
              transition: EASE,
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="Plus" className="w-3.5 h-3.5" style={{ flexShrink: 0 }} />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================================================================
// EXPERIENCE TYPE SELECTOR
// ==================================================================
export const ExperienceTypeSelector = ({ onSelect }) => {
  const types = [
    { id: "formal", label: "Trabalho Formal", desc: "CLT, PJ, contrato", icon: "Briefcase" },
    { id: "freelancer", label: "Freelancer", desc: "Trabalhos por conta própria", icon: "Zap" },
    { id: "informal", label: "Trabalho Informal", desc: "Bicos, serviços pontuais", icon: "Clock" },
    { id: "voluntario", label: "Voluntário", desc: "Trabalho sem remuneração", icon: "Heart" },
    { id: "estagio", label: "Estágio", desc: "Estágio ou trainee", icon: "GraduationCap" },
  ];

  React.useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontFamily: FONT.body,
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: 12,
        }}
      >
        Que tipo de experiência você tem?
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className="rh-exp-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minHeight: TOQUE,
              padding: "12px 16px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: RAD,
              textAlign: "left",
              cursor: "pointer",
              transition: EASE,
              flex: "1 1 auto",
              minWidth: 140,
            }}
          >
            <Icon
              name={type.icon}
              className="w-5 h-5"
              style={{ color: "var(--text-muted)", flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontFamily: FONT.body,
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1.3,
                }}
              >
                {type.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: FONT.body,
                  fontWeight: 500,
                  color: "var(--text-faint)",
                  marginTop: 2,
                  lineHeight: 1.2,
                }}
              >
                {type.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ==================================================================
// ICON MAPPING FOR FIELD WITH ICON
// ==================================================================
const FIELD_ICONS = {
  user: "User",
  email: "Mail",
  phone: "Phone",
  location: "MapPin",
  linkedin: "Globe",
  target: "Star",
  briefcase: "Briefcase",
  school: "GraduationCap",
  skills: "Zap",
  globe: "Globe",
  award: "Award",
  calendar: "Clock",
  description: "FileText",
  building: "Briefcase",
  clock: "Clock",
  search: "Search",
  help: "HelpCircle",
};

// ==================================================================
// FIELD WITH ICON
// ==================================================================
export const FieldWithIcon = ({ icon, label, children, tip }) => {
  const iconName = FIELD_ICONS[icon] || "FileText";

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {icon && (
          <Icon
            name={iconName}
            className="w-[18px] h-[18px]"
            style={{ color: "var(--text-muted)", flexShrink: 0 }}
          />
        )}
        <label
          style={{
            fontSize: 11,
            fontFamily: FONT.body,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: 1,
          }}
        >
          {label}
        </label>
      </div>
      {children}
      {tip && (
        <div
          style={{
            fontSize: 11,
            fontFamily: FONT.body,
            fontWeight: 500,
            color: "var(--text-faint)",
            marginTop: 5,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Icon name="HelpCircle" className="w-3.5 h-3.5" style={{ flexShrink: 0, color: "var(--text-faint)" }} />
          {tip}
        </div>
      )}
    </div>
  );
};

// ==================================================================
// VISUAL EXAMPLE EXAMPLES MAP
// ==================================================================
const EXAMPLES_MAP = {
  nome: { icon: "User", title: "Assim como no RG", visual: "João da Silva" },
  email: { icon: "Mail", title: "Formato padrão", visual: "seuemail@gmail.com" },
  telefone: { icon: "Phone", title: "Com DDD", visual: "(11) 98765-4321" },
  linkedin: { icon: "Globe", title: "URL do seu perfil", visual: "linkedin.com/in/seu-nome" },
  periodo: { icon: "Clock", title: "Exemplo", visual: "Jan 2022 - Dez 2023" },
  cargo: { icon: "Briefcase", title: "O que você fazia", visual: "Auxiliar Administrativo" },
};

// ==================================================================
// VISUAL EXAMPLE
// ==================================================================
export const VisualExample = ({ type, example }) => {
  const data = EXAMPLES_MAP[type] || {
    icon: "FileText",
    title: "Exemplo",
    visual: example || "—",
  };

  return (
    <div
      style={{
        marginTop: 12,
        padding: 14,
        background: "var(--surface-3)",
        borderRadius: RAD,
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon name={data.icon} className="w-5 h-5" style={{ color: "var(--coral)", flexShrink: 0 }} />
        <span
          style={{
            fontSize: 11,
            fontFamily: FONT.body,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {data.title}
        </span>
      </div>
      <div
        style={{
          fontSize: 15,
          fontFamily: FONT.display,
          fontWeight: 500,
          color: "var(--teal)",
          background: "var(--surface)",
          padding: "10px 14px",
          borderRadius: RAD_SM,
          border: "1px solid var(--border)",
          fontFeatureSettings: "'ss01', 'tnum'",
        }}
      >
        {data.visual}
      </div>
    </div>
  );
};

// ==================================================================
// QUICK FILL CARD
// ==================================================================
export const QuickFillCard = ({ title, examples, onSelect }) => {
  React.useEffect(() => { injectStyles(); }, []);

  return (
    <div
      style={{
        marginTop: 16,
        padding: 18,
        background: "var(--surface-2)",
        borderRadius: RAD,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Icon name="Zap" className="w-4 h-4" style={{ color: "var(--gold)", flexShrink: 0 }} />
        <span
          style={{
            fontSize: 13,
            fontFamily: FONT.body,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {title || "Não sabe o que escrever? Veja estes exemplos:"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {examples.map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelect(ex.text)}
            className="rh-fill-item"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: TOQUE,
              padding: "12px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: RAD_SM,
              cursor: "pointer",
              transition: EASE,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: FONT.body,
                fontWeight: 700,
                color: "var(--gold)",
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {ex.level || "Exemplo"}
            </div>
            <div
              style={{
                fontSize: 13,
                fontFamily: FONT.body,
                fontWeight: 500,
                color: "var(--text)",
                lineHeight: 1.5,
              }}
            >
              &ldquo;{ex.text}&rdquo;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
