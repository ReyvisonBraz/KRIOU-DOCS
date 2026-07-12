import { Icon } from "../../components/Icons";

export default function PaymentSuccessScreen({
  styles: S,
  keyframes,
  documentTypeLabel,
  displayEmail,
  onGoToDashboard,
  onDownloadPDF,
}) {
  return (
    <div style={S.successWrapper}>
      <style>{keyframes}</style>
      <div
        style={{
          ...S.successInner,
          animation: "ck-fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        }}
      >
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
          Seu {documentTypeLabel.toLowerCase()} está sendo gerado...
        </p>
        <p style={S.successDetail}>
          Você já pode baixar o PDF do seu documento.
        </p>

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
            <div style={S.emailValue}>{displayEmail}</div>
          </div>
        </div>

        <div style={S.successActions}>
          <button
            onClick={onGoToDashboard}
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
            onClick={onDownloadPDF}
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
