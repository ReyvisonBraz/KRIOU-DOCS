/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LocalDataCleanupCard from "./LocalDataCleanupCard";

describe("LocalDataCleanupCard", () => {
  it("explica o alcance local antes de confirmar", () => {
    render(<LocalDataCleanupCard onConfirm={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Limpar dados deste dispositivo" }),
    );

    expect(screen.getByRole("heading", { name: "Limpar dados locais?" })).toBeVisible();
    expect(screen.getByText(/continuam armazenados no servidor/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "Limpar e sair" })).toBeVisible();
  });

  it("permite cancelar sem executar a limpeza", () => {
    const onConfirm = vi.fn();
    render(<LocalDataCleanupCard onConfirm={onConfirm} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Limpar dados deste dispositivo" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Manter dados" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Limpar dados deste dispositivo" }),
    ).toBeVisible();
  });

  it("confirma uma única ação explícita", () => {
    const onConfirm = vi.fn();
    render(<LocalDataCleanupCard onConfirm={onConfirm} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Limpar dados deste dispositivo" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Limpar e sair" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
