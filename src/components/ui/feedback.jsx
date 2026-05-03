/**
 * ============================================
 * KRIOU DOCS - Componentes de Feedback
 * ============================================
 * EmptyState, ErrorMessage, SaveIndicator, SkeletonCard, ConfirmDialog
 *
 * Design: Luxury Refined + Bold Editorial
 * Fundo navy profundo (#090914 → #14142B),
 * accent coral (#F43F5E), detalhes dourados (#D4AF37)
 *
 * @module components/ui/feedback
 */

import React from "react";
import { Icon } from "../Icons";

// -- Tokens de design tipográfico --
const T = {
  display: "'Outfit', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

// =============================================================================
// CSS global injetado uma única vez para pseudo-classes e animações
// =============================================================================
const STYLE_ID = "kriou-feedback-global";

const ensureGlobalStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = `
    /* -- Animações -- */
    @keyframes kriou-sk-pulse {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    @keyframes kriou-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes kriou-dialog-in {
      from { opacity: 0; transform: scale(0.96) translateY(6px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes kriou-sheet-up {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }

    /* -- Padrão de foco visível -- */
    .kriou-focus-ring:focus-visible {
      outline: 2px solid var(--coral);
      outline-offset: 2px;
    }

    /* -- Botão de retry (ErrorMessage) -- */
    .kriou-retry-btn {
      min-height: 32px;
      min-width: 44px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 600;
      font-family: ${T.body};
      color: var(--coral);
      background: transparent;
      border: 1px solid var(--coral);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .kriou-retry-btn:hover {
      background: var(--coral);
      color: #fff;
    }
    .kriou-retry-btn:focus-visible {
      outline: 2px solid var(--coral);
      outline-offset: 2px;
    }
    .kriou-retry-btn:active {
      transform: scale(0.97);
    }

    /* -- Botões do ConfirmDialog -- */
    .kriou-dialog-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 11px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      font-family: ${T.body};
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .kriou-dialog-btn:focus-visible {
      outline: 2px solid var(--coral);
      outline-offset: 2px;
    }
    .kriou-dialog-btn:active {
      transform: scale(0.97);
    }
    .kriou-dialog-btn-cancel {
      background: var(--surface-2);
      color: var(--text-dim);
      border: 1px solid var(--border);
    }
    .kriou-dialog-btn-cancel:hover {
      background: var(--surface-3);
      color: var(--text);
      border-color: var(--border-hover);
    }
    .kriou-dialog-btn-confirm {
      background: var(--teal);
      color: #090914;
    }
    .kriou-dialog-btn-confirm:hover {
      filter: brightness(1.12);
    }
    .kriou-dialog-btn-danger {
      background: var(--coral);
      color: #fff;
    }
    .kriou-dialog-btn-danger:hover {
      filter: brightness(1.12);
    }

    /* -- ConfirmDialog overlay & painel -- */
    .kriou-dialog-overlay {
      animation: kriou-dialog-in 0.2s ease-out;
    }
    .kriou-dialog-panel {
      animation: kriou-dialog-in 0.22s ease-out;
    }

    /* -- ConfirmDialog mobile: bottom-sheet -- */
    @media (max-width: 639px) {
      .kriou-dialog-overlay {
        align-items: flex-end !important;
      }
      .kriou-dialog-panel {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 20px 20px 0 0 !important;
        animation: kriou-sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        padding-bottom: calc(28px + env(safe-area-inset-bottom));
      }
    }
  `;
  document.head.appendChild(el);
};

/* ====================== EmptyState ====================== */
export const EmptyState = ({ icon, title, description, action, className }) => (
  <div
    className={className}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "64px 16px",
      fontFamily: T.body,
    }}
  >
    {icon && (
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          color: "var(--coral)",
        }}
      >
        <Icon name={icon} style={{ width: 32, height: 32 }} />
      </div>
    )}

    {title && (
      <p
        style={{
          fontFamily: T.display,
          fontSize: 20,
          fontWeight: 700,
          color: "var(--text)",
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </p>
    )}

    {description && (
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--text-muted)",
          maxWidth: 420,
          margin: 0,
        }}
      >
        {description}
      </p>
    )}

    {action && <div style={{ marginTop: 28 }}>{action}</div>}
  </div>
);

/* ====================== ErrorMessage ====================== */
export const ErrorMessage = ({ message, onRetry, className, style }) => {
  if (!message) return null;
  ensureGlobalStyles();

  return (
    <div
      role="alert"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
        flexWrap: "wrap",
        ...style,
      }}
    >
      {/* Ícone de erro */}
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        <Icon name="AlertCircle" style={{ width: 14, height: 14, color: "var(--coral)" }} />
      </span>

      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--coral)",
          fontFamily: T.body,
          lineHeight: 1.4,
        }}
      >
        {message}
      </span>

      {onRetry && (
        <button onClick={onRetry} className="kriou-retry-btn">
          Tentar novamente
        </button>
      )}
    </div>
  );
};

