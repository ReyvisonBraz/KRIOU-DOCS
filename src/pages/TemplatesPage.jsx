import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import { RESUME_TEMPLATES } from "../data/constants";
import { getAvailableDocuments } from "../data/legalDocuments";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "Todos", icon: "Grid" },
  { id: "professional", label: "Profissional", icon: "Briefcase" },
  { id: "modern", label: "Moderno", icon: "Sparkles" },
  { id: "creative", label: "Criativo", icon: "Palette" },
  { id: "formal", label: "Formal", icon: "FileText" },
];

const CATEGORY_TEMPLATE_IDS = {
  professional: ["executivo", "corporativo", "classico"],
  modern: ["tech", "moderno", "minimalista"],
  creative: ["criativo", "elegante", "startup"],
  formal: ["classico", "corporativo", "executivo"],
};

const LEGAL_CATEGORIES = [
  { id: "all", label: "Todos", icon: "Grid" },
  { id: "contratos", label: "Contratos", icon: "FileText", docIds: ["compra-venda", "locacao", "comodato", "permuta"] },
  { id: "pessoais", label: "Pessoais", icon: "Users", docIds: ["procuracao", "doacao", "uniao-estavel", "autorizacao-viagem"] },
  { id: "financeiros", label: "Financeiros", icon: "Money", docIds: ["recibo"] },
];

const LEGAL_DOC_COLORS = {
  "compra-venda": { accent: "#14FFEC", bg: "#0D7377" },
  "locacao": { accent: "#3498DB", bg: "#1E3A5F" },
  "procuracao": { accent: "#A855F7", bg: "#533483" },
  "doacao": { accent: "#FF6B81", bg: "#E94560" },
  "recibo": { accent: "#F9A825", bg: "#00838F" },
  "uniao-estavel": { accent: "#FF6B81", bg: "#C62828" },
  "autorizacao-viagem": { accent: "#00D2D3", bg: "#0F3460" },
  "comodato": { accent: "#95A5A6", bg: "#2C3E50" },
  "permuta": { accent: "#F7C948", bg: "#E65100" },
};

