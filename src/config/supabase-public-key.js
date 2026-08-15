const OFFICIAL_LEGACY_HEADER_CLAIMS = new Set(["alg", "typ"]);
const LEGACY_ANON_SCHEMAS = {
  supabase: {
    name: "hosted",
    requiredClaims: new Set(["iss", "role", "iat", "exp"]),
    allowedClaims: new Set(["iss", "ref", "role", "iat", "exp"]),
  },
  "supabase-demo": {
    name: "cli-local",
    requiredClaims: new Set(["iss", "role", "exp"]),
    allowedClaims: new Set(["iss", "role", "exp"]),
  },
};

const PROJECT_REF_PATTERN = /^[a-z0-9]{20}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{20,}$/;

export const LEGACY_JWT_CLOCK_SKEW_SECONDS = 300;
export const LEGACY_JWT_MAX_LIFETIME_SECONDS = 315_576_000;

function decodeJsonSegment(segment) {
  if (!segment || !/^[A-Za-z0-9_-]+$/.test(segment)) return null;

  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(padded));
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasExactSchema(payload, schema) {
  const claims = Object.keys(payload);
  return [...schema.requiredClaims].every((claim) => Object.hasOwn(payload, claim))
    && claims.every((claim) => schema.allowedClaims.has(claim));
}

function validateTemporalClaims(payload, schema, options) {
  const nowSeconds = Number.isFinite(options.nowSeconds)
    ? Math.floor(options.nowSeconds)
    : Math.floor(Date.now() / 1000);
  const clockSkewSeconds = Number.isFinite(options.clockSkewSeconds)
    ? Math.max(0, Math.floor(options.clockSkewSeconds))
    : LEGACY_JWT_CLOCK_SKEW_SECONDS;

  if (!Number.isInteger(payload.exp)) return "expiration";
  if (payload.exp + clockSkewSeconds < nowSeconds) return "expired";

  // Uma chave gerada agora não pode ter mais de dez anos restantes. Esta
  // checagem também protege o shape CLI, que não contém `iat`.
  if (payload.exp > nowSeconds + LEGACY_JWT_MAX_LIFETIME_SECONDS + clockSkewSeconds) {
    return "expiration-too-distant";
  }

  if (schema.name === "hosted") {
    if (!Number.isInteger(payload.iat)) return "issued-at";
    if (payload.iat > nowSeconds + clockSkewSeconds) return "issued-in-future";
    if (payload.exp <= payload.iat) return "invalid-lifetime";
    if (payload.exp - payload.iat > LEGACY_JWT_MAX_LIFETIME_SECONDS) {
      return "lifetime-too-long";
    }
  }

  return null;
}

/**
 * Classifica os schemas públicos oficiais sem verificar assinatura:
 * hosted/self-hosted (`iss=supabase`) e CLI local (`iss=supabase-demo`).
 */
export function inspectLegacyAnonJwt(value, options = {}) {
  if (typeof value !== "string") return { valid: false, reason: "not-a-string" };

  const parts = value.split(".");
  if (parts.length !== 3 || parts.some((part) => !part) || !SIGNATURE_PATTERN.test(parts[2])) {
    return { valid: false, reason: "compact-shape" };
  }

  const header = decodeJsonSegment(parts[0]);
  const payload = decodeJsonSegment(parts[1]);
  if (!isPlainObject(header) || !isPlainObject(payload)) {
    return { valid: false, reason: "json" };
  }

  if (
    header.alg !== "HS256"
    || header.typ !== "JWT"
    || Object.keys(header).some((claim) => !OFFICIAL_LEGACY_HEADER_CLAIMS.has(claim))
  ) {
    return { valid: false, reason: "header" };
  }

  const schema = LEGACY_ANON_SCHEMAS[payload.iss];
  if (payload.role !== "anon" || !schema) {
    return { valid: false, reason: "role-or-issuer" };
  }

  if (Object.hasOwn(payload, "aud")) {
    return { valid: false, reason: "aud-not-supported" };
  }

  if (!hasExactSchema(payload, schema)) {
    return { valid: false, reason: "claims" };
  }

  if (Object.hasOwn(payload, "ref") && !PROJECT_REF_PATTERN.test(payload.ref)) {
    return { valid: false, reason: "project-ref" };
  }

  const temporalError = validateTemporalClaims(payload, schema, options);
  if (temporalError) return { valid: false, reason: temporalError };

  return {
    valid: true,
    issuer: payload.iss,
    schema: schema.name,
    projectRef: payload.ref || null,
    expiresAt: payload.exp,
  };
}

