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

export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
          <Icon name={icon} className="w-7 h-7 text-coral" />
        </div>
      )}
      {title && <p className="font-display text-lg font-bold text-white mb-2">{title}</p>}
      {description && <p className="text-sm text-text-muted max-w-md leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export const ErrorMessage = ({ message, style }) => {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-center gap-1 text-[13px] text-coral mt-1.5 font-medium"
      style={style}
    >
      {message}
    </p>
  );
};

export const SaveIndicator = ({ status = "saved", lastSaved = null }) => {
  const isSaving = status === "saving";
  const isError = status === "error";

  const color = isError ? "var(--coral)" : isSaving ? "var(--text-muted)" : "var(--success)";

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

export const SkeletonCard = () => (
  <div className="break-inside-avoid rounded-2xl border border-white/[0.06] bg-surface overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-surface-3" />
    <div className="p-5">
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .sk-line {
          background: var(--surface-3);
          border-radius: 6px;
          animation: skeleton-pulse 1.4s ease-in-out infinite;
        }
      `}</style>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="sk-line w-8 h-8 rounded-xl" />
        <div className="sk-line w-20 h-4 rounded-md" />
      </div>
      <div className="sk-line w-full h-[18px] mb-1.5 rounded-md" style={{ animationDelay: "0.1s" }} />
      <div className="sk-line w-3/5 h-[18px] mb-4 rounded-md" style={{ animationDelay: "0.15s" }} />
      <div className="flex justify-between">
        <div className="sk-line w-16 h-3 rounded-md" style={{ animationDelay: "0.25s" }} />
        <div className="sk-line w-14 h-5 rounded-full" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  </div>
);

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        className="bg-surface border border-border rounded-2xl p-7 max-w-[420px] w-full shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-lg font-extrabold text-white mb-2.5"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="text-sm text-text-muted leading-relaxed mb-6"
        >
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-surface-2 text-text-muted border border-border font-semibold text-sm cursor-pointer transition-colors hover:bg-surface-3 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
            style={{ background: danger ? "var(--coral)" : "var(--teal)", color: danger ? "#fff" : "var(--navy)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
