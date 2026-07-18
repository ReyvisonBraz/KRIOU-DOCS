import { describe, expect, it } from "vitest";
import { PAGE_TO_PATH, hasAuthenticationResponse, resolveHistoryIndex, resolveInitialPage, resolvePopstatePage } from "./navigation";

describe("navigation domain", () => {
  it.each([["#access_token=abc", true], ["#refresh_token=abc", true], ["#type=recovery", true], ["#error_description=denied", true], ["#section", false], ["", false]])(
    "detecta resposta de autenticação em %s", (hash, expected) => expect(hasAuthenticationResponse(hash)).toBe(expected),
  );

  it.each(Object.entries(PAGE_TO_PATH))("resolve a rota de %s", (page, path) => {
    expect(resolveInitialPage(path)).toBe(page);
    expect(resolvePopstatePage(null, path)).toBe(page);
  });

  it("prioriza callback quando a URL contém credenciais OAuth", () => {
    expect(resolveInitialPage("/dashboard", "#access_token=abc")).toBe("authCallback");
  });

  it("cai para landing em rota desconhecida", () => {
    expect(resolveInitialPage("/nao-existe")).toBe("landing");
    expect(resolvePopstatePage(null, "/nao-existe")).toBe("landing");
  });

  it.each([[{ appIndex: 3 }, 3], [{ appIndex: -1 }, 0], [{ appIndex: "3" }, 0], [null, 0]])(
    "normaliza o índice do histórico", (state, expected) => expect(resolveHistoryIndex(state)).toBe(expected),
  );

  it("prioriza a página registrada pelo histórico", () => {
    expect(resolvePopstatePage({ page: "profile" }, "/dashboard")).toBe("profile");
  });
});
