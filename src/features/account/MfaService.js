import { supabase } from "../../lib/supabase";

function assertTotpCode(code) {
  const normalized = String(code || "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(normalized)) {
    throw new Error("Digite os 6 números do aplicativo autenticador.");
  }
  return normalized;
}

export const MfaService = {
  async getStatus() {
    const [factorsResult, assuranceResult] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);
    if (factorsResult.error) throw factorsResult.error;
    if (assuranceResult.error) throw assuranceResult.error;

    const verifiedFactors = (factorsResult.data.totp || []).filter(
      (factor) => factor.status === "verified",
    );

    return {
      factor: verifiedFactors[0] || null,
      factors: verifiedFactors,
      currentLevel: assuranceResult.data.currentLevel || "aal1",
      nextLevel: assuranceResult.data.nextLevel || "aal1",
    };
  },

  async beginEnrollment() {
    const factorsResult = await supabase.auth.mfa.listFactors();
    if (factorsResult.error) throw factorsResult.error;

    const unverified = (factorsResult.data.totp || []).filter(
      (factor) => factor.status !== "verified",
    );
    for (const factor of unverified) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw error;
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `KRIOU-DOCS ${new Date().toISOString()}`,
    });
    if (error) throw error;

    return {
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    };
  },

  async verifyCode(factorId, code) {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: assertTotpCode(code),
    });
    if (error) throw error;
  },

  async cancelEnrollment(factorId) {
    if (!factorId) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) throw error;
  },
};

export default MfaService;
