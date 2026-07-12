import { describe, expect, it } from "vitest";
import {
  parseMercadoPagoExternalReference,
  validateMercadoPagoDocumentPayment,
} from "../../supabase/functions/_shared/mercadopago.ts";

const approvedPayment = {
  external_reference: "user-1::doc-1",
  currency_id: "BRL",
  transaction_amount: 9.9,
};

describe("Mercado Pago payment validation", () => {
  it("extrai usuario e documento do external_reference", () => {
    expect(parseMercadoPagoExternalReference("user-1::doc-1")).toEqual({
      userId: "user-1",
      documentId: "doc-1",
      hasUnexpectedParts: false,
    });
  });

  it("aceita pagamento do documento correto em BRL e valor esperado", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: approvedPayment,
      expectedUserId: "user-1",
      expectedDocumentId: "doc-1",
    });

    expect(result.valid).toBe(true);
    expect(result.reference).toEqual({
      userId: "user-1",
      documentId: "doc-1",
      hasUnexpectedParts: false,
    });
    expect(result.amountInCents).toBe(990);
  });

  it("rejeita referencia externa adulterada", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: { ...approvedPayment, external_reference: "user-1::doc-1::extra" },
      expectedUserId: "user-1",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("invalid_external_reference");
  });

  it("rejeita pagamento de outro usuario", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: approvedPayment,
      expectedUserId: "user-2",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("user_mismatch");
  });

  it("rejeita pagamento de outro documento quando informado", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: approvedPayment,
      expectedUserId: "user-1",
      expectedDocumentId: "doc-2",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("document_mismatch");
  });

  it("rejeita moeda diferente de BRL", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: { ...approvedPayment, currency_id: "USD" },
      expectedUserId: "user-1",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("currency_mismatch");
  });

  it("rejeita valor diferente do plano avulso", () => {
    const result = validateMercadoPagoDocumentPayment({
      payment: { ...approvedPayment, transaction_amount: 19.9 },
      expectedUserId: "user-1",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("amount_mismatch");
    expect(result.amountInCents).toBe(1990);
  });
});
