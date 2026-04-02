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
  ...props
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="label">{label}{required && " *"}</label>}
      <input
        type={type}
        className={`input-field ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={style}
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
  ...props
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="label">{label}{required && " *"}</label>}
      <textarea
        className={`input-field ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ resize: "vertical", ...style }}
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
  ...props
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label className="label">{label}{required && " *"}</label>}
      <select
        className={`input-field ${className}`}
        value={value}
        onChange={onChange}
        style={style}
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
};