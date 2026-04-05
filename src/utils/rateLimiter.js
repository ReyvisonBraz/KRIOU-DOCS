/**
 * ============================================
 * KRIOU DOCS - Rate Limiter (client-side)
 * ============================================
 * Protege ações sensíveis (login, OTP) contra
 * tentativas repetidas em curto período.
 * Armazena contadores em sessionStorage para
 * que expirem automaticamente ao fechar a aba.
 *
 * @module utils/rateLimiter
 */

const PREFIX = "kriou_rl_";

/**
 * @typedef {Object} RateLimitConfig
 * @property {number} maxAttempts  - Máximo de tentativas permitidas
 * @property {number} windowMs     - Janela de tempo em ms
 */

/** @type {Record<string, RateLimitConfig>} */
const LIMITS = {
  login:    { maxAttempts: 5,  windowMs: 15 * 60 * 1000 }, // 5 tentativas / 15 min
  otp:      { maxAttempts: 3,  windowMs: 10 * 60 * 1000 }, // 3 tentativas / 10 min
  password: { maxAttempts: 5,  windowMs: 30 * 60 * 1000 }, // 5 tentativas / 30 min
};

/**
 * Retorna a chave de sessionStorage para um action + identifier.
 */
const getKey = (action, identifier) =>
  `${PREFIX}${action}_${identifier || "global"}`;

/**
 * Verifica se a ação está bloqueada e registra uma nova tentativa.
 *
 * @param {string} action     - Nome da ação ('login' | 'otp' | 'password')
 * @param {string} identifier - Identificador único (ex: telefone, e-mail)
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
export function checkRateLimit(action, identifier = "global") {
  const config = LIMITS[action];
  if (!config) return { allowed: true, remaining: Infinity, retryAfterMs: 0 };

  const key = getKey(action, identifier);
  const now = Date.now();

  let record = { attempts: [], blockedUntil: null };
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) record = JSON.parse(stored);
  } catch {
    // sessionStorage não disponível — permitir
    return { allowed: true, remaining: config.maxAttempts, retryAfterMs: 0 };
  }

  // Se ainda está no período de bloqueio
  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: record.blockedUntil - now,
    };
  }

  // Filtrar tentativas dentro da janela atual
  const windowStart = now - config.windowMs;
  const recent = (record.attempts || []).filter((t) => t > windowStart);

  // Registrar nova tentativa
  recent.push(now);

  if (recent.length > config.maxAttempts) {
    // Bloquear por mais uma janela
    record.blockedUntil = now + config.windowMs;
    record.attempts = recent;
    try { sessionStorage.setItem(key, JSON.stringify(record)); } catch { /* ignore */ }
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: config.windowMs,
    };
  }

  record.attempts = recent;
  record.blockedUntil = null;
  try { sessionStorage.setItem(key, JSON.stringify(record)); } catch { /* ignore */ }

  return {
    allowed: true,
    remaining: config.maxAttempts - recent.length,
    retryAfterMs: 0,
  };
}

/**
 * Reseta o contador de tentativas após sucesso.
 * Deve ser chamado após login bem-sucedido.
 *
 * @param {string} action
 * @param {string} identifier
 */
export function resetRateLimit(action, identifier = "global") {
  try {
    sessionStorage.removeItem(getKey(action, identifier));
  } catch { /* ignore */ }
}

/**
 * Formata o tempo restante de bloqueio para exibição.
 * @param {number} ms - Milissegundos restantes
 * @returns {string} Ex: "14 min" ou "45 seg"
 */
export function formatRetryTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds >= 60) return `${Math.ceil(seconds / 60)} min`;
  return `${seconds} seg`;
}
