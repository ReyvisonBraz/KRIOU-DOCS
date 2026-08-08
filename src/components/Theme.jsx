/**
 * ============================================
 * KRIOU DOCS - Theme Configuration
 * ============================================
 * Design direction: Luxury Refined + Bold Editorial
 *
 * Suporta tema escuro (padrão) e tema claro.
 * A preferência é persistida em localStorage (kriou_theme)
 * e aplicada via atributo data-theme no <html>.
 * ============================================
 */

import React, { useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, ThemeContext } from "./themeContext";

export { THEME_STORAGE_KEY };

// ─── Tema escuro (padrão) ────────────────────────────────────────────────────
const darkColors = {
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

// ─── Tema claro ──────────────────────────────────────────────────────────────
const lightColors = {
  navy:         "#F5F7FA",
  navyLight:    "#EEF2F6",
  base:         "#E4E9F0",
  surface:      "#FFFFFF",
  surface2:     "#EEF2F6",
  surface3:     "#E4E9F0",

  coral:        "#C93659",
  coralHover:   "#A92545",
  coralMuted:   "rgba(201,54,89,0.10)",

  gold:         "#8A6510",
  goldMuted:    "rgba(138,101,16,0.10)",

  teal:         "#0F766E",
  tealMuted:    "rgba(15,118,110,0.10)",

  text:         "#182230",
  textDim:      "#475467",
  textMuted:    "#5F697B",
  textFaint:    "#5F697B",

  border:       "#D0D5DD",
  borderHover:  "#98A2B3",

  success:      "#0F766E",
  warning:      "#B54708",
  danger:       "#B42318",
};

const fonts = {
  display: "'Outfit', system-ui, sans-serif",
  body:    "'Plus Jakarta Sans', system-ui, sans-serif",
};

const radii = {
  sm:    "10px",
  md:    "14px",
  lg:    "20px",
  xl:    "24px",
  full:  "9999px",
};

const shadows = {
  card:       "0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)",
  elevated:   "0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.2)",
  button:     "0 2px 8px rgba(244,63,94,0.25)",
  buttonHover:"0 6px 24px rgba(244,63,94,0.35)",
  glow:       "0 0 40px rgba(244,63,94,0.15)",
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "dark";
    try {
      return window.localStorage?.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const isDark = mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(() => {
    const theme = { colors, fonts, radii, shadows };
    return {
      ...theme,
      mode,
      isDark,
      colors,
      setMode,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    };
  }, [mode, isDark, colors]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
