import React from "react";
import { Icon } from "../Icons";

// ─── Acentos visuais disponíveis (cores do tema) ───
const ACCENT_STYLES = {
  coral: { bg: "rgba(244,63,94,0.12)", color: "var(--coral)" },
  teal: { bg: "rgba(20,184,166,0.12)", color: "var(--teal)" },
  gold: { bg: "rgba(212,175,55,0.12)", color: "var(--gold)" },
  violet: { bg: "rgba(139,92,246,0.12)", color: "#8B5CF6" },
};

/**
 * Cartão de indicador único (ícone + valor grande + rótulo + subtítulo).
 * Use <MetricsCards> para montar a grade completa da visão geral.
 *
 * @param {string} label      título curto do indicador
 * @param {string|number} value  valor principal exibido em destaque
 * @param {string} [sub]      texto complementar (ex.: variação no período)
 * @param {string} [icon]     nome do ícone em components/Icons
 * @param {string} [accent]   coral | teal | gold | violet
 * @param {boolean} [isLoading] skeleton enquanto os dados carregam
 */
const MetricCard = ({ label, value, sub, icon = "Info", accent = "coral", isLoading = false }) => {
  const accentStyle = ACCENT_STYLES[accent] || ACCENT_STYLES.coral;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: accentStyle.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} className="w-4 h-4" style={{ color: accentStyle.color }} />
      </div>

      <div>
        {isLoading ? (
          <div
            style={{ height: 30, width: "62%", background: "var(--surface-3)", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text)",
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </div>
        )}
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{label}</div>
      </div>

      {!isLoading && sub && (
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{sub}</div>
      )}
    </div>
  );
};

export default MetricCard;
