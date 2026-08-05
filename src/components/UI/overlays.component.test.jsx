/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./overlays";

describe("Drawer", () => {
  it("expõe título e descrição e recebe foco ao abrir", async () => {
    render(
      <Drawer open title="Documentos de Ana" description="ana@example.com" onClose={vi.fn()}>
        <button type="button">Abrir documento</button>
      </Drawer>,
    );

    const drawer = screen.getByRole("dialog", { name: "Documentos de Ana" });
    expect(drawer).toHaveAccessibleDescription("ana@example.com");
    await waitFor(() => expect(screen.getByRole("button", { name: "Fechar painel" })).toHaveFocus());
  });

  it("contém o foco e fecha com Escape", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Detalhes" onClose={onClose}>
        <button type="button">Última ação</button>
      </Drawer>,
    );

    const close = screen.getByRole("button", { name: "Fechar painel" });
    const last = screen.getByRole("button", { name: "Última ação" });
    await waitFor(() => expect(close).toHaveFocus());
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("bloqueia fechamento enquanto uma operação está em andamento", () => {
    const onClose = vi.fn();
    render(<Drawer open busy title="Salvando" onClose={onClose}>Conteúdo</Drawer>);

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Fechar painel" })).toBeDisabled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("torna a aplicação ao fundo inerte enquanto está aberto", () => {
    const appRoot = document.createElement("div");
    appRoot.id = "root";
    document.body.appendChild(appRoot);
    const { unmount } = render(<Drawer open title="Detalhes" onClose={vi.fn()}>Conteúdo</Drawer>);

    expect(appRoot).toHaveAttribute("inert");
    unmount();
    expect(appRoot).not.toHaveAttribute("inert");
    appRoot.remove();
  });

  it("restaura o foco no acionador depois de fechar", async () => {
    const Harness = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Ver detalhes</button>
          <Drawer open={open} title="Detalhes" onClose={() => setOpen(false)}>Conteúdo</Drawer>
        </>
      );
    };

    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Ver detalhes" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
