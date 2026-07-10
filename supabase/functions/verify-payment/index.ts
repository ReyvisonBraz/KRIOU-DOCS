import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

const MP_API = "https://api.mercadopago.com";
const DOCUMENT_PRICE_IN_CENTS = 990;

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

    const { paymentId } = await req.json();
    if (!paymentId || !/^[\w-]+$/.test(String(paymentId))) {
      return json({ error: "paymentId inválido" }, 400);
    }

    const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      console.error("[verify-payment] Mercado Pago rejeitou a consulta", response.status);
      return json({ error: "Falha ao verificar pagamento" }, 502);
    }

    const payment = await response.json();
    const [referenceUserId, documentId, ...unexpected] = String(payment.external_reference || "").split("::");
    const amountInCents = Math.round(Number(payment.transaction_amount) * 100);

    if (unexpected.length || referenceUserId !== user.id || !documentId) {
      return json({ error: "Pagamento não pertence ao usuário autenticado" }, 403);
    }

    if (payment.currency_id !== "BRL" || amountInCents !== DOCUMENT_PRICE_IN_CENTS) {
      console.error("[verify-payment] Divergência financeira", {
        paymentId: payment.id,
        currency: payment.currency_id,
        amountInCents,
      });
      return json({ error: "Valor ou moeda do pagamento não confere" }, 409);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id")
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
