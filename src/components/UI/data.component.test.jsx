/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./data";

const columns = [
  { key: "name", header: "Nome" },
  { key: "email", header: "E-mail" },
  { key: "status", header: "Situação", render: (row) => <strong>{row.status}</strong> },
  { key: "actions", header: "Ações", mobile: "actions", render: () => <button type="button">Abrir</button> },
];
const rows = [{ id: "1", name: "Ana", email: "ana@example.com", status: "Ativa" }];

describe("DataTable", () => {
  it("preserva tabela, legenda, cabeçalhos e células sem duplicar conteúdo", () => {
    const renderStatus = vi.fn((row) => <strong>{row.status}</strong>);
    const customColumns = columns.map((column) => column.key === "status" ? { ...column, render: renderStatus } : column);
    render(<DataTable caption="Usuários cadastrados" columns={customColumns} rows={rows} />);

    expect(screen.getByRole("table", { name: "Usuários cadastrados" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "E-mail" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "ana@example.com" })).toHaveAttribute("data-label", "E-mail");
    expect(renderStatus).toHaveBeenCalledOnce();
  });

  it("aceita rótulo móvel diferente do cabeçalho", () => {
    render(
      <DataTable
        ariaLabel="Pagamentos"
        columns={[{ key: "amount", header: "Valor aprovado", mobileLabel: "Valor" }]}
        rows={[{ id: "p1", amount: "R$ 20,00" }]}
      />,
    );

    expect(screen.getByRole("cell", { name: "R$ 20,00" })).toHaveAttribute("data-label", "Valor");
  });

  it("expõe vazio como atualização de status", () => {
    render(<DataTable ariaLabel="Usuários" columns={columns} rows={[]} emptyMessage="Nenhum usuário." />);

    expect(screen.getByRole("status")).toHaveTextContent("Nenhum usuário.");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("anuncia carregamento e mantém estrutura previsível", () => {
    render(<DataTable ariaLabel="Usuários" columns={columns} rows={[]} isLoading loadingRows={2} />);

    expect(screen.getByRole("table", { name: "Usuários" }).parentElement).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("Carregando registros…")).toBeInTheDocument();
  });
});
