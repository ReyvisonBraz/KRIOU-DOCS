import React from "react";
import { Icon } from "../../components/Icons";
import { AppNavbar } from "../../components/UI";
import CheckoutSpinner from "./CheckoutSpinner";

export default function PaymentWaitingScreen({
  styles: S,
  keyframes,
  paymentError,
  isCheckingPayment,
  onGoToDashboard,
  onOpenPendingCheckout,
  canOpenPendingCheckout,
  onCheckPendingPayment,
}) {
  return (
    <div style={S.page}>
      <style>{keyframes}</style>
      <AppNavbar
        title="Aguardando pagamento"
        leftAction={
          <button
            onClick={onGoToDashboard}
            aria-label="Ir ao dashboard"
            style={S.backBtn}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      <div
        style={{
          ...S.container,
          animation: "ck-fadeSlideUp 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
          marginTop: 48,
        }}
      >
        <div style={{ ...S.summaryCard, textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              margin: "0 auto 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.28)",
              color: "var(--gold)",
            }}
          >
            <Icon name="Clock" className="w-9 h-9" />
          </div>

          <div style={S.sectionLabel}>Pagamento em andamento</div>
          <h1 style={{ ...S.successTitle, marginBottom: 10 }}>Aguardando pagamento</h1>
          <p style={S.successDetail}>
            Conclua o pagamento na aba segura do Mercado Pago. Esta tela verifica automaticamente
            a aprovação e libera o PDF assim que o Mercado Pago confirmar.
          </p>

          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 16,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.6,
              textAlign: "left",
            }}
          >
            <div style={{ color: "var(--text)", fontWeight: 800, marginBottom: 6 }}>
              O que acontece agora
            </div>
            <div>1. Escolha Pix ou cartão dentro do checkout do Mercado Pago.</div>
            <div>2. Depois de pagar, aguarde esta tela atualizar.</div>
            <div>3. Se a aba não abriu, use o botão abaixo para abrir novamente.</div>
          </div>

          {paymentError && (
            <div
              role="alert"
              style={{
                marginTop: 16,
                padding: "12px 14px",
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: 10,
                background: "rgba(239,68,68,0.08)",
                color: "var(--error, #ef4444)",
                fontSize: 14,
                lineHeight: 1.5,
                textAlign: "left",
              }}
            >
              {paymentError}
            </div>
          )}

          <div style={{ ...S.successActions, marginTop: 24 }}>
            {canOpenPendingCheckout && (
              <button onClick={onOpenPendingCheckout} style={S.successBtnPrimary}>
                <Icon name="ExternalLink" className="w-5 h-5" />
                Abrir checkout novamente
              </button>
            )}
            <button
              onClick={onCheckPendingPayment}
              disabled={isCheckingPayment}
              style={{
                ...S.successBtnSecondary,
                opacity: isCheckingPayment ? 0.7 : 1,
                cursor: isCheckingPayment ? "not-allowed" : "pointer",
              }}
            >
              {isCheckingPayment ? <CheckoutSpinner /> : <Icon name="RefreshCw" className="w-5 h-5" />}
              Verificar agora
            </button>
          </div>

          <button
            onClick={onGoToDashboard}
            style={{
              marginTop: 16,
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            Ver no dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
