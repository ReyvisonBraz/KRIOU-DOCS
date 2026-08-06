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
    expect(within(article).getByRole("button", { name: "Mais ações para Ana Souza" })).toBeVisible();
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

  it("mover para a lixeira não dispara a abertura do documento", () => {
    const { onClick, onDelete } = renderCard();
    const trigger = screen.getByRole("button", { name: "Mais ações para Ana Souza" });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Mover para a lixeira" }));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("na lixeira deixa a restauracao visivel sem depender do menu", () => {
    const onRestore = vi.fn();
    const onPermanentDelete = vi.fn();
    render(
      <DocumentCard
        doc={{ ...documentFixture, deletedAt: "2026-08-05T12:00:00.000Z" }}
        onClick={vi.fn()}
        onRestore={onRestore}
        onPermanentDelete={onPermanentDelete}
      />,
    );

    expect(screen.getByRole("button", { name: "Ana Souza está na lixeira" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Restaurar documento" }));
    expect(onRestore).toHaveBeenCalledOnce();
  });

  it("fecha o menu com Escape e devolve o foco ao gatilho", () => {
    renderCard();
    const trigger = screen.getByRole("button", { name: "Mais ações para Ana Souza" });

    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Renomear" })).toBeVisible();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("button", { name: "Renomear" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("renderiza o menu fora do card para não recortar nem interceptar ações", () => {
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: "Mais ações para Ana Souza" }));

    const actions = screen.getByLabelText("Ações para Ana Souza");
    expect(actions.parentElement).toBe(document.body);
    expect(actions).toHaveStyle({ position: "fixed", zIndex: "1000" });
  });
});
