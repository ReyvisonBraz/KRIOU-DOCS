/**
 * ============================================
 * KRIOU DOCS - Resume Helper Components
 * ============================================
 * HelpTooltip, FieldWithHelp, OptionalFieldButton, FieldHint,
 * QuickSuggestion, ExperienceTypeSelector, FieldWithIcon,
 * VisualExample, QuickFillCard
 *
 * @module components/ui/resume-helpers
 */

import React from "react";

export const HelpTooltip = ({ title }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "var(--surface-3)",
          color: "var(--text-muted)",
          fontSize: 10,
          fontWeight: 700,
          cursor: "help",
          marginLeft: 6,
        }}
        title={title}
      >
        ?
      </div>
    </div>
  );
};

export const FieldWithHelp = ({ label, children, help }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        {label}
        {help && <HelpTooltip {...help} />}
      </div>
      {children}
    </div>
  );
};

export const OptionalFieldButton = ({ onSkip, onFill, isSkipped }) => {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      {isSkipped ? (
        <button
          onClick={onFill}
          style={{
            background: "var(--surface-2)",
            border: "1px dashed var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          + Preencher agora
        </button>
      ) : (
        <button
          onClick={onSkip}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "var(--text-muted)",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Não tenho / Preencher depois
        </button>
      )}
    </div>
  );
};

export const FieldHint = ({ hint, example, whereFind, skipLabel, onSkip }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "var(--teal)",
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span style={{ fontSize: 14 }}>💡</span>
        {expanded ? "Ocultar" : "Ver dica"}
        <span style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
      </button>

      {expanded && (
        <div style={{
          marginTop: 10,
          padding: 12,
          background: "var(--surface-2)",
          borderRadius: 10,
          border: "1px solid var(--border)",
          fontSize: 13,
        }}>
          {hint && (
            <div style={{ marginBottom: 10, color: "var(--text)" }}>
              <strong>Dica:</strong> {hint}
            </div>
          )}
          {example && (
            <div style={{ marginBottom: 10, padding: 10, background: "var(--surface-3)", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Exemplo:</div>
              <div style={{ color: "var(--teal)", fontStyle: "italic" }}>"{example}"</div>
            </div>
          )}
          {whereFind && (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              <strong>Onde encontrar:</strong> {whereFind}
            </div>
          )}
          {skipLabel && (
            <button
              onClick={onSkip}
              style={{
                marginTop: 12,
                background: "var(--surface-3)",
                border: "1px dashed var(--border)",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "var(--text-muted)",
                cursor: "pointer",
                width: "100%",
              }}
            >
              ⊗ {skipLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const QuickSuggestion = ({ suggestions, onSelect, label }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {label && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 12,
              color: "var(--text)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--coral)";
              e.target.style.color = "white";
              e.target.style.borderColor = "var(--coral)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--surface-2)";
              e.target.style.color = "var(--text)";
              e.target.style.borderColor = "var(--border)";
            }}
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ExperienceTypeSelector = ({ onSelect }) => {
  const types = [
    { id: "formal", label: "Trabalho Formal", desc: "CLT, PJ, contrato" },
    { id: "freelancer", label: "Freelancer", desc: "Trabalhos por conta própria" },
    { id: "informal", label: "Trabalho Informal", desc: "Bicos, serviços pontuais" },
    { id: "voluntario", label: "Voluntário", desc: "Trabalho sem remuneração" },
    { id: "estagio", label: "Estágio", desc: "Estágio ou trainee" },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        Que tipo de experiência você tem?
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            style={{
              padding: "10px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface-2)";
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{type.label}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{type.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const FieldWithIcon = ({ icon, label, children, tip }) => {
  const icons = {
    user: "👤", email: "📧", phone: "📱", location: "📍", linkedin: "🔗",
    target: "🎯", briefcase: "💼", school: "🎓", skills: "⚡", globe: "🌍",
    award: "🏆", calendar: "📅", description: "📝", building: "🏢",
    clock: "⏰", search: "🔍", help: "❓",
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {icon && (
          <span style={{ fontSize: 18 }} role="img" aria-label={label}>
            {icons[icon] || "📄"}
          </span>
        )}
        <label style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          {label}
        </label>
      </div>
      {children}
      {tip && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12 }}>💡</span>
          {tip}
        </div>
      )}
    </div>
  );
};

export const VisualExample = ({ type, example }) => {
  const examples = {
    nome:     { emoji: "👤", title: "Assim como no RG",  visual: "João da Silva" },
    email:    { emoji: "📧", title: "Formato padrão",    visual: "seuemail@gmail.com" },
    telefone: { emoji: "📱", title: "Com DDD",           visual: "(11) 98765-4321" },
    linkedin: { emoji: "🔗", title: "URL do seu perfil", visual: "linkedin.com/in/seu-nome" },
    periodo:  { emoji: "📅", title: "Exemplo",           visual: "Jan 2022 - Dez 2023" },
    cargo:    { emoji: "💼", title: "O que você fazia",  visual: "Auxiliar Administrativo" },
  };

  const data = examples[type] || { emoji: "📄", title: "Exemplo", visual: example };

  return (
    <div style={{
      marginTop: 12,
      padding: 14,
      background: "linear-gradient(135deg, var(--surface-3) 0%, var(--surface-2) 100%)",
      borderRadius: 10,
      border: "1px dashed var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{data.emoji}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{data.title}</span>
      </div>
      <div style={{
        fontSize: 14,
        color: "var(--teal)",
        fontFamily: "monospace",
        background: "var(--surface)",
        padding: "8px 12px",
        borderRadius: 6,
        border: "1px solid var(--border)",
      }}>
        {data.visual}
      </div>
    </div>
  );
};

export const QuickFillCard = ({ examples, onSelect }) => {
  return (
    <div style={{
      marginTop: 16,
      padding: 16,
      background: "var(--surface-2)",
      borderRadius: 12,
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>
        💡 Não sabe o que escrever? Veja estes exemplos:
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {examples.map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelect(ex.text)}
            style={{
              textAlign: "left",
              padding: "10px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.background = "var(--surface-3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
            }}
          >
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              {ex.level || "Exemplo"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.4 }}>
              "{ex.text}"
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
