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

function formatTimestamp() {
  return new Date().toISOString().slice(11, 23);
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= MIN_LEVEL;
}

export const logger = {
  debug(module, message, data) {
    if (!shouldLog("debug")) return;
    if (IS_DEV) {
      console.log(`[${formatTimestamp()}][${module}][DEBUG]`, message, data || "");
    }
  },

  info(module, message, data) {
    if (!shouldLog("info")) return;
    if (IS_DEV) {
      console.log(`[${formatTimestamp()}][${module}]`, message, data || "");
    }
  },

  warn(module, message, data) {
    if (!shouldLog("warn")) return;
    console.warn(`[${formatTimestamp()}][${module}][AVISO]`, message, data || "");
  },

  error(module, message, error) {
    if (!shouldLog("error")) return;
    const errorMsg = error?.message || error || message;
    const errorData = error?.stack ? { stack: error.stack, ...(error?.context || {}) } : undefined;
    console.error(`[${formatTimestamp()}][${module}][ERRO]`, message, errorData || "");

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
