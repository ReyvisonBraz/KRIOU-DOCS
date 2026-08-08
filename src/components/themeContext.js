/**
 * ============================================
 * KRIOU DOCS - Theme Context
 * ============================================
 * Contexto e hook useTheme compartilhados entre
 * ThemeProvider (Theme.jsx) e ThemeToggle.
 */

import { createContext, useContext } from "react";

export const THEME_STORAGE_KEY = "kriou_theme";

export const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return ctx;
};
