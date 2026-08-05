/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRequirementsByLevel } from "../../features/requirements/domain/requirements";
import RequirementsModal from "./RequirementsModal";
import {
  ambiguousFlagsDocument,
  commonFieldsDocument,
  emptyDocument,
  missingCollectionsDocument,
  selectedVariant,
  variantFieldsDocument,
} from "./requirementsModal.fixtures";

const deepFreeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
};

const getDialog = () => screen.getByRole("dialog", { name: variantFieldsDocument.name });
const getPrintDocument = () => document.querySelector(".print-document");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRequirementsByLevel — caracterização", () => {
  it("tolera coleções ausentes e seções sem fields", () => {
    expect(getRequirementsByLevel(emptyDocument, "essencial")).toEqual({
      obrigatorios: [],
      opcionais: [],
      extras: [],
      count: 0,
    });
    expect(getRequirementsByLevel(missingCollectionsDocument, "completo")).toEqual({
      obrigatorios: [],
      opcionais: [],
      extras: [],
      count: 0,
    });
  });

  it("preserva a ordem entre seções comuns e todas as variantes", () => {
    const result = getRequirementsByLevel(variantFieldsDocument, "completo");

    expect(result.obrigatorios).toEqual([
      "Obrigatório 1",
      "Obrigatório 2",
      "Obrigatório 3",
      "Obrigatório 4",
      "Obrigatório 5",
      "Obrigatório e extra",
    ]);
    expect(result.opcionais).toEqual([
      "Opcional 1",
      "Opcional 2",
      "Opcional 3",
      "Opcional 4",
      "Opcional 5",
    ]);
    expect(result.extras).toEqual(["Extra 1", "Extra 2", "Obrigatório e extra"]);
    expect(result.count).toBe(14);
  });

  it("congela os cortes e arredondamentos dos três níveis", () => {
    expect(getRequirementsByLevel(variantFieldsDocument, "minimo")).toEqual({
      obrigatorios: ["Obrigatório 1", "Obrigatório 2", "Obrigatório 3"],
      opcionais: [],
      extras: [],
      count: 3,
    });
    expect(getRequirementsByLevel(variantFieldsDocument, "essencial")).toEqual({
      obrigatorios: [
        "Obrigatório 1",
        "Obrigatório 2",
        "Obrigatório 3",
        "Obrigatório 4",
        "Obrigatório 5",
        "Obrigatório e extra",
      ],
      opcionais: ["Opcional 1", "Opcional 2", "Opcional 3"],
      extras: [],
      count: 9,
    });
    expect(getRequirementsByLevel(variantFieldsDocument, "completo").count).toBe(14);
  });

  it("preserva o fallback de nível desconhecido", () => {
    expect(getRequirementsByLevel(commonFieldsDocument, "desconhecido")).toEqual({
      obrigatorios: ["Obrigatório 1", "Obrigatório 2", "Obrigatório 3"],
      opcionais: [],
      extras: [],
      count: 3,
    });
  });

  it("caracteriza a duplicação de um campo required e disableable", () => {
    expect(getRequirementsByLevel(ambiguousFlagsDocument, "completo")).toEqual({
      obrigatorios: ["Obrigatório e extra"],
      opcionais: [],
      extras: ["Obrigatório e extra"],
      count: 2,
    });
  });

  it("não altera a definição recebida", () => {
    const frozenDocument = deepFreeze(structuredClone(variantFieldsDocument));

    expect(() => getRequirementsByLevel(frozenDocument, "completo")).not.toThrow();
    expect(frozenDocument).toEqual(variantFieldsDocument);
  });
});

