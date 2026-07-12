/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckoutFlow } from "./useCheckoutFlow";
import { DocumentService } from "../../services/DocumentService";
import { PaymentService } from "../../services/PaymentService";
import showToast from "../../utils/toast";

vi.mock("../../services/DocumentService", () => ({
  DocumentService: {
    fetchAll: vi.fn(),
    fetchById: vi.fn(),
  },
}));

vi.mock("../../services/PaymentService", () => ({
  PaymentService: {
    confirmPayment: vi.fn(),
    sendConfirmationEmail: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const hookProps = {
  userId: "user-1",
  checkoutComplete: false,
  setCheckoutComplete: vi.fn(),
  setEditingDocId: vi.fn(),
  setUserDocuments: vi.fn(),
};

function renderCheckoutFlow(overrides = {}) {
  const props = { ...hookProps, ...overrides };
  return renderHook(() => useCheckoutFlow(props));
}

describe("useCheckoutFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/checkout");
  });

  it("confirma pagamento retornado pelo Mercado Pago e libera o documento", async () => {
    const paidDocument = { id: "doc-1", status: "finalizado", paymentStatus: "approved" };
    PaymentService.confirmPayment.mockResolvedValue({
      status: "approved",
      documentId: "doc-1",
    });
    DocumentService.fetchAll.mockResolvedValue([paidDocument]);

    window.history.replaceState({}, "", "/checkout?payment_id=pay-1&status=approved");
    renderCheckoutFlow();

    await waitFor(() => {
      expect(hookProps.setCheckoutComplete).toHaveBeenCalledWith(true);
    });

    expect(PaymentService.confirmPayment).toHaveBeenCalledWith("pay-1");
    expect(hookProps.setUserDocuments).toHaveBeenCalledWith([paidDocument]);
    expect(hookProps.setEditingDocId).toHaveBeenCalledWith(null);
    expect(PaymentService.sendConfirmationEmail).toHaveBeenCalledWith("doc-1");
    expect(showToast.success).toHaveBeenCalledWith("Pagamento confirmado! Seu documento está sendo gerado.");
    expect(window.location.search).toBe("");
  });

  it("verifica pagamento pendente salvo na sessao e libera quando ja foi aprovado", async () => {
    const pendingPayment = {
      documentId: "doc-1",
      initPoint: "https://provider.test/checkout",
      userId: "user-1",
    };
    const paidDocument = { id: "doc-1", status: "finalizado", paymentStatus: "approved" };
    window.sessionStorage.setItem("kriou_pending_payment", JSON.stringify(pendingPayment));
    DocumentService.fetchById.mockResolvedValue(paidDocument);
    DocumentService.fetchAll.mockResolvedValue([paidDocument]);

    renderCheckoutFlow();

    await waitFor(() => {
      expect(DocumentService.fetchById).toHaveBeenCalledWith("doc-1", "user-1");
    });
    await waitFor(() => {
      expect(hookProps.setCheckoutComplete).toHaveBeenCalledWith(true);
    });

    expect(hookProps.setUserDocuments).toHaveBeenCalledWith([paidDocument]);
    expect(PaymentService.sendConfirmationEmail).toHaveBeenCalledWith("doc-1");
    expect(window.sessionStorage.getItem("kriou_pending_payment")).toBeNull();
  });

  it("mantem a tela de espera com erro quando o pagamento pendente foi rejeitado", async () => {
    const pendingPayment = {
      documentId: "doc-1",
      initPoint: "https://provider.test/checkout",
      userId: "user-1",
    };
    window.sessionStorage.setItem("kriou_pending_payment", JSON.stringify(pendingPayment));
    DocumentService.fetchById.mockResolvedValue({
      id: "doc-1",
      status: "aguardando_pagamento",
      paymentStatus: "rejected",
    });

    const { result } = renderCheckoutFlow();

    await waitFor(() => {
      expect(result.current.paymentError).toBe(
        "Pagamento não aprovado pelo Mercado Pago. Abra o checkout novamente e tente outro método."
      );
    });

    expect(hookProps.setCheckoutComplete).not.toHaveBeenCalled();
    expect(PaymentService.sendConfirmationEmail).not.toHaveBeenCalled();
  });
});
