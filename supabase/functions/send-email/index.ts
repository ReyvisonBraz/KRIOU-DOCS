import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

const RESEND_API = "https://api.resend.com/emails";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeSubjectTitle(value: unknown) {
  return String(value || "Documento")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, 100) || "Documento";
}

function buildEmailHtml(document: { title?: string; code?: string }, appUrl: string) {
  const title = escapeHtml(document.title || "Documento");
  const code = escapeHtml(document.code || "—");

  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1f2937">
      <h2 style="color:#f43f5e">Kriou Docs</h2>
      <p>Olá!</p>
      <p>Seu documento <strong>${title}</strong> foi confirmado e está disponível no seu painel.</p>
      <p>Código do documento: <strong>${code}</strong></p>
      <p style="margin-top:24px">
        <a href="${appUrl}/dashboard" style="background:#f43f5e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Acessar Dashboard
        </a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#6b7280">Equipe Kriou Docs</p>
    </div>
  `;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const appUrl = Deno.env.get("APP_URL");

    if (!resendApiKey || !fromEmail || !appUrl) {
      return json({ error: "Serviço de e-mail não configurado" }, 503);
    }

    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user?.email) return json({ error: "Não autorizado" }, 401);

    const { documentId } = await req.json();
    if (!documentId || typeof documentId !== "string") {
      return json({ error: "documentId é obrigatório" }, 400);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id, title, code, status, payment_status, payment_id, confirmation_email_sent_at, confirmation_email_id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) return json({ error: "Documento não encontrado" }, 404);

    if (document.status !== "finalizado" || document.payment_status !== "approved" || !document.payment_id) {
      return json({ error: "Documento ainda não possui pagamento confirmado" }, 409);
    }

    if (document.confirmation_email_sent_at) {
      return json({ success: true, alreadySent: true, id: document.confirmation_email_id });
    }

    const response = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
        "Idempotency-Key": `document-confirmation-${document.id}-${document.payment_id}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: `Seu documento está pronto — ${safeSubjectTitle(document.title)}`,
        html: buildEmailHtml(document, appUrl),
      }),
    });

    if (!response.ok) {
      console.error("[send-email] Resend rejeitou o envio", response.status);
      return json({ error: "Falha ao enviar e-mail de confirmação" }, 502);
    }

    const data = await response.json();
    const { error: updateError } = await supabase
      .from("documents")
      .update({
        confirmation_email_sent_at: new Date().toISOString(),
        confirmation_email_id: data.id,
      })
      .eq("id", document.id)
      .eq("user_id", user.id)
      .is("confirmation_email_sent_at", null);

    if (updateError) {
      console.error("[send-email] E-mail enviado, mas rastreamento falhou", updateError.message);
    }

    return json({ success: true, alreadySent: false, id: data.id });
  } catch (error) {
    console.error("[send-email] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao enviar confirmação" }, 500);
  }
});
