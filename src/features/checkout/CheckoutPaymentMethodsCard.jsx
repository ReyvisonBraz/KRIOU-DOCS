import PaymentMethodOption from "./PaymentMethodOption";

export default function CheckoutPaymentMethodsCard({
  styles: S,
  methods,
  selectedPayment,
  onSelectPayment,
}) {
  return (
    <div style={S.paymentCard}>
      <div style={S.sectionLabel}>Forma de Pagamento</div>

      <div
        role="radiogroup"
        aria-label="Forma de pagamento"
        aria-orientation="vertical"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {methods.map((method, index) => (
          <PaymentMethodOption
            key={method.id}
            styles={S}
            method={method}
            index={index}
            total={methods.length}
            methods={methods}
            selectedPayment={selectedPayment}
            onSelectPayment={onSelectPayment}
          />
        ))}
      </div>
    </div>
  );
}
