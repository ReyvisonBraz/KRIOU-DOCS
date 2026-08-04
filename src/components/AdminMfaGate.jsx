import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "./UI";
import { Icon } from "./Icons";
import MfaService from "../features/account/MfaService";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]";

const AdminMfaGate = ({ children, mfaService = MfaService, onOpenProfile }) => {
  const [status, setStatus] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    setError("");
    try {
      setStatus(await mfaService.getStatus());
    } catch {
      setError("Não foi possível verificar a proteção administrativa.");
    }
  }, [mfaService]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const verify = async () => {
    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
    if (normalizedCode.length !== 6 || !status?.factor?.id) return;

    setBusy(true);
    setError("");
    try {
      await mfaService.verifyCode(status.factor.id, normalizedCode);
      const nextStatus = await mfaService.getStatus();
      if (nextStatus.currentLevel !== "aal2") {
        throw new Error("A sessão não alcançou o nível de segurança necessário.");
      }
      setStatus(nextStatus);
      setCode("");
    } catch (verificationError) {
      setError(verificationError?.message || "Código inválido ou expirado.");
    } finally {
      setBusy(false);
    }
  };

  if (!status && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Spinner size={36} />
      </div>
    );
  }

  if (status?.currentLevel === "aal2") return children;

  const hasFactor = Boolean(status?.factor);
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy" style={{ padding: 20 }}>
      <section style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 18, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}>
        <div aria-hidden="true" style={{ width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: 14, background: "rgba(20,184,166,0.12)", color: "var(--teal)", marginBottom: 16 }}>
          <Icon name="Shield" className="w-6 h-6" />
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: 22 }}>
          Confirmação administrativa
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
          O segundo fator é obrigatório somente para entrar no painel administrativo. O uso comum do KRIOU-DOCS continua apenas com o login Google.
        </p>

        {error && <p role="alert" style={{ color: "var(--coral)", fontSize: 13, margin: "16px 0 0" }}>{error}</p>}

        {hasFactor ? (
          <form onSubmit={(event) => { event.preventDefault(); verify(); }} style={{ marginTop: 20 }}>
            <label style={{ display: "block", color: "var(--text-dim)", fontSize: 13 }}>
              Código do aplicativo autenticador
              <input
                aria-label="Código administrativo do autenticador"
                autoComplete="one-time-code"
                inputMode="numeric"
                value={normalizedCode}
                disabled={busy}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className={focusClass}
                style={{ display: "block", boxSizing: "border-box", width: "100%", marginTop: 7, padding: "13px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 20, letterSpacing: "0.25em" }}
              />
            </label>
            <button type="submit" disabled={busy || normalizedCode.length !== 6} className={focusClass} style={{ width: "100%", minHeight: 46, marginTop: 14, border: 0, borderRadius: 12, background: "var(--action-primary)", color: "var(--on-action)", fontWeight: 800, cursor: "pointer" }}>
              {busy ? "Confirmando…" : "Entrar no painel"}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 20 }}>
            <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.6 }}>
              Esta conta administrativa ainda não possui um autenticador cadastrado. Configure-o no perfil antes de acessar o painel.
            </p>
            <button type="button" onClick={onOpenProfile} className={focusClass} style={{ width: "100%", minHeight: 46, border: 0, borderRadius: 12, background: "var(--action-primary)", color: "var(--on-action)", fontWeight: 800, cursor: "pointer" }}>
              Configurar no perfil
            </button>
          </div>
        )}

        {status && (
          <button type="button" onClick={loadStatus} disabled={busy} className={focusClass} style={{ width: "100%", minHeight: 42, marginTop: 10, border: "1px solid var(--border)", borderRadius: 12, background: "transparent", color: "var(--text-muted)", fontWeight: 700, cursor: "pointer" }}>
            Verificar novamente
          </button>
        )}
      </section>
    </main>
  );
};

export default AdminMfaGate;
