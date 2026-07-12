import { useState } from "react";
import { Icon } from "../../components/Icons";
import CheckoutSpinner from "./CheckoutSpinner";

export default function CheckoutPayButton({
  styles: S,
  price,
  isProcessing,
  onPay,
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onPay}
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
          <CheckoutSpinner />
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
}
