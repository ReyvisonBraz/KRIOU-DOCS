import { Icon } from "../../components/Icons";

export default function CheckoutOrderSummary({
  styles: S,
  documentTitle,
  documentSubtitle,
}) {
  return (
    <div style={S.summaryCard}>
      <div style={S.sectionLabel}>Resumo do Pedido</div>

      <div style={S.summaryRow}>
        <div>
          <div style={S.docTitle}>{documentTitle}</div>
          <div style={S.docSubtitle}>{documentSubtitle}</div>
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
  );
}
