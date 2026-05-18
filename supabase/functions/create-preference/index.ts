/**
 * ============================================
 * KRIOU DOCS — Create Mercado Pago Preference
 * ============================================
 * Supabase Edge Function
 *
 * Cria uma preferência de pagamento no Mercado Pago
 * e retorna a URL do Checkout Pro para redirecionamento.
 *
 * POST /create-preference
 * Body: { title, price, userId, documentId, email }
 *
 * Response: { init_point, preference_id }
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") || "";
const MP_API = "https://api.mercadopago.com";

serve(async (req) => {
  try {
    const { title, price, userId, documentId, email } = await req.json();

    if (!title || !price || !userId || !documentId) {
      return new Response(
        JSON.stringify({ error: "title, price, userId e documentId são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const preference = {
      items: [
        {
          id: documentId,
          title: title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: Number(price),
        },
      ],
      payer: {
        email: email || "",
      },
      back_urls: {
        success: `${req.headers.get("origin") || "https://kriou-docs.vercel.app"}/checkout/success`,
        failure: `${req.headers.get("origin") || "https://kriou-docs.vercel.app"}/checkout/failure`,
        pending: `${req.headers.get("origin") || "https://kriou-docs.vercel.app"}/checkout/pending`,
      },
      auto_return: "approved",
      external_reference: `${userId}::${documentId}`,
      notification_url: `${req.headers.get("origin") || "https://kriou-docs.vercel.app"}/api/webhooks/mercadopago`,
    };

    const response = await fetch(`${MP_API}/checkout/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[create-preference][ERRO] Mercado Pago API:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Falha ao criar preferência de pagamento" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        init_point: data.init_point,
        preference_id: data.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[create-preference][ERRO]", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
