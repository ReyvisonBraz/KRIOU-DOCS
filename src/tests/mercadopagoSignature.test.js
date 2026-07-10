import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyMercadoPagoSignature } from "../../supabase/functions/_shared/mercadopago.ts";

function signatureFor({ secret, dataId, requestId, timestamp }) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const hash = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${timestamp},v1=${hash}`;
}

describe("verifyMercadoPagoSignature", () => {
  const secret = "webhook-test-secret";
  const dataId = "PAY-123";
  const requestId = "request-456";
  const nowMs = 1_783_660_000_000;
  const timestamp = String(nowMs);

  it("aceita assinatura HMAC válida", async () => {
    await expect(verifyMercadoPagoSignature({
      xSignature: signatureFor({ secret, dataId, requestId, timestamp }),
      xRequestId: requestId,
      dataId,
      secret,
      nowMs,
    })).resolves.toBe(true);
  });

  it("rejeita assinatura alterada", async () => {
    await expect(verifyMercadoPagoSignature({
      xSignature: `ts=${timestamp},v1=${"0".repeat(64)}`,
      xRequestId: requestId,
      dataId,
      secret,
      nowMs,
    })).resolves.toBe(false);
  });

  it("rejeita timestamp fora da tolerância", async () => {
    const oldTimestamp = String(nowMs - 16 * 60 * 1000);
    await expect(verifyMercadoPagoSignature({
      xSignature: signatureFor({ secret, dataId, requestId, timestamp: oldTimestamp }),
      xRequestId: requestId,
      dataId,
      secret,
      nowMs,
    })).resolves.toBe(false);
  });
});
