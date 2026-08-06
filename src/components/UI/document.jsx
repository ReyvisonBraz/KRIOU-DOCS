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

import React, { useId, useState } from "react";
import { Badge } from "./primitives";
import DocumentActionsMenu from "./DocumentActionsMenu";
import { Icon } from "../Icons";
import { extractPersonData } from "../../utils/documentCode";
import {
  getDocumentAccessStatus,
  isDocumentPaid,
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
  onPay,
  onPrint,
  onRename,
  onDuplicate,
  onRestore,
  onPermanentDelete,
  unlimitedAccess = false,
  animationDelay = 0,
}) => {
  const [hover, setHover] = useState(false);
  const titleId = useId();

  if (!doc) return null;

  const typeKey = doc.type in ICONS ? doc.type : "default";
  const iconName = ICONS[typeKey];
  const accent = resolveAccent(doc);
  const typeLabel = TYPE_LABELS[doc.type] || doc.documentTypeName || doc.type;
  const isPaid = isDocumentPaid(doc);
  const accessStatus = getDocumentAccessStatus(doc);
  const hasDownloadAccess = isPaid || unlimitedAccess;
  const statusVariant = {
    paid: "teal",
    pending_payment: "gold",
    payment_failed: "coral",
    draft: "default",
    unpaid: "gold",
  }[accessStatus] || "default";
  const statusLabel = {
    paid: "Pago",
    pending_payment: "Pagamento em andamento",
    payment_failed: "Pagamento recusado",
    draft: "Rascunho",
    unpaid: "Não pago",
  }[accessStatus];
  const person = extractPersonData(doc);
  const accessibleTitle = person.nome || doc.title || typeLabel || "documento";
  const isTrashed = Boolean(doc.deletedAt);

  return (
    <article
      aria-labelledby={titleId}
      className="kf animate-fadeUp break-inside-avoid"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        cursor: "pointer",
        background: hover ? "var(--surface-subtle)" : "var(--surface)",
        border: `1px solid ${isPaid ? "rgba(20,184,166,0.55)" : hover ? "var(--border-hover)" : "var(--border)"}`,
        borderRadius: RAD_LG,
        overflow: "hidden",
        transition: EASE,
        boxShadow: hover
          ? "0 8px 32px rgba(244,63,94,0.12), 0 2px 8px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.2)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        animationDelay: `${animationDelay}s`,
      }}
    >
      <button
        type="button"
        aria-label={isTrashed ? `${accessibleTitle} está na lixeira` : `Abrir ${accessibleTitle}`}
        className="document-card-primary"
        onClick={isTrashed ? undefined : onClick}
        disabled={isTrashed}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: RAD_LG,
          background: "transparent",
          cursor: "pointer",
        }}
      />
      {isPaid && (
        <div style={{ position: "relative", zIndex: 0,
          padding: "7px 14px", background: "rgba(20,184,166,0.12)", color: "var(--teal)",
          fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Icon name="Check" className="w-3.5 h-3.5" /> Documento pago · edição liberada
        </div>
      )}
      {!isPaid && unlimitedAccess && (
        <div style={{ position: "relative", zIndex: 0,
          padding: "7px 14px", background: "rgba(212,175,55,0.12)", color: "var(--gold)",
          fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <Icon name="Shield" className="w-3.5 h-3.5" /> Conta admin · download ilimitado
        </div>
      )}
      <style>{`
        .doc-action-bar {
          opacity: 1;
        }
        .document-card-primary:focus-visible {
          outline: 3px solid var(--focus-ring);
          outline-offset: -3px;
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
                fontFamily: "'Plus Jakarta Sans Variable', monospace",
                fontSize: 12,
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
                fontSize: 12,
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

      </div>

      {/* ── Corpo: nome / título ── */}
      <div style={{ padding: "12px 18px 18px 18px" }}>
        {person.nome ? (
          <>
            <p
              id={titleId}
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
                  fontSize: 12,
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
            id={titleId}
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
              fontSize: 14,
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
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>
            {doc.date}
          </span>
          <Badge variant={statusVariant} style={{ fontSize: 12, padding: "4px 10px" }}>
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
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            <Icon name="Archive" className="w-3 h-3" />
            Arquivado
          </div>
        )}

        {isTrashed && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
            padding: "4px 9px", borderRadius: 999,
            background: "color-mix(in srgb, var(--danger) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)",
            color: "var(--danger)", fontSize: 12, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            <Icon name="Trash2" className="w-3 h-3" /> Na lixeira
          </div>
        )}

        {/* Acoes rapidas */}
        <div
          className="doc-action-bar"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: 5,
            flexWrap: "wrap",
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
            transition: EASE,
          }}
        >
          {!isTrashed && <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
              minHeight: TOQUE, padding: "0 12px", borderRadius: 9,
              border: `1px solid ${accent}45`, background: `${accent}14`, color: "var(--text-accent)",
              display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer",
              fontSize: 12, fontWeight: 800, fontFamily: "var(--font-body)",
            }}
            title="Editar o conteúdo deste documento"
          >
            <Icon name="Edit" className="w-4 h-4" /> Editar documento
          </button>}
          {!isTrashed && onDownload && hasDownloadAccess && (
            <DirectActionButton icon="Download" label="Baixar PDF" onClick={() => onDownload(doc)} accent={accent} />
          )}
          {!isTrashed && onPay && !hasDownloadAccess && accessStatus !== "draft" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPay(doc); }}
              style={{
                minHeight: TOQUE, padding: "0 12px", borderRadius: 9, border: "none",
                background: "var(--coral)", color: "var(--on-action)", display: "inline-flex",
                alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12,
                fontWeight: 800, fontFamily: "var(--font-body)",
              }}
              title="Finalizar o pagamento e liberar o PDF"
            >
              <Icon name="CreditCard" className="w-4 h-4" /> Pagar e liberar PDF
            </button>
          )}
          {isTrashed && onRestore && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onRestore(doc); }}
              style={{
                minHeight: TOQUE, padding: "0 14px", borderRadius: 9,
                border: "1px solid var(--teal)", background: "var(--teal)",
                color: "var(--on-action)", display: "inline-flex", alignItems: "center", gap: 7,
                cursor: "pointer", fontSize: 12, fontWeight: 800, fontFamily: "var(--font-body)",
              }}
            >
              <Icon name="RefreshCw" className="w-4 h-4" /> Restaurar documento
            </button>
          )}
          <DocumentActionsMenu
            documentTitle={accessibleTitle}
            items={[
              isTrashed && onRestore && { icon: "RefreshCw", label: "Restaurar documento", onSelect: () => onRestore(doc) },
              isTrashed && onPermanentDelete && { icon: "Trash2", label: "Excluir definitivamente", onSelect: () => onPermanentDelete(doc), danger: true },
              !isTrashed && onRename && { icon: "Edit", label: "Renomear", onSelect: () => onRename(doc) },
              !isTrashed && onDuplicate && { icon: "Copy", label: "Criar uma cópia", onSelect: () => onDuplicate(doc) },
              !isTrashed && onPrint && hasDownloadAccess && { icon: "Printer", label: "Imprimir", onSelect: () => onPrint(doc) },
              !isTrashed && onArchive && {
                icon: doc.archived ? "RefreshCw" : "Archive",
                label: doc.archived ? "Restaurar" : "Arquivar",
                onSelect: () => onArchive(doc),
              },
              !isTrashed && {
                icon: "WhatsApp",
                label: "Compartilhar no WhatsApp",
                onSelect: () => {
                  const text = encodeURIComponent(`*${doc.title || "Documento"}* - Kriou Docs\nCódigo: ${doc.code || ""}`);
                  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
                },
              },
              !isTrashed && onDelete && { icon: "Trash2", label: "Mover para a lixeira", onSelect: onDelete, danger: true },
            ]}
          />
        </div>
      </div>
    </article>
  );
};

const DirectActionButton = ({ icon, label, onClick, accent }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      minHeight: TOQUE,
      padding: "0 12px",
      borderRadius: 9,
      border: `1px solid ${accent}45`,
      background: `${accent}14`,
      color: "var(--text-accent)",
      cursor: "pointer",
      transition: EASE,
      fontFamily: "var(--font-body)",
      fontSize: 12,
      fontWeight: 800,
    }}
  >
    <Icon name={icon} className="w-4 h-4" />
    {label}
  </button>
);
