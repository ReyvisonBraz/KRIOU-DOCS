export default function CheckoutSpinner() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        // currentColor: o spinner aparece tanto sobre o botao coral
        // (texto branco) quanto sobre o botao de superficie (texto escuro
        // no tema claro). Cor fixa sumiria em um dos dois.
        border: "2.5px solid currentColor",
        borderTopColor: "transparent",
        animation: "ck-spin 0.7s linear infinite",
      }}
    />
  );
}
