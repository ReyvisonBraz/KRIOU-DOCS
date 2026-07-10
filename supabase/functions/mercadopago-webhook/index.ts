import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createAdminClient } from "../_shared/auth.ts";
import { json } from "../_shared/http.ts";
import { verifyMercadoPagoSignature } from "../_shared/mercadopago.ts";

const MP_API = "https://api.mercadopago.com";
const DOCUMENT_PRICE_IN_CENTS = 990;

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const webhookSecret = Deno.env.get("MP_WEBHOOK_SECRET");
    if (!accessToken || !webhookSecret) {
      return json({ error: "Webhook não configurado" }, 503);
    }

    const url = new URL(req.url);
    const queryDataId = url.searchParams.get("data.id") || "";
    const xSignature = req.headers.get("x-signature") || "";
    const xRequestId = req.headers.get("x-request-id") || "";

    const signatureIsValid = await verifyMercadoPagoSignature({
      xSignature,
      xRequestId,
      dataId: queryDataId,
      secret: webhookSecret,
    });

    if (!signatureIsValid) return json({ error: "Assinatura inválida" }, 401);

    const payload = await req.json();
    if (payload?.type !== "payment" || String(payload?.data?.id || "") !== queryDataId) {
      return json({ received: true, ignored: true });
    }

    const eventKey = `${payload.id || xRequestId}:${payload.action || "payment"}:${queryDataId}`;
    const supabase = createAdminClient();
    const { error: insertError } = await supabase
      .from("payment_webhook_events")
      .insert({
        event_key: eventKey,
        provider_event_id: payload.id ? String(payload.id) : null,
        request_id: xRequestId,
        payment_id: queryDataId,
        action: payload.action || null,
        live_mode: Boolean(payload.live_mode),
        payload,
      });

    if (insertError?.code === "23505") {
      const { data: existingEvent } = await supabase
        .from("payment_webhook_events")
        .select("processing_status")
        .eq("event_key", eventKey)
        .single();

      if (existingEvent?.processing_status === "processed") {
        return json({ received: true, duplicate: true });
      }
    }
    if (insertError && insertError.code !== "23505") throw insertError;

    const paymentResponse = await fetch(`${MP_API}/v1/payments/${queryDataId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!paymentResponse.ok) {
      await supabase.from("payment_webhook_events").update({
        processing_status: "failed",
        error_code: `provider_${paymentResponse.status}`,
        processed_at: new Date().toISOString(),
      }).eq("event_key", eventKey);
      return json({ error: "Falha ao consultar pagamento" }, 502);
    }

    const payment = await paymentResponse.json();
    const [userId, documentId, ...unexpected] = String(payment.external_reference || "").split("::");
    const amountInCents = Math.round(Number(payment.transaction_amount) * 100);

    if (
      unexpected.length ||
      !userId ||
      !documentId ||
      payment.currency_id !== "BRL" ||
      amountInCents !== DOCUMENT_PRICE_IN_CENTS
    ) {
      await supabase.from("payment_webhook_events").update({
        processing_status: "rejected",
        error_code: "payment_invariant_mismatch",
        processed_at: new Date().toISOString(),
      }).eq("event_key", eventKey);
      return json({ error: "Pagamento não corresponde ao pedido" }, 409);
    }

    const documentUpdate: Record<string, unknown> = {
      payment_status: payment.status || "pending",
      payment_id: String(payment.id),
      payment_method: payment.payment_method_id || null,
      payment_amount: Number(payment.transaction_amount),
    };

    if (payment.status === "approved") {
      documentUpdate.status = "finalizado";
      documentUpdate.paid_at = payment.date_approved || new Date().toISOString();
    }

    const { data: updatedDocument, error: updateError } = await supabase
      .from("documents")
      .update(documentUpdate)
      .eq("id", documentId)
      .eq("user_id", userId)
      .select("id")
      .single();

    if (updateError || !updatedDocument) {
      await supabase.from("payment_webhook_events").update({
        processing_status: "failed",
        error_code: "document_not_found",
        processed_at: new Date().toISOString(),
      }).eq("event_key", eventKey);
      return json({ error: "Documento não encontrado" }, 404);
    }

    await supabase.from("payment_webhook_events").update({
      processing_status: "processed",
      processed_at: new Date().toISOString(),
    }).eq("event_key", eventKey);

    return json({ received: true, paymentStatus: payment.status });
  } catch (error) {
    console.error("[mercadopago-webhook] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno no webhook" }, 500);
  }
});
