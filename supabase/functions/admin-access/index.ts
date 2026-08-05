import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  createAdminClient,
  getAdminAuthorization,
  hasAal2,
  hasAdminCapability,
} from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ROLES = new Set(["none", "support", "finance", "admin"]);

function statusForDatabaseError(error: { code?: string }) {
  if (error.code === "42501") return 403;
  if (error.code === "22023") return 400;
  if (error.code === "P0002") return 404;
  if (error.code === "23505") return 409;
  return 500;
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado", requestId }, 401);

    const authorization = await getAdminAuthorization(supabase, user.id);
    if (!hasAdminCapability(authorization, "roles.manage")) {
      return json({ error: "Capacidade administrativa insuficiente", requestId }, 403);
    }

    if (!(await hasAal2(req, supabase))) {
      return json({
        error: "Confirmação em duas etapas necessária",
        code: "mfa_required",
        requestId,
      }, 403);
    }

    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    const targetUserId = typeof body?.targetUserId === "string" ? body.targetUserId : "";
    const role = typeof body?.role === "string" ? body.role.toLowerCase().trim() : "";
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const operationId = typeof body?.operationId === "string" ? body.operationId : "";

    if (!UUID_PATTERN.test(targetUserId) || !UUID_PATTERN.test(operationId)) {
      return json({ error: "Identificadores inválidos", requestId }, 400);
    }
    if (!ALLOWED_ROLES.has(role)) {
      return json({ error: "Papel inválido ou exige aprovação adicional", requestId }, 400);
    }
    if (reason.length < 10 || reason.length > 500) {
      return json({ error: "Motivo deve ter entre 10 e 500 caracteres", requestId }, 400);
    }

    const { data, error } = await supabase.rpc("kriou_admin_change_role", {
      actor_id: user.id,
      target_user_id: targetUserId,
      target_role: role,
      change_reason: reason,
      operation_id: operationId,
      request_id: requestId,
    });

    if (error) {
      const status = statusForDatabaseError(error);
      console.error("[admin-access] Mudança de papel rejeitada", {
        code: error.code,
        requestId,
      });
      return json({
        error: status === 500 ? "Erro interno ao alterar papel" : error.message,
        requestId,
      }, status);
    }

    return json({ ...data, requestId }, 200);
  } catch (error) {
    console.error("[admin-access] Erro interno", {
      name: error instanceof Error ? error.name : "UnknownError",
      requestId,
    });
    return json({ error: "Erro interno ao alterar papel", requestId }, 500);
  }
});
