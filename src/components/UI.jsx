/**
 * ============================================
 * KRIOU DOCS - Reusable UI Components
 * ============================================
 * Centralized UI components for consistent
 * design system across the application.
 */

import React from "react";
import { Icon } from "./Icons";

/**
 * Button - Primary button component with variants
 */
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
  ...props
}) => {
  const baseClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    small: "btn-small",
  };

  const sizeClasses = {
    small: "btn-small",
    medium: "",
    large: "btn-large",
  };

  const classes = [
    baseClasses[variant] || "btn-primary",
    sizeClasses[size] || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}
      {...props}
    >
      {icon && iconPosition === "left" && <Icon name={icon} className="w-4 h-4" />}
      {children}
      {icon && iconPosition === "right" && <Icon name={icon} className="w-4 h-4" />}
    </button>
  );
};

/**
 * Card - Container component with hover effects
 */
export const Card = ({
  children,
  variant = "default",
  interactive = true,
  className = "",
  style = {},
  onClick,
  ...props
}) => {
  const classes = [
    interactive ? "card" : "card-static",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ cursor: onClick ? "pointer" : "default", ...style }} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

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

/**
 * Badge - Status/tag component
 */
export const Badge = ({
  children,
  variant = "default",
  className = "",
  style = {},
  ...props
}) => {
  const variantStyles = {
    default: { background: "var(--surface-3)", color: "var(--text-muted)" },
    success: { background: "rgba(0,200,151,0.15)", color: "var(--success)" },
    warning: { background: "rgba(249,168,37,0.15)", color: "var(--gold)" },
    coral: { background: "var(--coral)", color: "white" },
    teal: { background: "var(--teal)", color: "var(--navy)" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 100,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Navbar - Navigation bar component
 */
export const Navbar = ({ children, className = "", style = {}, ...props }) => {
  return (
    <nav className={`glass ${className}`} style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)", ...style }} {...props}>
      {children}
    </nav>
  );
};

/**
 * GlassPanel - Transparent glass-effect container
 */
export const GlassPanel = ({ children, className = "", style = {}, ...props }) => {
  return (
    <div className={`glass ${className}`} style={{ padding: 24, borderRadius: 16, ...style }} {...props}>
      {children}
    </div>
  );
};

/**
 * Tag - Chip/pill style component
 */
export const Tag = ({ children, active = false, onClick, className = "", style = {}, ...props }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--coral)" : "var(--surface-2)",
        color: active ? "white" : "var(--text-muted)",
        border: active ? "1px solid var(--coral)" : "1px solid var(--border)",
        borderRadius: 100,
        padding: "8px 16px",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .2s",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Spinner - Loading animation
 */
export const Spinner = ({ size = 24, className = "", style = {} }) => {
  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "var(--coral)",
        ...style,
      }}
    />
  );
};

