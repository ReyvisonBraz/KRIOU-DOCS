import React from "react";
import { Icon } from "../Icons";

// ─── Rótulos por estado de processamento ───
const STATUS_META = {
  rejected: { label: "Recusado", color: "var(--coral)" },
  cancelled: { label: "Cancelado", color: "var(--text-muted)" },
  pending: { label: "Pendente", color: "var(--gold)" },
  in_process: { label: "Em processo", color: "var(--gold)" },
  in_mediation: { label: "Em mediação", color: "var(--gold)" },
  authorized: { label: "Autorizado", color: "var(--gold)" },
};

/**
 * Lista curta de falhas recentes que exigem ação (webhook / pagamento).
 * Consome `recentFailures` retornado pela Edge Function admin-metrics.
 */
const RecentFailures = ({ failures = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ height: 48, borderRadius: 12, background: "var(--surface-2)" }}
          />
        ))}
      </div>
    );
  }

  if (!Array.isArray(failures) || failures.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "var(--teal)",
          fontSize: 13,
          padding: "8px 0",
        }}
      >
        <Icon name="CheckCircle" className="w-4 h-4" />
        Nenhuma falha recente que exija ação.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {failures.slice(0, 6).map((f) => {
        const status = String(f.processing_status || "").toLowerCase();
        const meta =
          STATUS_META[status] || { label: f.processing_status || "erro", color: "var(--text-muted)" };
        const id = f.payment_id ? ` #${f.payment_id}` : "";

        return (
          <div
            key={f.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--surface-2)",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(244,63,94,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="AlertTriangle" className="w-4 h-4" style={{ color: "var(--coral)" }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                {(f.provider || "pagamento") + id}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {f.error_code || f.action || "erro de processamento"}
                {f.received_at ? ` — ${formatDateTime(f.received_at)}` : ""}
              </div>
            </div>

            <span
              style={{
                display: "inline-flex",
                padding: "2px 10px",
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 600,
                background: "var(--soft-fill)",
                color: meta.color,
                flexShrink: 0,
              }}
            >
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default RecentFailures;
