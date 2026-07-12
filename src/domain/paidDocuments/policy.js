import {
  comparePaidIdentity,
  createPaidIdentitySnapshot,
  summarizeIdentityChanges,
} from "./identity";
import { paidDocumentMessages } from "./messages";

export const PAID_DOCUMENT_DECISION = {
  NOT_PAID: "not_paid",
  ALLOW_NORMAL_EDIT: "allow_normal_edit",
  REQUIRE_CONFIRMATION: "require_confirmation",
  REQUIRE_NEW_DOCUMENT: "require_new_document",
};

export function isPaidDocument(document) {
  return document?.status === "finalizado" && document?.paymentStatus === "approved";
}

export function createIdentityFromDocument(document) {
  return createPaidIdentitySnapshot({
    type: document?.type,
    documentType: document?.documentType || null,
    formData: document?.formData || null,
    legalData: document?.legalData || null,
  });
}

export function evaluatePaidDocumentEdit({ existingDocument, nextIdentity }) {
  if (!isPaidDocument(existingDocument)) {
    return {
      decision: PAID_DOCUMENT_DECISION.NOT_PAID,
      identityCheck: { level: "normal", score: 0, changes: [] },
      changedFields: "dados principais",
      message: null,
    };
  }

  const previousIdentity = existingDocument.paidIdentitySnapshot || createIdentityFromDocument(existingDocument);
  const identityCheck = comparePaidIdentity(previousIdentity, nextIdentity);
  const changedFields = summarizeIdentityChanges(identityCheck.changes);

  if (identityCheck.level === "critical") {
    return {
      decision: PAID_DOCUMENT_DECISION.REQUIRE_NEW_DOCUMENT,
      previousIdentity,
      identityCheck,
      changedFields,
      message: paidDocumentMessages.criticalChange,
    };
  }

  if (identityCheck.level === "sensitive" && existingDocument.sensitiveEditUsed) {
    return {
      decision: PAID_DOCUMENT_DECISION.REQUIRE_NEW_DOCUMENT,
      previousIdentity,
      identityCheck,
      changedFields,
      message: paidDocumentMessages.alreadyUsedSensitiveEdit(changedFields),
    };
  }

  if (identityCheck.level === "sensitive") {
    return {
      decision: PAID_DOCUMENT_DECISION.REQUIRE_CONFIRMATION,
      previousIdentity,
      identityCheck,
      changedFields,
      message: paidDocumentMessages.firstSensitiveEdit(changedFields),
    };
  }

  return {
    decision: PAID_DOCUMENT_DECISION.ALLOW_NORMAL_EDIT,
    previousIdentity,
    identityCheck,
    changedFields,
    message: null,
  };
}
