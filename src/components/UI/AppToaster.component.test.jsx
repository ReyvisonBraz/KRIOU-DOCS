/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeContext } from "../ThemeContext";
import { AppToaster } from "./AppToaster";

vi.mock("sonner", () => ({
  Toaster: ({ theme, containerAriaLabel, closeButton, visibleToasts }) => (
    <div
      data-testid="toaster"
      data-theme={theme}
      data-close-button={String(closeButton)}
      data-visible-toasts={String(visibleToasts)}
      aria-label={containerAriaLabel}
    />
  ),
}));

describe("AppToaster", () => {
  it("herda o tema e limita notificações simultâneas", () => {
    render(
      <ThemeContext.Provider value={{ mode: "light" }}>
        <AppToaster />
      </ThemeContext.Provider>,
    );

    const toaster = screen.getByLabelText("Notificações");
    expect(toaster).toHaveAttribute("data-theme", "light");
    expect(toaster).toHaveAttribute("data-close-button", "true");
    expect(toaster).toHaveAttribute("data-visible-toasts", "3");
  });
});
