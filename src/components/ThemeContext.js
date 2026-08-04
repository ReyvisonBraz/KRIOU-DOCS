import { createContext, useContext } from "react";

export const THEME_STORAGE_KEY = "kriou_theme";
export const ThemeContext = createContext(null);

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return value;
};
