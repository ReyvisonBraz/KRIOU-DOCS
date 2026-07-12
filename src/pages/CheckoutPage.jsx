import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { AppNavbar, ConfirmDialog } from "../components/UI";
import { PAYMENT_METHODS } from "../data/constants";
import { usePDF } from "../hooks/usePDF";
import { useConfirm } from "../hooks/useConfirm";
import { sanitizeFormData } from "../utils/sanitization";
import PaymentSuccessScreen from "../features/checkout/PaymentSuccessScreen";
import PaymentWaitingScreen from "../features/checkout/PaymentWaitingScreen";
import CheckoutPayButton from "../features/checkout/CheckoutPayButton";
import PaymentMethodOption from "../features/checkout/PaymentMethodOption";
import { useCheckoutFlow } from "../features/checkout/useCheckoutFlow";
import { usePaidDocumentEditFlow } from "../features/checkout/usePaidDocumentEditFlow";
import { PaymentService } from "../services/PaymentService";
import showToast from "../utils/toast";

const PAYMENT_MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_PAYMENT_MOCK === "true";
const CHECKOUT_PAYMENT_METHODS = PAYMENT_METHODS.filter((method) => method.id === "pix" || method.id === "card");

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
    userId,
    setUserDocuments,
  } = useApp();

  const [selectedPayment, setSelectedPayment] = useState("pix");
  const { generatePDF } = usePDF();
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const {
    isProcessing,
    setIsProcessing,
    isCheckingPayment,
    paymentError,
    setPaymentError,
    pendingPayment,
    clearPendingPayment,
    persistPendingPayment,
    checkPendingPayment,
    handleOpenPendingCheckout,
  } = useCheckoutFlow({
    userId,
    checkoutComplete,
    setCheckoutComplete,
    setEditingDocId,
    setUserDocuments,
  });

  const isLegalDocument = !!documentType;
  const price = "R$ 9,90";

  const { handlePaidDocumentEdit } = usePaidDocumentEditFlow({
    isLegalDocument,
    documentType,
    editingDocId,
    userId,
    updateDocument,
    requestConfirm,
    setCheckoutComplete,
    setEditingDocId,
    setPaymentError,
    setUserDocuments,
    clearPendingPayment,
  });

  const getDisplayEmail = () => email || "seu e-mail";
  const getDocumentTitle = () => {
    if (isLegalDocument) return documentType?.name || "Documento Jur\u00eddico";
    return formData.nome || "Curr\u00edculo";
  };
  const getDocumentTypeLabel = () =>
    isLegalDocument ? "Documento Jur\u00eddico" : "Curr\u00edculo";

  const handlePayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);
    let checkoutWindow = null;
    try {
      const docData = sanitizeFormData(isLegalDocument ? legalFormData : formData);
      if (editingDocId) {
        const handledAsPaidEdit = await handlePaidDocumentEdit(docData);
        if (handledAsPaidEdit) {
          return;
        }
      }

      let savedDoc;
      if (editingDocId) {
        await updateDocument(editingDocId, docData, { status: "aguardando_pagamento" });
        setEditingDocId(null);
        savedDoc = { id: editingDocId };
      } else {
        savedDoc = await saveDocument(docData, { status: "aguardando_pagamento" });
      }

      if (PAYMENT_MOCK_ENABLED) {
        setCheckoutComplete(true);
        showToast.info("Pagamento simulado: recurso exclusivo do ambiente local.");
        return;
      }

      checkoutWindow = window.open("", "_blank");
      const preference = await PaymentService.createPreference(savedDoc?.id);

      if (!preference?.init_point) {
        throw new Error("O provedor não retornou a URL de pagamento");
      }

      const pending = {
        documentId: savedDoc?.id,
        initPoint: preference.init_point,
        preferenceId: preference.preference_id,
        userId,
        payerEmail: email || null,
        createdAt: new Date().toISOString(),
      };

      persistPendingPayment(pending);

      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.href = preference.init_point;
      } else {
        setPaymentError("O navegador bloqueou a nova aba. Use o botão 'Abrir checkout novamente' abaixo.");
      }
    } catch (err) {
      checkoutWindow?.close();
      console.error("[CheckoutPage][ERRO] handlePayment:", err);
      setPaymentError(err.message || "Erro ao processar pagamento. Tente novamente.");
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
  if (checkoutComplete) {
    return (
      <PaymentSuccessScreen
        styles={S}
        keyframes={KEYFRAMES}
        documentTypeLabel={getDocumentTypeLabel()}
        displayEmail={getDisplayEmail()}
        onGoToDashboard={handleGoToDashboard}
        onDownloadPDF={handleDownloadPDF}
      />
    );
  }

  /* MAIN CHECKOUT */
  if (pendingPayment) {
    return (
      <PaymentWaitingScreen
        styles={S}
        keyframes={KEYFRAMES}
        paymentError={paymentError}
        isCheckingPayment={isCheckingPayment}
        onGoToDashboard={handleGoToDashboard}
        onOpenPendingCheckout={handleOpenPendingCheckout}
        onCheckPendingPayment={() => checkPendingPayment()}
      />
    );
  }

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
            {CHECKOUT_PAYMENT_METHODS.map((method, idx) => (
              <PaymentMethodOption
                key={method.id}
                styles={S}
                method={method}
                index={idx}
                total={CHECKOUT_PAYMENT_METHODS.length}
                methods={CHECKOUT_PAYMENT_METHODS}
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
              />
            ))}
          </div>
        </div>

        {/* ── Pay Button ── */}
        <CheckoutPayButton
          styles={S}
          price={price}
          isProcessing={isProcessing}
          onPay={handlePayment}
        />

        {paymentError && (
          <div
            role="alert"
            style={{
              marginTop: 12,
              padding: "12px 14px",
              border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              color: "var(--error, #ef4444)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {paymentError}
          </div>
        )}

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

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CheckoutPage;
