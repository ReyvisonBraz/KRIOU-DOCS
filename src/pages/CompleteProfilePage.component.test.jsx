/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { DocumentService } from "../services/DocumentService";
import showToast from "../utils/toast";
import CompleteProfilePage from "./CompleteProfilePage";

vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("../context/AppContext", () => ({ useApp: vi.fn() }));
vi.mock("../services/DocumentService", () => ({
  DocumentService: { updateProfile: vi.fn() },
}));
vi.mock("../utils/toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const logout = vi.fn();
const setProfile = vi.fn();

const googleUser = {
  id: "user-1",
  email: "ana@example.com",
  user_metadata: {
    full_name: "  Ana Maria Silva  ",
    avatar_url: "current-avatar.png",
    sub: "google-1",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  setProfile.mockReturnValue(undefined);
  useAuth.mockReturnValue({ user: googleUser });
  useApp.mockReturnValue({ logout, setProfile });
});

describe("CompleteProfilePage", () => {
  it("autopreenche dados Google, normaliza o payload e sincroniza o perfil antes de navegar", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const savedProfile = { id: "user-1", nome: "Beatriz", sobrenome: "Souza" };
    DocumentService.updateProfile.mockResolvedValue(savedProfile);

    render(<CompleteProfilePage onNavigate={onNavigate} />);

    const nome = screen.getByRole("textbox", { name: /^nome \*$/i });
    const sobrenome = screen.getByRole("textbox", { name: /^sobrenome \*$/i });
    const cpf = screen.getByRole("textbox", { name: /cpf.*opcional/i });
    expect(nome).toHaveValue("Ana");
    expect(sobrenome).toHaveValue("Maria Silva");

    await user.clear(nome);
    await user.type(nome, "  Beatriz  ");
    await user.clear(sobrenome);
    await user.type(sobrenome, "  Souza  ");
    await user.type(cpf, "52998224725");
    expect(cpf).toHaveValue("529.982.247-25");
    await user.click(screen.getByRole("button", { name: /concluir cadastro/i }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true }));
    expect(DocumentService.updateProfile).toHaveBeenCalledWith({
      nome: "Beatriz",
      sobrenome: "Souza",
      cpf: "52998224725",
      googleData: {
        email: "ana@example.com",
        avatar_url: "current-avatar.png",
        google_id: "google-1",
      },
    });
    expect(setProfile).toHaveBeenCalledWith(savedProfile);
    expect(setProfile.mock.invocationCallOrder[0]).toBeLessThan(onNavigate.mock.invocationCallOrder[0]);
    expect(showToast.success).toHaveBeenCalledOnce();
  });

  it("aceita CPF ausente, mas bloqueia nomes vazios e CPF informado inválido", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    useAuth.mockReturnValue({ user: null });
    DocumentService.updateProfile.mockResolvedValue({ nome: "Ana", sobrenome: "Silva", cpf: null });

    render(<CompleteProfilePage onNavigate={onNavigate} />);
    await user.click(screen.getByRole("button", { name: /concluir cadastro/i }));

    const nome = screen.getByRole("textbox", { name: /^nome \*$/i });
    const sobrenome = screen.getByRole("textbox", { name: /^sobrenome \*$/i });
    const cpf = screen.getByRole("textbox", { name: /cpf.*opcional/i });
    expect(nome).toHaveAccessibleDescription("Nome é obrigatório");
    expect(nome).toHaveAttribute("aria-invalid", "true");
    expect(sobrenome).toHaveAccessibleDescription("Sobrenome é obrigatório");
    expect(sobrenome).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(DocumentService.updateProfile).not.toHaveBeenCalled();

    await user.type(nome, "Ana");
    await user.type(sobrenome, "Silva");
    await user.type(cpf, "11111111111");
    await user.click(screen.getByRole("button", { name: /concluir cadastro/i }));

    expect(cpf).toHaveAccessibleDescription("CPF inválido");
    expect(cpf).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido");
    expect(DocumentService.updateProfile).not.toHaveBeenCalled();

    await user.clear(cpf);
    await user.click(screen.getByRole("button", { name: /concluir cadastro/i }));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true }));
    expect(DocumentService.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ cpf: null }));
  });

  it("mantém o submit single-flight enquanto o salvamento está pendente", async () => {
    const pending = deferred();
    const onNavigate = vi.fn();
    DocumentService.updateProfile.mockReturnValue(pending.promise);

    render(<CompleteProfilePage onNavigate={onNavigate} />);
    const form = screen.getByRole("button", { name: /concluir cadastro/i }).closest("form");
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(DocumentService.updateProfile).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /salvando/i })).toBeDisabled();

    await act(async () => pending.resolve({ id: "user-1", nome: "Ana", sobrenome: "Maria Silva" }));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledOnce());
  });

  it("libera o submit depois de erro e permite nova tentativa", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    DocumentService.updateProfile
      .mockRejectedValueOnce(new Error("indisponível"))
      .mockResolvedValueOnce({ id: "user-1", nome: "Ana", sobrenome: "Maria Silva" });

    render(<CompleteProfilePage onNavigate={onNavigate} />);
    const submit = screen.getByRole("button", { name: /concluir cadastro/i });
    await user.click(submit);

    await waitFor(() => expect(showToast.error).toHaveBeenCalledOnce());
    expect(submit).toBeEnabled();
    expect(onNavigate).not.toHaveBeenCalled();

    await user.click(submit);
    await waitFor(() => expect(onNavigate).toHaveBeenCalledOnce());
    expect(DocumentService.updateProfile).toHaveBeenCalledTimes(2);
  });

  it("pula em single-flight sem persistir CPF inválido e sincroniza o retorno", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onNavigate = vi.fn();
    const savedProfile = { id: "user-1", nome: "Usuário", sobrenome: "Kriou", cpf: null };
    useAuth.mockReturnValue({
      user: { user_metadata: { email: "meta@example.com", sub: "google-2" } },
    });
    DocumentService.updateProfile.mockReturnValue(pending.promise);

    const view = render(<CompleteProfilePage onNavigate={onNavigate} />);
    await user.type(screen.getByRole("textbox", { name: /cpf.*opcional/i }), "11111111111");
    const skip = screen.getByRole("button", { name: /pular, vou preencher depois/i });
    fireEvent.click(skip);
    fireEvent.click(skip);

    expect(DocumentService.updateProfile).toHaveBeenCalledOnce();
    expect(DocumentService.updateProfile).toHaveBeenCalledWith({
      nome: "Usuário",
      sobrenome: "Kriou",
      cpf: null,
      googleData: {
        email: "meta@example.com",
        avatar_url: null,
        google_id: "google-2",
      },
    });

    await act(async () => pending.resolve(savedProfile));
    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith("dashboard", { replace: true }));
    expect(setProfile).toHaveBeenCalledWith(savedProfile);
    expect(setProfile.mock.invocationCallOrder[0]).toBeLessThan(onNavigate.mock.invocationCallOrder[0]);
    fireEvent.click(skip);
    expect(onNavigate).toHaveBeenCalledOnce();

    view.unmount();
    const rejectedPublication = deferred();
    setProfile.mockReturnValue(false);
    DocumentService.updateProfile.mockReturnValue(rejectedPublication.promise);
    render(<CompleteProfilePage onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole("button", { name: /pular, vou preencher depois/i }));
    await act(async () => rejectedPublication.resolve(savedProfile));

    expect(setProfile).toHaveBeenLastCalledWith(savedProfile);
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("continua ao dashboard quando o salvamento opcional falha, sem prender o loading", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    DocumentService.updateProfile.mockRejectedValue(new Error("offline"));

    render(<CompleteProfilePage onNavigate={onNavigate} />);
    const skip = screen.getByRole("button", { name: /pular, vou preencher depois/i });
    await user.click(skip);

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith("dashboard", { replace: true }));
    expect(setProfile).not.toHaveBeenCalled();
    expect(skip).toBeEnabled();
    await user.click(skip);
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("ignora submit tardio após unmount, troca de identidade ou publicação rejeitada", async () => {
    const pending = deferred();
    const onNavigate = vi.fn();
    DocumentService.updateProfile.mockReturnValue(pending.promise);
    const view = render(<CompleteProfilePage onNavigate={onNavigate} />);

    fireEvent.submit(screen.getByRole("button", { name: /concluir cadastro/i }).closest("form"));
    view.unmount();
    await act(async () => pending.resolve({ id: "user-1", nome: "Antigo" }));

    expect(setProfile).not.toHaveBeenCalled();
    expect(showToast.success).not.toHaveBeenCalled();
    expect(showToast.error).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();

    const rejectedPublication = deferred();
    setProfile.mockReturnValue(false);
    DocumentService.updateProfile.mockReturnValue(rejectedPublication.promise);
    const rejectedView = render(<CompleteProfilePage onNavigate={onNavigate} />);
    fireEvent.submit(screen.getByRole("button", { name: /concluir cadastro/i }).closest("form"));
    await act(async () => rejectedPublication.resolve({ id: "user-1", nome: "Ana" }));

    expect(setProfile).toHaveBeenCalledWith({ id: "user-1", nome: "Ana" });
    expect(showToast.success).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
    rejectedView.unmount();

    const externalChange = deferred();
    let activeUser = googleUser;
    useAuth.mockImplementation(() => ({ user: activeUser }));
    setProfile.mockReturnValue(undefined);
    DocumentService.updateProfile.mockReturnValue(externalChange.promise);
    const identityView = render(<CompleteProfilePage onNavigate={onNavigate} />);
    fireEvent.submit(screen.getByRole("button", { name: /concluir cadastro/i }).closest("form"));
    activeUser = { ...googleUser, id: "user-2" };
    identityView.rerender(<CompleteProfilePage onNavigate={onNavigate} />);
    await act(async () => externalChange.resolve({ id: "user-1", nome: "A tardio" }));

    expect(setProfile).not.toHaveBeenCalledWith({ id: "user-1", nome: "A tardio" });
    expect(showToast.success).not.toHaveBeenCalled();
    expect(showToast.error).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("logout ou troca externa cancelam rejeição tardia do skip sem efeitos posteriores", async () => {
    const user = userEvent.setup();
    const pending = deferred();
    const onNavigate = vi.fn();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    DocumentService.updateProfile.mockReturnValue(pending.promise);
    render(<CompleteProfilePage onNavigate={onNavigate} />);

    await user.click(screen.getByRole("button", { name: /pular, vou preencher depois/i }));
    await user.click(screen.getByRole("button", { name: /sair/i }));
    await act(async () => pending.reject(new Error("tardia")));

    expect(logout).toHaveBeenCalledOnce();
    expect(setProfile).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();

    const externalPending = deferred();
    let activeUser = googleUser;
    useAuth.mockImplementation(() => ({ user: activeUser }));
    DocumentService.updateProfile.mockReturnValue(externalPending.promise);
    const externalView = render(<CompleteProfilePage onNavigate={onNavigate} />);
    await user.click(screen.getAllByRole("button", { name: /pular, vou preencher depois/i }).at(-1));
    activeUser = null;
    externalView.rerender(<CompleteProfilePage onNavigate={onNavigate} />);
    await act(async () => externalPending.reject(new Error("A rejeitado após SIGNED_OUT")));

    expect(console.warn).not.toHaveBeenCalled();
    expect(showToast.error).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
