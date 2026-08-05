/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "./Theme";
import { THEME_STORAGE_KEY } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    const values = new Map();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: vi.fn(() => values.clear()),
        getItem: vi.fn((key) => values.get(key) ?? null),
        setItem: vi.fn((key, value) => values.set(key, String(value))),
        removeItem: vi.fn((key) => values.delete(key)),
      },
    });
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("usa tema claro como padrão e permite ativar o escuro", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    const toggle = screen.getByRole("button", { name: "Ativar tema escuro" });
    expect(document.documentElement.dataset.theme).toBe("light");
    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  });

  it("restaura uma preferência escura existente", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Ativar tema claro" })).toBeVisible();
  });
});