describe("RequirementsModal — caracterização", () => {
  it("não renderiza overlay sem documento", () => {
    const { container } = render(<RequirementsModal doc={null} onClose={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    expect(document.querySelector(".print-overlay")).not.toBeInTheDocument();
  });

  it("abre no nível essencial com diálogo, variante e conteúdo esperado", async () => {
    render(
      <RequirementsModal
        doc={variantFieldsDocument}
        variant={selectedVariant}
        onClose={vi.fn()}
      />,
    );

    const dialog = getDialog();
    const modal = within(dialog);
    expect(dialog).toHaveAccessibleDescription("🏢 Pessoa jurídica");
    expect(modal.getByText("9 campos")).toBeInTheDocument();
    expect(modal.getByText("Quando usar este documento")).toBeInTheDocument();
    expect(modal.getByText("Opcional 3")).toBeInTheDocument();
    expect(modal.queryByText("Opcional 4")).not.toBeInTheDocument();
    expect(modal.queryByText("Extra 1")).not.toBeInTheDocument();
    expect(modal.getByText("Documentos necessários")).toBeInTheDocument();
    expect(modal.getByText("Dicas importantes")).toBeInTheDocument();
    expect(modal.getByLabelText("Lista de requisitos")).toHaveAttribute("tabindex", "0");
    for (const level of ["Mínimo", "Essencial", "Completo"]) {
      expect(modal.getByRole("button", { name: new RegExp(`^${level}`) })).toHaveStyle({ minWidth: 0 });
    }
    await waitFor(() => expect(modal.getByRole("button", { name: "Fechar requisitos" })).toHaveFocus());
  });

  it("congela conteúdo e contagem ao alternar entre mínimo e completo", () => {
    render(<RequirementsModal doc={variantFieldsDocument} onClose={vi.fn()} />);
    const modal = within(getDialog());

    fireEvent.click(modal.getByRole("button", { name: /^Mínimo/ }));
    expect(modal.getByText("3 campos")).toBeInTheDocument();
    expect(modal.queryByText("Quando usar este documento")).not.toBeInTheDocument();
    expect(modal.queryByText("Opcional 1")).not.toBeInTheDocument();
    expect(modal.queryByText("Dicas importantes")).not.toBeInTheDocument();
    expect(modal.getByText("Documentos necessários")).toBeInTheDocument();

    fireEvent.click(modal.getByRole("button", { name: /^Completo/ }));
    expect(modal.getByText("14 campos")).toBeInTheDocument();
    expect(modal.getByText("Opcional 5")).toBeInTheDocument();
    expect(modal.getByText("Extra 2")).toBeInTheDocument();
    expect(modal.getAllByText("Obrigatório e extra")).toHaveLength(2);
    expect(modal.queryByText("Quando usar este documento")).not.toBeInTheDocument();
    expect(modal.getByText("Dicas importantes")).toBeInTheDocument();
  });

  it("mantém a árvore de impressão sincronizada com o nível selecionado", () => {
    render(
      <RequirementsModal
        doc={variantFieldsDocument}
        variant={selectedVariant}
        onClose={vi.fn()}
      />,
    );
    const modal = within(getDialog());
    const printDocument = within(getPrintDocument());

    expect(printDocument.getByText("9 campos necessarios")).toBeInTheDocument();
    expect(printDocument.getByText("OPCIONAIS (3)")).toBeInTheDocument();
    expect(printDocument.queryByText("EXTRAS (3)")).not.toBeInTheDocument();

    fireEvent.click(modal.getByRole("button", { name: /^Completo/ }));
    expect(printDocument.getByText("14 campos necessarios")).toBeInTheDocument();
    expect(printDocument.getByText("OBRIGATORIOS (6)")).toBeInTheDocument();
    expect(printDocument.getByText("OPCIONAIS (5)")).toBeInTheDocument();
    expect(printDocument.getByText("EXTRAS (3)")).toBeInTheDocument();
    expect(printDocument.getByText("Pessoa jurídica")).toBeInTheDocument();
  });

  it("preserva no papel os conteúdos auxiliares que a tela mínima oculta", () => {
    render(<RequirementsModal doc={variantFieldsDocument} onClose={vi.fn()} />);
    const modal = within(getDialog());
    fireEvent.click(modal.getByRole("button", { name: /^Mínimo/ }));

    expect(modal.queryByText("Quando usar este documento")).not.toBeInTheDocument();
    expect(modal.queryByText("Dicas importantes")).not.toBeInTheDocument();

    const printDocument = within(getPrintDocument());
    expect(printDocument.getByText("QUANDO USAR ESTE DOCUMENTO")).toBeInTheDocument();
    expect(printDocument.getByText("DICAS IMPORTANTES")).toBeInTheDocument();
    expect(printDocument.getByText("DOCUMENTOS NECESSARIOS")).toBeInTheDocument();
  });

  it("fecha por Escape, botão e backdrop, mas não por clique interno", () => {
    const onClose = vi.fn();
    render(<RequirementsModal doc={variantFieldsDocument} onClose={onClose} />);
    const dialog = getDialog();
    const overlay = document.querySelector(".print-overlay");

    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar requisitos" }));
    expect(onClose).toHaveBeenCalledTimes(3);
    fireEvent.click(within(dialog).getByRole("button", { name: "Fechar" }));
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it("retém o foco, bloqueia a página e restaura tudo ao desmontar", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Abrir requisitos";
    const appRoot = document.createElement("div");
    appRoot.id = "root";
    document.body.append(trigger, appRoot);
    trigger.focus();

    const { unmount } = render(
      <RequirementsModal doc={variantFieldsDocument} onClose={vi.fn()} />,
      { container: appRoot },
    );
    const dialog = getDialog();
    const modal = within(dialog);
    const firstButton = modal.getByRole("button", { name: "Fechar requisitos" });
    const lastButton = modal.getByRole("button", { name: "Imprimir Checklist" });

    await waitFor(() => expect(firstButton).toHaveFocus());
    expect(appRoot).toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("hidden");

    lastButton.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(firstButton).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(lastButton).toHaveFocus();

    unmount();
    expect(appRoot).not.toHaveAttribute("inert");
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
    trigger.remove();
    appRoot.remove();
  });

  it("invoca impressão uma vez e mantém o contrato CSS do A4", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<RequirementsModal doc={variantFieldsDocument} onClose={vi.fn()} />);

    fireEvent.click(within(getDialog()).getByRole("button", { name: "Imprimir Checklist" }));
    expect(printSpy).toHaveBeenCalledOnce();

    const printDocument = getPrintDocument();
    expect(printDocument).toHaveStyle({ display: "none" });
    const printStyles = document.querySelector(".print-overlay style")?.textContent || "";
    expect(printStyles).toContain("size: A4");
    expect(printStyles).toContain("margin: 12mm 15mm 20mm 15mm");
    expect(printStyles).toMatch(/\.print-modal\s*\{[\s\S]*?display:\s*none !important/);
    expect(printStyles).toMatch(/\.print-document\s*\{[\s\S]*?display:\s*block !important/);
    expect(printStyles).toContain("content: counter(page)");
  });
});