/**
 * EmptyState - Empty content placeholder
 */
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {icon && (
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(233,69,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Icon name={icon} className="w-6 h-6" style={{ color: "var(--coral)" }} />
        </div>
      )}
      {title && <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{title}</div>}
      {description && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
};

/**
 * HelpTooltip - Tooltip de ajuda para campos complexos
 */
export const HelpTooltip = ({ title, children: content, example, whereFind }) => {
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

/**
 * FieldWithHelp - Campo com botão de ajuda
 */
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

/**
 * OptionalFieldButton - Botão para campos opcionais
 */
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

/**
 * FieldHint - Dica interativa para campos (mobile-first)
 * Clique/tap para expandir e ver exemplo, onde encontrar, etc.
 */
export const FieldHint = ({ hint, example, whereFind, skipLabel, onSkip, isSkipped }) => {
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
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "var(--surface-2)",
            borderRadius: 10,
            border: "1px solid var(--border)",
            fontSize: 13,
          }}
        >
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

/**
 * QuickSuggestion - Sugestões rápidas em chips
 * Para campos como objetivo, habilidades, etc.
 */
export const QuickSuggestion = ({ suggestions, onSelect, label }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {label && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
          {label}
        </div>
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

/**
 * ExperienceTypeSelector - Selector de tipo de experiência
 * Ajuda quem nunca trabalhou formalmente
 */
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

/**
 * FieldWithIcon - Campo com ícone representativo para usuários leigos
 * Ajuda visual para entender o que preencher em cada campo
 */
export const FieldWithIcon = ({ icon, label, children, tip }) => {
  const icons = {
    user: "👤",
    email: "📧",
    phone: "📱",
    location: "📍",
    linkedin: "🔗",
    target: "🎯",
    briefcase: "💼",
    school: "🎓",
    skills: "⚡",
    globe: "🌍",
    award: "🏆",
    calendar: "📅",
    description: "📝",
    building: "🏢",
    clock: "⏰",
    search: "🔍",
    help: "❓",
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

/**
 * VisualExample - Exemplo visual para campos复杂os
 * Mostra uma imagem ilustrativa do que preencher
 */
export const VisualExample = ({ type, example }) => {
  const examples = {
    nome: {
      emoji: "👤",
      title: "Assim como no RG",
      visual: "João da Silva",
    },
    email: {
      emoji: "📧",
      title: "Formato padrão",
      visual: "seuemail@gmail.com",
    },
    telefone: {
      emoji: "📱",
      title: "Com DDD",
      visual: "(11) 98765-4321",
    },
    linkedin: {
      emoji: "🔗",
      title: "URL do seu perfil",
      visual: "linkedin.com/in/seu-nome",
    },
    periodo: {
      emoji: "📅",
      title: "Exemplo",
      visual: "Jan 2022 - Dez 2023",
    },
    cargo: {
      emoji: "💼",
      title: "O que você fazia",
      visual: "Auxiliar Administrativo",
    },
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

/**
 * QuickFillCard - Cartão de preenchimento rápido com exemplo visual
 * Para usuários que não sabem o que escrever
 */
export const QuickFillCard = ({ title, examples, onSelect }) => {
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

// ============================================
// COMPONENTES PARA DOCUMENTOS JURÍDICOS
// ============================================

/**
 * VariantSelector - Seletor de variante do documento
 * Ex: Compra e Venda → Imóvel | Veículo | Terreno
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
            {/* Indicador ativo */}
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
 * Mais visível que o HelpTooltip padrão
 */
export const LegalHelpButton = ({ hint, example, whereFind, label }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          border: open ? "2px solid var(--teal)" : "2px solid var(--border)",
          background: open ? "rgba(0,210,211,0.15)" : "var(--surface-3)",
          color: open ? "var(--teal)" : "var(--text-muted)",
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--teal)";
            e.currentTarget.style.color = "var(--teal)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }
        }}
        title="Clique para ver ajuda"
      >
        ?
      </button>

      {open && (
        <>
          {/* Overlay para fechar */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 90,
            }}
          />
          {/* Card de ajuda */}
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
            {/* Header */}
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

            {/* Dica */}
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

            {/* Exemplo */}
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

            {/* Onde encontrar */}
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
        color: enabled ? "var(--text-muted)" : "var(--text-muted)",
        transition: "all 0.2s",
        opacity: enabled ? 1 : 0.6,
      }}
    >
      {/* Toggle visual */}
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
 */
export const ClientNoteBanner = ({ notes }) => {
  const [expanded, setExpanded] = React.useState(false);
  if (!notes || notes.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(0,210,211,0.08) 0%, rgba(83,52,131,0.08) 100%)",
      border: "1px solid rgba(0,210,211,0.2)",
      borderRadius: 14,
      padding: "14px 18px",
      marginBottom: 24,
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "var(--text)",
        }}
      >
        <span style={{ fontSize: 20 }}>📋</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>
          Informações Importantes para Você
        </span>
        <span style={{
          marginLeft: "auto",
          transform: expanded ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.2s",
          fontSize: 12,
          color: "var(--text-muted)",
        }}>
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.map((note, i) => (
            <div key={i} style={{
              display: "flex",
              gap: 10,
              padding: "8px 12px",
              background: "rgba(0,0,0,0.15)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--text)",
              lineHeight: 1.5,
            }}>
              <span style={{ color: "var(--teal)", fontWeight: 700, flexShrink: 0 }}>•</span>
              {note}
            </div>
          ))}
        </div>
      )}
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
      {/* Label + Ajuda + Toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}>
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

        {/* Botão de ajuda */}
        {hasHelp && (
          <LegalHelpButton
            hint={fieldDef.hint}
            example={fieldDef.example}
            whereFind={fieldDef.whereFind}
            label={fieldDef.label}
          />
        )}
      </div>

      {/* Toggle para campo opcional */}
      {isOptional && (
        <div style={{ marginBottom: 8 }}>
          <OptionalFieldToggle
            enabled={!isDisabled}
            onToggle={onToggleDisabled}
            label="Preencher este campo"
          />
        </div>
      )}

      {/* Campo de input (se habilitado) */}
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

          {/* Exemplo inline (quando tem placeholder diferente do exemplo) */}
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

          {/* Erro */}
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

