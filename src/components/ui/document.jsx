/**
 * ============================================
 * KRIOU DOCS - Document Card Component
 * ============================================
 * DocumentCard — card reutilizável para currículos e docs jurídicos
 *
 * @module components/ui/document
 */

import React from "react";
import { Card } from "./primitives";
import { Badge } from "./primitives";
import { Icon } from "../Icons";

/**
 * DocumentCard — Card reutilizável para exibir documentos no Dashboard.
 *
 * @param {Object}   doc            - Objeto do documento
 * @param {Function} onClick        - Handler de clique
 * @param {Function} onDelete       - Handler de exclusão
 * @param {number}   animationDelay - Delay de animação em segundos
 */
export const DocumentCard = ({ doc, onClick, onDelete, animationDelay = 0 }) => {
  const isResume = doc.type === "curriculo";

  const typeColor = isResume ? "var(--coral)" : "var(--teal)";
  const typeBg = isResume ? "rgba(233,69,96,0.1)" : "rgba(0,210,211,0.1)";

  const typeLabels = {
    curriculo: "Currículo",
    "compra-venda": "Compra/Venda",
    locacao: "Locação",
    procuracao: "Procuração",
    "prestacao-servicos": "Prest. Serviços",
    comodato: "Comodato",
    doacao: "Doação",
    recibo: "Recibo",
    "uniao-estavel": "União Estável",
    "autorizacao-viagem": "Autorização de Viagem",
    permuta: "Permuta",
  };
  const typeLabel = typeLabels[doc.type] || doc.type;

  const statusVariant = doc.status === "finalizado" ? "success" : "warning";
  const statusLabel = doc.status === "finalizado" ? "✓ Finalizado" : "✎ Rascunho";

  return (
    <Card
      className="animate-fadeUp"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: 18,
        animationDelay: `${animationDelay}s`,
        transition: "transform .18s, box-shadow .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          background: typeBg,
          color: typeColor,
          padding: "5px 10px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
        }}>
          {typeLabel}
        </span>
        <Badge variant={statusVariant} style={{ fontSize: 10 }}>
          {statusLabel}
        </Badge>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--text)", lineHeight: 1.3 }}>
        {doc.title}
      </h3>

      <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{doc.template}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{doc.date}</span>
          {onDelete && (
            <button
              aria-label={`Excluir ${doc.title}`}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--text-muted)", padding: 2, display: "flex",
                alignItems: "center", borderRadius: 4,
                transition: "color .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--coral)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Icon name="Trash2" className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
