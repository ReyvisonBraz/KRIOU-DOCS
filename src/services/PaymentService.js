import { supabase } from "../lib/supabase";

async function invoke(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) throw new Error(error.message || `Falha ao executar ${functionName}`);
  if (data?.error) throw new Error(data.error);

  return data;
}

export const PaymentService = {
  createPreference(documentId) {
    if (!documentId) throw new Error("Documento inválido para pagamento");
    return invoke("create-preference", { documentId });
  },

  confirmPayment(paymentId) {
    if (!paymentId) throw new Error("Identificador do pagamento ausente");
    return invoke("verify-payment", { paymentId });
  },

  confirmDocumentPayment(documentId) {
    if (!documentId) throw new Error("Documento inválido para verificação");
    return invoke("verify-payment", { documentId });
  },

  sendConfirmationEmail(documentId) {
    if (!documentId) throw new Error("Documento inválido para confirmação por e-mail");
    return invoke("send-email", { documentId });
  },
};