// ─────────────────────────────────────────────
// NOVOS COMPONENTES REUTILIZÁVEIS
// (PLANO-REFATORACAO Fase 1 + plano-evolucao)
// ─────────────────────────────────────────────

/**
 * ErrorMessage — Exibe mensagem de erro de formulário.
 * Substitui os {errors.campo && <div>} espalhados pelo projeto.
 * @param {string} message - Mensagem de erro (não renderiza se falsy)
 * @param {object} style - Estilo extra opcional
 */
export const ErrorMessage = ({ message, style }) => {
  if (!message) return null;
  return (
    <p
      role="alert"
      style={{
        color: "var(--coral, #E94560)",
        fontSize: "0.78rem",
        marginTop: 5,
        display: "flex",
        alignItems: "center",
        gap: 4,
        ...style,
      }}
    >
      {message}
    </p>
  );
};

/**
 * AppNavbar — Navbar glass reutilizável para todas as páginas.
 * Substitui as navbars inline duplicadas em EditorPage, LegalEditorPage,
 * DashboardPage, PreviewPage e CheckoutPage.
 *
 * @param {string}    title        - Título centralizado
 * @param {ReactNode} leftAction   - Conteúdo à esquerda (ex: botão voltar)
 * @param {ReactNode} rightAction  - Conteúdo à direita (ex: botão salvar)
 * @param {ReactNode} children     - Conteúdo extra abaixo da linha principal (ex: stepper)
 * @param {object}    style        - Estilo extra no container
 */
export const AppNavbar = ({ title, leftAction, rightAction, children, style }) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(15, 15, 30, 0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/* Lado esquerdo */}
      <div style={{ minWidth: 80 }}>{leftAction || <span />}</div>

      {/* Título central */}
      <span
        style={{
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-primary, #F0F0F5)",
          textAlign: "center",
          flex: 1,
        }}
      >
        {title}
      </span>

      {/* Lado direito */}
      <div style={{ minWidth: 80, display: "flex", justifyContent: "flex-end" }}>
        {rightAction || <span />}
      </div>
    </div>

    {/* Conteúdo extra (ex: stepper, barra de progresso) */}
    {children && <div style={{ padding: "0 16px 10px" }}>{children}</div>}
  </div>
);

/**
 * AppStepper — Indicador de etapas para wizards.
 * Substitui os steppers duplicados em EditorPage e LegalEditorPage.
 *
 * @param {Array}    steps          - Array de { label, icon, key }
 * @param {number}   currentStep    - Índice da etapa atual (0-based)
 * @param {Function} onStepClick    - Callback ao clicar numa etapa concluída
 * @param {Set}      completedSteps - Set de índices das etapas concluídas
 */
export const AppStepper = ({ steps = [], currentStep = 0, onStepClick, completedSteps = new Set() }) => (
  <nav
    aria-label={`Etapa ${currentStep + 1} de ${steps.length}: ${steps[currentStep]?.label || ""}`}
    style={{
      display: "flex",
      overflowX: "auto",
      gap: 4,
      padding: "4px 0",
      scrollbarWidth: "none",
    }}
  >
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = completedSteps.has(index);
      const isClickable = isCompleted && onStepClick;

      return (
        <button
          key={step.key || index}
          onClick={() => isClickable && onStepClick(index)}
          aria-current={isActive ? "step" : undefined}
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "6px 10px",
            borderRadius: 10,
            border: "none",
            cursor: isClickable ? "pointer" : "default",
            background: isActive
              ? "rgba(233, 69, 96, 0.15)"
              : "transparent",
            transition: "background 0.2s",
          }}
        >
          {/* Dot indicator */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              background: isActive
                ? "var(--coral, #E94560)"
                : isCompleted
                ? "var(--success, #00C897)"
                : "rgba(255,255,255,0.08)",
              color: isActive || isCompleted ? "#fff" : "var(--text-muted, #8888A8)",
              transition: "background 0.2s",
            }}
          >
            {isCompleted && !isActive ? "✓" : index + 1}
          </div>

          {/* Label */}
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? "var(--coral, #E94560)"
                : isCompleted
                ? "var(--success, #00C897)"
                : "var(--text-muted, #8888A8)",
              whiteSpace: "nowrap",
              transition: "color 0.2s",
            }}
          >
            {step.label}
          </span>
        </button>
      );
    })}
  </nav>
);

