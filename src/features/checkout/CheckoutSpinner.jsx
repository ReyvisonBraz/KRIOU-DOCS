export default function CheckoutSpinner() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "2.5px solid rgba(255,255,255,0.25)",
        borderTopColor: "#fff",
        animation: "ck-spin 0.7s linear infinite",
      }}
    />
  );
}
