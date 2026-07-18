/**
 * ============================================
 * KRIOU DOCS — Structured Logger
 * ============================================
 * Logger centralizado com níveis e suporte a
 * integração futura com Sentry / Datadog.
 *
 * USO:
 *   import { logger } from "../utils/logger";
 *   logger.info("ModuleName", "Mensagem", { extra: "data" });
 *   logger.error("ModuleName", "Mensagem", error);
 * ============================================
 */

const IS_DEV = import.meta.env.DEV;

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Nível mínimo de log (pode vir de env var no futuro)
const MIN_LEVEL = LOG_LEVELS[import.meta.env.VITE_LOG_LEVEL] || (IS_DEV ? LOG_LEVELS.debug : LOG_LEVELS.warn);
const SENSITIVE_KEY = /(authorization|token|secret|password|senha|cpf|cnpj|email|phone|telefone|nome|legalData|formData)/i;
const MAX_DEPTH = 4;

function formatTimestamp() {
  return new Date().toISOString().slice(11, 23);
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= MIN_LEVEL;
}

export function sanitizeLogData(value, depth = 0, seen = new WeakSet()) {
  if (value == null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value.length > 500 ? `${value.slice(0, 500)}…` : value;
  if (typeof value !== "object" || depth >= MAX_DEPTH) return "[OMITIDO]";
  if (seen.has(value)) return "[CIRCULAR]";
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeLogData(item, depth + 1, seen));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeLogData(item, depth + 1, seen),
  ]));
}

function errorReference() {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const logger = {
  debug(module, message, data) {
    if (!shouldLog("debug")) return;
    if (IS_DEV) {
      console.log(`[${formatTimestamp()}][${module}][DEBUG]`, message, sanitizeLogData(data) || "");
    }
  },

  info(module, message, data) {
    if (!shouldLog("info")) return;
    if (IS_DEV) {
      console.log(`[${formatTimestamp()}][${module}]`, message, sanitizeLogData(data) || "");
    }
  },

  warn(module, message, data) {
    if (!shouldLog("warn")) return;
    console.warn(`[${formatTimestamp()}][${module}][AVISO]`, message, sanitizeLogData(data) || "");
  },

  error(module, message, error) {
    if (!shouldLog("error")) return;
    const reference = error?.reference || errorReference();
    const errorMsg = error?.message || error || message;
    const errorData = sanitizeLogData({
      reference,
      code: error?.code,
      context: error?.context,
      ...(IS_DEV && error?.stack ? { stack: error.stack } : {}),
    });
    console.error(`[${formatTimestamp()}][${module}][ERRO][${reference}]`, errorMsg, errorData);
    return reference;

    // Future: Sentry integration
    // if (typeof Sentry !== "undefined") {
    //   Sentry.captureException(error || new Error(message), {
    //     tags: { module },
    //     extra: errorData,
    //   });
    // }

    // Future: PostHog error tracking
    // if (typeof posthog !== "undefined") {
    //   posthog.capture("error_occurred", { module, message, ...errorData });
    // }
  },
};

export default logger;
