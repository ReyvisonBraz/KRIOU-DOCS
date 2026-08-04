import React, { useState } from "react";
import { Card } from "../../components/UI";
import { Icon } from "../../components/Icons";
import { LOCAL_DATA_CLEANUP_COPY } from "./localDataCleanup";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]";

export default function LocalDataCleanupCard({ onConfirm }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className={`${focusClass} rounded-xl`}
        style={{
          minWidth: 44,
          minHeight: 44,
          padding: "12px 16px",
          margin: "16px auto 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 500,
          display: "block",
          textAlign: "center",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        {LOCAL_DATA_CLEANUP_COPY.trigger}
      </button>
    );
  }

  return (
    <Card
      style={{
        marginTop: 16,
        padding: 20,
        border: "1.5px solid rgba(244,63,94,0.35)",
        background: "rgba(244,63,94,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(244,63,94,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--coral)",
          }}
        >
          <Icon name="Shield" className="w-5 h-5" />
        </div>
        <div>
          <h2 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: 15 }}>
            {LOCAL_DATA_CLEANUP_COPY.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--text-dim)",
              margin: 0,
            }}
          >
            {LOCAL_DATA_CLEANUP_COPY.description}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={focusClass}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 13,
            border: "1.5px solid var(--border)",
            background: "transparent",
            color: "var(--text-dim)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {LOCAL_DATA_CLEANUP_COPY.cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={focusClass}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: 13,
            border: "none",
            background: "linear-gradient(135deg, #F43F5E 0%, #E4324D 100%)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {LOCAL_DATA_CLEANUP_COPY.confirm}
        </button>
      </div>
    </Card>
  );
}
