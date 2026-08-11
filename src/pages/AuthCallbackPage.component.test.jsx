/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { DocumentService } from "../services/DocumentService";
import AuthCallbackPage from "./AuthCallbackPage";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock("../services/DocumentService", () => ({
  DocumentService: {
    fetchProfile: vi.fn(),
    isProfileComplete: vi.fn(),
  },
}));

const session = {
  user: {
    id: "user-42",
    email: "ana@example.com",
  },
};

const completeProfile = {
  firstName: "Ana",
  lastName: "Silva",
  cpf: "12345678901",
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

let authStateCallback;
let unsubscribe;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-11T12:00:00Z"));
  vi.clearAllMocks();
  localStorage.clear();
  authStateCallback = null;
  unsubscribe = vi.fn();

  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    authStateCallback = callback;
    return { data: { subscription: { unsubscribe } } };
  });
  DocumentService.fetchProfile.mockResolvedValue(completeProfile);
  DocumentService.isProfileComplete.mockReturnValue(true);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AuthCallbackPage", () => {
  it("exibe o estado inicial enquanto aguarda uma sessão", () => {
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}));

    render(<AuthCallbackPage onNavigate={vi.fn()} />);

    expect(screen.getByText("Verificando login...")).toBeInTheDocument();
    expect(supabase.auth.getSession).toHaveBeenCalledOnce();
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledOnce();
  });

  it("envia perfil incompleto encontrado pelo polling para completeProfile", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    DocumentService.isProfileComplete.mockReturnValue(false);

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();

    expect(DocumentService.fetchProfile).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("completeProfile", { replace: true });
  });

  it("envia perfil completo sem onboarding para welcome", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();

    expect(localStorage.getItem("kriou_onboarding_user-42_seen")).toBeNull();
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });
  });

  it("envia perfil completo com onboarding para dashboard", async () => {
    const onNavigate = vi.fn();
    localStorage.setItem("kriou_onboarding_user-42_seen", "true");
    supabase.auth.getSession.mockResolvedValue({ data: { session } });

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();

    expect(onNavigate).toHaveBeenCalledWith("dashboard", { replace: true });
  });

  it("usa dashboard como fallback quando a busca do perfil falha", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    DocumentService.fetchProfile.mockRejectedValue(new Error("perfil indisponível"));

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();

    expect(onNavigate).toHaveBeenCalledWith("dashboard", { replace: true });
    expect(DocumentService.isProfileComplete).not.toHaveBeenCalled();
  });

  it("continua o polling depois de getSession falhar e se recupera", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession
      .mockRejectedValueOnce(new Error("rede instável"))
      .mockResolvedValueOnce({ data: { session } });

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();
    expect(onNavigate).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(supabase.auth.getSession).toHaveBeenCalledTimes(2);
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });
  });

  it("desiste em 15 segundos sem sessão e volta ao login com replace", async () => {
    const onNavigate = vi.fn();

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });

    expect(screen.getByText("Tempo esgotado. Verifique sua conexao e tente novamente.")).toBeInTheDocument();
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });
  });

  it("watchdog expira mesmo quando o primeiro getSession nunca resolve", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}));

    const view = render(<AuthCallbackPage onNavigate={onNavigate} />);
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    act(() => authStateCallback("SIGNED_OUT", null));
    view.unmount();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(supabase.auth.getSession).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["SIGNED_IN", "INITIAL_SESSION", "TOKEN_REFRESHED"])(
    "resolve sessão recebida pelo evento %s",
    async (event) => {
      const onNavigate = vi.fn();
      supabase.auth.getSession.mockReturnValue(new Promise(() => {}));
      DocumentService.isProfileComplete.mockReturnValue(false);

      render(<AuthCallbackPage onNavigate={onNavigate} />);
      await act(async () => {
        authStateCallback(event, session);
        await Promise.resolve();
      });

      expect(unsubscribe).toHaveBeenCalledOnce();
      expect(onNavigate).toHaveBeenCalledWith("completeProfile", { replace: true });
    },
  );

  it("ignora eventos sem sessão e eventos tardios depois de resolver", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}));

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    act(() => authStateCallback("USER_UPDATED", null));
    expect(DocumentService.fetchProfile).not.toHaveBeenCalled();

    await act(async () => {
      authStateCallback("SIGNED_IN", session);
      await Promise.resolve();
    });
    act(() => authStateCallback("SIGNED_OUT", null));

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });
  });

  it("executa uma vez o unsubscribe solicitado durante registro síncrono defensivo", () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockReturnValue(new Promise(() => {}));
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      callback("SIGNED_OUT", null);
      return { data: { subscription: { unsubscribe } } };
    });

    const view = render(<AuthCallbackPage onNavigate={onNavigate} />);
    view.unmount();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("SIGNED_OUT volta ao login e invalida um polling ainda pendente", async () => {
    const onNavigate = vi.fn();
    const pendingSession = deferred();
    supabase.auth.getSession.mockReturnValue(pendingSession.promise);

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    act(() => authStateCallback("SIGNED_OUT", null));

    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });

    pendingSession.resolve({ data: { session } });
    await settle();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(DocumentService.fetchProfile).not.toHaveBeenCalled();
  });

  it("SIGNED_OUT invalida fetchProfile pendente que resolve depois", async () => {
    const onNavigate = vi.fn();
    const pendingProfile = deferred();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    DocumentService.fetchProfile.mockReturnValue(pendingProfile.promise);

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();
    expect(screen.getByText("Login confirmado! Verificando perfil...")).toBeInTheDocument();

    act(() => authStateCallback("SIGNED_OUT", null));
    pendingProfile.resolve(completeProfile);
    await settle();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(DocumentService.isProfileComplete).not.toHaveBeenCalled();
    expect(screen.getByText("Login confirmado! Verificando perfil...")).toBeInTheDocument();
    expect(screen.queryByText("Preparando tour...")).not.toBeInTheDocument();
  });

  it("SIGNED_OUT invalida fetchProfile pendente que rejeita depois", async () => {
    const onNavigate = vi.fn();
    const pendingProfile = deferred();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    DocumentService.fetchProfile.mockReturnValue(pendingProfile.promise);

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();
    act(() => authStateCallback("SIGNED_OUT", null));

    pendingProfile.reject(new Error("perfil indisponível"));
    await settle();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("login", { replace: true });
    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(screen.getByText("Login confirmado! Verificando perfil...")).toBeInTheDocument();
    expect(screen.queryByText("Erro ao carregar perfil. Redirecionando...")).not.toBeInTheDocument();
  });

  it("deduplica a sessão recebida simultaneamente por listener e polling", async () => {
    const onNavigate = vi.fn();
    const pendingSession = deferred();
    const pendingProfile = deferred();
    supabase.auth.getSession.mockReturnValue(pendingSession.promise);
    DocumentService.fetchProfile.mockReturnValue(pendingProfile.promise);

    render(<AuthCallbackPage onNavigate={onNavigate} />);
    act(() => authStateCallback("SIGNED_IN", session));
    pendingSession.resolve({ data: { session } });
    await settle();

    expect(DocumentService.fetchProfile).toHaveBeenCalledOnce();

    pendingProfile.resolve(completeProfile);
    await settle();

    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });
  });

  it("cancela polling e subscription no unmount", async () => {
    const onNavigate = vi.fn();
    const view = render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();
    expect(vi.getTimerCount()).toBe(2);

    view.unmount();
    await vi.advanceTimersByTimeAsync(2000);

    expect(unsubscribe).toHaveBeenCalledOnce();
    expect(supabase.auth.getSession).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("permanece funcional após o replay de effects do StrictMode", async () => {
    const onNavigate = vi.fn();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });

    render(
      <React.StrictMode>
        <AuthCallbackPage onNavigate={onNavigate} />
      </React.StrictMode>,
    );
    await settle();

    expect(supabase.auth.getSession).toHaveBeenCalledTimes(2);
    expect(DocumentService.fetchProfile).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });
  });

  it("não navega quando o perfil termina de carregar depois do unmount", async () => {
    const onNavigate = vi.fn();
    const pendingProfile = deferred();
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    DocumentService.fetchProfile.mockReturnValue(pendingProfile.promise);

    const view = render(<AuthCallbackPage onNavigate={onNavigate} />);
    await settle();
    view.unmount();

    pendingProfile.resolve(completeProfile);
    await settle();

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
