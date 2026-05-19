import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import { PAYMENT_METHODS } from "../data/constants";
import { usePDF } from "../hooks/usePDF";
import { sanitizeFormData } from "../utils/sanitization";
import { DocumentService } from "../services/DocumentService";
import showToast from "../utils/toast";

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || null;

/* ───────────────────────────────────────────
   Design Tokens (referenced from :root)
   --navy, --surface, --surface-2, --surface-3
   --coral, --gold, --teal
   --text, --text-dim, --text-muted, --text-faint
   --border, --border-hover, --success
   Fonts: --font-display (Outfit), --font-body (Plus Jakarta Sans)
   ─────────────────────────────────────────── */

const S = {
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
const KEYFRAMES = `
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

const CheckoutPage = () => {
  const {
    navigate,
    selectedTemplate,
    formData,
    email,
    checkoutComplete,
    setCheckoutComplete,
    documentType,
    legalFormData,
    selectedVariant,
    disabledFields,
    saveDocument,
    updateDocument,
    editingDocId,
    setEditingDocId,
  } = useApp();

  const [selectedPayment, setSelectedPayment] = useState("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const { generatePDF } = usePDF();

  const isLegalDocument = !!documentType;
  const price = "R$ 9,90";

  const getDisplayEmail = () => email || "seu e-mail";
  const getDocumentTitle = () => {
    if (isLegalDocument) return documentType?.name || "Documento Jurídico";
    return formData.nome || "Currículo";
  };
  const getDocumentTypeLabel = () =>
    isLegalDocument ? "Documento Jurídico" : "Currículo";

  // ── Check for Mercado Pago return callback ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const status = params.get("status");

    if (paymentId && status === "approved") {
      handlePaymentSuccess(paymentId);
    } else if (paymentId && status === "failure") {
      setPaymentError("Pagamento não aprovado. Tente novamente.");
    }
  }, []);

  const sendConfirmationEmail = useCallback(async (doc) => {
    try {
      const title = isLegalDocument ? (documentType?.name || "Documento Jurídico") : (formData.nome || "Currículo");
      await callEdgeFunction("send-email", {
        to: email,
        subject: `Seu documento está pronto — ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #F43F5E;">Kriou Docs</h2>
            <p>Olá!</p>
            <p>Seu documento <strong>${title}</strong> foi gerado com sucesso e já está disponível no seu painel.</p>
            <p>Código do documento: <strong>${doc?.code || "—"}</strong></p>
            <p style="margin-top: 24px;">
              <a href="${window.location.origin}/dashboard"
                 style="background: #F43F5E; color: #fff; padding: 12px 24px; border-radius: 8px;
                        text-decoration: none; font-weight: 600; display: inline-block;">
                Acessar Dashboard
              </a>
            </p>
            <p style="margin-top: 24px; font-size: 12px; color: #888;">
              Equipe Kriou Docs &bull; Documentos que impressionam
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.warn("[CheckoutPage] Falha ao enviar e-mail de confirmação:", err.message);
    }
  }, [email, callEdgeFunction, isLegalDocument, documentType, formData]);

  const handlePaymentSuccess = async (paymentId) => {
    setIsProcessing(true);
    try {
      const docData = sanitizeFormData(isLegalDocument ? legalFormData : formData);
      let savedDoc;
      if (editingDocId) {
        await updateDocument(editingDocId, docData);
        setEditingDocId(null);
        savedDoc = { id: editingDocId };
      } else {
        savedDoc = await saveDocument(docData);
      }
      setCheckoutComplete(true);
      showToast.success("Pagamento confirmado! Seu documento está sendo gerado.");
      window.history.replaceState({}, "", window.location.pathname);
      sendConfirmationEmail(savedDoc);
    } catch (err) {
      console.error("[CheckoutPage][ERRO] handlePaymentSuccess:", err);
      showToast.error("Erro ao finalizar documento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const callEdgeFunction = useCallback(async (functionName, body) => {
    const { supabase } = await import("../lib/supabase");
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    });
    if (error) throw error;
    return data;
  }, []);

  const handlePayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);
    try {
      const docData = sanitizeFormData(isLegalDocument ? legalFormData : formData);
      let savedDoc;
      if (editingDocId) {
        await updateDocument(editingDocId, docData);
        setEditingDocId(null);
        savedDoc = { id: editingDocId };
      } else {
        savedDoc = await saveDocument(docData);
      }

      // Try Mercado Pago if public key is configured
      if (MP_PUBLIC_KEY) {
        try {
          const preference = await callEdgeFunction("create-preference", {
            title: getDocumentTitle(),
            price: "9.90",
            userId: savedDoc?.userId || "unknown",
            documentId: savedDoc?.id || "unknown",
            email: email || "",
          });

          if (preference?.init_point) {
            window.location.href = preference.init_point;
            return;
          }
        } catch (mpErr) {
          console.warn("[CheckoutPage] MP fallback, erro:", mpErr.message);
        }
      }

      // Fallback: save directly without payment
      setCheckoutComplete(true);
      showToast.success("Documento salvo com sucesso!");
    } catch (err) {
      console.error("[CheckoutPage][ERRO] handlePayment:", err);
      showToast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToDashboard = () => {
    setCheckoutComplete(false);
    setEditingDocId(null);
    navigate("dashboard", { replace: true });
  };

  const handleDownloadPDF = async () => {
    try {
      if (isLegalDocument) {
        await generatePDF({
          type: "GENERATE_LEGAL",
          formData: legalFormData,
          docType: documentType,
          disabledFields: disabledFields || {},
          variantId: selectedVariant || null,
        });
      } else {
        await generatePDF({
          type: "GENERATE_RESUME",
          formData,
          template: selectedTemplate,
        });
      }
    } catch {
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  /* ─── PaymentOption Sub-Component ─── */
  const PaymentOption = ({ method, index = 0, total = 1 }) => {
    const isSelected = selectedPayment === method.id;
    const [hover, setHover] = useState(false);

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedPayment(method.id);
        return;
      }
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        const next = (index + 1) % total;
        const nextEl = document.querySelector(`[data-payment-index="${next}"]`);
        nextEl?.focus();
        if (nextEl) setSelectedPayment(PAYMENT_METHODS[next].id);
        return;
      }
      if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        const prev = (index - 1 + total) % total;
        const prevEl = document.querySelector(`[data-payment-index="${prev}"]`);
        prevEl?.focus();
        if (prevEl) setSelectedPayment(PAYMENT_METHODS[prev].id);
      }
    };

    return (
      <div
        role="radio"
        aria-checked={isSelected}
        tabIndex={0}
        data-payment-index={index}
        onClick={() => setSelectedPayment(method.id)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...S.optionBase,
          ...(isSelected ? S.optionSelected : {}),
          ...(hover && !isSelected
            ? { border: "1.5px solid var(--border-hover)", background: "var(--surface-3)" }
            : {}),
        }}
        onFocus={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = "1.5px solid var(--border-hover)";
            e.currentTarget.style.background = "var(--surface-3)";
          }
        }}
        onBlur={(e) => {
          if (!isSelected) {
            e.currentTarget.style.border = "1.5px solid var(--border)";
            e.currentTarget.style.background = "var(--surface-2)";
          }
        }}
      >
        {/* Icon Container */}
        <div
          style={{
            ...S.optionIconBox,
            ...(isSelected ? S.optionIconBoxSelected : {}),
          }}
        >
          <span style={{ fontSize: 22 }}>{method.icon}</span>
        </div>

        {/* Label + Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <span style={S.optionLabel}>{method.label}</span>
            {method.badge && (
              <span style={S.badgeRecommended}>{method.badge}</span>
            )}
          </div>
          <span style={S.optionDesc}>{method.desc}</span>
        </div>

        {/* Radio Indicator */}
        <div
          style={{
            ...S.radioOuter,
            ...(isSelected ? S.radioOuterSelected : {}),
          }}
        >
          {isSelected && <div style={S.radioInner} />}
        </div>
      </div>
    );
  };

  /* ─── Spinner ─── */
  const Spinner = () => (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff",
        animation: "ck-spin 0.7s linear infinite",
      }}
    />
  );

  /* ─── Pay Button ─── */
  const PayButton = () => {
    const [hover, setHover] = useState(false);

    return (
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...S.payButton,
          ...(hover && !isProcessing ? S.payButtonHover : {}),
          ...(isProcessing ? S.payButtonDisabled : {}),
        }}
        onFocus={(e) => {
          if (!isProcessing) {
            e.currentTarget.style.outline = "2px solid var(--coral)";
            e.currentTarget.style.outlineOffset = "2px";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-label={isProcessing ? "Processando pagamento" : `Pagar ${price}`}
      >
        {isProcessing ? (
          <>
            <Spinner />
            <span>Processando...</span>
          </>
        ) : (
          <>
            <Icon
              name="CreditCard"
              className="w-5 h-5"
              style={{ color: "var(--text)" }}
            />
            <span>Pagar {price}</span>
          </>
        )}
      </button>
    );
  };

  /* ════════════════════════════════════════
     SUCCESS SCREEN
     ════════════════════════════════════════ */
  if (checkoutComplete) {
    return (
      <div style={S.successWrapper}>
        <style>{KEYFRAMES}</style>
        <div
          style={{
            ...S.successInner,
            animation: "ck-fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
          }}
        >
          {/* Animated Checkmark */}
          <div style={S.checkmarkRing}>
            <Icon
              name="Check"
              className="w-12 h-12"
              style={{
                color: "var(--success)",
                animation: "ck-checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                animationDelay: "0.1s",
              }}
            />
          </div>

          <h1 style={S.successTitle}>Pagamento Confirmado!</h1>
          <p style={S.successSub}>
            Seu {getDocumentTypeLabel().toLowerCase()} está sendo gerado...
          </p>
          <p style={S.successDetail}>
            Você já pode baixar o PDF do seu documento.
          </p>

          {/* Email Confirmation Card */}
          <div style={S.emailCard}>
            <div style={S.emailIconBox}>
              <Icon
                name="Mail"
                className="w-6 h-6"
                style={{ color: "var(--teal)" }}
              />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={S.emailLabel}>Confirmação enviada para</div>
              <div style={S.emailValue}>{getDisplayEmail()}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={S.successActions}>
            <button
              onClick={handleGoToDashboard}
              style={S.successBtnSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-3)";
                e.currentTarget.style.border = "1px solid var(--border-hover)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-2)";
                e.currentTarget.style.border = "1px solid var(--border)";
                e.currentTarget.style.color = "var(--text-dim)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid var(--coral)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              <Icon name="Home" className="w-5 h-5" />
              Ir ao Dashboard
            </button>
            <button
              onClick={handleDownloadPDF}
              style={S.successBtnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--coral-hover)";
                e.currentTarget.style.boxShadow =
                  "0 6px 24px rgba(244,63,94,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--coral)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(244,63,94,0.25)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid var(--coral)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              <Icon name="Download" className="w-5 h-5" />
              Baixar PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     MAIN CHECKOUT
     ════════════════════════════════════════ */
  const documentTitleFull = isLegalDocument
    ? documentType?.name || "Documento Jurídico"
    : `Currículo — ${selectedTemplate?.name || "Modelo"}`;

  return (
    <div style={S.page}>
      <style>{KEYFRAMES}</style>

      {/* ── Navbar ── */}
      <AppNavbar
        title={`Checkout — ${
          isLegalDocument ? "Documento Jurídico" : "Currículo"
        }`}
        leftAction={
          <button
            onClick={() => navigate("preview", { replace: true })}
            aria-label="Voltar ao preview"
            style={S.backBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text)";
              e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-dim)";
              e.currentTarget.style.background = "none";
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid var(--coral)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      {/* ── Content ── */}
      <div
        style={{
          ...S.container,
          animation: "ck-fadeSlideUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
          marginTop: 40,
        }}
      >
        {/* ── Order Summary Card ── */}
        <div style={S.summaryCard}>
          <div style={S.sectionLabel}>Resumo do Pedido</div>

          <div style={S.summaryRow}>
            <div>
              <div style={S.docTitle}>{documentTitleFull}</div>
              <div style={S.docSubtitle}>{getDocumentTitle()}</div>
              <div style={S.deliveryLabel}>
                <Icon
                  name="Zap"
                  className="w-4 h-4"
                  style={{ color: "var(--gold)" }}
                />
                Entrega imediata via e-mail
              </div>
            </div>

            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={S.priceCurrency}>R$</span>
              <span style={S.priceDisplay}>9,90</span>
            </div>
          </div>

          {/* Decorative accent line */}
          <div
            style={{
              width: "100%",
              height: 2,
              marginTop: 16,
              borderRadius: 2,
              background:
                "linear-gradient(90deg, var(--coral), var(--gold), transparent)",
              opacity: 0.15,
            }}
          />
        </div>

        {/* ── Payment Methods Card ── */}
        <div style={S.paymentCard}>
          <div style={S.sectionLabel}>Forma de Pagamento</div>

          <div role="radiogroup" aria-label="Forma de pagamento" aria-orientation="vertical" style={{ display: "flex", flexDirection: "column" }}>
            {PAYMENT_METHODS.map((method, idx) => (
              <PaymentOption key={method.id} method={method} index={idx} total={PAYMENT_METHODS.length} />
            ))}
          </div>
        </div>

        {/* ── Pay Button ── */}
        <PayButton />

        {/* ── Security Badge ── */}
        <div style={S.securityBadge}>
          <Icon
            name="Shield"
            className="w-4 h-4"
            style={{ color: "var(--text-faint)" }}
          />
          <span style={S.securityText}>
            Pagamento seguro processado por Mercado Pago
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