/**
 * BottomNavigation — Botões de navegação entre etapas do wizard.
 * Substitui os botões Voltar/Próximo duplicados em EditorPage e LegalEditorPage.
 *
 * @param {Function} onBack       - Callback para voltar
 * @param {Function} onNext       - Callback para avançar
 * @param {boolean}  isFirstStep  - Oculta botão voltar na primeira etapa
 * @param {boolean}  isLastStep   - Muda label do botão de avançar
 * @param {string}   nextLabel    - Label personalizado para botão de avançar
 * @param {ReactNode} extraContent - Conteúdo extra (ex: indicador de progresso)
 */
export const BottomNavigation = ({
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  nextLabel,
  extraContent,
  style,
}) => (
  <div
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "rgba(15, 15, 30, 0.95)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 16px",
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 12,
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {!isFirstStep && (
        <button
          onClick={onBack}
          style={{
            flex: "0 0 auto",
            padding: "14px 20px",
            borderRadius: 14,
            border: "1.5px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "var(--text-muted, #8888A8)",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="ChevronLeft" className="w-4 h-4" />
          Voltar
        </button>
      )}

      <button
        onClick={onNext}
        style={{
          flex: 1,
          padding: "14px 20px",
          borderRadius: 14,
          border: "none",
          background: "var(--coral, #E94560)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
      >
        {nextLabel || (isLastStep ? "Finalizar" : "Próximo")}
        {!isLastStep && <Icon name="ChevronRight" className="w-4 h-4" />}
      </button>
    </div>

    {extraContent && (
      <div style={{ maxWidth: 600, margin: "8px auto 0" }}>{extraContent}</div>
    )}
  </div>
);

/**
 * SkeletonCard — Placeholder animado enquanto documentos carregam.
 * Usa animação CSS pulse para simular o conteúdo real.
 */
export const SkeletonCard = () => (
  <div style={{
    background: "var(--surface-2)",
    borderRadius: 14,
    padding: 18,
    border: "1px solid var(--border)",
  }}>
    <style>{`
      @keyframes skeleton-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .skeleton-line {
        background: var(--surface-3);
        border-radius: 6px;
        animation: skeleton-pulse 1.4s ease-in-out infinite;
      }
    `}</style>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
      <div className="skeleton-line" style={{ width: 80, height: 22 }} />
      <div className="skeleton-line" style={{ width: 64, height: 22, animationDelay: "0.1s" }} />
    </div>
    <div className="skeleton-line" style={{ width: "70%", height: 18, marginBottom: 10, animationDelay: "0.2s" }} />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div className="skeleton-line" style={{ width: "35%", height: 14, animationDelay: "0.3s" }} />
      <div className="skeleton-line" style={{ width: "20%", height: 14, animationDelay: "0.35s" }} />
    </div>
  </div>
);

/**
 * SaveIndicator — Indicador visual do estado de auto-save.
 * Exibe "Salvando..." animado ou "Salvo" com ícone de check.
 *
 * @param {"saving"|"saved"|"error"} status - Estado atual do save
 * @param {Date|null} lastSaved             - Timestamp do último save bem-sucedido
 */
export const SaveIndicator = ({ status = "saved", lastSaved = null }) => {
  const isSaving = status === "saving";
  const isError = status === "error";

  const color = isError ? "var(--coral, #E94560)" : isSaving ? "var(--text-muted)" : "var(--success, #00C897)";

  const label = isError
    ? "Erro ao salvar"
    : isSaving
    ? "Salvando..."
    : lastSaved
    ? `Salvo às ${lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    : "Salvo";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color, userSelect: "none" }}
    >
      {isSaving ? (
        <span
          style={{
            width: 12, height: 12, borderRadius: "50%",
            border: `2px solid ${color}`,
            borderTopColor: "transparent",
            display: "inline-block",
            animation: "spin 0.8s linear infinite",
          }}
        />
      ) : (
        <Icon name={isError ? "AlertCircle" : "Check"} className="w-3 h-3" />
      )}
      {label}
    </div>
  );
};

/**
 * ConfirmDialog — Modal de confirmação acessível.
 * Usado com o hook useConfirm para ações destrutivas.
 *
 * @param {boolean}  open          - Visibilidade do modal
 * @param {string}   title         - Título do diálogo
 * @param {string}   message       - Mensagem de confirmação
 * @param {string}   confirmLabel  - Label do botão de confirmar
 * @param {string}   cancelLabel   - Label do botão de cancelar
 * @param {boolean}  danger        - Estilo destrutivo no botão confirmar
 * @param {Function} onConfirm     - Callback ao confirmar
 * @param {Function} onCancel      - Callback ao cancelar
 */
export const ConfirmDialog = ({
  open = false,
  title = "Confirmar ação",
  message = "Tem certeza?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        style={{
          background: "var(--surface, #1a1a2e)",
          borderRadius: 16,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <h2
          id="confirm-dialog-title"
          style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px", borderRadius: 10,
              background: "var(--surface-2)", color: "var(--text-muted)",
              border: "1px solid var(--border)", fontWeight: 600,
              fontSize: 13, cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            style={{
              padding: "10px 20px", borderRadius: 10,
              background: danger ? "var(--coral, #E94560)" : "var(--teal, #00D2D3)",
              color: "#fff", border: "none", fontWeight: 700,
              fontSize: 13, cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * DocumentCard — Card reutilizável para exibir documentos no Dashboard.
 * Aceita tanto currículos quanto documentos jurídicos.
 *
 * @param {Object}   doc           - Objeto do documento
 * @param {Function} onClick       - Handler de clique
 * @param {number}   animationDelay - Delay de animação em segundos
 */
export const DocumentCard = ({ doc, onClick, onDelete, animationDelay = 0 }) => {
  const isResume = doc.type === "curriculo";

  const typeColor = isResume ? "var(--coral)" : "var(--teal)";
  const typeBg = isResume ? "rgba(233,69,96,0.1)" : "rgba(0,210,211,0.1)";

  const typeLabels = {
    curriculo: "Currículo",
    "compra-venda": "Compra/Venda",
    locacao: "Locação",
    procuracao: "Procuração",
    "prestacao-servicos": "Prest. Serviços",
  };
  const typeLabel = typeLabels[doc.type] || doc.type;

  const statusVariant = doc.status === "finalizado" ? "success" : "warning";
  const statusLabel = doc.status === "finalizado" ? "✓ Finalizado" : "✎ Rascunho";

  return (
    <Card
      className="animate-fadeUp"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: 18,
        animationDelay: `${animationDelay}s`,
        transition: "transform .18s, box-shadow .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          background: typeBg,
          color: typeColor,
          padding: "5px 10px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
        }}>
          {typeLabel}
        </span>
        <Badge variant={statusVariant} style={{ fontSize: 10 }}>
          {statusLabel}
        </Badge>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--text)", lineHeight: 1.3 }}>
        {doc.title}
      </h3>

      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{doc.template}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{doc.date}</span>
          {onDelete && (
            <button
              aria-label={`Excluir ${doc.title}`}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: 2, display: "flex",
                alignItems: "center", borderRadius: 4,
                transition: "color .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--coral)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Icon name="Trash2" className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Badge,
  Navbar,
  GlassPanel,
  Tag,
  Spinner,
  EmptyState,
  HelpTooltip,
  FieldWithHelp,
  OptionalFieldButton,
  FieldHint,
  QuickSuggestion,
  ExperienceTypeSelector,
  FieldWithIcon,
  VisualExample,
  QuickFillCard,
  VariantSelector,
  SectionHeader,
  LegalHelpButton,
  OptionalFieldToggle,
  ClientNoteBanner,
  LegalFieldRenderer,
  // Novos componentes
  ErrorMessage,
  AppNavbar,
  AppStepper,
  BottomNavigation,
  DocumentCard,
  SaveIndicator,
  SkeletonCard,
  ConfirmDialog,
};