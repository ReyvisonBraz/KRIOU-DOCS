import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";
import { createPaidIdentitySnapshot } from "../_shared/document_identity.ts";
import { validateMercadoPagoDocumentPayment } from "../_shared/mercadopago.ts";

const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) return json({ error: "Integração de pagamento não configurada" }, 503);

    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    const { paymentId, documentId: requestedDocumentId } = await req.json();
    if (paymentId && !/^[\w-]+$/.test(String(paymentId))) {
      return json({ error: "paymentId inválido" }, 400);
    }
    if (!paymentId && (!requestedDocumentId || typeof requestedDocumentId !== "string")) {
      return json({ error: "paymentId ou documentId é obrigatório" }, 400);
    }

    if (!paymentId) {
      const { data: ownedDocument } = await supabase
        .from("documents")
        .select("id")
        .eq("id", requestedDocumentId)
        .eq("user_id", user.id)
        .single();
      if (!ownedDocument) return json({ error: "Documento não encontrado" }, 404);
    }

    const paymentUrl = paymentId
      ? `${MP_API}/v1/payments/${paymentId}`
      : `${MP_API}/v1/payments/search?external_reference=${encodeURIComponent(`${user.id}::${requestedDocumentId}`)}&sort=date_created&criteria=desc`;
    const response = await fetch(paymentUrl, { headers: { "Authorization": `Bearer ${accessToken}` } });

    if (!response.ok) {
      console.error("[verify-payment] Mercado Pago rejeitou a consulta", response.status);
      return json({ error: "Falha ao verificar pagamento" }, 502);
    }

    const providerData = await response.json();
    const candidates = paymentId ? [providerData] : (providerData.results || []);
    const payment = candidates.find((item: { status?: string }) => item.status === "approved") || candidates[0];
    if (!payment) return json({ status: "pending", documentId: requestedDocumentId });
    const paymentValidation = validateMercadoPagoDocumentPayment({
      payment,
      expectedUserId: user.id,
      expectedDocumentId: requestedDocumentId || null,
    });
    const { documentId } = paymentValidation.reference;

    if (["user_mismatch", "document_mismatch", "invalid_external_reference"].includes(paymentValidation.reason || "")) {
      return json({ error: "Pagamento n?o pertence ao usu?rio autenticado" }, 403);
    }

    if (!paymentValidation.valid) {
      console.error("[verify-payment] Diverg?ncia financeira", {
        paymentId: payment.id,
        currency: payment.currency_id,
        amountInCents: paymentValidation.amountInCents,
      });
      return json({ error: "Valor ou moeda do pagamento n?o confere" }, 409);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id, type, document_type, form_data, legal_data")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return json({ error: "Documento do pagamento não encontrado" }, 404);
    }

    if (payment.status !== "approved") {
      await supabase
        .from("documents")
        .update({ payment_status: payment.status || "pending" })
        .eq("id", document.id)
        .eq("user_id", user.id);

      return json({ status: payment.status || "pending", documentId: document.id });
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "finalizado",
        payment_status: "approved",
        payment_id: String(payment.id),
        payment_method: payment.payment_method_id || null,
        payment_amount: Number(payment.transaction_amount),
        paid_at: payment.date_approved || new Date().toISOString(),
        paid_identity_snapshot: createPaidIdentitySnapshot(document),
        sensitive_edit_used: false,
        sensitive_edit_used_at: null,
        sensitive_edit_summary: null,
      })
      .eq("id", document.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[verify-payment] Falha ao liberar documento", updateError.message);
      return json({ error: "Pagamento aprovado, mas a liberação falhou" }, 500);
    }

    return json({ status: "approved", paymentId: String(payment.id), documentId: document.id });
  } catch (error) {
    console.error("[verify-payment] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao verificar pagamento" }, 500);
  }
});
