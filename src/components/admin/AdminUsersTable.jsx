import React from "react";
import { Badge, Button, DataTable } from "../UI";

const ROLE_META = {
  owner: { label: "Proprietário", variant: "warning" },
  admin: { label: "Administrador", variant: "info" },
  support: { label: "Suporte", variant: "success" },
  finance: { label: "Financeiro", variant: "warning" },
  client: { label: "Cliente", variant: "default" },
};

const displayName = (user) => {
  const fullName = [user.nome, user.sobrenome].filter(Boolean).join(" ").trim();
  return fullName || "Nome indisponível";
};

const AdminUsersTable = ({ users = [], isLoading = false, canManageRoles = false, onViewDocuments, onManageAccess }) => {
  const columns = [
    { key: "name", header: "Nome", render: (user) => <strong style={{ color: "var(--text)", fontWeight: 700 }}>{displayName(user)}</strong> },
    { key: "email", header: "E-mail", render: (user) => user.email || "E-mail indisponível" },
    {
      key: "role",
      header: "Acesso",
      render: (user) => {
        const meta = ROLE_META[user.adminRole] || ROLE_META.client;
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    { key: "documents", header: "Documentos", mobileLabel: "Docs.", align: "center", render: (user) => <strong style={{ color: "var(--text)" }}>{user.docCount ?? 0}</strong> },
    { key: "createdAt", header: "Criado em", render: (user) => user.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—" },
    {
      key: "actions",
      header: "Ações",
      mobileLabel: "",
      mobile: "actions",
      render: (user) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
          <Button size="small" variant="secondary" onClick={() => onViewDocuments?.(user.id)}>Documentos</Button>
          {canManageRoles && (
            <Button size="small" variant="secondary" onClick={() => onManageAccess?.(user)} style={{ color: "var(--gold)", borderColor: "color-mix(in srgb, var(--gold) 38%, transparent)" }}>
              Acesso
            </Button>
          )}
        </div>
      ),
    },
  ];

  return <DataTable caption="Usuários cadastrados" columns={columns} rows={users} isLoading={isLoading} loadingRows={4} emptyMessage="Nenhum usuário encontrado." />;
};

export default AdminUsersTable;
