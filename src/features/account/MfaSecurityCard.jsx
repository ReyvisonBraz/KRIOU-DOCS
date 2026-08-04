import React, { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/UI";
import { Icon } from "../../components/Icons";
import MfaService from "./MfaService";

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--teal)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]";

function qrImageSource(qrCode) {
  if (typeof qrCode !== "string") return "";
  if (qrCode.startsWith("data:image/svg+xml")) return qrCode;
  if (qrCode.trim().startsWith("<svg")) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`;
  }
  return "";
}

export default function MfaSecurityCard({ mfaService = MfaService }) {
  const [status, setStatus] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshStatus = useCallback(async () => {
    const nextStatus = await mfaService.getStatus();
    setStatus(nextStatus);
  }, [mfaService]);

  useEffect(() => {
    let active = true;
    mfaService.getStatus()
      .then((nextStatus) => active && setStatus(nextStatus))
      .catch(() => active && setError("Não foi possível consultar a proteção da conta."));
    return () => { active = false; };
  }, [mfaService]);

  const run = async (operation) => {
    setBusy(true);
    setError("");
    try {
      await operation();
    } catch (operationError) {
      setError(operationError?.message || "Não foi possível concluir a operação.");
    } finally {
      setBusy(false);
    }
  };

  const startEnrollment = () => run(async () => {
    setEnrollment(await mfaService.beginEnrollment());
    setCode("");
  });

  const cancelEnrollment = () => run(async () => {
    await mfaService.cancelEnrollment(enrollment?.factorId);
    setEnrollment(null);
    setCode("");
    await refreshStatus();
  });

  const verify = () => run(async () => {
    const factorId = enrollment?.factorId || status?.factor?.id;
    await mfaService.verifyCode(factorId, code);
    setEnrollment(null);
    setCode("");
    await refreshStatus();
  });

  const isAal2 = status?.currentLevel === "aal2";
  const hasFactor = Boolean(status?.factor);
  const factorCount = status?.factors?.length || (hasFactor ? 1 : 0);
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const qrSource = qrImageSource(enrollment?.qrCode);

  return (
    <Card style={{ marginBottom: 16, padding: 20 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(20,184,166,0.12)", color: "var(--teal)", flexShrink: 0 }}>
          <Icon name="Shield" className="w-5 h-5" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: "0 0 5px", fontSize: 15, color: "var(--text)" }}>
            Verificação em duas etapas
          </h2>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-muted)" }}>
            Protege ações sensíveis com um código temporário do seu aplicativo autenticador.
            Este QR é secreto e nunca será impresso nos documentos.
          </p>
        </div>
        {status && (
          <span style={{ fontSize: 11, fontWeight: 700, color: isAal2 ? "var(--teal)" : "var(--text-muted)" }}>
            {isAal2 ? `${factorCount} fator${factorCount === 1 ? "" : "es"}` : hasFactor ? "Confirmação necessária" : "Não configurada"}
          </span>
        )}
      </div>

      {error && <p role="alert" style={{ color: "var(--coral)", fontSize: 12, margin: "14px 0 0" }}>{error}</p>}

      {!status && !error && <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Consultando proteção…</p>}

      {status && !hasFactor && !enrollment && (
        <button type="button" onClick={startEnrollment} disabled={busy} className={focusClass} style={primaryButtonStyle}>
          Ativar verificação em duas etapas
        </button>
      )}

      {enrollment && (
        <div style={{ marginTop: 18 }}>
          <ol style={{ paddingLeft: 20, color: "var(--text-dim)", fontSize: 13, lineHeight: 1.7 }}>
            <li>Abra Google Authenticator, Microsoft Authenticator, 1Password ou equivalente.</li>
            <li>Escaneie este QR secreto.</li>
            <li>Digite abaixo o código de 6 números gerado pelo aplicativo.</li>
          </ol>
          {qrSource && <img src={qrSource} alt="QR secreto para cadastrar o aplicativo autenticador" style={{ display: "block", width: 210, maxWidth: "100%", padding: 10, background: "#fff", borderRadius: 12, margin: "12px auto" }} />}
          <details style={{ color: "var(--text-muted)", fontSize: 12, marginBottom: 12 }}>
            <summary>Não consigo escanear o QR</summary>
            <p>Digite manualmente esta chave no aplicativo. Não compartilhe:</p>
            <code style={{ overflowWrap: "anywhere", color: "var(--text)" }}>{enrollment.secret}</code>
          </details>
          <CodeField value={normalizedCode} onChange={setCode} disabled={busy} />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button type="button" onClick={cancelEnrollment} disabled={busy} className={focusClass} style={secondaryButtonStyle}>Cancelar</button>
            <button type="button" onClick={verify} disabled={busy || normalizedCode.length !== 6} className={focusClass} style={primaryButtonStyle}>Confirmar código</button>
          </div>
        </div>
      )}

      {status && hasFactor && !isAal2 && !enrollment && (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>
            Digite o código atual para reforçar esta sessão antes de usar ações protegidas.
          </p>
          <CodeField value={normalizedCode} onChange={setCode} disabled={busy} />
          <button type="button" onClick={verify} disabled={busy || normalizedCode.length !== 6} className={focusClass} style={primaryButtonStyle}>Reforçar sessão</button>
        </div>
      )}

      {status && hasFactor && isAal2 && !enrollment && (
        <div style={{ marginTop: 14 }}>
          <p style={{ margin: 0, color: "var(--teal)", fontSize: 13 }}>
            Esta sessão está pronta para operações protegidas.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.55 }}>
            {factorCount < 2
              ? "Cadastre um segundo autenticador como reserva antes de depender desta conta para administrar o sistema."
              : "Você possui um autenticador de reserva. A remoção continua bloqueada até existir recuperação administrativa auditada."}
          </p>
          {factorCount < 2 && (
            <button type="button" onClick={startEnrollment} disabled={busy} className={focusClass} style={secondaryButtonStyle}>
              Adicionar autenticador reserva
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

function CodeField({ value, onChange, disabled }) {
  return (
    <label style={{ display: "block", color: "var(--text-dim)", fontSize: 12 }}>
      Código do autenticador
      <input aria-label="Código do autenticador" inputMode="numeric" autoComplete="one-time-code" value={value} disabled={disabled} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))} className={focusClass} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 18, letterSpacing: "0.25em" }} />
    </label>
  );
}

const primaryButtonStyle = { minHeight: 44, padding: "10px 16px", border: 0, borderRadius: 12, background: "var(--teal)", color: "#041713", fontWeight: 700, cursor: "pointer", marginTop: 14 };
const secondaryButtonStyle = { ...primaryButtonStyle, background: "transparent", border: "1px solid var(--border)", color: "var(--text-dim)", flex: 1 };
