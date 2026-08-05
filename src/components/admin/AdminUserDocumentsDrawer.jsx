import React from "react";
import { Alert, Badge, Button, Drawer, EmptyState, Skeleton } from "../UI";

const STATUS_META = {
  finalizado: { label: "Finalizado", variant: "success" },
  completed: { label: "Finalizado", variant: "success" },
  pago: { label: "Pago", variant: "success" },
  draft: { label: "Rascunho", variant: "default" },
  rascunho: { label: "Rascunho", variant: "default" },
  pending: { label: "Pendente", variant: "warning" },
};

const userName = (user) => {
  const name = [user?.nome, user?.sobrenome].filter(Boolean).join(" ").trim();
  return name || user?.email || "usuário";
};

const documentStatus = (status) => {
  const normalized = (status || "draft").toLowerCase();
  return STATUS_META[normalized] || { label: status || "Rascunho", variant: "info" };
};

const LoadingList = () => (
  <div aria-label="Carregando documentos" role="status" style={{ display: "grid", gap: 12 }}>
    {[0, 1, 2].map((item) => (
      <div key={item} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-card)" }}>
        <Skeleton width="65%" height={18} />
        <Skeleton width="42%" height={14} style={{ marginTop: 10 }} />
      </div>
    ))}
  </div>
);

const AdminUserDocumentsDrawer = ({ user, documents = [], loading = false, error, onRetry, onClose }) => (
  <Drawer
    open={Boolean(user)}
    title={`Documentos de ${userName(user)}`}
    description={user?.email || "Consulte os documentos vinculados a esta conta."}
    onClose={onClose}
  >
    {error && (
      <Alert
        variant="danger"
        title="Não foi possível carregar os documentos"
        action={<Button size="small" variant="secondary" onClick={onRetry}>Tentar novamente</Button>}
        style={{ marginBottom: 16 }}
      >
        {error}
      </Alert>
    )}

    {loading ? (
      <LoadingList />
    ) : documents.length === 0 && !error ? (
      <EmptyState
        title="Nenhum documento"
        description="Esta conta ainda não criou documentos."
        headingLevel={3}
      />
    ) : (
      <ul className="admin-document-list" aria-label={`${documents.length} documentos encontrados`}>
        {documents.map((document) => {
          const status = documentStatus(document.status);
          return (
            <li key={document.id} className="admin-document-item">
              <div className="admin-document-item__header">
                <div style={{ minWidth: 0 }}>
                  <strong>{document.title || "Documento sem título"}</strong>
                  {document.code && <span className="admin-document-item__code">{document.code}</span>}
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p>
                {document.document_type_name || document.type || "Tipo não informado"}
                {document.created_at ? ` · ${new Date(document.created_at).toLocaleDateString("pt-BR")}` : ""}
              </p>
            </li>
          );
        })}
      </ul>
    )}
  </Drawer>
);

export default AdminUserDocumentsDrawer;
