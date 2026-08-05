/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminRoleManager from "./AdminRoleManager";

const targetUser = { id: "target-user", nome: "Cliente", adminRole: null };

describe("AdminRoleManager", () => {
  it("exige mudança real e motivo mínimo antes de habilitar", async () => {
    const service = { changeRole: vi.fn() };
    render(<AdminRoleManager user={targetUser} currentUserId="owner-user" service={service} />);

    const button = screen.getByRole("button", { name: "Salvar acesso" });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Papel administrativo"), { target: { value: "support" } });
    fireEvent.change(screen.getByLabelText("Motivo da alteração de acesso"), { target: { value: "curto" } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Motivo da alteração de acesso"), { target: { value: "Atendimento ao cliente durante o turno" } });
    expect(button).toBeEnabled();
  });

  it("envia a alteração e informa auditoria", async () => {
    const service = { changeRole: vi.fn().mockResolvedValue({ changed: true, role: "support" }) };
    const onChanged = vi.fn().mockResolvedValue();
    render(<AdminRoleManager user={targetUser} currentUserId="owner-user" service={service} onChanged={onChanged} />);

    fireEvent.change(screen.getByLabelText("Papel administrativo"), { target: { value: "support" } });
    fireEvent.change(screen.getByLabelText("Motivo da alteração de acesso"), { target: { value: "Necessário para atender chamados de clientes" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar acesso" }));

    await waitFor(() => expect(service.changeRole).toHaveBeenCalledWith({
      targetUserId: "target-user",
      role: "support",
      reason: "Necessário para atender chamados de clientes",
    }));
    expect(await screen.findByText(/registrado na auditoria/i)).toBeVisible();
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it("bloqueia autoalteração e owner", async () => {
    const { rerender } = render(<AdminRoleManager user={targetUser} currentUserId="target-user" />);
    expect(await screen.findByText(/própria permissão não pode/i)).toBeVisible();
    expect(screen.getByLabelText("Papel administrativo")).toBeDisabled();

    rerender(<AdminRoleManager user={{ ...targetUser, adminRole: "owner" }} currentUserId="other-owner" />);
    expect(await screen.findByText(/aprovação de outra pessoa/i)).toBeVisible();
    expect(screen.getByLabelText("Papel administrativo")).toBeDisabled();
  });
});
