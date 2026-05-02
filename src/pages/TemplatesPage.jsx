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

const ResumeMiniPreview = ({ template }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5, height: "100%" }}>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${template.accent}44`, flexShrink: 0 }} />
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

const TemplateCard = ({ template, onClick, onViewSpec }) => {
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
        border: "2px solid transparent",
        transform: isHovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: isHovered ? "0 16px 40px rgba(0,0,0,0.2)" : "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{
        height: 220,
        background: `linear-gradient(145deg, ${template.color} 0%, ${template.color}DD 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {template.tag && (
          <span style={{
            position: "absolute", top: 14, right: 14, padding: "4px 12px", borderRadius: 100,
            fontSize: 11, fontWeight: 700, background: template.accent,
            color: template.id === "primeiro-emprego" ? "var(--navy)" : "white", zIndex: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}>
            {template.tag}
          </span>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: "75%", height: "70%", background: "white", borderRadius: 6, padding: 14,
          boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 12px rgba(0,0,0,0.15)",
          transition: "box-shadow 0.25s ease",
        }}>
          <ResumeMiniPreview template={template} />
        </div>
        {isHovered && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            animation: "fadeIn 0.15s ease",
          }}>
            <Button variant="primary" size="small" icon="Eye" onClick={(e) => { e.stopPropagation(); onViewSpec(template); }}>Ver Ficha</Button>
            <Button variant="secondary" size="small" icon="FileText" onClick={(e) => { e.stopPropagation(); onClick(); }}>Usar</Button>
          </div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{template.name}</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.desc}</p>
          </div>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: template.accent, border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
        </div>
      </div>
    </Card>
  );
};

