/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminUsersTable from "./AdminUsersTable";

const user = { id: "user-1", nome: "Ana", sobrenome: "Silva", email: "ana@example.com", adminRole: "support", docCount: 3, created_at: "2026-08-05T12:00:00.000Z" };

describe("AdminUsersTable", () => {
  it("apresenta dados e papel com semântica de tabela", () => {
    render(<AdminUsersTable users={[user]} />);

    expect(screen.getByRole("table", { name: "Usuários cadastrados" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "Ana Silva" })).toHaveAttribute("data-label", "Nome");
    expect(screen.getByText("Suporte")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Acesso" })).not.toBeInTheDocument();
  });

  it("mantém documentos e gestão de acesso como ações independentes", () => {
    const onViewDocuments = vi.fn();
    const onManageAccess = vi.fn();
    render(<AdminUsersTable users={[user]} canManageRoles onViewDocuments={onViewDocuments} onManageAccess={onManageAccess} />);

    fireEvent.click(screen.getByRole("button", { name: "Documentos" }));
    fireEvent.click(screen.getByRole("button", { name: "Acesso" }));

    expect(onViewDocuments).toHaveBeenCalledWith("user-1");
    expect(onManageAccess).toHaveBeenCalledWith(user);
  });

  it("expõe carregamento antes de declarar lista vazia", () => {
    render(<AdminUsersTable isLoading users={[]} />);

    expect(screen.getByRole("table", { name: "Usuários cadastrados" }).parentElement).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Nenhum usuário encontrado.")).not.toBeInTheDocument();
  });
});
