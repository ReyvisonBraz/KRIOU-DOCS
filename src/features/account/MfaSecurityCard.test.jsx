/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MfaSecurityCard from "./MfaSecurityCard";

const noFactor = { factor: null, currentLevel: "aal1", nextLevel: "aal1" };
const aal1Factor = { factor: { id: "factor-1" }, currentLevel: "aal1", nextLevel: "aal2" };
const aal2Factor = { factor: { id: "factor-1" }, currentLevel: "aal2", nextLevel: "aal2" };

describe("MfaSecurityCard", () => {
  it("cadastra o autenticador sem confundir o QR com o documento", async () => {
    const service = {
      getStatus: vi.fn().mockResolvedValue(noFactor),
      beginEnrollment: vi.fn().mockResolvedValue({ factorId: "new-factor", qrCode: "<svg></svg>", secret: "SECRET123" }),
      verifyCode: vi.fn(),
      cancelEnrollment: vi.fn(),
    };
    render(<MfaSecurityCard mfaService={service} />);

    fireEvent.click(await screen.findByRole("button", { name: /ativar verificação/i }));

    expect(await screen.findByAltText(/QR secreto/i)).toBeVisible();
    expect(screen.getByText(/nunca será impresso nos documentos/i)).toBeVisible();
    fireEvent.click(screen.getByText("Não consigo escanear o QR"));
    expect(screen.getByText("SECRET123")).toBeVisible();
  });

  it("confirma o cadastro e atualiza a sessão para AAL2", async () => {
    const service = {
      getStatus: vi.fn().mockResolvedValueOnce(noFactor).mockResolvedValueOnce(aal2Factor),
      beginEnrollment: vi.fn().mockResolvedValue({ factorId: "new-factor", qrCode: "<svg></svg>", secret: "SECRET123" }),
      verifyCode: vi.fn().mockResolvedValue(),
      cancelEnrollment: vi.fn(),
    };
    render(<MfaSecurityCard mfaService={service} />);
    fireEvent.click(await screen.findByRole("button", { name: /ativar verificação/i }));
    fireEvent.change(await screen.findByLabelText("Código do autenticador"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar código" }));

    await waitFor(() => expect(service.verifyCode).toHaveBeenCalledWith("new-factor", "123456"));
    expect(await screen.findByText("Proteção ativa")).toBeVisible();
  });

  it("reforça uma sessão AAL1 que já possui fator", async () => {
    const service = {
      getStatus: vi.fn().mockResolvedValueOnce(aal1Factor).mockResolvedValueOnce(aal2Factor),
      beginEnrollment: vi.fn(), verifyCode: vi.fn().mockResolvedValue(), cancelEnrollment: vi.fn(),
    };
    render(<MfaSecurityCard mfaService={service} />);
    fireEvent.change(await screen.findByLabelText("Código do autenticador"), { target: { value: "654321" } });
    fireEvent.click(screen.getByRole("button", { name: "Reforçar sessão" }));

    await waitFor(() => expect(service.verifyCode).toHaveBeenCalledWith("factor-1", "654321"));
    expect(await screen.findByText("Proteção ativa")).toBeVisible();
  });
});
