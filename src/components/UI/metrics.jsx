import React from "react";
import { Icon } from "../Icons";
import { Card } from "./primitives";

const ACCENTS = {
  accent: { soft: "var(--coral-light)", color: "var(--text-accent)" },
  coral: { soft: "var(--coral-light)", color: "var(--text-accent)" },
  success: { soft: "var(--status-success-soft)", color: "var(--status-success)" },
  teal: { soft: "var(--status-success-soft)", color: "var(--status-success)" },
  warning: { soft: "var(--status-warning-soft)", color: "var(--status-warning)" },
  gold: { soft: "var(--status-warning-soft)", color: "var(--gold)" },
  danger: { soft: "var(--status-danger-soft)", color: "var(--status-danger)" },
  info: { soft: "var(--status-info-soft)", color: "var(--status-info)" },
  neutral: { soft: "var(--surface-3)", color: "var(--text-dim)" },
  violet: { soft: "var(--soft-fill)", color: "var(--action-primary)" },
};

/** Cartão compartilhado para indicadores do cliente e do painel administrativo. */
export const MetricCard = ({
  label,
  value,
  sub,
  icon = "Info",
  accent = "accent",
  compact = false,
  isLoading = false,
  className,
  style,
  ...props
}) => {
  const visual = ACCENTS[accent] || ACCENTS.accent;
  const accessibleValue = isLoading ? "carregando" : String(value ?? "—");

  if (compact) {
    return (
      <Card
        variant="flat"
        className={["bento-stat", className].filter(Boolean).join(" ")}
        role="group"
        aria-label={`${label}: ${accessibleValue}`}
        aria-busy={isLoading || undefined}
        padding="small"
        style={{
          "--stat-accent": visual.color,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          minWidth: 0,
          ...style,
        }}
        {...props}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: visual.color,
            boxShadow: `0 0 8px color-mix(in srgb, ${visual.color} 45%, transparent)`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
          {isLoading ? "—" : value}
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", overflowWrap: "anywhere" }}>
          {label}
        </span>
      </Card>
    );
  }

  return (
    <Card
      variant="flat"
      padding="medium"
      className={className}
      role="group"
      aria-label={`${label}: ${accessibleValue}`}
      aria-busy={isLoading || undefined}
      style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0, ...style }}
      {...props}
    >
      <span
        aria-hidden="true"
        style={{ width: 36, height: 36, borderRadius: 10, background: visual.soft, color: visual.color, display: "grid", placeItems: "center" }}
      >
        <Icon name={icon} style={{ width: 18, height: 18 }} />
      </span>

      <div>
        {isLoading ? (
          <span aria-hidden="true" style={{ display: "block", height: 30, width: "62%", background: "var(--surface-3)", borderRadius: 8 }} />
        ) : (
          <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </div>
        )}
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
      </div>

      {!isLoading && sub && <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.45 }}>{sub}</div>}
    </Card>
  );
};

export default MetricCard;
