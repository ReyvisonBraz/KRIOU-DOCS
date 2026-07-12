/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPaidIdentitySnapshot } from "../../domain/paidDocuments";
import { DocumentService } from "../../services/DocumentService";
import showToast from "../../utils/toast";
import { usePaidDocumentEditFlow } from "./usePaidDocumentEditFlow";

vi.mock("../../services/DocumentService", () => ({
  DocumentService: {
    fetchAll: vi.fn(),
    fetchById: vi.fn(),
  },
}));

vi.mock("../../utils/toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const paidDocument = {
  id: "doc-1",
  type: "legal",
  documentType: "contrato_locacao",
  status: "finalizado",
  paymentStatus: "approved",
  legalData: {
    locadorNome: "Joao Silva",
    locadorCpf: "123.456.789-09",
    enderecoImovel: "Rua A",
  },
  paidIdentitySnapshot: createPaidIdentitySnapshot({
    type: "legal",
    documentType: "contrato_locacao",
    legalData: {
      locadorNome: "Joao Silva",
      locadorCpf: "123.456.789-09",
      enderecoImovel: "Rua A",
    },
  }),
};

const baseProps = {
  isLegalDocument: true,
  documentType: { id: "contrato_locacao" },
  editingDocId: "doc-1",
  userId: "user-1",
  updateDocument: vi.fn(),
  requestConfirm: vi.fn(),
  setCheckoutComplete: vi.fn(),
  setEditingDocId: vi.fn(),
  setPaymentError: vi.fn(),
  setUserDocuments: vi.fn(),
  clearPendingPayment: vi.fn(),
};

function renderPaidEditFlow(overrides = {}) {
  const props = { ...baseProps, ...overrides };
  return renderHook(() => usePaidDocumentEditFlow(props));
}

describe("usePaidDocumentEditFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DocumentService.fetchById.mockResolvedValue(paidDocument);
    DocumentService.fetchAll.mockResolvedValue([paidDocument]);
  });

  it("aplica correcao gratuita quando primeira alteracao sensivel e confirmada", async () => {
    baseProps.requestConfirm.mockResolvedValue(true);
    const { result } = renderPaidEditFlow();

    await act(async () => {
      const handled = await result.current.handlePaidDocumentEdit({
        locadorNome: "Maria Souza",
        locadorCpf: "123.456.789-09",
        enderecoImovel: "Rua A",
      });
      expect(handled).toBe(true);
    });

    expect(baseProps.requestConfirm).toHaveBeenCalledWith(expect.objectContaining({
      danger: true,
      confirmLabel: "Usar correção gratuita",
    }));
    expect(baseProps.updateDocument).toHaveBeenCalledWith(
      "doc-1",
      expect.objectContaining({ locadorNome: "Maria Souza" }),
      expect.objectContaining({
        status: "finalizado",
        sensitiveEditUsed: true,
        sensitiveEditSummary: expect.objectContaining({
          fields: expect.arrayContaining(["Locador Nome"]),
        }),
      })
    );
    expect(baseProps.setUserDocuments).toHaveBeenCalledWith([paidDocument]);
    expect(baseProps.setCheckoutComplete).toHaveBeenCalledWith(true);
    expect(baseProps.setEditingDocId).toHaveBeenCalledWith(null);
    expect(baseProps.clearPendingPayment).toHaveBeenCalled();
    expect(showToast.success).toHaveBeenCalled();
  });

  it("bloqueia nova cobranca quando a segunda alteracao sensivel exige novo documento", async () => {
    DocumentService.fetchById.mockResolvedValue({ ...paidDocument, sensitiveEditUsed: true });
    const { result } = renderPaidEditFlow();

    await act(async () => {
      const handled = await result.current.handlePaidDocumentEdit({
        locadorNome: "Maria Souza",
        locadorCpf: "987.654.321-00",
      });
      expect(handled).toBe(true);
    });

    expect(baseProps.setPaymentError).toHaveBeenCalledWith(expect.stringContaining("crie um novo documento"));
    expect(showToast.error).toHaveBeenCalledWith("Crie um novo documento para continuar.");
    expect(baseProps.updateDocument).not.toHaveBeenCalled();
  });

  it("retorna false quando documento ainda nao esta pago", async () => {
    DocumentService.fetchById.mockResolvedValue({
      ...paidDocument,
      status: "aguardando_pagamento",
      paymentStatus: "pending",
    });
    const { result } = renderPaidEditFlow();

    await act(async () => {
      const handled = await result.current.handlePaidDocumentEdit({
        locadorNome: "Joao Silva",
      });
      expect(handled).toBe(false);
    });

    expect(baseProps.updateDocument).not.toHaveBeenCalled();
    expect(baseProps.requestConfirm).not.toHaveBeenCalled();
  });
});
