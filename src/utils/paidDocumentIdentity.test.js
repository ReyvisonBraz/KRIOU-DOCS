import { describe, expect, it } from "vitest";
import {
  comparePaidIdentity,
  createPaidIdentitySnapshot,
  summarizeIdentityChanges,
} from "./paidDocumentIdentity";

describe("paidDocumentIdentity", () => {
  it("não marca endereço como alteração sensível", () => {
    const paid = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "João Silva",
        locadorCpf: "123.456.789-09",
        enderecoImovel: "Rua A, 10",
      },
    });

    const next = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "João Silva",
        locadorCpf: "123.456.789-09",
        enderecoImovel: "Rua B, 200",
      },
    });

    expect(comparePaidIdentity(paid, next)).toMatchObject({
      level: "normal",
      score: 0,
      changes: [],
    });
  });

  it("marca nome e CPF como alteração sensível", () => {
    const paid = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "João Silva",
        locadorCpf: "123.456.789-09",
      },
    });

    const next = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: {
        locadorNome: "Maria Souza",
        locadorCpf: "987.654.321-00",
      },
    });

    const result = comparePaidIdentity(paid, next);

    expect(result.level).toBe("sensitive");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(summarizeIdentityChanges(result.changes)).toContain("Locador Nome");
  });

  it("marca troca de tipo jurídico como alteração crítica", () => {
    const paid = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "contrato_locacao",
      legalData: { locadorNome: "João Silva" },
    });

    const next = createPaidIdentitySnapshot({
      type: "legal",
      documentType: "procuracao",
      legalData: { locadorNome: "João Silva" },
    });

    expect(comparePaidIdentity(paid, next)).toMatchObject({
      level: "critical",
      score: 100,
    });
  });
});
