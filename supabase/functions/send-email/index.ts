/**
 * ============================================
 * KRIOU DOCS — Send Email via Resend
 * ============================================
 * Supabase Edge Function
 *
 * Envia e-mail com o documento PDF anexado
 * usando a API do Resend (https://resend.com).
 *
 * POST /send-email
 * Body: { to, subject, html, pdfBase64, pdfFilename }
 *
 * Environment:
 *   RESEND_API_KEY — Chave de API do Resend
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "Kriou Docs <noreply@kriou-docs.com.br>";

serve(async (req) => {
  try {
    const { to, subject, html, pdfBase64, pdfFilename } = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "to e subject são obrigatórios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const payload = {
      from: FROM_EMAIL,
      to: [to],
      subject,
      html: html || `<p>Seu documento está pronto no Kriou Docs.</p>`,
    };

    if (pdfBase64 && pdfFilename) {
      payload.attachments = [
        {
          filename: pdfFilename,
          content: pdfBase64,
          encoding: "base64",
        },
      ];
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[send-email][ERRO] Resend API:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Falha ao enviar e-mail" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[send-email][ERRO]", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
