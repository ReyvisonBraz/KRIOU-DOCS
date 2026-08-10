/**
 * @vitest-environment jsdom
 */
import React, { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { AuthProvider, useAuth } from "./AuthContext";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

let authStateCallback;
let unsubscribe;

const Probe = () => {
  const auth = useAuth();
  const [actionError, setActionError] = useState("");

  return (
    <div>
      <span data-testid="loading">{String(auth.isAuthLoading)}</span>
      <span data-testid="user-id">{auth.userId ?? "sem-user"}</span>
      <span data-testid="name">{auth.displayName}</span>
      <span data-testid="email">{auth.email ?? "sem-email"}</span>
      <span data-testid="avatar">{auth.avatarUrl ?? "sem-avatar"}</span>
      <span data-testid="action-error">{actionError}</span>
      <button onClick={() => auth.signInWithGoogle().catch((error) => setActionError(error.message))}>
        entrar
      </button>
      <button onClick={() => auth.logout()}>sair</button>
    </div>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  authStateCallback = null;
  unsubscribe = vi.fn();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    authStateCallback = callback;
    return { data: { subscription: { unsubscribe } } };
  });
  supabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
  supabase.auth.signOut.mockResolvedValue({ error: null });
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthProvider", () => {
  it("restaura a sessão e deriva metadados do usuário", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          access_token: "token",
          user: {
            id: "user-1",
            email: "ana@example.com",
            user_metadata: { full_name: "Ana Silva", avatar_url: "avatar.png" },
          },
        },
      },
    });

    render(<AuthProvider><Probe /></AuthProvider>);

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("user-id")).toHaveTextContent("user-1");
    expect(screen.getByTestId("name")).toHaveTextContent("Ana Silva");
    expect(screen.getByTestId("email")).toHaveTextContent("ana@example.com");
    expect(screen.getByTestId("avatar")).toHaveTextContent("avatar.png");
  });

  it("reage a login e logout emitidos pelo Supabase", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(authStateCallback).toBeTypeOf("function"));

    act(() => {
      authStateCallback("SIGNED_IN", {
        user: {
          id: "user-2",
          email: "bia@example.com",
          user_metadata: { name: "Bia" },
        },
      });
    });
    expect(screen.getByTestId("user-id")).toHaveTextContent("user-2");
    expect(screen.getByTestId("name")).toHaveTextContent("Bia");

    act(() => authStateCallback("SIGNED_OUT", null));
    expect(screen.getByTestId("user-id")).toHaveTextContent("sem-user");
    expect(screen.getByTestId("name")).toHaveTextContent("Usuario");
  });

  it("inicia OAuth Google com callback na origem atual", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole("button", { name: "entrar" }));

    await waitFor(() => expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    }));
  });

  it("propaga erro de OAuth para a interface", async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({ error: new Error("OAuth indisponível") });
    render(<AuthProvider><Probe /></AuthProvider>);

    fireEvent.click(screen.getByRole("button", { name: "entrar" }));

    await waitFor(() => expect(screen.getByTestId("action-error")).toHaveTextContent("OAuth indisponível"));
  });

  it("encerra a sessão e cancela a assinatura ao desmontar", async () => {
    const view = render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole("button", { name: "sair" }));
    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledOnce());

    view.unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe("useAuth", () => {
  it("falha explicitamente quando usado fora do provider", () => {
    expect(() => render(<Probe />)).toThrow("useAuth deve ser usado dentro de AuthProvider");
  });
});
