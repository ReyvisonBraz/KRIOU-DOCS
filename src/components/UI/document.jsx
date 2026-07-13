/**
 * ============================================
 * KRIOU DOCS — Document Card Component
 * ============================================
 * DocumentCard — card reutilizável para currículos e docs jurídicos
 * com design editorial de luxo.
 *
 * Paleta: navy (#090914 → #14142B), coral (#F43F5E), gold (#D4AF37), teal (#14B8A6)
 * Tipografia: Outfit (display) + Plus Jakarta Sans (body)
 *
 * @module components/ui/document
 */

import React, { useState } from "react";
import { Badge } from "./primitives";
import { Icon } from "../Icons";
import { extractPersonData } from "../../utils/documentCode";
import {
  getDocumentAccessStatus,
  isDocumentPaid,
  isDocumentPaymentPending,
} from "../../domain/documents/payment";

// ── Design tokens ──
const EASE = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
const RAD_LG = "14px";
const RAD_SM = "8px";
const TOQUE = 44;

// ── Ícones por tipo ──
const ICONS = {
  resume: "User",
  curriculo: "User",
  "compra-venda": "Tag",
  locacao: "Home",
  procuracao: "Shield",
  "prestacao-servicos": "Wrench",
  comodato: "Key",
  doacao: "Gift",
  recibo: "FileCheck",
  "uniao-estavel": "Heart",
  "autorizacao-viagem": "Plane",
  permuta: "Repeat",
  default: "FileText",
};

// ── Cor de destaque por tipo ──
const ACCENTS = {
  resume: "var(--coral)",
  curriculo: "var(--coral)",
  "compra-venda": "var(--teal)",
  locacao: "var(--teal)",
  procuracao: "var(--gold)",
  "prestacao-servicos": "var(--teal)",
  comodato: "var(--gold)",
  doacao: "var(--coral)",
  recibo: "var(--teal)",
  "uniao-estavel": "var(--coral)",
  "autorizacao-viagem": "var(--teal)",
  permuta: "var(--gold)",
  default: "var(--teal)",
};

