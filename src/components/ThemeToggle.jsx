import React from "react";
import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleMode } = useTheme();
  const nextTheme = isDark ? "claro" : "escuro";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={`Ativar tema ${nextTheme}`}
      title={`Ativar tema ${nextTheme}`}
      style={{
        position: "fixed", right: 16, bottom: "calc(18px + env(safe-area-inset-bottom, 0px))", zIndex: 250,
        width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 14,
        border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)",
        boxShadow: "var(--shadow-elevated)", cursor: "pointer", fontSize: 19,
        transition: "transform 0.2s ease, background 0.2s ease, border-color 0.2s ease",
      }}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50"
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
};

export default ThemeToggle;
