import React from "react";
import { Toaster } from "sonner";
import { useTheme } from "../ThemeContext";

/** Região global de notificações, alinhada ao tema e à navegação móvel. */
export const AppToaster = () => {
  const { mode } = useTheme();

  return (
    <Toaster
      theme={mode}
      position="bottom-center"
      closeButton
      richColors
      visibleToasts={3}
      duration={4000}
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: "calc(72px + env(safe-area-inset-bottom, 0px))", left: 16, right: 16 }}
      containerAriaLabel="Notificações"
      toastOptions={{
        closeButtonAriaLabel: "Fechar notificação",
        style: {
          background: "var(--surface)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-control)",
          boxShadow: "var(--shadow-elevated)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
        },
        actionButtonStyle: {
          minHeight: 36,
          background: "var(--action-primary)",
          color: "var(--on-action)",
        },
      }}
    />
  );
};

export default AppToaster;
