import { describe, expect, it } from "vitest";
import { createPaidIdentitySnapshot } from "./identity";
import {
  evaluatePaidDocumentEdit,
  PAID_DOCUMENT_DECISION,
} from "./policy";

const paidDocument = {
  id: "doc-1",
  type: "legal",
  documentType: "contrato_locacao",
  status: "finalizado",
  paymentStatus: "approved",
  legalData: {
    locadorNome: "João Silva",
    locadorCpf: "123.456.789-09",
    enderecoImovel: "Rua A",
  },
  paidIdentitySnapshot: createPaidIdentitySnapshot({
    type: "legal",
    documentType: "contrato_locacao",
    legalData: {
      locadorNome: "João Silva",
      locadorCpf: "123.456.789-09",
      enderecoImovel: "Rua A",
    },
  }),
};

describe("paid document policy", () => {
  it("retorna not_paid para documento ainda não pago", () => {
    const decision = evaluatePaidDocumentEdit({
      existingDocument: { ...paidDocument, status: "aguardando_pagamento", paymentStatus: "pending" },
      nextIdentity: paidDocument.paidIdentitySnapshot,
    });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.NOT_PAID);
  });

  it("permite edição normal sem confirmação", () => {
    const nextIdentity = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "João Silva",
        locadorCpf: "123.456.789-09",
        enderecoImovel: "Rua B",
      },
    });

    const decision = evaluatePaidDocumentEdit({ existingDocument: paidDocument, nextIdentity });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.ALLOW_NORMAL_EDIT);
  });

  it("exige confirmação na primeira alteração sensível", () => {
    const nextIdentity = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "Maria Souza",
        locadorCpf: "123.456.789-09",
      },
    });

    const decision = evaluatePaidDocumentEdit({ existingDocument: paidDocument, nextIdentity });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.REQUIRE_CONFIRMATION);
    expect(decision.message).toContain("correção gratuita");
  });

  it("exige novo documento se alteração sensível já foi usada", () => {
    const nextIdentity = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "Maria Souza",
        locadorCpf: "123.456.789-09",
      },
    });

    const decision = evaluatePaidDocumentEdit({
      existingDocument: { ...paidDocument, sensitiveEditUsed: true },
      nextIdentity,
    });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.REQUIRE_NEW_DOCUMENT);
  });
});
