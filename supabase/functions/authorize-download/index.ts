import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  createAdminClient,
  getAdminAuthorization,
  hasAal2,
  hasAdminCapability,
} from "../_shared/auth.ts";
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

    const paidAccess = document.status === "finalizado" &&
      document.payment_status === "approved" && Boolean(document.payment_id);

    let accessMode = "paid_document";
    if (!paidAccess) {
      const authorization = await getAdminAuthorization(supabase, user.id);
      const canUseException = hasAdminCapability(
        authorization,
        "documents.download.exceptional",
      );

      if (!canUseException) {
        return json({ error: "PDF liberado somente após pagamento aprovado" }, 409);
      }

      if (!(await hasAal2(req, supabase))) {
        return json({
          error: "Confirmação em duas etapas necessária",
          code: "mfa_required",
        }, 403);
      }

      accessMode = "admin_exceptional";
    }

    return json({
      authorized: true,
      documentId: document.id,
      accessMode,
      expiresAt: new Date(Date.now() + AUTHORIZATION_TTL_SECONDS * 1000).toISOString(),
    });
  } catch (error) {
    console.error("[authorize-download] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao autorizar download" }, 500);
  }
});
