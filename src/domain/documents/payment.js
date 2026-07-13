const PENDING_PAYMENT_STATUSES = new Set([
  "pending",
  "in_process",
  "in_mediation",
  "authorized",
]);

const FAILED_PAYMENT_STATUSES = new Set([
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

export function isLocalDraftDocument(document) {
  return String(document?.id || "").startsWith("draft-") || document?.status === "rascunho";
}

export function isDocumentPaid(document) {
  return document?.status === "finalizado" && document?.paymentStatus === "approved";
}

export function isDocumentPaymentPending(document) {
  if (!document) return false;
  return (
    document.status === "aguardando_pagamento" ||
    PENDING_PAYMENT_STATUSES.has(document.paymentStatus)
  );
}

export function isDocumentPaymentFailed(document) {
  return FAILED_PAYMENT_STATUSES.has(document?.paymentStatus);
}

export function requiresPaymentToAccess(document) {
  if (!document || isLocalDraftDocument(document)) return false;
  return !isDocumentPaid(document);
}

export function getDocumentAccessStatus(document) {
  if (isDocumentPaid(document)) return "paid";
  if (isDocumentPaymentPending(document)) return "pending_payment";
  if (isDocumentPaymentFailed(document)) return "payment_failed";
  if (isLocalDraftDocument(document)) return "draft";
  return "unpaid";
}

export function matchesDocumentPaymentFilter(document, filter) {
  switch (filter) {
    case "pagos":
      return isDocumentPaid(document);
    case "pagamento_pendente":
      return isDocumentPaymentPending(document);
    case "nao_pagos":
      return requiresPaymentToAccess(document) && !isDocumentPaymentPending(document);
    case "rascunhos":
      return isLocalDraftDocument(document);
    case "todos":
    default:
      return true;
  }
}
