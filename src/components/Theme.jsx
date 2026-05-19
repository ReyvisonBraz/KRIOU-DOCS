/**
 * ============================================
 * KRIOU DOCS - Theme Configuration
 * ============================================
 * Design direction: Luxury Refined + Bold Editorial
 *
 * Physical scene: A professional working from home or office,
 * natural light by day, warm ambient lighting at night.
 * Mood: focused, confident, authoritative.
 *
 * Color strategy: Deep navy as anchor, coral as energetic accent,
 * warm gold for prestige touches. Teal reserved for success/positive states.
 * ============================================
 */

import React, { createContext, useContext, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Fonte da verdade: src/index.css :root
// Estes valores DEVEM ser idênticos aos do index.css
export const colors = {
  navy:         "#090914",
  navyLight:    "#111127",
  base:         "#14142B",
  surface:      "#1A1A36",
  surface2:     "#212145",
  surface3:     "#2A2A52",

  coral:        "#F43F5E",
  coralHover:   "#FB7185",
  coralMuted:   "rgba(244,63,94,0.12)",

  gold:         "#D4AF37",
  goldMuted:    "rgba(212,175,55,0.10)",

  teal:         "#14B8A6",
  tealMuted:    "rgba(20,184,166,0.10)",

  text:         "#E8E8F0",
  textDim:      "#A0A0B8",
  textMuted:    "#6B6B88",
  textFaint:    "#6B6B99",

  border:       "#2A2A4D",
  borderHover:  "#3D3D66",

  success:      "#10B981",
  warning:      "#F59E0B",
  danger:       "#EF4444",
};

export const fonts = {
  display: "'Outfit', system-ui, sans-serif",
  body:    "'Plus Jakarta Sans', system-ui, sans-serif",
};

export const radii = {
  sm:    "10px",
  md:    "14px",
  lg:    "20px",
  xl:    "24px",
  full:  "9999px",
};

export const shadows = {
  card:       "0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)",
  elevated:   "0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.2)",
  button:     "0 2px 8px rgba(244,63,94,0.25)",
  buttonHover:"0 6px 24px rgba(244,63,94,0.35)",
  glow:       "0 0 40px rgba(244,63,94,0.15)",
};

export const theme = { colors, fonts, radii, shadows };

// ─── Theme Context ─────────────────────────────────────────────────────────────
const ThemeContext = createContext(theme);
export const useTheme = () => useContext(ThemeContext);

// ─── CSS variable injection ────────────────────────────────────────────────────
function buildCSSVariables(vars, prefix = "") {
  return Object.entries(vars)
    .map(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        return buildCSSVariables(value, `${prefix}${key}-`);
      }
      return `  --${prefix}${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value};`;
    })
    .join("\n");
}

// ─── ThemeProvider ─────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    const cssVars = buildCSSVariables(theme.colors, "");
    const style = document.createElement("style");
    style.textContent = `:root {\n${cssVars}\n}`;
    style.setAttribute("data-theme-inject", "");
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
