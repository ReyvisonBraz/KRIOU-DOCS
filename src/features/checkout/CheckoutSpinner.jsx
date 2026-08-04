export default function CheckoutSpinner() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "2.5px solid color-mix(in srgb, var(--on-action) 28%, transparent)",
        borderTopColor: "var(--on-action)",
        animation: "ck-spin 0.7s linear infinite",
      }}
    />
  );
}