// ─── ResumeMiniPreview ──────────────────────────────────────────────────────
const ResumeMiniPreview = ({ template }) => (
  <div style={{ display: "flex", gap: 5, height: "100%", padding: 2 }}>
    <div style={{
      width: 24, minWidth: 24, background: `${template.color}12`,
      borderRadius: 3, padding: "4px 3px", display: "flex",
      flexDirection: "column", gap: 3, alignItems: "center",
    }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: template.accent, marginBottom: 1 }} />
      <div style={{ width: "100%", height: 2, background: `${template.color}30`, borderRadius: 1 }} />
      <div style={{ width: "75%", height: 2, background: `${template.color}18`, borderRadius: 1 }} />
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ width: "85%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
      <div style={{ width: "70%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }} />
      <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 1 }} />
    </div>
    <div style={{ flex: 1, padding: "4px 3px", display: "flex", flexDirection: "column", gap: 3 }}>
      <div style={{ width: 26, height: 2, background: template.accent, borderRadius: 1, opacity: 0.6 }} />
      <div style={{ width: "90%", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
      <div style={{ width: "75%", height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
      <div style={{ width: "85%", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
      <div style={{ width: 26, height: 2, background: template.accent, borderRadius: 1, opacity: 0.6, marginTop: 3 }} />
      <div style={{ width: "80%", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
      <div style={{ width: "65%", height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1 }} />
      <div style={{ width: "70%", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1 }} />
    </div>
  </div>
);

// ─── TemplateCard ───────────────────────────────────────────────────────────
const TemplateCard = ({ template, onClick, onViewSpec }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="button"
      aria-label={`Modelo ${template.name} — ${template.desc}`}
      style={{
        cursor: "pointer",
        background: "var(--surface)",
        borderRadius: 14,
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.35), 0 0 0 1px ${template.accent}40`
          : "0 2px 8px rgba(0,0,0,0.18)",
        outline: "none",
        position: "relative",
      }}
    >
      {/* Preview area */}
      <div style={{
        height: 200,
        background: `linear-gradient(155deg, ${template.color} 0%, ${template.color}DD 60%, ${template.color}AA 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {template.tag && (
          <span style={{
            position: "absolute", top: 12, right: 12, padding: "4px 12px",
            borderRadius: 100, fontSize: 10, fontWeight: 800,
            background: template.accent,
            color: template.id === "primeiro-emprego" ? "var(--navy)" : "#fff",
            zIndex: 2, letterSpacing: "0.04em", textTransform: "uppercase",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          }}>
            {template.tag}
          </span>
        )}
        {/* Mini preview on card */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: `translate(-50%, -50%) ${hovered ? "scale(1.04)" : "scale(1)"}`,
          width: "72%", height: "68%", background: "var(--navy)",
          borderRadius: 6, padding: 8,
          boxShadow: hovered
            ? "0 10px 30px rgba(0,0,0,0.4)"
            : "0 4px 14px rgba(0,0,0,0.25)",
          transition: "all 0.3s ease",
        }}>
          <ResumeMiniPreview template={template} />
        </div>
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 48,
          background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(9,9,20,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s ease",
          pointerEvents: hovered ? "auto" : "none",
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewSpec(template); }}
            style={{
              minHeight: 44, padding: "10px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
          >
            <Icon name="Eye" className="w-4 h-4" /> Ver Ficha
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
              minHeight: 44, padding: "10px 20px", borderRadius: 10,
              background: template.accent, border: "none",
              color: template.id === "primeiro-emprego" ? "var(--navy)" : "#fff",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            <Icon name="FileText" className="w-4 h-4" /> Usar
          </button>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 className="font-display" style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.3px" }}>
            {template.name}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.3 }}>{template.desc}</p>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: "50%", background: template.accent,
          flexShrink: 0, boxShadow: `0 0 10px ${template.accent}40`,
        }} />
      </div>
    </div>
  );
};

// ─── TemplateSpecModal ──────────────────────────────────────────────────────
const TemplateSpecModal = ({ template, onClose, onSelect }) => {
  if (!template) return null;
  const spec = template.spec || {};

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(9,9,20,0.82)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "modalFadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 18, maxWidth: 600,
        width: "100%", maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        animation: "modalScaleIn 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          padding: "26px 28px",
          background: `linear-gradient(155deg, ${template.color} 0%, ${template.color}DD 100%)`,
          position: "sticky", top: 0, zIndex: 1, borderRadius: "18px 18px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4, letterSpacing: "-0.5px" }}>
                {template.name}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>{template.desc}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                minWidth: 44, minHeight: 44, padding: 10, borderRadius: 12,
                background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.3)",
                cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28 }}>
          {/* Target + Palette */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 26 }}>
            <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="Target" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Público-alvo
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                {spec.target || "Não especificado"}
              </p>
            </div>
            <div style={{ padding: 18, background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${template.color}, ${template.accent})`,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Paleta
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: template.color }} />
                  <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace" }}>{template.color}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: template.accent }} />
                  <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "monospace" }}>{template.accent}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Best For */}
          {spec.bestFor && (
            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                <Icon name="Star" className="w-3.5 h-3.5" style={{ display: "inline", marginRight: 6, verticalAlign: -1 }} />
                Melhores áreas
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.bestFor.map((area, i) => (
                  <span key={i} style={{
                    padding: "8px 16px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: `${template.color}14`, color: template.color,
                    border: `1px solid ${template.color}28`,
                  }}>{area}</span>
                ))}
              </div>
            </div>
          )}

          {/* Sections */}
          {spec.sections && (
            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                <Icon name="Layers" className="w-3.5 h-3.5" style={{ display: "inline", marginRight: 6, verticalAlign: -1 }} />
                Seções
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.sections.map((s, i) => (
                  <span key={i} style={{
                    padding: "8px 16px", background: "var(--surface-2)",
                    color: "var(--text)", borderRadius: 8, fontSize: 12, fontWeight: 500,
                    border: "1px solid var(--surface-3)",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {spec.tips && (
            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                <Icon name="Lightbulb" className="w-3.5 h-3.5" style={{ display: "inline", marginRight: 6, verticalAlign: -1 }} />
                Dicas
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {spec.tips.map((tip, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 14px", background: "var(--surface-2)",
                    borderRadius: 10, fontSize: 13, color: "var(--text)", lineHeight: 1.5,
                  }}>
                    <Icon name="CheckCircle" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1, minHeight: 48, fontSize: 14, fontWeight: 700 }}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => { onSelect(template); onClose(); }}
              icon="FileText"
              style={{ flex: 1, minHeight: 48, fontSize: 14, fontWeight: 700 }}
            >
              Usar este modelo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── LegalDocSpecModal ──────────────────────────────────────────────────────
const LegalDocSpecModal = ({ doc, onClose, onCreate }) => {
  if (!doc) return null;
  const colors = LEGAL_DOC_COLORS[doc.id] || { accent: "#3498DB", bg: "#1E3A5F" };
  const spec = doc.spec || {};

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(9,9,20,0.82)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "modalFadeIn 0.2s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface)", borderRadius: 18, maxWidth: 560,
        width: "100%", maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        animation: "modalScaleIn 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 26px",
          background: `linear-gradient(155deg, ${colors.bg} 0%, ${colors.bg}DD 100%)`,
          position: "sticky", top: 0, zIndex: 1, borderRadius: "18px 18px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={doc.icon} className="w-6 h-6" style={{ color: "#fff" }} />
              </div>
              <div>
                <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 2, letterSpacing: "-0.3px" }}>
                  {doc.name}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 12 }}>{doc.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                minWidth: 44, minHeight: 44, padding: 10, borderRadius: 12,
                background: "rgba(255,255,255,0.22)", border: "1.5px solid rgba(255,255,255,0.3)",
                cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px" }}>
          {/* When to use */}
          {spec.whenUse && (
            <div style={{
              padding: 16, background: "var(--surface-2)", borderRadius: 12,
              marginBottom: 18, borderLeft: `4px solid ${colors.accent}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Lightbulb" className="w-4 h-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Quando usar
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{spec.whenUse}</p>
            </div>
          )}

          {/* Legislation */}
          {doc.legislation && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 18,
              display: "flex", alignItems: "center", gap: 10,
              background: `${colors.accent}0D`, border: `1px solid ${colors.accent}1A`,
            }}>
              <Icon name="Scale" className="w-4 h-4" style={{ color: colors.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 500 }}>{doc.legislation}</span>
            </div>
          )}

          {/* Parties + Variants */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {spec.parties && (
              <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Icon name="Users" className="w-4 h-4" style={{ color: colors.accent }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Partes
                  </span>
                </div>
                {spec.parties.map((p, i) => (
                  <p key={i} style={{ fontSize: 12, color: "var(--text)", marginBottom: 4 }}>{p}</p>
                ))}
              </div>
            )}
            <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="Layers" className="w-4 h-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Variantes
                </span>
              </div>
              {doc.variants?.map((v) => (
                <div key={v.id} style={{ fontSize: 12, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{v.icon}</span>
                  <span style={{ fontWeight: 500 }}>{v.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {spec.sections && (
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Seções
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {spec.sections.map((s, i) => (
                  <span key={i} style={{
                    padding: "6px 14px", background: `${colors.accent}10`,
                    color: colors.accent, borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${colors.accent}22`,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Required docs */}
          {spec.requiredDocs && (
            <div style={{ marginBottom: 18 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Documentos necessários
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {spec.requiredDocs.map((d, i) => (
                  <span key={i} style={{
                    padding: "6px 14px", background: "var(--surface-2)",
                    color: "var(--text)", borderRadius: 6, fontSize: 11, fontWeight: 500,
                    border: "1px solid var(--surface-3)",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <Icon name="FileCheck" className="w-3 h-3" style={{ color: "var(--success)" }} />
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common issues */}
          {spec.commonIssues && (
            <div style={{
              padding: 16, borderRadius: 10, marginBottom: 18,
              background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="AlertTriangle" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--coral)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Pontos de atenção
                </span>
              </div>
              {spec.commonIssues.map((issue, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
                  {issue}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1, minHeight: 48, fontSize: 14, fontWeight: 700 }}>
              Voltar
            </Button>
            <Button
              variant="primary"
              onClick={() => { onCreate(doc); onClose(); }}
              icon="ArrowRight"
              style={{
                flex: 1, minHeight: 48, fontSize: 14, fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.bg}, ${colors.accent})`,
              }}
            >
              Criar Documento
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── TemplatesPage ──────────────────────────────────────────────────────────
const TemplatesPage = () => {
  const { navigate, setSelectedTemplate, setCurrentStep, setLegalStep, setDocumentType, setSelectedVariant } = useApp();
  const [docType, setDocType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLegalCategory, setSelectedLegalCategory] = useState("all");
  const [specTemplate, setSpecTemplate] = useState(null);
  const [specLegalDoc, setSpecLegalDoc] = useState(null);

  useEffect(() => {
    const cat = sessionStorage.getItem("kriou_template_category");
    if (cat === "resume" || cat === "legal") setDocType(cat);
    sessionStorage.removeItem("kriou_template_category");
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    navigate("editor");
  };

  const handleLegalDocSelect = (doc) => {
    setDocumentType(doc);
    setSelectedVariant(doc.defaultVariant || doc.variants?.[0]?.id);
    setLegalStep(0);
    navigate("legalEditor");
  };

  const handleBack = () => {
    setDocType(null);
    setSelectedCategory("all");
    setSelectedLegalCategory("all");
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return RESUME_TEMPLATES;
    const ids = CATEGORY_TEMPLATE_IDS[selectedCategory] || [];
    return RESUME_TEMPLATES.filter((t) => ids.includes(t.id));
  }, [selectedCategory]);

  const legalDocs = useMemo(() => {
    const allDocs = getAvailableDocuments();
    if (selectedLegalCategory === "all") return allDocs;
    const cat = LEGAL_CATEGORIES.find((c) => c.id === selectedLegalCategory);
    if (!cat) return allDocs;
    return allDocs.filter((doc) => cat.docIds.includes(doc.id));
  }, [selectedLegalCategory]);

  // ── Category pill button ────────────────────────────────────────────────
  const CategoryPill = ({ cat, selected, accent, onSelect }) => (
    <button
      onClick={() => onSelect(cat.id)}
      style={{
        minHeight: 36, minWidth: 44, padding: "8px 18px", borderRadius: 100,
        border: selected ? `1.5px solid ${accent}` : "1px solid var(--border)",
        background: selected ? `${accent}14` : "var(--surface-2)",
        color: selected ? accent : "var(--text-dim)",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        transition: "all 0.15s ease",
        outline: "none",
      }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}40`; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      onMouseEnter={(e) => {
        if (!selected) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }
      }}
      onMouseLeave={(e) => {
        if (!selected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-dim)"; }
      }}
    >
      <Icon name={cat.icon} className="w-4 h-4" />
      {cat.label}
    </button>
  );

  // ── Category Selection (no docType) ─────────────────────────────────────
  const renderCategorySelection = () => (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative",
    }}>
      {/* Ambient light accents */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 520, height: 520, background: "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 440, height: 440, background: "radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 64, position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block", padding: "6px 18px", borderRadius: 100,
          background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.18)",
          fontSize: 12, fontWeight: 700, color: "var(--coral)",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 24,
        }}>
          Criar novo documento
        </span>
        <h1 className="font-display" style={{
          fontSize: 44, fontWeight: 900, marginBottom: 16, letterSpacing: "-1.5px",
          color: "var(--text)", lineHeight: 1.1,
        }}>
          O que deseja criar?
        </h1>
        <p style={{
          color: "var(--text-muted)", fontSize: 16, maxWidth: 480, margin: "0 auto",
          lineHeight: 1.65, fontWeight: 400,
        }}>
          Currículos profissionais ou documentos jurídicos — escolha e comece agora
        </p>
      </div>

      {/* Category cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28,
        maxWidth: 800, width: "100%", position: "relative", zIndex: 1,
      }}>
        {/* Resume card */}
        <button
          onClick={() => setDocType("resume")}
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            textAlign: "left", cursor: "pointer", padding: 0,
            borderRadius: 16, border: "none",
            background: "var(--surface)", overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
            outline: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(244,63,94,0.15), 0 4px 16px rgba(0,0,0,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)"; }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px var(--coral), 0 20px 40px rgba(244,63,94,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)"; }}
        >
          {/* Left accent bar */}
          <div style={{ width: "100%", height: 5, background: "var(--coral)", flexShrink: 0 }} />
          <div style={{ padding: "34px 30px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, marginBottom: 22,
              background: "rgba(244,63,94,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="User" className="w-7 h-7" style={{ color: "var(--coral)" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.4px" }}>
              Currículos
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 22, flex: 1 }}>
              Modelos profissionais com visualização em tempo real. Escolha o layout que combina com sua área.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: "rgba(244,63,94,0.12)", color: "var(--coral)",
              }}>
                {RESUME_TEMPLATES.length} modelos
              </span>
              <span style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12,
                background: "var(--surface-2)", color: "var(--text-dim)", fontWeight: 500,
              }}>
                Preview visual
              </span>
            </div>
          </div>
        </button>

        {/* Legal card */}
        <button
          onClick={() => setDocType("legal")}
          style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            textAlign: "left", cursor: "pointer", padding: 0,
            borderRadius: 16, border: "none",
            background: "var(--surface)", overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
            outline: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(20,184,166,0.15), 0 4px 16px rgba(0,0,0,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)"; }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px var(--teal), 0 20px 40px rgba(20,184,166,0.15)"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.16)"; }}
        >
          <div style={{ width: "100%", height: 5, background: "var(--teal)", flexShrink: 0 }} />
          <div style={{ padding: "34px 30px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, marginBottom: 22,
              background: "rgba(20,184,166,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="FileText" className="w-7 h-7" style={{ color: "var(--teal)" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 24, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.4px" }}>
              Documentos Jurídicos
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, marginBottom: 22, flex: 1 }}>
              Contratos, procurações e documentos legais. Veja os detalhes antes de preencher.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                background: "rgba(20,184,166,0.12)", color: "var(--teal)",
              }}>
                {getAvailableDocuments().length} tipos
              </span>
              <span style={{
                padding: "5px 14px", borderRadius: 100, fontSize: 12,
                background: "var(--surface-2)", color: "var(--text-dim)", fontWeight: 500,
              }}>
                Base legal
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // ── Resume Templates ─────────────────────────────────────────────────────
  const renderResumeTemplates = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(244,63,94,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="User" className="w-5 h-5" style={{ color: "var(--coral)" }} />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 800, color: "var(--coral)",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                Currículos
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.6px" }}>
              Modelos de Currículo
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Escolha o estilo que combina com você e sua área</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                cat={cat}
                selected={selectedCategory === cat.id}
                accent="var(--coral)"
                onSelect={setSelectedCategory}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Asymmetric grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 20,
      }}>
        {filteredTemplates.map((t, i) => {
          const spans = i % 5 === 0 ? 5 : i % 5 === 3 ? 5 : 4;
          return (
            <div
              key={t.id}
              style={{
                gridColumn: `span ${spans}`,
                animation: `fadeUp 0.4s ease forwards`,
                animationDelay: `${i * 0.06}s`,
                opacity: 0,
              }}
            >
              <TemplateCard
                template={t}
                onClick={() => handleTemplateSelect(t)}
                onViewSpec={(t2) => setSpecTemplate(t2)}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{
        marginTop: 52, padding: "22px 28px", borderRadius: 14,
        background: "var(--surface-2)", textAlign: "center",
        border: "1px solid var(--surface-3)",
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Não encontrou o modelo ideal?{" "}
          <button
            onClick={() => navigate("dashboard", { replace: true })}
            style={{
              background: "none", border: "none",
              color: "var(--coral)", fontWeight: 700, fontSize: 14,
              cursor: "pointer", textDecoration: "underline",
              minHeight: 44, padding: "4px 4px",
            }}
          >
            Solicite um personalizado
          </button>
        </p>
      </div>
    </div>
  );

  // ── Legal Templates ──────────────────────────────────────────────────────
  const renderLegalTemplates = () => {
    const categories = LEGAL_CATEGORIES;
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(20,184,166,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="FileText" className="w-5 h-5" style={{ color: "var(--teal)" }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: "var(--teal)",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Documentos Jurídicos
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.6px" }}>
                Escolha o Tipo de Documento
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Visualize os detalhes antes de preencher</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  cat={cat}
                  selected={selectedLegalCategory === cat.id}
                  accent="var(--teal)"
                  onSelect={setSelectedLegalCategory}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legal doc cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {legalDocs.map((doc, i) => {
            const c = LEGAL_DOC_COLORS[doc.id] || { accent: "#3498DB", bg: "#1E3A5F" };
            return (
              <div
                key={doc.id}
                style={{
                  animation: `fadeUp 0.4s ease forwards`,
                  animationDelay: `${i * 0.06}s`,
                  opacity: 0,
                }}
              >
                <Card
                  onClick={() => handleLegalDocSelect(doc)}
                  style={{
                    cursor: "pointer", padding: 0, overflow: "hidden",
                    background: "var(--surface)", borderRadius: 12,
                    border: "none", transition: "all 0.25s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 30px ${c.accent}18`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.14)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    {/* Left accent bar */}
                    <div style={{
                      width: 5, flexShrink: 0,
                      background: `linear-gradient(180deg, ${c.accent} 0%, ${c.bg} 100%)`,
                      borderRadius: "12px 0 0 12px",
                    }} />

                    {/* Content */}
                    <div style={{ flex: 1, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18 }}>
                      {/* Icon */}
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `${c.accent}12`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon name={doc.icon} className="w-5 h-5" style={{ color: c.accent }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                          <h3 className="font-display" style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                            {doc.name}
                          </h3>
                          {doc.legislation && (
                            <span style={{
                              fontSize: 10, padding: "3px 10px", borderRadius: 100,
                              background: `${c.accent}10`, color: c.accent,
                              fontWeight: 700, border: `1px solid ${c.accent}20`,
                              letterSpacing: "0.02em",
                            }}>
                              {doc.legislation.length > 40 ? doc.legislation.substring(0, 40) + "…" : doc.legislation}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.45, marginBottom: 10 }}>
                          {doc.description}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          {doc.variants?.map((v) => (
                            <span key={v.id} style={{
                              fontSize: 11, padding: "3px 12px", borderRadius: 100,
                              background: "var(--surface-2)", color: "var(--text-dim)",
                              fontWeight: 500, display: "flex", alignItems: "center", gap: 4,
                            }}>
                              {v.icon} {v.name}
                            </span>
                          ))}
                          <span style={{
                            fontSize: 11, padding: "3px 12px", borderRadius: 100,
                            background: `${c.accent}0C`, color: c.accent, fontWeight: 700,
                          }}>
                            {doc.spec?.sections?.length || 0} seções
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSpecLegalDoc(doc); }}
                          style={{
                            minHeight: 44, padding: "10px 18px", borderRadius: 10,
                            background: "transparent", border: "1px solid var(--border)",
                            color: "var(--text-dim)", fontSize: 13, fontWeight: 600,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.15s ease", outline: "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = c.accent;
                            e.currentTarget.style.color = c.accent;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-dim)";
                          }}
                          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${c.accent}40`; }}
                          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <Icon name="Eye" className="w-4 h-4" /> Ver
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLegalDocSelect(doc); }}
                          style={{
                            minHeight: 44, padding: "10px 22px", borderRadius: 10,
                            background: c.accent, border: "none",
                            color: "#fff", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                            transition: "all 0.15s ease", outline: "none",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.12)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
                          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px ${c.accent}60`; }}
                          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                        >
                          Criar <Icon name="ArrowRight" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom info */}
        <div style={{
          marginTop: 40, padding: "18px 24px", borderRadius: 14,
          background: "var(--surface-2)", border: "1px solid var(--surface-3)",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "rgba(20,184,166,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Icon name="Shield" className="w-5 h-5" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
              Clique em "Ver" para conferir base legal, requisitos e dicas
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Todos os documentos seguem a legislação brasileira vigente
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ── Render content ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (docType === "resume") return renderResumeTemplates();
    if (docType === "legal") return renderLegalTemplates();
    return renderCategorySelection();
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "var(--navy)" }}>
      <AppNavbar
        title={
          <span className="font-bold">
            {docType
              ? (docType === "resume" ? "Modelos de Currículo" : "Documentos Jurídicos")
              : "Criar Documento"}
          </span>
        }
        leftAction={
          <button
            onClick={() => docType ? handleBack() : navigate("dashboard", { replace: true })}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              minHeight: 44, padding: "6px 4px",
              fontSize: 14, fontWeight: 700, color: "var(--text-muted)",
              background: "transparent", border: "none", cursor: "pointer",
              transition: "color 0.15s ease", outline: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
            onFocus={(e) => { e.currentTarget.style.color = "var(--text)"; }}
            onBlur={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
            {docType ? "Voltar" : "Início"}
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingBottom: 80 }}>
        {renderContent()}
      </div>

      {/* Modals */}
      {specTemplate && (
        <TemplateSpecModal
          template={specTemplate}
          onClose={() => setSpecTemplate(null)}
          onSelect={(t) => handleTemplateSelect(t)}
        />
      )}
      {specLegalDoc && (
        <LegalDocSpecModal
          doc={specLegalDoc}
          onClose={() => setSpecLegalDoc(null)}
          onCreate={handleLegalDocSelect}
        />
      )}

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TemplatesPage;
