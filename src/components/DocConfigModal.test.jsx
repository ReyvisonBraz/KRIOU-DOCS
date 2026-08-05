/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocConfigModal } from "./DocConfigModal";

const appState = {
  currentDocument: { id: "KD-001", tipo: "curriculo", titulo: "", partes: [] },
  updateCurrentDocument: vi.fn(),
  addParte: vi.fn(),
  removeParte: vi.fn(),
  finalizeDocConfig: vi.fn(),
  showDocConfig: true,
};

vi.mock("../context/AppContext", () => ({ useApp: () => appState }));

describe("DocConfigModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usa um modal obrigatório e valida os dados antes de avançar", () => {
    render(<DocConfigModal />);

    expect(screen.getByRole("dialog", { name: "Configurar novo documento" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /fechar modal/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar para o editor" }));
    expect(screen.getByText("Dê um título ao documento")).toBeVisible();
    expect(screen.getByText("Adicione pelo menos uma parte")).toBeVisible();
    expect(appState.finalizeDocConfig).not.toHaveBeenCalled();
  });
});
