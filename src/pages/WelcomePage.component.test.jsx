/**
 * @vitest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApp } from "../context/AppContext";
import WelcomePage from "./WelcomePage";

vi.mock("../context/AppContext", () => ({ useApp: vi.fn() }));

const navigate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useApp.mockReturnValue({
    profile: { nome: "Ana" },
    navigate,
    userId: "user-1",
  });
});

describe("WelcomePage", () => {
  it("usa o perfil sincronizado e percorre o tour por próximo, voltar e dots", async () => {
    const user = userEvent.setup();
    render(<WelcomePage />);

    expect(screen.getByText("Ana!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /começar tour/i }));
    expect(screen.getByText("Currículo Profissional")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /próximo/i }));
    expect(screen.getByText("Documentos Jurídicos")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /voltar/i }));
    expect(screen.getByText("Currículo Profissional")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ir para etapa 4" }));
    expect(screen.getByText("Simples e Acessível")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ir para etapa 5" }));
    expect(screen.getByText("Tudo pronto,")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /pular/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ir ao dashboard/i }));
    await user.click(screen.getByRole("button", { name: /ver mais tarde/i }));
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("dashboard", { replace: true });
  });

  it("pular persiste uma chave isolada pelo userId e finaliza uma única vez", async () => {
    const user = userEvent.setup();
    localStorage.setItem("kriou_onboarding_other-user_seen", "anterior");
    render(<WelcomePage />);

    const skip = screen.getByRole("button", { name: /pular/i });
    fireEvent.click(skip);
    fireEvent.click(skip);

    expect(localStorage.getItem("kriou_onboarding_user-1_seen")).toBe("1");
    expect(localStorage.getItem("kriou_onboarding_other-user_seen")).toBe("anterior");
    expect(navigate).toHaveBeenCalledOnce();
    await user.click(skip);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("sem userId navega sem tentar gravar no armazenamento", async () => {
    const user = userEvent.setup();
    const setItem = vi.spyOn(localStorage, "setItem");
    useApp.mockReturnValue({ profile: null, navigate, userId: null });
    render(<WelcomePage />);

    expect(screen.getByText("Usuário!")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pular/i }));

    expect(setItem).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("dashboard", { replace: true });
  });

  it("falha de localStorage não impede o dashboard e a conclusão continua single-flight", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota excedida");
    });
    render(<WelcomePage />);

    const skip = screen.getByRole("button", { name: /pular/i });
    fireEvent.click(skip);
    fireEvent.click(skip);

    expect(console.warn).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("dashboard", { replace: true });
  });
});
