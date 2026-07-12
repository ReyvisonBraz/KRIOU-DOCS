import {
  createPaidIdentitySnapshot,
  evaluatePaidDocumentEdit,
  PAID_DOCUMENT_DECISION,
  paidDocumentMessages,
} from "../../domain/paidDocuments";
import { DocumentService } from "../../services/DocumentService";
import showToast from "../../utils/toast";

export function usePaidDocumentEditFlow({
  isLegalDocument,
  documentType,
  editingDocId,
  userId,
  updateDocument,
  requestConfirm,
  setCheckoutComplete,
  setEditingDocId,
  setPaymentError,
  setUserDocuments,
  clearPendingPayment,
}) {
  const buildCurrentIdentity = (docData) => createPaidIdentitySnapshot({
    type: isLegalDocument ? "legal" : "resume",
    documentType: isLegalDocument ? documentType?.id || null : null,
    formData: isLegalDocument ? null : docData,
    legalData: isLegalDocument ? docData : null,
  });

  const handlePaidDocumentEdit = async (docData) => {
    const existingDoc = await DocumentService.fetchById(editingDocId, userId);
    const currentIdentity = buildCurrentIdentity(docData);
    const editDecision = evaluatePaidDocumentEdit({
      existingDocument: existingDoc,
      nextIdentity: currentIdentity,
    });
    const { decision, identityCheck, previousIdentity, changedFields } = editDecision;

    if (decision === PAID_DOCUMENT_DECISION.NOT_PAID) return false;

    if (decision === PAID_DOCUMENT_DECISION.REQUIRE_NEW_DOCUMENT) {
      setPaymentError(editDecision.message);
      showToast.error("Crie um novo documento para continuar.");
      return true;
    }

    const updateOptions = {
      status: "finalizado",
      paidIdentitySnapshot: previousIdentity,
    };

    if (decision === PAID_DOCUMENT_DECISION.REQUIRE_CONFIRMATION) {
      const confirmed = await requestConfirm({
        title: "Usar correção gratuita?",
        message: paidDocumentMessages.firstSensitiveEdit(changedFields),
        confirmLabel: "Usar correção gratuita",
        cancelLabel: "Voltar e revisar",
        danger: true,
      });

      if (!confirmed) return true;

      updateOptions.paidIdentitySnapshot = currentIdentity;
      updateOptions.sensitiveEditUsed = true;
      updateOptions.sensitiveEditUsedAt = new Date().toISOString();
      updateOptions.sensitiveEditSummary = {
        score: identityCheck.score,
        fields: identityCheck.changes.map((change) => change.label),
      };
    }

    await updateDocument(editingDocId, docData, updateOptions);
    const refreshedDocuments = await DocumentService.fetchAll(userId);
    setUserDocuments(refreshedDocuments);
    setCheckoutComplete(true);
    setEditingDocId(null);
    clearPendingPayment();
    showToast.success(
      identityCheck.level === "sensitive"
        ? "Correção gratuita aplicada. Documento atualizado."
        : "Documento pago atualizado sem nova cobrança."
    );
    return true;
  };

  return {
    handlePaidDocumentEdit,
  };
}
