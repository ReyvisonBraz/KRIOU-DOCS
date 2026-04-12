/**
 * ============================================
 * KRIOU DOCS - Theme Config
 * ============================================
 * Centralized theme references and provider.
 * Actual CSS is handled by Tailwind v4 in index.css.
 */

import React from "react";

// ─── Configuração do Tema Exportada (para uso em JS caso necessário) ───
export const theme = {
  colors: {
    navy: "#0F0F1E",
    navyLight: "#1A1A2E",
    blue: "#0F3460",
    coral: "#E94560",
    coralLight: "#FF6B81",
    purple: "#533483",
    teal: "#00D2D3",
    gold: "#F9A825",
    surface: "#16162A",
    surface2: "#1E1E36",
    surface3: "#26264A",
    text: "#F0F0F5",
    textMuted: "#8888A8",
    border: "#2A2A4A",
    success: "#00C897",
  },
  fonts: {
    display: "'Outfit', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
};

// ─── Componente Provider do Tema ───
export const ThemeProvider = ({ children }) => {
  return (
    <div className="theme-provider-root">
      {children}
    </div>
  );
};