/* ====================== SaveIndicator ====================== */
export const SaveIndicator = ({ status = "saved", lastSaved = null }) => {
  ensureGlobalStyles();

  const isSaving = status === "saving";
  const isError = status === "error";
  const isIdle = status === "idle";

  const accentColor = isError
    ? "var(--coral)"
    : isSaving
    ? "var(--text-muted)"
    : isIdle
    ? "var(--text-faint)"
    : "var(--success)";

  // Rótulo localizado em português
  const label = isError
    ? "Erro ao salvar"
    : isSaving
    ? "Salvando..."
    : isIdle
    ? "Pendente"
    : lastSaved
    ? `Salvo ${new Date(lastSaved).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "Salvo";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 500,
        color: accentColor,
        fontFamily: T.body,
        userSelect: "none",
      }}
    >
      {isSaving ? (
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            border: `2px solid ${accentColor}`,
            borderTopColor: "transparent",
            display: "inline-block",
            animation: "kriou-spin 0.7s linear infinite",
          }}
        />
      ) : (
        <Icon
          name={isError ? "AlertCircle" : "Check"}
          style={{ width: 12, height: 12 }}
        />
      )}
      <span>{label}</span>
    </div>
  );
};

/* ====================== SkeletonCard ====================== */
export const SkeletonCard = ({ className }) => {
  ensureGlobalStyles();

  return (
    <div
      className={className}
      style={{
        breakInside: "avoid",
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        overflow: "hidden",
        fontFamily: T.body,
      }}
    >
      {/* Barra decorativa superior */}
      <div style={{ height: 3, background: "var(--surface-3)" }} />

      <div style={{ padding: 20 }}>
        {/* Ícone + título fantasma */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "var(--surface-3)",
              animation: "kriou-sk-pulse 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: 88,
              height: 16,
              borderRadius: 8,
              background: "var(--surface-3)",
              animation: "kriou-sk-pulse 1.4s ease-in-out infinite 0.1s",
            }}
          />
        </div>

        {/* Linhas de texto fantasma */}
        <div
          style={{
            width: "100%",
            height: 16,
            borderRadius: 8,
            background: "var(--surface-3)",
            animation: "kriou-sk-pulse 1.4s ease-in-out infinite 0.05s",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            width: "60%",
            height: 16,
            borderRadius: 8,
            background: "var(--surface-3)",
            animation: "kriou-sk-pulse 1.4s ease-in-out infinite 0.12s",
            marginBottom: 22,
          }}
        />

        {/* Rodapé fantasma */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              width: 60,
              height: 12,
              borderRadius: 6,
              background: "var(--surface-3)",
              animation: "kriou-sk-pulse 1.4s ease-in-out infinite 0.2s",
            }}
          />
          <div
            style={{
              width: 52,
              height: 22,
              borderRadius: 11,
              background: "var(--surface-3)",
              animation: "kriou-sk-pulse 1.4s ease-in-out infinite 0.28s",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ====================== ConfirmDialog ====================== */
export const ConfirmDialog = ({
  visible,
  open, // fallback legado para compatibilidade
  title = "Confirmar ação",
  message = "Tem certeza?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const isOpen = visible ?? open ?? false;
  if (!isOpen) return null;

  ensureGlobalStyles();

  // Trava scroll do body enquanto o diálogo está aberto
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kriou-dialog-title"
      aria-describedby="kriou-dialog-message"
      className="kriou-dialog-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(9,9,20,0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      {/* Painel do diálogo */}
      <div
        className="kriou-dialog-panel"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Ícone de alerta para variante danger */}
        {danger && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(244,63,94,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Icon
              name="AlertTriangle"
              style={{ width: 22, height: 22, color: "var(--coral)" }}
            />
          </div>
        )}

        {/* Título */}
        <h2
          id="kriou-dialog-title"
          style={{
            fontFamily: T.display,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text)",
            margin: "0 0 10px",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>

        {/* Mensagem */}
        <p
          id="kriou-dialog-message"
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            margin: "0 0 28px",
            fontFamily: T.body,
          }}
        >
          {message}
        </p>

        {/* Botões de ação */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            className="kriou-dialog-btn kriou-dialog-btn-cancel"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            autoFocus
            className={`kriou-dialog-btn ${
              danger ? "kriou-dialog-btn-danger" : "kriou-dialog-btn-confirm"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
