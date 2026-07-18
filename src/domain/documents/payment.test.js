import { describe, expect, it } from "vitest";
import {
  canDownloadDocument,
  getDocumentAccessStatus,
  isDocumentPaid,
  isDocumentPaymentPending,
  matchesDocumentPaymentFilter,
  requiresPaymentToAccess,
} from "./payment";

describe("document payment access policy", () => {
  it("libera apenas documento finalizado com pagamento aprovado", () => {
    const paid = { status: "finalizado", paymentStatus: "approved" };
    const unpaid = { status: "finalizado", paymentStatus: "pending" };

    expect(isDocumentPaid(paid)).toBe(true);
    expect(isDocumentPaid(unpaid)).toBe(false);
    expect(requiresPaymentToAccess(unpaid)).toBe(true);
  });

  it("classifica pagamento pendente sem tratar como rascunho", () => {
    const pending = { status: "aguardando_pagamento", paymentStatus: "pending" };

    expect(isDocumentPaymentPending(pending)).toBe(true);
    expect(getDocumentAccessStatus(pending)).toBe("pending_payment");
    expect(matchesDocumentPaymentFilter(pending, "pagamento_pendente")).toBe(true);
  });

  it("mantem rascunho editavel sem exigir pagamento", () => {
    const draft = { id: "draft-1", status: "rascunho" };

    expect(requiresPaymentToAccess(draft)).toBe(false);
    expect(getDocumentAccessStatus(draft)).toBe("draft");
    expect(matchesDocumentPaymentFilter(draft, "rascunhos")).toBe(true);
  });

  it("filtra documentos pagos", () => {
    const paid = { status: "finalizado", paymentStatus: "approved" };
    const pending = { status: "finalizado", paymentStatus: "pending" };

    expect(matchesDocumentPaymentFilter(paid, "pagos")).toBe(true);
    expect(matchesDocumentPaymentFilter(pending, "pagos")).toBe(false);
  });

  it("libera qualquer documento persistido da própria conta para administrador", () => {
    const unpaid = { id: "doc-1", status: "aguardando_pagamento", paymentStatus: "pending" };
    expect(canDownloadDocument(unpaid, { role: "admin" })).toBe(true);
    expect(canDownloadDocument(unpaid, { role: "user" })).toBe(false);
    expect(canDownloadDocument({ id: "draft-local", status: "rascunho" }, { role: "admin" })).toBe(false);
  });
});
