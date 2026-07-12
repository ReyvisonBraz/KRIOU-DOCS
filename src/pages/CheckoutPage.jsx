import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { AppNavbar, ConfirmDialog } from "../components/UI";
import { PAYMENT_METHODS } from "../data/constants";
import { usePDF } from "../hooks/usePDF";
import { useConfirm } from "../hooks/useConfirm";
import PaymentSuccessScreen from "../features/checkout/PaymentSuccessScreen";
import PaymentWaitingScreen from "../features/checkout/PaymentWaitingScreen";
import CheckoutPayButton from "../features/checkout/CheckoutPayButton";
import CheckoutOrderSummary from "../features/checkout/CheckoutOrderSummary";
import CheckoutErrorAlert from "../features/checkout/CheckoutErrorAlert";
import CheckoutSecurityBadge from "../features/checkout/CheckoutSecurityBadge";
import PaymentMethodOption from "../features/checkout/PaymentMethodOption";
import { checkoutKeyframes, checkoutStyles } from "../features/checkout/checkoutStyles";
import { useCheckoutFlow } from "../features/checkout/useCheckoutFlow";
import { usePaidDocumentEditFlow } from "../features/checkout/usePaidDocumentEditFlow";
import { useStartCheckoutPayment } from "../features/checkout/useStartCheckoutPayment";
import showToast from "../utils/toast";

const PAYMENT_MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_ENABLE_PAYMENT_MOCK === "true";
const CHECKOUT_PAYMENT_METHODS = PAYMENT_METHODS.filter((method) => method.id === "pix" || method.id === "card");
const S = checkoutStyles;
const KEYFRAMES = checkoutKeyframes;

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

  const { handlePayment } = useStartCheckoutPayment({
    isLegalDocument,
    formData,
    legalFormData,
    editingDocId,
    userId,
    email,
    saveDocument,
    updateDocument,
    setCheckoutComplete,
    setEditingDocId,
    setIsProcessing,
    setPaymentError,
    persistPendingPayment,
    handlePaidDocumentEdit,
    paymentMockEnabled: PAYMENT_MOCK_ENABLED,
  });

  const getDisplayEmail = () => email || "seu e-mail";
  const getDocumentTitle = () => {
    if (isLegalDocument) return documentType?.name || "Documento Jur\u00eddico";
    return formData.nome || "Curr\u00edculo";
  };
  const getDocumentTypeLabel = () =>
    isLegalDocument ? "Documento Jur\u00eddico" : "Curr\u00edculo";

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
        <CheckoutOrderSummary
          styles={S}
          documentTitle={documentTitleFull}
          documentSubtitle={getDocumentTitle()}
        />

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

        <CheckoutErrorAlert message={paymentError} />

        <CheckoutSecurityBadge styles={S} />
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
