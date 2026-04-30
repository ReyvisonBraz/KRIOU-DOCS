/**
 * ============================================
 * KRIOU DOCS - UI Primitives
 * ============================================
 * Button, Card, Badge, Tag, Spinner
 *
 * @module components/ui/primitives
 */

import React from "react";
import { Icon } from "../Icons";

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
 * Badge - Status/tag component
 */
export const Badge = ({
  children,
  variant = "default",
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
 * Tag - Chip/pill style component
 */
export const Tag = ({ children, active = false, onClick, style = {}, ...props }) => {
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
