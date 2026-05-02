import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import { PAYMENT_METHODS } from "../data/constants";
import { usePDF } from "../hooks/usePDF";
import showToast from "../utils/toast";

const CheckoutPage = () => {
  const { navigate, selectedTemplate, formData, email, checkoutComplete, setCheckoutComplete, documentType, legalFormData, selectedVariant, disabledFields, saveDocument, userId, setUserDocuments } = useApp();
  const [selectedPayment, setSelectedPayment] = useState("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const { generatePDF } = usePDF();

  const isLegalDocument = !!documentType;
  const price = "R$ 9,90";

  const getDisplayEmail = () => email || "seu e-mail";
  const getDocumentTitle = () => {
    if (isLegalDocument) return documentType?.name || "Documento Jurídico";
    return formData.nome || "Currículo";
  };
  const getDocumentTypeLabel = () => isLegalDocument ? "Documento Jurídico" : "Currículo";

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const docData = isLegalDocument ? legalFormData : formData;
      await saveDocument(docData);
    } catch (err) {
      console.error("[CheckoutPage][ERRO] Falha ao salvar documento:", err);
    }
    setCheckoutComplete(true);
    setIsProcessing(false);
    showToast.success("Pagamento confirmado! Seu documento está sendo gerado.");
  };

  const handleGoToDashboard = () => {
    setCheckoutComplete(false);
    navigate("dashboard");
  };

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

  const PaymentOption = ({ method }) => {
    const isSelected = selectedPayment === method.id;
    return (
      <div
        onClick={() => setSelectedPayment(method.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: 16,
          background: isSelected ? "var(--surface-3)" : "var(--surface-2)",
          borderRadius: 14,
          marginBottom: 10,
          cursor: "pointer",
          border: isSelected ? "2px solid var(--coral)" : "1.5px solid var(--border)",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: isSelected ? "rgba(233,69,96,0.1)" : "var(--surface-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}>
          <span style={{ fontSize: 22 }}>{method.icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{method.label}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{method.desc}</div>
        </div>
        <div style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: isSelected ? "2px solid var(--coral)" : "2px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}>
          {isSelected && (
            <div style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "var(--coral)",
            }} />
          )}
        </div>
      </div>
    );
  };

  if (checkoutComplete) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--surface-1)" }}>
        <div className="animate-scaleIn" style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "rgba(0,200,151,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <Icon name="CheckCircle" className="w-12 h-12" style={{ color: "var(--success)" }} />
          </div>

          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>
            Pagamento Confirmado!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}>
            Seu {getDocumentTypeLabel().toLowerCase()} está sendo gerado...
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>
            Você já pode baixar o PDF do seu documento.
          </p>

          <Card style={{ padding: 24, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
              <Icon name="Mail" className="w-6 h-6" style={{ color: "var(--teal)" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Confirmação enviada para</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{getDisplayEmail()}</div>
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="secondary" icon="Home" onClick={handleGoToDashboard}>
              Ir ao Dashboard
            </Button>
            <Button variant="primary" icon="Download" onClick={handleDownloadPDF}>
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-1)" }}>
      <AppNavbar
        title={`Checkout — ${isLegalDocument ? "Documento Jurídico" : "Currículo"}`}
        leftAction={
          <button
            onClick={() => navigate("preview")}
            aria-label="Voltar ao preview"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8, borderRadius: 8 }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 24px" }}>
        <div className="animate-fadeUp">
          <Card style={{ marginBottom: 20, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
              RESUMO DO PEDIDO
            </h3>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              background: "var(--surface-2)",
              borderRadius: 14,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {isLegalDocument 
                    ? documentType?.name || "Documento Jurídico" 
                    : `Currículo — ${selectedTemplate?.name || "Modelo"}`}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {getDocumentTitle()}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Entrega imediata via e-mail
                </div>
              </div>
              <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: "var(--coral)" }}>
                {price}
              </div>
            </div>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text-muted)" }}>
              FORMA DE PAGAMENTO
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PAYMENT_METHODS.map((method) => (
                <PaymentOption key={method.id} method={method} />
              ))}
            </div>
          </Card>

          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={isProcessing}
            style={{ 
              width: "100%", 
              padding: 18, 
              fontSize: 16,
              marginTop: 20,
              gap: 10,
            }}
            icon={isProcessing ? undefined : "CreditCard"}
            iconPosition="right"
          >
            {isProcessing ? (
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  animation: "spin 0.8s linear infinite",
                }} />
                Processando...
              </span>
            ) : (
              `Pagar ${price}`
            )}
          </Button>

          <div style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}>
            <Icon name="Shield" className="w-4 h-4" style={{ color: "var(--success)" }} />
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Pagamento seguro processado por Mercado Pago
            </p>
          </div>

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
