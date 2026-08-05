/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminUserDocumentsDrawer from "./AdminUserDocumentsDrawer";

const user = { id: "user-1", nome: "Ana", email: "ana@example.com" };

describe("AdminUserDocumentsDrawer", () => {
  it("apresenta os documentos com estado e metadados legíveis", () => {
    render(
      <AdminUserDocumentsDrawer
        user={user}
        documents={[{
          id: "doc-1",
          title: "Contrato social",
          code: "KD-123",
          status: "finalizado",
          document_type_name: "Contrato",
          created_at: "2026-08-05T12:00:00.000Z",
        }]}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Documentos de Ana" })).toBeVisible();
    expect(screen.getByText("Contrato social")).toBeVisible();
    expect(screen.getByText("KD-123")).toBeVisible();
    expect(screen.getByText("Finalizado")).toBeVisible();
  });

  it("diferencia carregamento, vazio e erro", () => {
    const { rerender } = render(<AdminUserDocumentsDrawer user={user} loading onClose={vi.fn()} />);
    expect(screen.getByRole("status", { name: "Carregando documentos" })).toBeVisible();

    rerender(<AdminUserDocumentsDrawer user={user} onClose={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Nenhum documento" })).toBeVisible();

    rerender(<AdminUserDocumentsDrawer user={user} error="Falha de conexão" onRetry={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Falha de conexão");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });
});
