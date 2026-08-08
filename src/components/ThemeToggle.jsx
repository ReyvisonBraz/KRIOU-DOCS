/**
 * ============================================
 * KRIOU DOCS - ThemeToggle
 * ============================================
 * Botão de alternância entre tema claro/escuro.
 * Posicionado no topo (navbar), com destaque de cor
 * para chamar a atenção do cliente.
 */

import React from "react";
import { useTheme } from "./themeContext";
import { Icon } from "./Icons";

export const ThemeToggle = ({ variant = "navbar", className = "", label = true }) => {
  const { isDark, toggleMode } = useTheme();
  const nextLabel = isDark ? "Ativar tema claro" : "Ativar tema escuro";
  const IconComponent = isDark ? "Sun" : "Moon";

  if (variant === "landing") {
    return (
      <button
        type="button"
        onClick={toggleMode}
        aria-label={nextLabel}
        title={nextLabel}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold cursor-pointer
          bg-gold text-white shadow-[0_2px_12px_rgba(212,175,55,0.4)]
          hover:bg-gold/90 hover:shadow-[0_4px_18px_rgba(212,175,55,0.5)]
          active:scale-[0.97] transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
          touch-target ${className}`}
      >
        <Icon name={IconComponent} className="w-4 h-4" />
        {label && <span>{isDark ? "Claro" : "Escuro"}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={nextLabel}
      title={nextLabel}
      className={`inline-flex items-center justify-center rounded-xl cursor-pointer
        bg-coral text-white shadow-[0_2px_10px_rgba(244,63,94,0.35)]
        hover:bg-coral-hover hover:shadow-[0_4px_18px_rgba(244,63,94,0.45)]
        active:scale-95 transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
        touch-target ${className}`}
    >
      <Icon name={IconComponent} className="w-5 h-5" />
    </button>
  );
};

export default ThemeToggle;
