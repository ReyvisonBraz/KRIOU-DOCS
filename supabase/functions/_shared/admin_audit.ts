import { createAdminClient } from "./auth.ts";

export type AdminAuditResult = "attempted" | "success" | "failure" | "denied";

export interface AdminAuditEvent {
  operationId?: string;
  requestId?: string | null;
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  reason: string;
  result: AdminAuditResult;
  errorCode?: string | null;
  metadata?: Record<string, unknown>;
}

const SENSITIVE_KEY = /token|secret|password|authorization|cookie|cpf|cnpj|email|payload|content|form_data|legal_data/i;
const SAFE_KEY = /^[a-z][a-zA-Z0-9_]{0,63}$/;
const SAFE_IDENTIFIER = /^[a-z0-9][a-z0-9._:-]{0,127}$/i;

function sanitizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export function sanitizeAuditMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata).flatMap(([key, value]) => {
      if (!SAFE_KEY.test(key) || SENSITIVE_KEY.test(key)) return [];
      if (typeof value === "string") return [[key, sanitizeText(value, 200)]];
      if (typeof value === "number" && Number.isFinite(value)) return [[key, value]];
      if (typeof value === "boolean" || value === null) return [[key, value]];
      return [];
    }),
  );
}

export async function recordAdminAudit(
  event: AdminAuditEvent,
  supabase = createAdminClient(),
) {
  if (!SAFE_IDENTIFIER.test(event.actorId)) throw new Error("Ator de auditoria inválido");
  if (!SAFE_IDENTIFIER.test(event.action)) throw new Error("Ação de auditoria inválida");
  if (!SAFE_IDENTIFIER.test(event.targetType)) throw new Error("Tipo de alvo inválido");
  if (!event.reason?.trim()) throw new Error("Motivo de auditoria obrigatório");

  const operationId = event.operationId || crypto.randomUUID();
  const { error } = await supabase.from("admin_audit_events").insert({
    operation_id: operationId,
    request_id: event.requestId ? sanitizeText(event.requestId, 128) : null,
    actor_id: event.actorId,
    actor_email: null,
    action: event.action,
    target_type: event.targetType,
    target_id: event.targetId ? sanitizeText(event.targetId, 128) : null,
    reason: sanitizeText(event.reason, 500),
    result: event.result,
    error_code: event.errorCode ? sanitizeText(event.errorCode, 80) : null,
    metadata: sanitizeAuditMetadata(event.metadata),
  });

  if (error) {
    console.error("[admin-audit] Falha ao registrar evento", {
      operationId,
      action: event.action,
      result: event.result,
      code: error.code,
    });
    throw new Error("Falha ao registrar auditoria administrativa");
  }

  return operationId;
}
