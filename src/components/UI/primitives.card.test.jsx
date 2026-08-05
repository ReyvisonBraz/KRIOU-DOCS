/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./primitives";

describe("Card", () => {
  it("permanece uma superfície neutra quando não tem ação", () => {
    render(<Card padding="medium">Conteúdo</Card>);

    const card = screen.getByText("Conteúdo");
    expect(card).not.toHaveAttribute("role");
    expect(card).toHaveStyle({ padding: "20px" });
  });

  it("oferece teclado e preserva o evento composto quando interativo", () => {
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(<Card onClick={onClick} onKeyDown={onKeyDown}>Abrir</Card>);

    const card = screen.getByRole("button", { name: "Abrir" });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("expõe estado desabilitado sem executar a ação", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick} disabled>Bloqueado</Card>);

    const card = screen.getByRole("button", { name: "Bloqueado" });
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });

    expect(card).toHaveAttribute("aria-disabled", "true");
    expect(onClick).not.toHaveBeenCalled();
  });
});
