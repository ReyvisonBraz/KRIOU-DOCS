import React from "react";

// ─── Períodos suportados (equivalentes aos do backend admin-metrics) ───
const PERIODS = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "1y", label: "1 ano" },
  { value: "all", label: "Tudo" },
];

/**
 * Seletor de período do painel administrativo.
 * Valores: 7d | 30d | 90d | 1y | all (padrão 30d).
 *
 * @param {string}   value     período ativo
 * @param {Function} onChange  (period) => void
 * @param {boolean}  disabled  desabilita enquanto carrega
 */
const PeriodFilter = ({ value = "30d", onChange, disabled = false }) => {
  return (
    <div
      role="group"
      aria-label="Período das métricas"
      style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
    >
      {PERIODS.map((p) => {
        const active = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.value)}
            aria-pressed={active}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              border: `1.5px solid ${active ? "var(--coral)" : "var(--border)"}`,
              background: active ? "var(--coral)" : "var(--surface-2)",
              color: active ? "#fff" : "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};

export default PeriodFilter;
