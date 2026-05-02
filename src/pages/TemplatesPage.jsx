import React, { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button } from "../components/UI";
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
  "compra-venda": { bg: "#0D7377", accent: "#14FFEC", glow: "rgba(13,115,119,0.15)" },
  "locacao": { bg: "#1E3A5F", accent: "#3498DB", glow: "rgba(30,58,95,0.15)" },
  "procuracao": { bg: "#533483", accent: "#A855F7", glow: "rgba(83,52,131,0.15)" },
  "doacao": { bg: "#E94560", accent: "#FF6B81", glow: "rgba(233,69,96,0.15)" },
  "recibo": { bg: "#00D2D3", accent: "#F9A825", glow: "rgba(0,210,211,0.15)" },
  "uniao-estavel": { bg: "#E94560", accent: "#FF6B81", glow: "rgba(233,69,96,0.15)" },
  "autorizacao-viagem": { bg: "#0F3460", accent: "#00D2D3", glow: "rgba(15,52,96,0.15)" },
  "comodato": { bg: "#2C3E50", accent: "#95A5A6", glow: "rgba(44,62,80,0.15)" },
  "permuta": { bg: "#FF6B35", accent: "#F7C948", glow: "rgba(255,107,53,0.15)" },
};

const LegalMiniPreview = ({ doc }) => {
  const colors = LEGAL_DOC_COLORS[doc.id] || { bg: "#1E3A5F", accent: "#3498DB" };
  const sectionCount = doc.spec?.sections?.length || 3;
  const partyCount = doc.spec?.parties?.length || 2;
  const variantCount = doc.variants?.length || 1;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: 140,
      background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.bg}CC 100%)`,
      borderRadius: 6,
      overflow: "hidden",
      padding: 10,
    }}>
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-10%",
        width: "60%",
        height: "80%",
        background: `radial-gradient(ellipse, ${colors.accent}22 0%, transparent 70%)`,
      }} />

      <div style={{
        background: "rgba(255,255,255,0.95)",
        borderRadius: 4,
        padding: "8px 10px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}>
        <div style={{ width: "55%", height: 5, background: colors.accent, borderRadius: 2, opacity: 0.8 }} />
        <div style={{ width: "75%", height: 3.5, background: "#ddd", borderRadius: 2 }} />
        <div style={{ width: "100%", height: 1, background: "#eee", margin: "2px 0" }} />
        {Array.from({ length: Math.min(sectionCount, 4) }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 4, height: 4, borderRadius: 1, background: colors.accent, opacity: 0.6 }} />
            <div style={{ width: `${50 + Math.random() * 35}%`, height: 2.5, background: "#ececec", borderRadius: 2 }} />
          </div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", gap: 4 }}>
          {Array.from({ length: Math.min(partyCount, 2) }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 1.5, background: "#ddd", borderRadius: 1 }} />
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 6,
        right: 6,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(4px)",
        padding: "2px 7px",
        borderRadius: 100,
        fontSize: 9,
        fontWeight: 700,
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}>
        {variantCount} {variantCount === 1 ? "variante" : "variantes"}
      </div>
    </div>
  );
};

const ResumeMiniPreview = ({ template }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    gap: 5,
    height: "100%",
  }}>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: `${template.accent}44`,
        flexShrink: 0,
      }} />
      <div>
        <div style={{ width: 50, height: 5, background: "#ddd", borderRadius: 2 }} />
        <div style={{ width: 35, height: 3, background: "#eee", borderRadius: 2, marginTop: 3 }} />
      </div>
    </div>
    <div style={{ width: "100%", height: 1, background: "#eee" }} />
    <div style={{ width: "85%", height: 3, background: "#eee", borderRadius: 2 }} />
    <div style={{ width: "70%", height: 3, background: "#eee", borderRadius: 2 }} />
    <div style={{ width: "90%", height: 3, background: "#eee", borderRadius: 2 }} />
    <div style={{ width: "100%", height: 1, background: "#eee", marginTop: 2 }} />
    <div style={{ width: "75%", height: 3, background: "#f0f0f0", borderRadius: 2 }} />
    <div style={{ width: "60%", height: 3, background: "#f0f0f0", borderRadius: 2 }} />
  </div>
);

const TemplateCard = ({ template, onClick, isSelected, onViewSpec }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        transition: "all 0.25s ease",
        border: isSelected ? "2px solid var(--coral)" : "2px solid transparent",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered ? "0 16px 40px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          height: 220,
          background: `linear-gradient(145deg, ${template.color} 0%, ${template.color}DD 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {template.tag && (
          <span
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 700,
              background: template.accent,
              color: template.id === "primeiro-emprego" ? "var(--navy)" : "white",
              zIndex: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {template.tag}
          </span>
        )}

        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)",
        }} />

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "75%",
          height: "70%",
          background: "white",
          borderRadius: 6,
          padding: 14,
          boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 12px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.25s ease",
        }}>
          <ResumeMiniPreview template={template} />
        </div>

        {isHovered && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            animation: "fadeIn 0.15s ease",
          }}>
            <Button variant="primary" size="small" icon="Eye" onClick={(e) => { e.stopPropagation(); onViewSpec(template); }}>
              Ver Ficha
            </Button>
            <Button variant="secondary" size="small" icon="FileText" onClick={(e) => { e.stopPropagation(); onClick(); }}>
              Usar
            </Button>
          </div>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{template.name}</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.desc}</p>
          </div>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: template.accent,
              border: "2px solid white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>
    </Card>
  );
};

