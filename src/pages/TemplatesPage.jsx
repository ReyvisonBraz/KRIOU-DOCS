import React, { useState, useMemo } from "react";
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

const LegalDocCard = ({ doc, onClick }) => (
  <Card
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: 24,
      transition: "all 0.2s ease",
      border: "1.5px solid var(--border)",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--teal)";
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,210,211,0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: "linear-gradient(135deg, rgba(0,210,211,0.1) 0%, transparent 100%)", borderRadius: "0 8px 0 60px" }} />
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "rgba(0, 210, 211, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon name={doc.icon} className="w-6 h-6" style={{ color: "var(--teal)" }} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{doc.name}</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>
          {doc.description || "Documento jurídico para uso profissional"}
        </p>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
      <Icon name="ArrowRight" className="w-4 h-4" style={{ color: "var(--teal)" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teal)" }}>Começar</span>
    </div>
  </Card>
);

const TemplateCard = ({ template, onClick, isSelected }) => {
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
            animation: "fadeIn 0.15s ease",
          }}>
            <Button variant="primary" size="small" icon="Eye">
              Ver Modelo
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </Card>
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

const TemplatesPage = () => {
  const { navigate, setSelectedTemplate, setCurrentStep, setLegalStep, setDocumentType, selectedTemplate } = useApp();
  const [docType, setDocType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredDoc, setHoveredDoc] = useState(null);

  const handleSelectDocType = (type) => {
    setDocType(type);
    if (type === "legal") {
      setDocumentType(null);
      setLegalStep(0);
      navigate("legalEditor");
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    navigate("editor");
  };

  const handleLegalDocSelect = (type) => {
    setSelectedTemplate(null);
    setLegalStep(0);
    setDocumentType(type);
    navigate("legalEditor");
  };

  const handleBack = () => {
    setDocType(null);
    setSelectedCategory("all");
  };

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return RESUME_TEMPLATES;
    const ids = CATEGORY_TEMPLATE_IDS[selectedCategory] || [];
    return RESUME_TEMPLATES.filter((t) => ids.includes(t.id));
  }, [selectedCategory]);

  const legalDocs = getAvailableDocuments();

  const renderHeroSection = () => (
    <div style={{
      textAlign: "center",
      marginBottom: 48,
      padding: "40px 24px",
      background: "linear-gradient(180deg, var(--surface-1) 0%, transparent 100%)",
      borderRadius: "0 0 40px 40px",
    }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{
          display: "inline-block",
          padding: "6px 16px",
          background: "rgba(233,69,96,0.1)",
          borderRadius: 100,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--coral)",
          marginBottom: 16,
        }}>
          ✨ Novos modelos disponíveis
        </span>
      </div>
      <h1 className="font-display" style={{
        fontSize: 36,
        fontWeight: 900,
        marginBottom: 12,
        letterSpacing: "-1px",
        background: "linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        O que você deseja criar?
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
        Escolha entre currículos profissionais e documentos jurídicos personalizados
      </p>
    </div>
  );

  const renderDocTypeSelection = () => (
    <div className="animate-fadeIn" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
      }}>
        <div
          onClick={() => handleSelectDocType("resume")}
          style={{
            cursor: "pointer",
            padding: 32,
            background: "var(--card-bg)",
            border: "1.5px solid var(--border)",
            borderRadius: 16,
            transition: "all 0.25s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--coral)";
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(233,69,96,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(233, 69, 96, 0.08)",
          }} />
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(233, 69, 96, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <Icon name="User" className="w-8 h-8" style={{ color: "var(--coral)" }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Currículo</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
            Crie currículos profissionais com múltiplos modelos e customizações
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(233,69,96,0.1)", color: "var(--coral)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
              10 modelos
            </span>
            <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
              Preview
            </span>
          </div>
        </div>

        <div
          onClick={() => handleSelectDocType("legal")}
          style={{
            cursor: "pointer",
            padding: 32,
            background: "var(--card-bg)",
            border: "1.5px solid var(--border)",
            borderRadius: 16,
            transition: "all 0.25s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--teal)";
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,210,211,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(0, 210, 211, 0.08)",
          }} />
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "rgba(0, 210, 211, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}>
            <Icon name="FileText" className="w-8 h-8" style={{ color: "var(--teal)" }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Documento Jurídico</h3>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 20 }}>
            Contratos, procurações e outros documentos legais
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(0,210,211,0.1)", color: "var(--teal)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
              {legalDocs.length} tipos
            </span>
            <span style={{ background: "var(--surface-2)", color: "var(--text-muted)", padding: "4px 12px", borderRadius: 100, fontSize: 12 }}>
              Assistente
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: "center", color: "var(--text-muted)" }}>
          Documentos Jurídicos Disponíveis
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {legalDocs.map((doc) => (
            <Card
              key={doc.id}
              onClick={() => {
                setDocumentType(doc);
                setLegalStep(0);
                navigate("legalEditor");
              }}
              style={{
                cursor: "pointer",
                padding: 20,
                border: hoveredDoc === doc.id ? "1.5px solid var(--teal)" : "1px solid var(--border)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={() => setHoveredDoc(doc.id)}
              onMouseLeave={() => setHoveredDoc(null)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(0, 210, 211, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Icon name={doc.icon} className="w-5 h-5" style={{ color: "var(--teal)" }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</span>
              </div>
            </Card>
          ))}
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
              isSelected={selectedTemplate?.id === template.id}
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

  const renderContent = () => {
    if (docType === "resume") return renderResumeTemplates();
    return renderDocTypeSelection();
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {renderContent()}
    </div>
  );
};

export default TemplatesPage;
