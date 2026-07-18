import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

const AUTHORIZATION_TTL_SECONDS = 60;

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) return json({ error: "Perfil não encontrado" }, 403);
    const hasUnlimitedAccess = profile.role === "admin";

    const { documentId } = await req.json();
    if (!documentId || typeof documentId !== "string") {
      return json({ error: "documentId é obrigatório" }, 400);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id, user_id, status, payment_status, payment_id")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (documentError || !document) {
      return json({ error: "Documento não encontrado" }, 404);
    }

    if (!hasUnlimitedAccess && (document.status !== "finalizado" || document.payment_status !== "approved" || !document.payment_id)) {
      return json({ error: "PDF liberado somente após pagamento aprovado" }, 409);
    }

    return json({
      authorized: true,
      documentId: document.id,
      accessMode: hasUnlimitedAccess ? "admin_unlimited" : "paid_document",
      expiresAt: new Date(Date.now() + AUTHORIZATION_TTL_SECONDS * 1000).toISOString(),
    });
  } catch (error) {
    console.error("[authorize-download] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao autorizar download" }, 500);
  }
});
