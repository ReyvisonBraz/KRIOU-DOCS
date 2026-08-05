import React, { useState } from "react";
import AdminAccessService from "../../services/AdminAccessService";

const ROLE_OPTIONS = [
  { value: "none", label: "Cliente — sem acesso administrativo" },
  { value: "support", label: "Suporte — atendimento e documentos" },
  { value: "finance", label: "Financeiro — pagamentos e conciliação" },
  { value: "admin", label: "Administrador — operação ampla" },
];

const AdminRoleManager = ({ user, currentUserId, onChanged, service = AdminAccessService }) => {
  const currentRole = user.adminRole || "none";
  const [role, setRole] = useState(currentRole);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isSelf = user.id === currentUserId;
  const isOwner = currentRole === "owner";
  const canSubmit = !busy && !isSelf && !isOwner && role !== currentRole && reason.trim().length >= 10;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await service.changeRole({ targetUserId: user.id, role, reason: reason.trim() });
      setSuccess("Acesso atualizado e registrado na auditoria.");
      setReason("");
      await onChanged?.();
    } catch (operationError) {
      setError(operationError?.message || "Não foi possível alterar o acesso.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: 16, padding: 16, borderRadius: 12, background: "var(--surface-2)" }}>
      <h4 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: 14 }}>Acesso administrativo</h4>
      <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 12, lineHeight: 1.55 }}>
        Alterações exigem conta proprietária, MFA e motivo. Não é possível alterar o próprio papel nem um proprietário por esta tela.
      </p>
      <label style={{ display: "block", color: "var(--text-dim)", fontSize: 12 }}>
        Papel
        <select aria-label="Papel administrativo" value={isOwner ? "owner" : role} disabled={busy || isSelf || isOwner} onChange={(event) => setRole(event.target.value)} style={fieldStyle}>
          {isOwner && <option value="owner">Proprietário — protegido</option>}
          {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label style={{ display: "block", marginTop: 12, color: "var(--text-dim)", fontSize: 12 }}>
        Motivo da alteração
        <textarea aria-label="Motivo da alteração de acesso" value={reason} disabled={busy || isSelf || isOwner} maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Explique a necessidade em pelo menos 10 caracteres" style={{ ...fieldStyle, minHeight: 82, resize: "vertical" }} />
      </label>
      {isSelf && <p role="status" style={noticeStyle}>Sua própria permissão não pode ser alterada por esta tela.</p>}
      {isOwner && <p role="status" style={noticeStyle}>Mudanças de proprietário exigirão aprovação de outra pessoa.</p>}
      {error && <p role="alert" style={{ ...noticeStyle, color: "var(--coral)" }}>{error}</p>}
      {success && <p role="status" style={{ ...noticeStyle, color: "var(--teal)" }}>{success}</p>}
      <button type="submit" disabled={!canSubmit} style={{ width: "100%", minHeight: 42, marginTop: 12, border: 0, borderRadius: 10, background: "var(--action-primary)", color: "var(--on-action)", fontWeight: 800, cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.55 }}>
        {busy ? "Salvando…" : "Salvar acesso"}
      </button>
    </form>
  );
};

const fieldStyle = { display: "block", boxSizing: "border-box", width: "100%", marginTop: 6, padding: "11px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", font: "inherit" };
const noticeStyle = { margin: "10px 0 0", color: "var(--text-muted)", fontSize: 12 };

export default AdminRoleManager;
