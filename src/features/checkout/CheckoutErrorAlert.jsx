export default function CheckoutErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        marginTop: 12,
        padding: "12px 14px",
        border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: 10,
        background: "rgba(239,68,68,0.08)",
        color: "var(--error, #ef4444)",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {message}
    </div>
  );
}
