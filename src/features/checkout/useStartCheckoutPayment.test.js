/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStartCheckoutPayment } from "./useStartCheckoutPayment";
import { PaymentService } from "../../services/PaymentService";
import showToast from "../../utils/toast";

vi.mock("../../services/PaymentService", () => ({
  PaymentService: {
    createPreference: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const baseProps = {
  isLegalDocument: false,
  formData: { nome: "Cliente Teste", html: "<b>texto</b>" },
  legalFormData: null,
  editingDocId: null,
  userId: "user-1",
  email: "cliente@test.com",
  saveDocument: vi.fn(),
  updateDocument: vi.fn(),
  setCheckoutComplete: vi.fn(),
  setEditingDocId: vi.fn(),
  setIsProcessing: vi.fn(),
  setPaymentError: vi.fn(),
  persistPendingPayment: vi.fn(),
  handlePaidDocumentEdit: vi.fn(),
  paymentMockEnabled: false,
};

function renderStartPayment(overrides = {}) {
  const props = { ...baseProps, ...overrides };
  return renderHook(() => useStartCheckoutPayment(props));
}

describe("useStartCheckoutPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva documento novo, cria preferencia e persiste pagamento pendente", async () => {
    const checkoutWindow = { opener: "app", location: { href: "" }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(checkoutWindow);
    baseProps.saveDocument.mockResolvedValue({ id: "doc-1" });
    PaymentService.createPreference.mockResolvedValue({
      init_point: "https://provider.test/checkout",
      preference_id: "pref-1",
    });

    const { result } = renderStartPayment();

    await act(async () => {
      await result.current.handlePayment();
    });

    expect(baseProps.setPaymentError).toHaveBeenCalledWith(null);
    expect(baseProps.setIsProcessing).toHaveBeenNthCalledWith(1, true);
    expect(baseProps.saveDocument).toHaveBeenCalledWith(
      expect.objectContaining({ nome: "Cliente Teste" }),
      { status: "aguardando_pagamento" }
    );
    expect(PaymentService.createPreference).toHaveBeenCalledWith("doc-1");
    expect(baseProps.persistPendingPayment).toHaveBeenCalledWith(expect.objectContaining({
      documentId: "doc-1",
      initPoint: "https://provider.test/checkout",
      preferenceId: "pref-1",
      userId: "user-1",
      payerEmail: "cliente@test.com",
    }));
    expect(checkoutWindow.opener).toBeNull();
    expect(checkoutWindow.location.href).toBe("https://provider.test/checkout");
    expect(baseProps.setIsProcessing).toHaveBeenLastCalledWith(false);
  });

  it("usa mock local sem criar preferencia no Mercado Pago", async () => {
    baseProps.saveDocument.mockResolvedValue({ id: "doc-1" });

    const { result } = renderStartPayment({ paymentMockEnabled: true });

    await act(async () => {
      await result.current.handlePayment();
    });

    expect(PaymentService.createPreference).not.toHaveBeenCalled();
    expect(baseProps.setCheckoutComplete).toHaveBeenCalledWith(true);
    expect(showToast.info).toHaveBeenCalledWith("Pagamento simulado: recurso exclusivo do ambiente local.");
  });

  it("interrompe quando edicao paga ja foi tratada", async () => {
    const { result } = renderStartPayment({
      editingDocId: "doc-1",
      handlePaidDocumentEdit: vi.fn().mockResolvedValue(true),
    });

    await act(async () => {
      await result.current.handlePayment();
    });

    expect(baseProps.saveDocument).not.toHaveBeenCalled();
    expect(baseProps.updateDocument).not.toHaveBeenCalled();
    expect(PaymentService.createPreference).not.toHaveBeenCalled();
  });
});
