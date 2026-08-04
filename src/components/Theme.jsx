import React, { useEffect, useMemo, useState } from "react";
import { ThemeContext, THEME_STORAGE_KEY } from "./ThemeContext";

const colors = {
  navy: "#F5F7FA", navyLight: "#EEF2F6", base: "#E4E9F0",
  surface: "#FFFFFF", surface2: "#EEF2F6", surface3: "#E4E9F0",
  coral: "#C93659", coralHover: "#A92545", coralMuted: "rgba(201,54,89,0.10)",
  gold: "#8A6510", goldMuted: "rgba(138,101,16,0.10)",
  teal: "#0F766E", tealMuted: "rgba(15,118,110,0.10)",
  text: "#182230", textDim: "#475467", textMuted: "#5F697B", textFaint: "#5F697B",
  border: "#D0D5DD", borderHover: "#98A2B3",
  success: "#0F766E", warning: "#B54708", danger: "#B42318",
};

const fonts = {
  display: "'Outfit', system-ui, sans-serif",
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
};

const radii = { sm: "10px", md: "14px", lg: "20px", xl: "24px", full: "9999px" };
const shadows = {
  card: "0 1px 2px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.06)",
  elevated: "0 12px 40px rgba(15,23,42,0.12)",
  button: "0 4px 12px rgba(225,29,72,0.18)",
  buttonHover: "0 8px 24px rgba(225,29,72,0.24)",
  glow: "0 0 40px rgba(225,29,72,0.10)",
};

const baseTheme = { colors, fonts, radii, shadows };
function initialMode() {
  if (typeof window === "undefined") return "light";
  return window.localStorage?.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    window.localStorage?.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(() => ({
    ...baseTheme,
    mode,
    isDark: mode === "dark",
    setMode,
    toggleMode: () => setMode((current) => current === "light" ? "dark" : "light"),
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
