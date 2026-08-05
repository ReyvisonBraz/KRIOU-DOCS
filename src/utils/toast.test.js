import { beforeEach, describe, expect, it, vi } from "vitest";

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  loading: vi.fn(),
  promise: vi.fn(),
  dismiss: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: toastMock }));

import { showToast } from "./toast";

describe("showToast", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usa o tipo semântico correto para avisos", () => {
    showToast.warning("Pagamento pendente.");

    expect(toastMock.warning).toHaveBeenCalledWith("Pagamento pendente.", { duration: 4500 });
  });

  it("permite sobrescrever opções sem perder os padrões", () => {
    showToast.error("Falha.", { duration: 1000, id: "payment" });

    expect(toastMock.error).toHaveBeenCalledWith("Falha.", { duration: 1000, id: "payment" });
  });

  it("padroniza mensagens de operações assíncronas", () => {
    const task = Promise.resolve("ok");
    showToast.promise(task, { success: "Documento salvo." });

    expect(toastMock.promise).toHaveBeenCalledWith(task, {
      loading: "Processando...",
      success: "Documento salvo.",
      error: "Não foi possível concluir a operação.",
    });
  });
});
