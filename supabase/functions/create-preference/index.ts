import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

const MP_API = "https://api.mercadopago.com";
const DOCUMENT_PRICE = 9.90;

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const appUrl = Deno.env.get("APP_URL");

    if (!accessToken || !appUrl) {
      return json({ error: "Integração de pagamento não configurada" }, 503);
    }

    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    const { documentId } = await req.json();
    if (!documentId || typeof documentId !== "string") {
      return json({ error: "documentId é obrigatório" }, 400);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id, title")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return json({ error: "Documento não encontrado" }, 404);
    }

    const preference: Record<string, unknown> = {
      items: [{
        id: document.id,
        title: document.title || "Documento Kriou Docs",
        quantity: 1,
        currency_id: "BRL",
        unit_price: DOCUMENT_PRICE,
      }],
      payer: { email: user.email || "" },
      back_urls: {
        success: `${appUrl}/checkout`,
        failure: `${appUrl}/checkout`,
        pending: `${appUrl}/checkout`,
      },
      auto_return: "approved",
      external_reference: `${user.id}::${document.id}`,
    };

    const response = await fetch(`${MP_API}/checkout/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      console.error("[create-preference] Mercado Pago rejeitou a preferência", response.status);
      return json({ error: "Falha ao criar preferência de pagamento" }, 502);
    }

    const data = await response.json();
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        status: "aguardando_pagamento",
        payment_status: "pending",
        payment_preference_id: data.id,
        payment_amount: DOCUMENT_PRICE,
      })
      .eq("id", document.id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[create-preference] Falha ao persistir preferência", updateError.message);
      return json({ error: "Falha ao registrar preferência de pagamento" }, 500);
    }

    return json({ init_point: data.init_point, preference_id: data.id });
  } catch (error) {
    console.error("[create-preference] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao criar pagamento" }, 500);
  }
});
