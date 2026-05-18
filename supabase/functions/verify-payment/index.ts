/**
 * ============================================
 * KRIOU DOCS — Verify Mercado Pago Payment
 * ============================================
 * Supabase Edge Function
 *
 * Verifica o status de um pagamento no Mercado Pago.
 *
 * GET /verify-payment?payment_id=12345
 *
 * Response: { status, payment_id, external_reference, payer_email }
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") || "";
const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("payment_id");

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: "payment_id é obrigatório" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[verify-payment][ERRO] Mercado Pago API:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Falha ao verificar pagamento" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const payment = await response.json();

    return new Response(
      JSON.stringify({
        status: payment.status,
        status_detail: payment.status_detail,
        payment_id: payment.id,
        external_reference: payment.external_reference,
        payer_email: payment.payer?.email,
        payment_method: payment.payment_method_id,
        transaction_amount: payment.transaction_amount,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verify-payment][ERRO]", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
