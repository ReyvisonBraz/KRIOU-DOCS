/**
 * ============================================
 * KRIOU DOCS - Checkout Page Component
 * ============================================
 * Payment page with method selection and
 * order summary for document purchase.
 * Supports both resume and legal documents.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import { PAYMENT_METHODS } from "../data/constants";
import { usePDF } from "../hooks/usePDF";
import showToast from "../utils/toast";

/**
 * CheckoutPage - Payment flow for document purchase
 */
const CheckoutPage = () => {
  const { navigate, selectedTemplate, formData, phone, checkoutComplete, setCheckoutComplete, documentType, legalFormData, selectedVariant, disabledFields } = useApp();
  const [selectedPayment, setSelectedPayment] = useState("pix");
  const { generatePDF, isGenerating } = usePDF();

  // Check if processing a legal document
  const isLegalDocument = !!documentType;

  /**
   * Payment price
   */
  const price = "R$ 9,90";

  /**
   * Handle payment completion
   */
  const handlePayment = () => {
    setCheckoutComplete(true);
    showToast.success("Pagamento confirmado! Seu documento está sendo gerado.");
  };

  /**
   * Handle return to dashboard
   */
  const handleGoToDashboard = () => {
    setCheckoutComplete(false);
    navigate("dashboard");
  };

  /**
   * Handle PDF download — gerado em Web Worker (não trava a UI)
   */
  const handleDownloadPDF = async () => {
    try {
      if (isLegalDocument) {
        await generatePDF({ type: "GENERATE_LEGAL", formData: legalFormData, docType: documentType, disabledFields: disabledFields || {}, variantId: selectedVariant || null });
      } else {
        await generatePDF({ type: "GENERATE_RESUME", formData, template: selectedTemplate });
      }
    } catch {
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  /**
   * Get display phone number or default
   */
  const getDisplayPhone = () => {
    return phone || "(11) 99999-9999";
  };

  /**
   * Get document title or default
   */
  const getDocumentTitle = () => {
    if (isLegalDocument) {
      return documentType?.name || "Documento Jurídico";
    }
    return formData.nome || "Currículo";
  };

  /**
   * Get document type label
   */
  const getDocumentTypeLabel = () => {
    return isLegalDocument ? "Documento Jurídico" : "Currículo";
  };

  // ─── Estado de Sucesso do Pagamento ───
  if (checkoutComplete) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="animate-scaleIn" style={{ textAlign: "center", maxWidth: 480 }}>
          {/* Success Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(0,200,151,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Icon name="Check" className="w-10 h-10" style={{ color: "var(--success)" }} />
          </div>

          {/* Title */}
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            Pagamento Confirmado! 🎉
          </h1>

          {/* Subtitle */}
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}>
            Seu {getDocumentTypeLabel().toLowerCase()} está sendo gerado...
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
            Você receberá o PDF no seu WhatsApp em instantes.
          </p>

          {/* WhatsApp Delivery Card */}
          <Card style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
              <Icon name="MessageCircle" className="w-6 h-6" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Enviando via WhatsApp</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{getDisplayPhone()}</div>
              </div>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "3px solid var(--success)",
                  borderTopColor: "transparent",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button variant="primary" onClick={handleGoToDashboard}>
              Ir ao Dashboard
            </Button>
            <Button variant="secondary" icon="Download" onClick={handleDownloadPDF}>
              Baixar PDF
            </Button>
          </div>

          {/* Spin Animation */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ─── Estado do Formulário de Pagamento ───
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Top Navigation Bar ─── */}
      <AppNavbar
        title={`Checkout — ${isLegalDocument ? "Documento Jurídico" : "Currículo"}`}
        leftAction={
          <button
            onClick={() => navigate("preview")}
            aria-label="Voltar ao preview"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6 }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      {/* ─── Checkout Content ─── */}
      <div className="checkout-container" style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
        <div className="animate-fadeUp">
          {/* Order Summary */}
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Resumo do Pedido</h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 16,
                background: "var(--surface-2)",
                borderRadius: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {isLegalDocument 
                    ? documentType?.name || "Documento Jurídico" 
                    : `Currículo — ${selectedTemplate?.name || "Modelo"}`}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{getDocumentTitle()}</div>
              </div>
              <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "var(--coral)" }}>
                {price}
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="animate-fadeUp delay-1" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Forma de Pagamento</h3>
            {PAYMENT_METHODS.map((method, index) => (
              <label
                key={method.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 14,
                  background: selectedPayment === method.id ? "var(--surface-3)" : "var(--surface-2)",
                  borderRadius: 10,
                  marginBottom: 8,
                  cursor: "pointer",
                  border: selectedPayment === method.id ? "1.5px solid var(--coral)" : "1px solid var(--border)",
                  transition: "all .2s",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  style={{ accentColor: "var(--coral)" }}
                />
                <span style={{ fontSize: 20 }}>{method.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{method.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{method.desc}</div>
                </div>
                {method.badge && (
                  <span
                    style={{
                      background: "var(--coral)",
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {method.badge}
                  </span>
                )}
              </label>
            ))}
          </Card>

          {/* Pay Button */}
          <Button
            variant="primary"
            className="animate-fadeUp delay-2"
            style={{ width: "100%", padding: 18, fontSize: 17 }}
            icon="CreditCard"
            iconPosition="right"
            onClick={handlePayment}
          >
            Pagar {price}
          </Button>

          {/* Security Note */}
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
            🔒 Pagamento seguro processado por Mercado Pago
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;