import { useState } from "react";

export default function PaymentMethodOption({
  styles: S,
  method,
  index = 0,
  total = 1,
  methods,
  selectedPayment,
  onSelectPayment,
}) {
  const isSelected = selectedPayment === method.id;
  const [hover, setHover] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectPayment(method.id);
      return;
    }
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const next = (index + 1) % total;
      const nextEl = document.querySelector(`[data-payment-index="${next}"]`);
      nextEl?.focus();
      if (nextEl) onSelectPayment(methods[next].id);
      return;
    }
    if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      const prev = (index - 1 + total) % total;
      const prevEl = document.querySelector(`[data-payment-index="${prev}"]`);
      prevEl?.focus();
      if (prevEl) onSelectPayment(methods[prev].id);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      data-payment-index={index}
      onClick={() => onSelectPayment(method.id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...S.optionBase,
        ...(isSelected ? S.optionSelected : {}),
        ...(hover && !isSelected
          ? { border: "1.5px solid var(--border-hover)", background: "var(--surface-3)" }
          : {}),
      }}
      onFocus={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border = "1.5px solid var(--border-hover)";
          e.currentTarget.style.background = "var(--surface-3)";
        }
      }}
      onBlur={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border = "1.5px solid var(--border)";
          e.currentTarget.style.background = "var(--surface-2)";
        }
      }}
    >
      <div
        style={{
          ...S.optionIconBox,
          ...(isSelected ? S.optionIconBoxSelected : {}),
        }}
      >
        <span style={{ fontSize: 22 }}>{method.icon}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={S.optionLabel}>{method.label}</span>
          {method.badge && (
            <span style={S.badgeRecommended}>{method.badge}</span>
          )}
        </div>
        <span style={S.optionDesc}>{method.desc}</span>
      </div>

      <div
        style={{
          ...S.radioOuter,
          ...(isSelected ? S.radioOuterSelected : {}),
        }}
      >
        {isSelected && <div style={S.radioInner} />}
      </div>
    </div>
  );
}
