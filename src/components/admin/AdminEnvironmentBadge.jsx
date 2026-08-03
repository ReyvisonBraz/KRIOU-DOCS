import React from "react";

/**
 * Badges de ambiente (Local / Teste / Produção) e saúde geral do painel.
 *
 * Regras de ambiente:
 *  - URL do Supabase com "localhost"/"127.0.0.1"  → Local
 *  - Build de desenvolvimento (import.meta.env.DEV) → Teste
 *  - Caso contrário                               → Produção
 */
const AdminEnvironmentBadge = ({ healthy = true }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const isLocal =
    supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");
  const isDev = import.meta.env.DEV;

  const envLabel = isLocal ? "Local" : isDev ? "Teste" : "Produção";
  const envColor = isLocal ? "var(--coral)" : isDev ? "var(--gold)" : "var(--teal)";

  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 9999,
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted)",
  };

  const dot = (color) => ({
    width: 8,
    height: 8,
    borderRadius: 9999,
    background: color,
    flexShrink: 0,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={pill}>
        <span style={dot(envColor)} />
        {envLabel}
      </span>
      <span style={{ ...pill, color: healthy ? "var(--teal)" : "var(--coral)" }}>
        <span style={dot(healthy ? "var(--teal)" : "var(--coral)")} />
        {healthy ? "Operacional" : "Atenção"}
      </span>
    </div>
  );
};

export default AdminEnvironmentBadge;
