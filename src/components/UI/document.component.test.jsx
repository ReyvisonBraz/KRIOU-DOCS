/** @vitest-environment jsdom */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DocumentCard } from "./document";

const documentFixture = {
  id: "doc-1",
  type: "resume",
  title: "Currículo de Ana",
  date: "4 de ago.",
  status: "draft",
  formData: { nome: "Ana Souza" },
};

function renderCard(overrides = {}) {
  const callbacks = {
    onClick: vi.fn(),
    onDelete: vi.fn(),
    onArchive: vi.fn(),
    onDownload: vi.fn(),
    onPrint: vi.fn(),
    onRename: vi.fn(),
    onDuplicate: vi.fn(),
    ...overrides,
  };

  render(<DocumentCard doc={documentFixture} {...callbacks} />);
  return callbacks;
}

describe("DocumentCard", () => {
  it("separa a ação principal das demais ações do card", () => {
    renderCard();

    const article = screen.getByRole("article", { name: "Ana Souza" });
    expect(within(article).getByRole("button", { name: "Abrir Ana Souza" })).toBeVisible();
    expect(within(article).getByRole("button", { name: "Excluir Currículo de Ana" })).toBeVisible();
    expect(article.querySelector("button button")).toBeNull();
    expect(article.querySelector('[role="button"] button')).toBeNull();
  });

  it("usa um botão nativo como ação principal", () => {
    const { onClick } = renderCard();
    const openButton = screen.getByRole("button", { name: "Abrir Ana Souza" });

    expect(openButton.tagName).toBe("BUTTON");
    expect(openButton).toHaveAttribute("type", "button");
    fireEvent.click(openButton);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("excluir não dispara a abertura do documento", () => {
    const { onClick, onDelete } = renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Excluir Currículo de Ana" }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });
});