// ── Rótulos ──
const TYPE_LABELS = {
  resume: "Currículo",
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

/**
 * Resolve qual cor de destaque usar para o documento.
 * Prioriza doc.color / doc.templateColor; fallback coral p/ resume, teal p/ legal.
 */
function resolveAccent(doc) {
  const own = doc?.color || doc?.templateColor;
  if (own) return own;
  const typeKey = doc?.type in ACCENTS ? doc.type : "default";
  return ACCENTS[typeKey];
}

export const DocumentCard = ({
  doc,
  onClick,
  onDelete,
  onArchive,
  onDownload,
  onPrint,
  onRename,
  onDuplicate,
  animationDelay = 0,
}) => {
  const [hover, setHover] = useState(false);

  if (!doc) return null;

  const typeKey = doc.type in ICONS ? doc.type : "default";
  const iconName = ICONS[typeKey];
  const accent = resolveAccent(doc);
  const typeLabel = TYPE_LABELS[doc.type] || doc.documentTypeName || doc.type;
  const isPaid = isDocumentPaid(doc);
  const isPaymentPending = isDocumentPaymentPending(doc);
  const accessStatus = getDocumentAccessStatus(doc);
  const statusVariant = isPaid ? "teal" : isPaymentPending ? "gold" : "coral";
  const statusLabel = {
    paid: "Pago",
    pending_payment: "Pagamento em andamento",
    payment_failed: "Pagamento recusado",
    draft: "Rascunho",
    unpaid: "Não pago",
  }[accessStatus];
  const person = extractPersonData(doc);

  return (
    <div
      role="button"
      tabIndex={0}
      className="kf animate-fadeUp break-inside-avoid"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        cursor: "pointer",
        background: hover ? "#14142B" : "var(--surface)",
        border: `1px solid ${hover ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: RAD_LG,
        overflow: "hidden",
        transition: EASE,
        boxShadow: hover
          ? "0 8px 32px rgba(244,63,94,0.12), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.2)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${animationDelay}s`,
        outline: "none",
      }}
    >
      <style>{`
        .doc-action-bar {
          opacity: 1;
        }
        @media (hover: hover) and (pointer: fine) {
          .doc-action-bar {
            opacity: ${hover ? 1 : 0.84};
          }
        }
      `}</style>

      {/* Header: icone + codigo ou tipo */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "18px 18px 0 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {/* Ícone do tipo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: RAD_SM,
              background: `${accent}18`,
              border: `1px solid ${accent}30`,
              flexShrink: 0,
              color: accent,
            }}
          >
            <Icon name={iconName} className="w-5 h-5" />
          </div>

          {/* Código ou rótulo do tipo */}
          {doc.code ? (
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', monospace",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "var(--text-dim)",
                background: "var(--surface-2)",
                padding: "4px 10px",
                borderRadius: "100px",
                border: "1px solid var(--border)",
                whiteSpace: "nowrap",
              }}
            >
              {doc.code}
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-faint)",
                whiteSpace: "nowrap",
              }}
            >
              {typeLabel}
            </span>
          )}
        </div>

        {/* Botão de excluir */}
        <button
          aria-label={`Excluir ${doc.title}`}
          className="kf"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: TOQUE,
            height: TOQUE,
            borderRadius: RAD_SM,
            border: "none",
            background: "transparent",
            color: "var(--text-faint)",
            cursor: "pointer",
            opacity: hover ? 1 : 0.55,
            transition: EASE,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--danger)";
            e.currentTarget.style.background = "rgba(244,63,94,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-faint)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <Icon name="Trash2" className="w-4 h-4" />
        </button>
      </div>

      {/* ── Corpo: nome / título ── */}
      <div style={{ padding: "12px 18px 18px 18px" }}>
        {person.nome ? (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 16,
                lineHeight: 1.35,
                color: "var(--text)",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {person.nome}
            </p>
            {(person.cpf || person.rg) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {person.cpf && <span>CPF: {person.cpf}</span>}
                {person.cpf && person.rg && (
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "var(--text-faint)",
                      flexShrink: 0,
                    }}
                  />
                )}
                {person.rg && <span>RG: {person.rg}</span>}
              </div>
            )}
          </>
        ) : (
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              lineHeight: 1.35,
              color: "var(--text)",
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {doc.title}
          </h3>
        )}

        {/* ── Template ── */}
        {doc.template && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              margin: "6px 0 0 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {doc.templateName || (typeof doc.template === 'string' ? doc.template : doc.template?.name || '')}
          </p>
        )}

        {/* ── Footer: data + status ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
            gap: 12,
          }}
        >
          <span style={{ fontSize: 11, color: "var(--text-faint)" }}>
            {doc.date}
          </span>
          <Badge variant={statusVariant} style={{ fontSize: 10, padding: "4px 10px" }}>
            {statusLabel}
          </Badge>
        </div>

        {doc.archived && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            padding: "4px 9px",
            borderRadius: 999,
            background: "rgba(212,175,55,0.10)",
            border: "1px solid rgba(212,175,55,0.20)",
            color: "var(--gold)",
            fontSize: 10,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            <Icon name="Archive" className="w-3 h-3" />
            Arquivado
          </div>
        )}

        {/* Acoes rapidas */}
        <div
          className="doc-action-bar"
          style={{
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
            transition: EASE,
          }}
        >
          {onRename && (
            <ActionBtn icon="Edit" label="Renomear" onClick={(e) => { e.stopPropagation(); onRename(doc); }} accent={accent} />
          )}
          {onDuplicate && (
            <ActionBtn icon="Copy" label="Copiar" onClick={(e) => { e.stopPropagation(); onDuplicate(doc); }} accent={accent} />
          )}
          {onDownload && isPaid && (
            <ActionBtn icon="Download" label="Baixar PDF" onClick={(e) => { e.stopPropagation(); onDownload(doc); }} accent={accent} />
          )}
          {onPrint && isPaid && (
            <ActionBtn icon="Printer" label="Imprimir" onClick={(e) => { e.stopPropagation(); onPrint(doc); }} accent={accent} />
          )}
          {onArchive && (
            <ActionBtn
              icon={doc.archived ? "RefreshCw" : "Archive"}
              label={doc.archived ? "Restaurar" : "Arquivar"}
              onClick={(e) => { e.stopPropagation(); onArchive(doc); }}
              accent={accent}
            />
          )}
          <ActionBtn
            icon="WhatsApp"
            label="WhatsApp"
            onClick={(e) => {
              e.stopPropagation();
              const text = encodeURIComponent(`*${doc.title || "Documento"}* - Kriou Docs\nCódigo: ${doc.code || ""}`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
            accent="#25D366"
          />
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick, accent }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: 8,
      border: "none",
      background: "transparent",
      color: "var(--text-faint)",
      cursor: "pointer",
      transition: EASE,
      flexShrink: 0,
    }}
    onMouseEnter={(e) => { e.currentTarget.style.color = accent; e.currentTarget.style.background = `${accent}15`; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.background = "transparent"; }}
  >
    <Icon name={icon} className="w-4 h-4" />
  </button>
);
