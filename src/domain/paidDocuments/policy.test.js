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

  it("mantem edicao permitida quando muda varios dados nao identitarios", () => {
    const nextIdentity = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "Joao Silva",
        locadorCpf: "123.456.789-09",
        enderecoImovel: "Rua B, 200",
        valorAluguel: "R$ 2.500,00",
        prazoContrato: "24 meses",
        clausulaExtra: "Permitido animal de pequeno porte",
      },
    });

    const decision = evaluatePaidDocumentEdit({ existingDocument: paidDocument, nextIdentity });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.ALLOW_NORMAL_EDIT);
    expect(decision.identityCheck.score).toBe(0);
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

  it("bloqueia segunda alteracao sensivel mesmo quando tambem ha mudancas normais", () => {
    const nextIdentity = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "Maria Souza",
        locadorCpf: "987.654.321-00",
        enderecoImovel: "Rua B",
        valorAluguel: "R$ 2.500,00",
      },
    });

    const decision = evaluatePaidDocumentEdit({
      existingDocument: { ...paidDocument, sensitiveEditUsed: true },
      nextIdentity,
    });

    expect(decision.decision).toBe(PAID_DOCUMENT_DECISION.REQUIRE_NEW_DOCUMENT);
    expect(decision.changedFields).toContain("Locador Nome");
    expect(decision.changedFields).toContain("Locador Cpf");
    expect(decision.message).toContain("crie um novo documento");
  });
});
