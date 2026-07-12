const DEFAULT_MAX_SIGNATURE_AGE_MS = 15 * 60 * 1000;
export const DOCUMENT_PRICE_IN_CENTS = 990;

function parseSignatureHeader(xSignature: string) {
  return Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...valueParts] = part.trim().split("=");
      return [key, valueParts.join("=")];
    }),
  );
}

function timestampToMilliseconds(timestamp: string) {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp)) return null;
  return numericTimestamp > 1_000_000_000_000
    ? numericTimestamp
    : numericTimestamp * 1000;
}

async function hmacSha256Hex(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqualHex(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyMercadoPagoSignature({
  xSignature,
  xRequestId,
  dataId,
  secret,
  nowMs = Date.now(),
  maxAgeMs = DEFAULT_MAX_SIGNATURE_AGE_MS,
}: {
  xSignature: string;
  xRequestId: string;
  dataId: string;
  secret: string;
  nowMs?: number;
  maxAgeMs?: number;
}) {
  if (!xSignature || !xRequestId || !dataId || !secret) return false;

  const { ts, v1 } = parseSignatureHeader(xSignature);
  const timestampMs = timestampToMilliseconds(ts);
  if (!ts || !v1 || timestampMs === null) return false;
  if (Math.abs(nowMs - timestampMs) > maxAgeMs) return false;

  const normalizedDataId = dataId.toLowerCase();
  const manifest = `id:${normalizedDataId};request-id:${xRequestId};ts:${ts};`;
  const expectedSignature = await hmacSha256Hex(secret, manifest);

  return constantTimeEqualHex(expectedSignature, v1.toLowerCase());
}

export function parseMercadoPagoExternalReference(externalReference: unknown) {
  const [userId, documentId, ...unexpected] = String(externalReference || "").split("::");

  return {
    userId: userId || null,
    documentId: documentId || null,
    hasUnexpectedParts: unexpected.length > 0,
  };
}

export function validateMercadoPagoDocumentPayment({
  payment,
  expectedUserId,
  expectedDocumentId,
  expectedAmountInCents = DOCUMENT_PRICE_IN_CENTS,
}: {
  payment: {
    external_reference?: unknown;
    currency_id?: unknown;
    transaction_amount?: unknown;
  };
  expectedUserId?: string | null;
  expectedDocumentId?: string | null;
  expectedAmountInCents?: number;
}) {
  const reference = parseMercadoPagoExternalReference(payment?.external_reference);
  const amountInCents = Math.round(Number(payment?.transaction_amount) * 100);

  if (reference.hasUnexpectedParts || !reference.userId || !reference.documentId) {
    return { valid: false, reason: "invalid_external_reference", reference, amountInCents };
  }

  if (expectedUserId && reference.userId !== expectedUserId) {
    return { valid: false, reason: "user_mismatch", reference, amountInCents };
  }

  if (expectedDocumentId && reference.documentId !== expectedDocumentId) {
    return { valid: false, reason: "document_mismatch", reference, amountInCents };
  }

  if (payment?.currency_id !== "BRL") {
    return { valid: false, reason: "currency_mismatch", reference, amountInCents };
  }

  if (amountInCents !== expectedAmountInCents) {
    return { valid: false, reason: "amount_mismatch", reference, amountInCents };
  }

  return { valid: true, reason: null, reference, amountInCents };
}
