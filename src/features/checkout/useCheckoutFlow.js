import { useCallback, useEffect, useState } from "react";
import { DocumentService } from "../../services/DocumentService";
import { PaymentService } from "../../services/PaymentService";
import showToast from "../../utils/toast";

const PENDING_PAYMENT_STORAGE_KEY = "kriou_pending_payment";
const FAILED_PAYMENT_STATUSES = ["rejected", "cancelled", "refunded", "charged_back"];

export function useCheckoutFlow({
  userId,
  checkoutComplete,
  setCheckoutComplete,
  setEditingDocId,
  setUserDocuments,
  restoreDocument,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingPayment, setPendingPayment] = useState(null);

  const sendConfirmationEmail = useCallback(async (doc) => {
    try {
      await PaymentService.sendConfirmationEmail(doc?.id);
    } catch (err) {
      console.warn("[useCheckoutFlow] Falha ao enviar e-mail de confirmação:", err.message);
    }
  }, []);

  const clearPendingPayment = useCallback(() => {
    setPendingPayment(null);
    window.sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
  }, []);

  const persistPendingPayment = useCallback((payment) => {
    setPendingPayment(payment);
    window.sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(payment));
  }, []);

  const handlePaymentSuccess = useCallback(async (paymentId) => {
    setIsProcessing(true);
    try {
      const confirmation = await PaymentService.confirmPayment(paymentId);

      if (confirmation?.status !== "approved") {
        throw new Error("O pagamento ainda não foi aprovado");
      }

      const refreshedDocuments = await DocumentService.fetchAll(userId);
      setUserDocuments(refreshedDocuments);
      const savedDoc = refreshedDocuments.find((doc) => doc.id === confirmation.documentId);
      if (savedDoc) restoreDocument?.(savedDoc);

      setCheckoutComplete(true);
      setEditingDocId(null);
      clearPendingPayment();
      showToast.success("Pagamento confirmado! Seu documento está sendo gerado.");
      window.history.replaceState({ page: "checkout" }, "", window.location.pathname);
      sendConfirmationEmail(savedDoc);
    } catch (err) {
      console.error("[useCheckoutFlow][ERRO] handlePaymentSuccess:", err);
      setPaymentError(err.message || "Não foi possível confirmar o pagamento.");
      showToast.error("Pagamento não confirmado. Verifique o status e tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }, [clearPendingPayment, restoreDocument, sendConfirmationEmail, setCheckoutComplete, setEditingDocId, setUserDocuments, userId]);

  const checkPendingPayment = useCallback(async ({ silent = false } = {}) => {
    if (!pendingPayment?.documentId || !userId) return false;

    if (!silent) setIsCheckingPayment(true);
    try {
      const confirmation = await PaymentService.confirmDocumentPayment(pendingPayment.documentId);
      const doc = await DocumentService.fetchById(pendingPayment.documentId, userId);

      if (confirmation?.status === "approved" || (doc?.status === "finalizado" && doc?.paymentStatus === "approved")) {
        const refreshedDocuments = await DocumentService.fetchAll(userId);
        setUserDocuments(refreshedDocuments);
        const restoredDoc = refreshedDocuments.find((item) => item.id === pendingPayment.documentId) || doc;
        restoreDocument?.(restoredDoc);
        setCheckoutComplete(true);
        setEditingDocId(null);
        clearPendingPayment();
        showToast.success("Pagamento confirmado! Seu documento está liberado.");
        sendConfirmationEmail(doc);
        return true;
      }

      if (FAILED_PAYMENT_STATUSES.includes(doc?.paymentStatus)) {
        setPaymentError("Pagamento não aprovado pelo Mercado Pago. Abra o checkout novamente e tente outro método.");
        return false;
      }

      if (!silent) {
        showToast.info("Pagamento ainda não confirmado pelo Mercado Pago.");
      }
      return false;
    } catch (err) {
      console.error("[useCheckoutFlow][ERRO] checkPendingPayment:", err);
      if (!silent) {
        setPaymentError("Não foi possível verificar o pagamento agora. Tente novamente em alguns segundos.");
      }
      return false;
    } finally {
      if (!silent) setIsCheckingPayment(false);
    }
  }, [
    clearPendingPayment,
    pendingPayment?.documentId,
    restoreDocument,
    sendConfirmationEmail,
    setCheckoutComplete,
    setEditingDocId,
    setUserDocuments,
    userId,
  ]);

  useEffect(() => {
    if (!userId) return;

    try {
      const stored = window.sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.userId && parsed.userId !== userId) {
          window.sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
          setPendingPayment(null);
          return;
        }

        if (parsed?.documentId) {
          setPendingPayment(parsed);
        }
      }
    } catch {
      window.sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const params = new URLSearchParams(window.location.search);
    const returnDocumentId = params.get("document_id");
    if (!returnDocumentId) return;

    setPendingPayment((current) => current?.documentId === returnDocumentId
      ? current
      : { documentId: returnDocumentId, userId, returnedFromProvider: true });
  }, [userId]);

  useEffect(() => {
    if (!pendingPayment?.documentId || checkoutComplete) return undefined;

    checkPendingPayment({ silent: true });
    const intervalId = window.setInterval(() => {
      checkPendingPayment({ silent: true });
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [checkPendingPayment, checkoutComplete, pendingPayment?.documentId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");
    const providerStatus = params.get("status");

    if (paymentId) {
      handlePaymentSuccess(paymentId);
    } else if (providerStatus === "failure") {
      setPaymentError("Pagamento não aprovado. Tente novamente.");
      clearPendingPayment();
    }
  }, [clearPendingPayment, handlePaymentSuccess]);

  const handleOpenPendingCheckout = useCallback(() => {
    if (!pendingPayment?.initPoint) return;
    window.open(pendingPayment.initPoint, "_blank", "noopener,noreferrer");
  }, [pendingPayment?.initPoint]);

  return {
    isProcessing,
    setIsProcessing,
    isCheckingPayment,
    paymentError,
    setPaymentError,
    pendingPayment,
    clearPendingPayment,
    persistPendingPayment,
    checkPendingPayment,
    handleOpenPendingCheckout,
  };
}
