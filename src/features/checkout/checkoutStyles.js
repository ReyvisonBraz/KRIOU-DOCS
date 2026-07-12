export const checkoutStyles = {
  /* Layout */
  page: {
    minHeight: "100vh",
    background: "var(--navy)",
  },
  container: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "0 24px calc(80px + env(safe-area-inset-bottom, 0px))",
  },

  /* Cards */
  summaryCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    background: "var(--surface-2)",
    borderRadius: 16,
    border: "1px solid var(--border)",
  },
  paymentCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: 28,
  },

  /* Typography */
  sectionLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: 18,
  },
  docTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 800,
    color: "var(--text)",
    marginBottom: 4,
    letterSpacing: "-0.01em",
  },
  docSubtitle: {
    fontFamily: "var(--font-body)",
    fontSize: 14,
    color: "var(--text-dim)",
    marginBottom: 8,
  },
  deliveryLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  priceDisplay: {
    fontFamily: "var(--font-display)",
    fontSize: 32,
    fontWeight: 900,
    color: "var(--coral)",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  priceCurrency: {
    fontFamily: "var(--font-display)",
    fontSize: 18,
    fontWeight: 700,
    color: "var(--coral)",
    marginRight: 2,
  },

  /* Payment Option */
  optionBase: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    minHeight: 72,
    background: "var(--surface-2)",
    borderRadius: 16,
    cursor: "pointer",
    border: "1.5px solid var(--border)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    userSelect: "none",
    marginBottom: 10,
  },
  optionSelected: {
    background: "var(--surface-3)",
    border: "2px solid var(--coral)",
    boxShadow: "0 0 0 4px rgba(244,63,94,0.08)",
  },
  optionIconBox: {
    minWidth: 48,
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "var(--surface-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  optionIconBoxSelected: {
    background: "rgba(244,63,94,0.12)",
  },
  optionLabel: {
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    fontSize: 15,
    color: "var(--text)",
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-muted)",
  },
  radioOuter: {
    minWidth: 24,
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "2px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },
  radioOuterSelected: {
    border: "2px solid var(--coral)",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: "var(--coral)",
    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  badgeRecommended: {
    fontFamily: "var(--font-body)",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--gold)",
    background: "rgba(212,175,55,0.12)",
    padding: "3px 8px",
    borderRadius: 6,
    lineHeight: 1,
  },

  /* Pay Button */
  payButton: {
    width: "100%",
    padding: 18,
    fontSize: 16,
    fontFamily: "var(--font-body)",
    fontWeight: 700,
    background: "var(--coral)",
    color: "#fff",
    border: "none",
    borderRadius: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 20px rgba(244,63,94,0.3)",
    minHeight: 56,
    outline: "none",
  },
  payButtonHover: {
    background: "var(--coral-hover)",
    boxShadow: "0 6px 28px rgba(244,63,94,0.4)",
  },
  payButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  /* Security Badge */
  securityBadge: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  securityText: {
    fontFamily: "var(--font-body)",
    fontSize: 12,
    color: "var(--text-faint)",
  },

  /* Divider */
  divider: {
    height: 1,
    background: "var(--border)",
    margin: "28px 0",
  },

  /* ── Success Screen ── */
  successWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "var(--navy)",
  },
  successInner: {
    textAlign: "center",
    maxWidth: 440,
    width: "100%",
  },
  checkmarkRing: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    background: "rgba(16,185,129,0.1)",
    border: "3px solid rgba(16,185,129,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 32px",
  },
  successTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 28,
    fontWeight: 900,
    color: "var(--text)",
    marginBottom: 8,
    letterSpacing: "-0.02em",
  },
  successSub: {
    fontFamily: "var(--font-body)",
    fontSize: 16,
    color: "var(--text-dim)",
    marginBottom: 4,
  },
  successDetail: {
    fontFamily: "var(--font-body)",
    fontSize: 14,
    color: "var(--text-muted)",
    marginBottom: 32,
  },
  emailCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    display: "flex",
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
  },
  emailIconBox: {
    minWidth: 44,
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(20,184,166,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emailLabel: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    marginBottom: 2,
  },
  emailValue: {
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--text-muted)",
  },
  successActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  successBtnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 24px",
    borderRadius: 14,
    fontFamily: "var(--font-body)",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text-dim)",
    minHeight: 52,
    transition: "all 0.2s ease",
    outline: "none",
  },
  successBtnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 24px",
    borderRadius: 14,
    fontFamily: "var(--font-body)",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    background: "var(--coral)",
    color: "#fff",
    minHeight: 52,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 16px rgba(244,63,94,0.25)",
    outline: "none",
  },

  /* Navbar */
  backBtn: {
    background: "none",
    border: "none",
    color: "var(--text-dim)",
    cursor: "pointer",
    padding: 10,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    minHeight: 44,
    transition: "all 0.2s ease",
    outline: "none",
  },
};

/* ─── Inline Keyframes ─── */
export const checkoutKeyframes = `
@keyframes ck-spin {
  to { transform: rotate(360deg); }
}
@keyframes ck-checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ck-fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

