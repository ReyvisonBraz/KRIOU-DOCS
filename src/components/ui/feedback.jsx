/**
 * ============================================
 * KRIOU DOCS - UI Feedback Components
 * ============================================
 * EmptyState, ErrorMessage, SaveIndicator, SkeletonCard, ConfirmDialog
 *
 * @module components/ui/feedback
 */

import React from "react";
import { Icon } from "../Icons";

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
 * ErrorMessage — Exibe mensagem de erro de formulário.
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
 * SaveIndicator — Indicador visual do estado de auto-save.
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
 * SkeletonCard — Placeholder animado enquanto documentos carregam.
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
 * ConfirmDialog — Modal de confirmação acessível.
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
