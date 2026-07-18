import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { PaymentService } from "./PaymentService";

vi.mock("../lib/supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

describe("PaymentService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("envia somente o ID do documento ao criar preferência", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { init_point: "https://provider.test/checkout" },
      error: null,
    });

    await PaymentService.createPreference("doc-123");

    expect(supabase.functions.invoke).toHaveBeenCalledWith("create-preference", {
      body: { documentId: "doc-123" },
    });
  });

  it("não aceita criação de preferência sem documento", () => {
    expect(() => PaymentService.createPreference()).toThrow("Documento inválido");
  });

  it("solicita confirmação server-side pelo ID do pagamento", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { status: "approved", documentId: "doc-123" },
      error: null,
    });

    await expect(PaymentService.confirmPayment("pay-123")).resolves.toEqual({
      status: "approved",
      documentId: "doc-123",
    });
  });

  it("verifica o pagamento diretamente pelo documento", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { status: "approved", documentId: "doc-123" },
      error: null,
    });

    await PaymentService.confirmDocumentPayment("doc-123");

    expect(supabase.functions.invoke).toHaveBeenCalledWith("verify-payment", {
      body: { documentId: "doc-123" },
    });
  });

  it("propaga falha segura da Edge Function", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Não autorizado" },
    });

    await expect(PaymentService.confirmPayment("pay-123")).rejects.toThrow("Não autorizado");
  });

  it("trata erro de domínio retornado pelo backend", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { error: "Valor ou moeda do pagamento não confere" },
      error: null,
    });

    await expect(PaymentService.confirmPayment("pay-123")).rejects.toThrow("Valor ou moeda");
  });

  it("solicita e-mail apenas pelo ID do documento", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { success: true },
      error: null,
    });

    await PaymentService.sendConfirmationEmail("doc-123");

    expect(supabase.functions.invoke).toHaveBeenCalledWith("send-email", {
      body: { documentId: "doc-123" },
    });
  });

  it("não solicita e-mail sem documento", () => {
    expect(() => PaymentService.sendConfirmationEmail()).toThrow("Documento inválido");
  });
});
