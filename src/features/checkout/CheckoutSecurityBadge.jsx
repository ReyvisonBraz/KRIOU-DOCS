import { Icon } from "../../components/Icons";

export default function CheckoutSecurityBadge({ styles: S }) {
  return (
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
  );
}
