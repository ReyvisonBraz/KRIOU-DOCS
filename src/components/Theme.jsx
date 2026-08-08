/**
 * ============================================
 * KRIOU DOCS - Theme Provider
 * ============================================
 * Alterna entre tema escuro (padrão) e claro.
 *
 * A preferência é persistida em localStorage sob a chave `kriou_theme`
 * e aplicada como atributo `data-theme` no <html>.
 *
 * IMPORTANTE — onde ficam as cores:
 *   A fonte da verdade da paleta é `src/index.css`, em :root e
 *   :root[data-theme="light"]. Este arquivo NÃO declara cores.
 *   Componentes consomem via `var(--surface)` ou pelas classes Tailwind
 *   equivalentes, que apontam para as mesmas variáveis.
 *
 *   Cores de documento (--doc-*) são deliberadamente fixas: o preview de
 *   contrato e as miniaturas de template precisam ter a mesma aparência
 *   nos dois temas.
 *
 * O tema inicial é aplicado por um script inline em `index.html`, antes
 * da primeira pintura, para não haver flash. Este provider cuida apenas
 * da alternância em tempo de execução.
 * ============================================
 */

import React, { useEffect, useMemo, useState } from "react";
import { THEME_STORAGE_KEY, ThemeContext } from "./themeContext";

export { THEME_STORAGE_KEY };

// Cor da barra do navegador no celular, por tema.
// Deve espelhar --navy de src/index.css e o script inline de index.html.
const THEME_COLORS = {
  dark:  "#090914",
  light: "#F5F7FA",
};

const readStoredMode = () => {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage?.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(readStoredMode);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;

    // Barra do navegador no celular. O valor inicial já é aplicado pelo
    // script inline em index.html; aqui só acompanhamos a alternância.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[mode]);

    try {
      window.localStorage?.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* localStorage bloqueado: o tema ainda funciona nesta sessão */
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      setMode,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