const LegalDocCard = ({ doc, onClick, onViewSpec }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = LEGAL_DOC_COLORS[doc.id] || { bg: "#1E3A5F", accent: "#3498DB", glow: "rgba(30,58,95,0.15)" };

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        padding: 0,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        border: isHovered ? `2px solid ${colors.accent}` : "2px solid transparent",
        transform: isHovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        boxShadow: isHovered ? `0 20px 48px ${colors.glow}` : "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <LegalMiniPreview doc={doc} />

      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "var(--text)" }}>
          {doc.name}
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: 12 }}>
          {doc.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {doc.variants?.slice(0, 3).map((v) => (
            <span key={v.id} style={{
              fontSize: 10,
              padding: "2px 8px",
              background: `${colors.accent}15`,
              color: colors.accent,
              borderRadius: 100,
              fontWeight: 600,
            }}>
              {v.icon} {v.name}
            </span>
          ))}
          {doc.variants?.length > 3 && (
            <span style={{
              fontSize: 10,
              padding: "2px 8px",
              background: "var(--surface-3)",
              color: "var(--text-muted)",
              borderRadius: 100,
              fontWeight: 600,
            }}>
              +{doc.variants.length - 3}
            </span>
          )}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="Scale" className="w-3.5 h-3.5" style={{ color: colors.accent }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
              {doc.spec?.sections?.length || 0} seções
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onViewSpec(doc); }}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <Icon name="Eye" className="w-3.5 h-3.5" />
              Ver
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              style={{
                background: colors.accent,
                border: "none",
                borderRadius: 8,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 600,
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Icon name="ArrowRight" className="w-3.5 h-3.5" />
              Criar
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const LegalDocSpecModal = ({ doc, onClose, onCreate }) => {
  if (!doc) return null;
  const colors = LEGAL_DOC_COLORS[doc.id] || { bg: "#1E3A5F", accent: "#3498DB" };
  const spec = doc.spec || {};

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scaleIn"
        style={{
          background: "var(--card-bg)",
          borderRadius: 20,
          maxWidth: 580,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{
          padding: 24,
          background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.bg}CC 100%)`,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon name={doc.icon} className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "white" }}>
                  {doc.name}
                </h2>
              </div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{doc.description}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: "white",
              }}
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {spec.whenUse && (
            <div style={{
              padding: 16,
              background: "var(--surface-2)",
              borderRadius: 12,
              marginBottom: 20,
              borderLeft: `3px solid ${colors.accent}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Lightbulb" className="w-4 h-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Quando usar</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{spec.whenUse}</p>
            </div>
          )}

          {doc.legislation && (
            <div style={{
              padding: 14,
              background: `${colors.accent}08`,
              borderRadius: 10,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${colors.accent}20`,
            }}>
              <Icon name="Scale" className="w-4 h-4" style={{ color: colors.accent }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.legislation}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {spec.parties && (
              <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Icon name="Users" className="w-4 h-4" style={{ color: colors.accent }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Partes</span>
                </div>
                {spec.parties.map((party, i) => (
                  <p key={i} style={{ fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{party}</p>
                ))}
              </div>
            )}

            <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="Layers" className="w-4 h-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Variantes</span>
              </div>
              {doc.variants?.map((v) => (
                <div key={v.id} style={{ fontSize: 13, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{v.icon}</span>
                  <span style={{ fontWeight: 500 }}>{v.name}</span>
                </div>
              ))}
            </div>
          </div>

          {spec.sections && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                Seções do documento
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.sections.map((section, i) => (
                  <span key={i} style={{
                    padding: "6px 14px",
                    background: `${colors.accent}12`,
                    color: colors.accent,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1px solid ${colors.accent}25`,
                  }}>
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {spec.requiredDocs && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                Documentos necessários
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.requiredDocs.map((docItem, i) => (
                  <span key={i} style={{
                    padding: "6px 14px",
                    background: "var(--surface-2)",
                    color: "var(--text)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <Icon name="FileCheck" className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
                    {docItem}
                  </span>
                ))}
              </div>
            </div>
          )}

          {spec.tips && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                Dicas de preenchimento
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {spec.tips.map((tip, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: 10,
                    background: "var(--surface-2)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--text)",
                  }}>
                    <Icon name="CheckCircle" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {spec.commonIssues && (
            <div style={{
              padding: 16,
              background: "rgba(233,69,96,0.06)",
              borderRadius: 12,
              marginBottom: 24,
              border: "1px solid rgba(233,69,96,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="AlertTriangle" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral)", textTransform: "uppercase" }}>Pontos de atenção</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {spec.commonIssues.map((issue, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Voltar
            </Button>
            <Button variant="primary" onClick={() => { onCreate(doc); onClose(); }} icon="FileText" style={{ flex: 1, background: `linear-gradient(135deg, ${colors.bg}, ${colors.accent})` }}>
              Criar Documento
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const TemplateSpecModal = ({ template, onClose, onSelect }) => {
  if (!template) return null;

  const spec = template.spec || {};
  const colorBoxStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: template.color,
    border: `2px solid ${template.accent}`,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scaleIn print-spec-card"
        style={{
          background: "var(--card-bg)",
          borderRadius: 20,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div className="print-spec-header" style={{
          padding: 24,
          background: `linear-gradient(145deg, ${template.color} 0%, ${template.color}CC 100%)`,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 4 }}>
                {template.name}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{template.desc}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: "white",
              }}
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Target" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Público-alvo</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)" }}>{spec.target || "Não especificado"}</p>
            </div>

            <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={colorBoxStyle} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Paleta de cores</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.color}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.accent}</p>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Melhores áreas
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(spec.bestFor || []).map((area, i) => (
                <span key={i} style={{
                  padding: "6px 14px",
                  background: `${template.color}15`,
                  color: template.color,
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${template.color}30`,
                }}>
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Seções do documento
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(spec.sections || []).map((section, i) => (
                <span key={i} style={{
                  padding: "6px 14px",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1px solid var(--border)",
                }}>
                  {section}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Dicas de preenchimento
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(spec.tips || []).map((tip, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 10,
                  background: "var(--surface-2)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--text)",
                }}>
                  <Icon name="CheckCircle" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: 16,
            background: "var(--surface-1)",
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Significado das cores
            </h3>
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
              {spec.colorMeaning || "Não especificado"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Fechar
            </Button>
            <Button variant="primary" onClick={() => { onSelect(template); onClose(); }} icon="FileText" style={{ flex: 1 }}>
              Usar este modelo
            </Button>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              icon="Printer"
              style={{ width: "100%" }}
            >
              Imprimir Ficha
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print-spec-card {
            position: absolute !important;
            inset: 0 !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .print-spec-header {
            position: static !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          button { display: none !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const TemplatesPage = () => {
  const { navigate, setSelectedTemplate, setCurrentStep, setLegalStep, setDocumentType } = useApp();
  const [docType, setDocType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLegalCategory, setSelectedLegalCategory] = useState("all");
  const [specTemplate, setSpecTemplate] = useState(null);
  const [specLegalDoc, setSpecLegalDoc] = useState(null);

  useEffect(() => {
    const category = sessionStorage.getItem("kriou_template_category");
    if (category === "resume" || category === "legal") {
      setDocType(category);
    }
    sessionStorage.removeItem("kriou_template_category");
  }, []);

  const handleSelectDocType = (type) => {
    setDocType(type);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    navigate("editor");
  };

  const handleLegalDocSelect = (doc) => {
    setDocumentType(doc);
    setLegalStep(0);
    navigate("legalEditor");
  };

  const handleLegalDocSpecCreate = (doc) => {
    setDocumentType(doc);
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

  const renderHeroSection = () => (
    <div style={{
      textAlign: "center",
      marginBottom: 48,
      padding: "48px 24px 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 600,
        height: 600,
        background: "radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        top: "-30%",
        right: "-10%",
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(0,210,211,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block",
          padding: "6px 16px",
          background: "rgba(233,69,96,0.1)",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--coral)",
          marginBottom: 16,
          border: "1px solid rgba(233,69,96,0.2)",
        }}>
          Modelos disponíveis
        </span>
        <h1 className="font-display" style={{
          fontSize: 40,
          fontWeight: 900,
          marginBottom: 12,
          letterSpacing: "-1.5px",
          background: "linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          O que você deseja criar?
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
          Escolha entre currículos profissionais e documentos jurídicos personalizados
        </p>
      </div>
    </div>
  );

  const renderCategorySelection = () => (
    <div className="animate-fadeIn" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
      {renderHeroSection()}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 28,
        marginBottom: 40,
      }}>
        <div
          onClick={() => handleSelectDocType("resume")}
          style={{
            cursor: "pointer",
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            background: "var(--card-bg)",
            border: "1.5px solid var(--border)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--coral)";
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 24px 48px rgba(233,69,96,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            height: 200,
            background: "linear-gradient(135deg, #E94560 0%, #D63851 40%, #0F3460 100%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            }} />
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              padding: 20,
              transform: "perspective(800px) rotateY(-8deg) rotateX(4deg)",
            }}>
              {RESUME_TEMPLATES.slice(0, 3).map((t, i) => (
                <div key={i} style={{
                  width: 68,
                  height: 90,
                  background: "white",
                  borderRadius: 6,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  padding: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: t.accent || "#E94560" }} />
                    <div style={{ flex: 1, height: 3, background: "#ddd", borderRadius: 2 }} />
                  </div>
                  <div style={{ width: "80%", height: 2, background: "#eee", borderRadius: 1 }} />
                  <div style={{ width: "60%", height: 2, background: "#eee", borderRadius: 1 }} />
                  <div style={{ width: "90%", height: 1.5, background: "#f5f5f5", borderRadius: 1 }} />
                  <div style={{ width: "70%", height: 1.5, background: "#f5f5f5", borderRadius: 1 }} />
                  <div style={{ marginTop: "auto", display: "flex", gap: 3 }}>
                    <div style={{ width: 12, height: 2, background: t.accent || "#E94560", borderRadius: 1, opacity: 0.5 }} />
                    <div style={{ width: 12, height: 2, background: t.accent || "#E94560", borderRadius: 1, opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px 28px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(233,69,96,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon name="User" className="w-6 h-6" style={{ color: "var(--coral)" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 20 }}>Currículos</h3>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Crie currículos profissionais com múltiplos modelos e visualizações em tempo real
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(233,69,96,0.12)", color: "var(--coral)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                {RESUME_TEMPLATES.length} modelos
              </span>
              <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
                Preview visual
              </span>
              <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
                ATS-friendly
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleSelectDocType("legal")}
          style={{
            cursor: "pointer",
            position: "relative",
            borderRadius: 24,
            overflow: "hidden",
            background: "var(--card-bg)",
            border: "1.5px solid var(--border)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--teal)";
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 24px 48px rgba(0,210,211,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            height: 200,
            background: "linear-gradient(135deg, #0D7377 0%, #0F3460 50%, #00D2D3 150%)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 70% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)",
            }} />
            <div style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-end",
              transform: "perspective(800px) rotateY(8deg) rotateX(4deg)",
            }}>
              {getAvailableDocuments().slice(0, 3).map((doc, i) => {
                const colors = LEGAL_DOC_COLORS[doc.id] || { bg: "#1E3A5F", accent: "#3498DB" };
                const scale = 1 - i * 0.06;
                return (
                  <div key={i} style={{
                    width: 90,
                    height: 120,
                    background: "white",
                    borderRadius: 6,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transform: `scale(${scale})`,
                    transformOrigin: "bottom center",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}>
                    <div style={{ width: "60%", height: 4, background: colors.accent, borderRadius: 2 }} />
                    <div style={{ width: "80%", height: 2.5, background: "#ddd", borderRadius: 2, marginTop: 4 }} />
                    <div style={{ width: "65%", height: 2.5, background: "#ececec", borderRadius: 2 }} />
                    <div style={{ width: "100%", height: 1, background: "#eee", margin: "3px 0" }} />
                    <div style={{ width: "75%", height: 2, background: "#f5f5f5", borderRadius: 1 }} />
                    <div style={{ width: "50%", height: 2, background: "#f5f5f5", borderRadius: 1 }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: "24px 28px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(0,210,211,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon name="FileText" className="w-6 h-6" style={{ color: "var(--teal)" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: 20 }}>Documentos Jurídicos</h3>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Contratos, procurações e outros documentos legais com assistente inteligente
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(0,210,211,0.12)", color: "var(--teal)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                {getAvailableDocuments().length} tipos
              </span>
              <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
                Assistente
              </span>
              <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
                Base legal
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResumeTemplates = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <Icon name="ChevronLeft" className="w-4 h-4" />
          Voltar
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(233,69,96,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon name="User" className="w-5 h-5" style={{ color: "var(--coral)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Currículos
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
              Modelos de Currículo
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
              Escolha o estilo que combina com você e sua área
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: selectedCategory === cat.id ? "1.5px solid var(--coral)" : "1px solid var(--border)",
                  background: selectedCategory === cat.id ? "rgba(233,69,96,0.1)" : "var(--surface-2)",
                  color: selectedCategory === cat.id ? "var(--coral)" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <Icon name={cat.icon} className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 24,
      }}>
        {filteredTemplates.map((template, index) => (
          <div
            key={template.id}
            className="animate-fadeUp"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TemplateCard
              template={template}
              onClick={() => handleTemplateSelect(template)}
              isSelected={false}
              onViewSpec={(t) => setSpecTemplate(t)}
            />
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 48,
        padding: 24,
        background: "var(--surface-2)",
        borderRadius: 16,
        textAlign: "center",
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Não encontrou o modelo ideal?{" "}
          <button
            onClick={() => navigate("dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "var(--coral)",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Solicite um personalizado
          </button>
        </p>
      </div>
    </div>
  );

  const renderLegalTemplates = () => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <Icon name="ChevronLeft" className="w-4 h-4" />
          Voltar
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(0,210,211,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon name="FileText" className="w-5 h-5" style={{ color: "var(--teal)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Documentos Jurídicos
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
              Escolha o Tipo de Documento
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
              Selecione o documento e veja os detalhes antes de preencher
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LEGAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedLegalCategory(cat.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: selectedLegalCategory === cat.id ? "1.5px solid var(--teal)" : "1px solid var(--border)",
                  background: selectedLegalCategory === cat.id ? "rgba(0,210,211,0.1)" : "var(--surface-2)",
                  color: selectedLegalCategory === cat.id ? "var(--teal)" : "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <Icon name={cat.icon} className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {legalDocs.map((doc, index) => (
          <div
            key={doc.id}
            className="animate-fadeUp"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <LegalDocCard
              doc={doc}
              onClick={() => handleLegalDocSelect(doc)}
              onViewSpec={(d) => setSpecLegalDoc(d)}
            />
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 40,
        padding: "20px 24px",
        background: "linear-gradient(135deg, rgba(0,210,211,0.06) 0%, rgba(0,210,211,0.02) 100%)",
        borderRadius: 16,
        border: "1px solid rgba(0,210,211,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(0,210,211,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon name="Info" className="w-5 h-5" style={{ color: "var(--teal)" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>
            Todos os documentos incluem base legal
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Clique em "Ver" para conferir requisitos, partes envolvidas e dicas de preenchimento antes de começar.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (docType === "resume") return renderResumeTemplates();
    if (docType === "legal") return renderLegalTemplates();
    return renderCategorySelection();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {renderContent()}

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
          onCreate={handleLegalDocSpecCreate}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TemplatesPage;