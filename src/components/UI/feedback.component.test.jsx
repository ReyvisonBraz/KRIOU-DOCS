/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert, ConfirmDialog, EmptyState } from "./feedback";

describe("Alert", () => {
  it("anuncia erros imediatamente e associa o conteúdo", () => {
    render(<Alert variant="danger" title="Pagamento não concluído">Tente novamente.</Alert>);

    const alert = screen.getByRole("alert", { name: "Pagamento não concluído" });
    expect(alert).toHaveTextContent("Tente novamente.");
    expect(alert).toHaveAttribute("aria-describedby");
  });

  it("usa anúncio não intrusivo para informações", () => {
    render(<Alert message="Documento salvo." />);

    expect(screen.getByRole("status")).toHaveTextContent("Documento salvo.");
  });
});

describe("EmptyState", () => {
  it("expõe título e descrição como região nomeada", () => {
    render(<EmptyState title="Nenhum documento" description="Crie seu primeiro documento." />);

    const region = screen.getByRole("region", { name: "Nenhum documento" });
    expect(screen.getByRole("heading", { level: 2, name: "Nenhum documento" })).toBeVisible();
    expect(region).toHaveAccessibleDescription("Crie seu primeiro documento.");
  });

  it("permite ajustar corretamente o nível do título", () => {
    render(<EmptyState title="Sem resultados" headingLevel={3} />);

    expect(screen.getByRole("heading", { level: 3, name: "Sem resultados" })).toBeVisible();
  });
});

describe("ConfirmDialog", () => {
  it("foca a confirmação em ações comuns", async () => {
    render(<ConfirmDialog visible title="Publicar?" onCancel={vi.fn()} onConfirm={vi.fn()} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Confirmar" })).toHaveFocus());
  });

  it("prioriza cancelar em ações destrutivas e mantém o foco no diálogo", async () => {
    render(
      <ConfirmDialog
        visible
        danger
        title="Excluir documento?"
        confirmLabel="Excluir"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const cancel = screen.getByRole("button", { name: "Cancelar" });
    const confirm = screen.getByRole("button", { name: "Excluir" });
    await waitFor(() => expect(cancel).toHaveFocus());

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(cancel).toHaveFocus();
  });

  it("fecha com Escape e devolve o foco ao acionador", async () => {
    const onCancel = vi.fn();

    const Harness = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Abrir confirmação</button>
          <ConfirmDialog
            visible={open}
            title="Continuar?"
            onConfirm={vi.fn()}
            onCancel={() => {
              onCancel();
              setOpen(false);
            }}
          />
        </>
      );
    };

    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Abrir confirmação" });
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onCancel).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
  });

  it("bloqueia confirmação duplicada durante processamento", () => {
    render(
      <ConfirmDialog
        visible
        title="Salvar?"
        busy
        busyLabel="Salvando"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const confirm = screen.getByRole("button", { name: "Salvando" });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
  });
});
