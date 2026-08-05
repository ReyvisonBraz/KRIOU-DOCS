import React, { useState } from "react";
import AdminAccessService from "../../services/AdminAccessService";
import { Alert, Button, Select, Textarea } from "../UI";

const ROLE_OPTIONS = [
  { value: "none", label: "Cliente — sem acesso administrativo" },
  { value: "support", label: "Suporte — atendimento e documentos" },
  { value: "finance", label: "Financeiro — pagamentos e conciliação" },
  { value: "admin", label: "Administrador — operação ampla" },
];

const AdminRoleManager = ({ user, currentUserId, onChanged, onBusyChange, service = AdminAccessService }) => {
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
    onBusyChange?.(true);
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
      onBusyChange?.(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h4 style={{ margin: "0 0 6px", color: "var(--text)", fontSize: 14 }}>Acesso administrativo</h4>
      <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>
        Alterações exigem conta proprietária, MFA e motivo. Não é possível alterar o próprio papel nem um proprietário por esta tela.
      </p>
      <Select
        label="Papel administrativo"
        value={isOwner ? "owner" : role}
        disabled={busy || isSelf || isOwner}
        onChange={(event) => setRole(event.target.value)}
        options={isOwner ? [{ value: "owner", label: "Proprietário — protegido" }, ...ROLE_OPTIONS] : ROLE_OPTIONS}
      />
      <Textarea
        label="Motivo da alteração de acesso"
        value={reason}
        disabled={busy || isSelf || isOwner}
        maxLength={500}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Explique a necessidade em pelo menos 10 caracteres"
        description="Use entre 10 e 500 caracteres e explique claramente a necessidade."
        rows={4}
      />
      {isSelf && <Alert>Sua própria permissão não pode ser alterada por esta tela.</Alert>}
      {isOwner && <Alert variant="warning">Mudanças de proprietário exigirão aprovação de outra pessoa.</Alert>}
      {error && <Alert variant="danger" style={{ marginTop: 12 }}>{error}</Alert>}
      {success && <Alert variant="success" style={{ marginTop: 12 }}>{success}</Alert>}
      <Button type="submit" disabled={!canSubmit} loading={busy} loadingLabel="Salvando acesso" style={{ width: "100%", marginTop: 16 }}>
        Salvar acesso
      </Button>
    </form>
  );
};

export default AdminRoleManager;
