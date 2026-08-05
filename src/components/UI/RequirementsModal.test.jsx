/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RequirementsModal from "./RequirementsModal";

const documentDefinition = {
  name: "Contrato de prestação de serviços",
  commonSections: [
    { fields: [{ label: "Nome do contratante", required: true }, { label: "Prazo", required: false }] },
  ],
  variantSections: {},
  spec: { whenUse: "Para formalizar a prestação de um serviço." },
};

describe("RequirementsModal", () => {
  it("funciona como diálogo acessível sem perder o conteúdo de impressão", async () => {
    const onClose = vi.fn();
    render(<RequirementsModal doc={documentDefinition} onClose={onClose} />);

    const dialog = screen.getByRole("dialog", { name: documentDefinition.name });
    expect(dialog).toHaveAccessibleDescription("Verifique os requisitos");
    expect(document.querySelector(".print-document")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar requisitos" })).toHaveFocus());

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
