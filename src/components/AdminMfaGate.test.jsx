/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminMfaGate from "./AdminMfaGate";

const aal1Factor = { factor: { id: "factor-1" }, currentLevel: "aal1", nextLevel: "aal2" };
const aal2Factor = { factor: { id: "factor-1" }, currentLevel: "aal2", nextLevel: "aal2" };

describe("AdminMfaGate", () => {
  it("não entrega o conteúdo administrativo antes de AAL2", async () => {
    const service = { getStatus: vi.fn().mockResolvedValue(aal1Factor), verifyCode: vi.fn() };
    render(<AdminMfaGate mfaService={service}><p>Conteúdo secreto</p></AdminMfaGate>);

    expect(await screen.findByText("Confirmação administrativa")).toBeVisible();
    expect(screen.queryByText("Conteúdo secreto")).not.toBeInTheDocument();
  });

  it("confirma o código e só então monta o painel", async () => {
    const service = {
      getStatus: vi.fn().mockResolvedValueOnce(aal1Factor).mockResolvedValueOnce(aal2Factor),
      verifyCode: vi.fn().mockResolvedValue(),
    };
    render(<AdminMfaGate mfaService={service}><p>Painel liberado</p></AdminMfaGate>);

    fireEvent.change(await screen.findByLabelText("Código administrativo do autenticador"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar no painel" }));

    await waitFor(() => expect(service.verifyCode).toHaveBeenCalledWith("factor-1", "123456"));
    expect(await screen.findByText("Painel liberado")).toBeVisible();
  });

  it("envia administrador sem fator para configuração no perfil", async () => {
    const onOpenProfile = vi.fn();
    const service = { getStatus: vi.fn().mockResolvedValue({ factor: null, currentLevel: "aal1", nextLevel: "aal1" }) };
    render(<AdminMfaGate mfaService={service} onOpenProfile={onOpenProfile}><p>Painel</p></AdminMfaGate>);

    fireEvent.click(await screen.findByRole("button", { name: "Configurar no perfil" }));
    expect(onOpenProfile).toHaveBeenCalledOnce();
    expect(screen.queryByText("Painel")).not.toBeInTheDocument();
  });
});