const TemplateSpecModal = ({ template, onClose, onSelect }) => {
  if (!template) return null;
  const spec = template.spec || {};

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, animation: "fadeIn 0.15s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-scaleIn print-spec-card" style={{
        background: "#16162A", borderRadius: 20, maxWidth: 600, width: "100%", maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div className="print-spec-header" style={{
          padding: 24,
          background: `linear-gradient(145deg, ${template.color} 0%, ${template.color}CC 100%)`,
          position: "sticky", top: 0, zIndex: 1, borderRadius: "20px 20px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 4 }}>{template.name}</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{template.desc}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "white" }}>
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ padding: 16, background: "#1E1E36", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Target" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Público-alvo</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)" }}>{spec.target || "Não especificado"}</p>
            </div>
            <div style={{ padding: 16, background: "#1E1E36", borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: template.color, border: `2px solid ${template.accent}` }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Paleta</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.color}</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{template.accent}</p>
            </div>
          </div>
          {spec.bestFor && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Melhores áreas</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.bestFor.map((area, i) => (
                  <span key={i} style={{ padding: "6px 14px", background: `${template.color}15`, color: template.color, borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1px solid ${template.color}30` }}>{area}</span>
                ))}
              </div>
            </div>
          )}
          {spec.sections && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Seções</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.sections.map((s, i) => <span key={i} style={{ padding: "6px 14px", background: "#1E1E36", color: "var(--text)", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid #2A2A4A" }}>{s}</span>)}
              </div>
            </div>
          )}
          {spec.tips && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>Dicas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {spec.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: "#1E1E36", borderRadius: 8, fontSize: 13, color: "var(--text)" }}>
                    <Icon name="CheckCircle" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />{tip}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Fechar</Button>
            <Button variant="primary" onClick={() => { onSelect(template); onClose(); }} icon="FileText" style={{ flex: 1 }}>Usar este modelo</Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } } @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
};

const LegalDocSpecModal = ({ doc, onClose, onCreate }) => {
  if (!doc) return null;
  const colors = LEGAL_DOC_COLORS[doc.id] || { accent: "#3498DB", bg: "#1E3A5F" };
  const spec = doc.spec || {};

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24, animation: "fadeIn 0.15s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-scaleIn" style={{
        background: "#16162A", borderRadius: 20, maxWidth: 560, width: "100%", maxHeight: "90vh",
        overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          padding: "20px 24px",
          background: `linear-gradient(145deg, ${colors.bg} 0%, ${colors.bg}EE 100%)`,
          position: "sticky", top: 0, zIndex: 1, borderRadius: "20px 20px 0 0",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={doc.icon} className="w-5 h-5" style={{ color: "white" }} />
              </div>
              <div>
                <h2 className="font-display" style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 2 }}>{doc.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>{doc.description}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "white" }}>
              <Icon name="X" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {spec.whenUse && (
            <div style={{ padding: 14, background: "#1E1E36", borderRadius: 12, marginBottom: 16, borderLeft: `3px solid ${colors.accent}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Icon name="Lightbulb" className="w-4 h-4" style={{ color: colors.accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Quando usar</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{spec.whenUse}</p>
            </div>
          )}

          {doc.legislation && (
            <div style={{
              padding: 12, background: `${colors.accent}10`, borderRadius: 10, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10, border: `1px solid ${colors.accent}20`,
            }}>
              <Icon name="Scale" className="w-4 h-4" style={{ color: colors.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{doc.legislation}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {spec.parties && (
              <div style={{ padding: 14, background: "#1E1E36", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Icon name="Users" className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Partes</span>
                </div>
                {spec.parties.map((p, i) => <p key={i} style={{ fontSize: 12, color: "var(--text)", marginBottom: 3 }}>{p}</p>)}
              </div>
            )}
            <div style={{ padding: 14, background: "#1E1E36", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Icon name="Layers" className="w-3.5 h-3.5" style={{ color: colors.accent }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Variantes</span>
              </div>
              {doc.variants?.map((v) => (
                <div key={v.id} style={{ fontSize: 12, color: "var(--text)", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
                  <span>{v.icon}</span><span style={{ fontWeight: 500 }}>{v.name}</span>
                </div>
              ))}
            </div>
          </div>

          {spec.sections && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Seções</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {spec.sections.map((s, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: `${colors.accent}12`, color: colors.accent, borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {spec.requiredDocs && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Documentos necessários</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {spec.requiredDocs.map((d, i) => (
                  <span key={i} style={{ padding: "4px 10px", background: "#1E1E36", color: "var(--text)", borderRadius: 6, fontSize: 11, border: "1px solid #2A2A4A" }}>
                    <Icon name="FileCheck" className="w-3 h-3" style={{ color: "var(--success)", marginRight: 4 }} />{d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {spec.commonIssues && (
            <div style={{ padding: 14, background: "rgba(233,69,96,0.06)", borderRadius: 10, marginBottom: 16, border: "1px solid rgba(233,69,96,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Icon name="AlertTriangle" className="w-4 h-4" style={{ color: "var(--coral)" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--coral)", textTransform: "uppercase" }}>Pontos de atenção</span>
              </div>
              {spec.commonIssues.map((issue, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />{issue}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Voltar</Button>
            <Button variant="primary" onClick={() => { onCreate(doc); onClose(); }} icon="ArrowRight" style={{ flex: 1, background: `linear-gradient(135deg, ${colors.bg}, ${colors.accent})` }}>
              Criar Documento
            </Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } } @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }`}</style>
    </div>
  );
};

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

  const renderCategorySelection = () => (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, background: "radial-gradient(circle, rgba(233,69,96,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(0,210,211,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block", padding: "6px 16px", background: "rgba(233,69,96,0.08)",
          borderRadius: 100, fontSize: 13, fontWeight: 600, color: "var(--coral)", marginBottom: 20,
          border: "1px solid rgba(233,69,96,0.15)",
        }}>
          Criar novo documento
        </span>
        <h1 className="font-display" style={{
          fontSize: 44, fontWeight: 900, marginBottom: 14, letterSpacing: "-2px",
          background: "linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          O que deseja criar?
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Currículos profissionais ou documentos jurídicos — escolha e comece agora
        </p>
      </div>

      <div className="animate-fadeUp delay-1" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 720, width: "100%", position: "relative", zIndex: 1,
      }}>
        <div
          onClick={() => setDocType("resume")}
          style={{
            cursor: "pointer", padding: "36px 32px", borderRadius: 20,
            background: "linear-gradient(135deg, rgba(233,69,96,0.06) 0%, rgba(233,69,96,0.02) 100%)",
            border: "1.5px solid rgba(233,69,96,0.15)", transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--coral)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(233,69,96,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(233,69,96,0.15)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(233,69,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Icon name="User" className="w-7 h-7" style={{ color: "var(--coral)" }} />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, letterSpacing: "-0.5px" }}>Currículos</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
            Modelos profissionais com visualização em tempo real. Escolha o layout que combina com sua área.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(233,69,96,0.12)", color: "var(--coral)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
              {RESUME_TEMPLATES.length} modelos
            </span>
            <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
              Preview visual
            </span>
          </div>
        </div>

        <div
          onClick={() => setDocType("legal")}
          style={{
            cursor: "pointer", padding: "36px 32px", borderRadius: 20,
            background: "linear-gradient(135deg, rgba(0,210,211,0.06) 0%, rgba(0,210,211,0.02) 100%)",
            border: "1.5px solid rgba(0,210,211,0.15)", transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,210,211,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,210,211,0.15)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(0,210,211,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Icon name="FileText" className="w-7 h-7" style={{ color: "var(--teal)" }} />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, letterSpacing: "-0.5px" }}>Documentos Jurídicos</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
            Contratos, procurações e documentos legais. Veja os detalhes antes de preencher.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(0,210,211,0.12)", color: "var(--teal)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
              {getAvailableDocuments().length} tipos
            </span>
            <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
              Base legal
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResumeTemplates = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
        <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
          <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(233,69,96,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="User" className="w-5 h-5" style={{ color: "var(--coral)" }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--coral)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Currículos</span>
            </div>
            <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Modelos de Currículo</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Escolha o estilo que combina com você e sua área</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{
                padding: "8px 16px", borderRadius: 100,
                border: selectedCategory === cat.id ? "1.5px solid var(--coral)" : "1px solid var(--border)",
                background: selectedCategory === cat.id ? "rgba(233,69,96,0.1)" : "var(--surface-2)",
                color: selectedCategory === cat.id ? "var(--coral)" : "var(--text-muted)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s ease",
              }}>
                <Icon name={cat.icon} className="w-4 h-4" />{cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
        {filteredTemplates.map((t, i) => (
          <div key={t.id} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
            <TemplateCard template={t} onClick={() => handleTemplateSelect(t)} onViewSpec={(t2) => setSpecTemplate(t2)} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: 24, background: "var(--surface-2)", borderRadius: 16, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
          Não encontrou o modelo ideal?{" "}
          <button onClick={() => navigate("dashboard")} style={{ background: "none", border: "none", color: "var(--coral)", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            Solicite um personalizado
          </button>
        </p>
      </div>
    </div>
  );

  const renderLegalTemplates = () => {
    const categories = LEGAL_CATEGORIES;
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
          <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 500 }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
            <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,210,211,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="FileText" className="w-5 h-5" style={{ color: "var(--teal)" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Documentos Jurídicos</span>
              </div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Escolha o Tipo de Documento</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Visualize os detalhes antes de preencher</p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedLegalCategory(cat.id)} style={{
                  padding: "8px 16px", borderRadius: 100,
                  border: selectedLegalCategory === cat.id ? "1.5px solid var(--teal)" : "1px solid var(--border)",
                  background: selectedLegalCategory === cat.id ? "rgba(0,210,211,0.1)" : "var(--surface-2)",
                  color: selectedLegalCategory === cat.id ? "var(--teal)" : "var(--text-muted)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s ease",
                }}>
                  <Icon name={cat.icon} className="w-4 h-4" />{cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {legalDocs.map((doc, i) => {
            const c = LEGAL_DOC_COLORS[doc.id] || { accent: "#3498DB", bg: "#1E3A5F" };
            return (
              <div key={doc.id} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <Card
                  onClick={() => handleLegalDocSelect(doc)}
                  style={{
                    cursor: "pointer", padding: 0, overflow: "hidden",
                    border: "1px solid var(--border)", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.boxShadow = `0 8px 24px ${c.accent}18`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "stretch" }}>
                    <div style={{ width: 4, background: `linear-gradient(180deg, ${c.accent} 0%, ${c.bg} 100%)`, flexShrink: 0 }} />

                    <div style={{ flex: 1, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: `${c.accent}12`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon name={doc.icon} className="w-5 h-5" style={{ color: c.accent }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                          <h3 style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{doc.name}</h3>
                          {doc.legislation && (
                            <span style={{ fontSize: 10, padding: "2px 8px", background: `${c.accent}10`, color: c.accent, borderRadius: 100, fontWeight: 600, border: `1px solid ${c.accent}20` }}>
                              {doc.legislation.length > 40 ? doc.legislation.substring(0, 40) + "…" : doc.legislation}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4, marginBottom: 10 }}>
                          {doc.description}
                        </p>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {doc.variants?.map((v) => (
                            <span key={v.id} style={{ fontSize: 11, padding: "2px 10px", background: "var(--surface-2)", color: "var(--text-muted)", borderRadius: 100, fontWeight: 500 }}>
                              {v.icon} {v.name}
                            </span>
                          ))}
                          <span style={{ fontSize: 11, padding: "2px 10px", background: `${c.accent}08`, color: c.accent, borderRadius: 100, fontWeight: 600 }}>
                            {doc.spec?.sections?.length || 0} seções
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSpecLegalDoc(doc); }}
                          style={{
                            background: "transparent", border: "1px solid var(--border)", borderRadius: 10,
                            padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.color = c.accent; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                        >
                          <Icon name="Eye" className="w-4 h-4" /> Ver
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLegalDocSelect(doc); }}
                          style={{
                            background: c.accent, border: "none", borderRadius: 10,
                            padding: "10px 18px", fontSize: 13, fontWeight: 700, color: "white",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
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

        <div style={{
          marginTop: 36, padding: "18px 22px",
          background: "linear-gradient(135deg, rgba(0,210,211,0.06) 0%, rgba(0,210,211,0.02) 100%)",
          borderRadius: 14, border: "1px solid rgba(0,210,211,0.12)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,210,211,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="Shield" className="w-5 h-5" style={{ color: "var(--teal)" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>Clique em "Ver" para conferir base legal, requisitos e dicas</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Todos os documentos seguem a legislação brasileira vigente</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (docType === "resume") return renderResumeTemplates();
    if (docType === "legal") return renderLegalTemplates();
    return renderCategorySelection();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {renderContent()}
      {specTemplate && <TemplateSpecModal template={specTemplate} onClose={() => setSpecTemplate(null)} onSelect={(t) => handleTemplateSelect(t)} />}
      {specLegalDoc && <LegalDocSpecModal doc={specLegalDoc} onClose={() => setSpecLegalDoc(null)} onCreate={handleLegalDocSelect} />}
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } } @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
};

export default TemplatesPage;