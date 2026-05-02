/**
 * ============================================
 * KRIOU DOCS - Document Card Component
 * ============================================
 * DocumentCard — card reutilizável para currículos e docs jurídicos
 * com layout masonry/bento-grid, anti-identical-card-grid.
 *
 * @module components/ui/document
 */

import React from "react";
import { Badge } from "./primitives";
import { Icon } from "../Icons";
import { extractPersonData } from "../../utils/documentCode";

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

const GRADIENTS = {
  resume: "from-coral/15 to-coral/5",
  curriculo: "from-coral/15 to-coral/5",
  "compra-venda": "from-teal/15 to-teal/5",
  locacao: "from-teal/15 to-teal/5",
  procuracao: "from-purple/15 to-purple/5",
  "prestacao-servicos": "from-teal/15 to-teal/5",
  comodato: "from-gold/15 to-gold/5",
  doacao: "from-coral/15 to-coral/5",
  recibo: "from-teal/15 to-teal/5",
  "uniao-estavel": "from-coral/15 to-coral/5",
  "autorizacao-viagem": "from-teal/15 to-teal/5",
  permuta: "from-gold/15 to-gold/5",
  default: "from-surface-2 to-surface",
};

const ACCENTS = {
  resume: "bg-coral",
  curriculo: "bg-coral",
  "compra-venda": "bg-teal",
  locacao: "bg-teal",
  procuracao: "bg-purple",
  "prestacao-servicos": "bg-teal",
  comodato: "bg-gold",
  doacao: "bg-coral",
  recibo: "bg-teal",
  "uniao-estavel": "bg-coral",
  "autorizacao-viagem": "bg-teal",
  permuta: "bg-gold",
  default: "bg-teal",
};

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

export const DocumentCard = ({ doc, onClick, onDelete, animationDelay = 0 }) => {
  const typeKey = doc.type in GRADIENTS ? doc.type : "default";
  const iconName = ICONS[typeKey] || "FileText";
  const gradient = GRADIENTS[typeKey] || GRADIENTS.default;
  const accent = ACCENTS[typeKey] || ACCENTS.default;
  const typeLabel = TYPE_LABELS[doc.type] || doc.type;
  const statusVariant = doc.status === "finalizado" ? "success" : "warning";
  const statusLabel = doc.status === "finalizado" ? "Finalizado" : "Rascunho";
  const person = extractPersonData(doc);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="animate-fadeUp break-inside-avoid group relative cursor-pointer rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Background gradient layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} pointer-events-none`} />

      {/* Accent stripe top (thin, not side-stripe border — that's banned) */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${accent} opacity-60 pointer-events-none`} />

      <div className="relative p-5">
        {/* Code + type row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-3 border border-white/[0.06]">
              <Icon name={iconName} className="w-4 h-4 text-text-muted" />
            </div>
            {doc.code ? (
              <span className="text-xs font-mono font-bold tracking-wider text-text/90 bg-surface-3 px-2 py-0.5 rounded-md border border-white/[0.06]">
                {doc.code}
              </span>
            ) : (
              <span className="text-xs font-bold tracking-wide uppercase text-text-muted/70">
                {typeLabel}
              </span>
            )}
          </div>
          <button
            aria-label={`Excluir ${doc.title}`}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg text-text-muted/50 hover:text-coral hover:bg-coral/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60"
          >
            <Icon name="Trash2" className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Person data (nome, CPF, RG) */}
        {person.nome && (
          <div className="mb-2">
            <p className="font-display font-bold text-[15px] leading-snug text-white truncate">
              {person.nome}
            </p>
            {(person.cpf || person.rg) && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-muted/60">
                {person.cpf && <span>CPF: {person.cpf}</span>}
                {person.cpf && person.rg && (
                  <span className="w-0.5 h-0.5 rounded-full bg-text-muted/30 inline-block" />
                )}
                {person.rg && <span>RG: {person.rg}</span>}
              </div>
            )}
          </div>
        )}

        {/* Title fallback when no person name */}
        {!person.nome && (
          <h3 className="font-display font-bold text-[15px] leading-snug text-white mb-3 line-clamp-2">
            {doc.title}
          </h3>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted/60">
            {doc.date}
          </span>
          <Badge variant={statusVariant} style={{ fontSize: 10, padding: "3px 8px" }}>
            {statusLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
};
