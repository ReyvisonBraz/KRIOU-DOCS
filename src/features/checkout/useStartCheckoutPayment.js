import { sanitizeFormData } from "../../utils/sanitization";
import { PaymentService } from "../../services/PaymentService";
import showToast from "../../utils/toast";

export function useStartCheckoutPayment({
  isLegalDocument,
  formData,
  legalFormData,
  editingDocId,
  userId,
  email,
  saveDocument,
  updateDocument,
  setCheckoutComplete,
  setEditingDocId,
  setIsProcessing,
  setPaymentError,
  persistPendingPayment,
  handlePaidDocumentEdit,
  paymentMockEnabled,
}) {
  const handlePayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);
    let checkoutWindow = null;

    try {
      const docData = sanitizeFormData(isLegalDocument ? legalFormData : formData);
      if (editingDocId) {
        const handledAsPaidEdit = await handlePaidDocumentEdit(docData);
        if (handledAsPaidEdit) {
          return;
        }
      }

      let savedDoc;
      if (editingDocId) {
        await updateDocument(editingDocId, docData, { status: "aguardando_pagamento" });
        setEditingDocId(null);
        savedDoc = { id: editingDocId };
      } else {
        savedDoc = await saveDocument(docData, { status: "aguardando_pagamento" });
      }

      if (paymentMockEnabled) {
        setCheckoutComplete(true);
        showToast.info("Pagamento simulado: recurso exclusivo do ambiente local.");
        return;
      }

      checkoutWindow = window.open("", "_blank");
      const preference = await PaymentService.createPreference(savedDoc?.id);

      if (!preference?.init_point) {
        throw new Error("O provedor não retornou a URL de pagamento");
      }

      const pending = {
        documentId: savedDoc?.id,
        initPoint: preference.init_point,
        preferenceId: preference.preference_id,
        userId,
        payerEmail: email || null,
        createdAt: new Date().toISOString(),
      };

      persistPendingPayment(pending);

      if (checkoutWindow) {
        checkoutWindow.opener = null;
        checkoutWindow.location.href = preference.init_point;
      } else {
        setPaymentError("O navegador bloqueou a nova aba. Use o botão 'Abrir checkout novamente' abaixo.");
      }
    } catch (err) {
      checkoutWindow?.close();
      console.error("[useStartCheckoutPayment][ERRO] handlePayment:", err);
      setPaymentError(err.message || "Erro ao processar pagamento. Tente novamente.");
      showToast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handlePayment,
  };
}
