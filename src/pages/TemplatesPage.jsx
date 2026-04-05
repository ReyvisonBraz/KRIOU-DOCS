/**
 * ============================================
 * KRIOU DOCS - Templates Page Component
 * ============================================
 * Template selection page for resume creation.
 * Displays available resume templates with preview.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button } from "../components/UI";
import { RESUME_TEMPLATES } from "../data/constants";
import { getAvailableDocuments } from "../data/legalDocuments";

/**
 * TemplatesPage - Template gallery for resume selection
 */
const TemplatesPage = () => {
  const { navigate, setSelectedTemplate, setCurrentStep, setDocumentType } = useApp();
  const [docType, setDocType] = useState(null);

  /**
   * Handle document type selection
   * @param {string} type - 'resume' or 'legal'
   */
  const handleSelectDocType = (type) => {
    setDocType(type);
    if (type === "legal") {
      setDocumentType(null);
      setCurrentStep(0);
      navigate("legalEditor");
    }
  };

  /**
   * Handle template selection for resume
   * @param {Object} template - Selected template object
   */
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCurrentStep(0);
    navigate("editor");
  };

  /**
   * Handle legal document type selection
   * @param {Object} type - Selected legal document type
   */
  const handleLegalDocSelect = (type) => {
    setSelectedTemplate(null);
    setCurrentStep(0);
    setDocumentType(type);
    navigate("legalEditor");
  };

  /**
   * Go back to document type selection
   */
  const handleBack = () => {
    setDocType(null);
  };

  /**
   * Get tag style based on template accent color
   * @param {Object} template - Template object
   * @returns {Object} Style object
   */
  const getTagStyle = (template) => {
    if (template.id === "primeiro-emprego") {
      return { background: template.accent, color: "var(--navy)" };
    }
    return { background: template.accent, color: "white" };
  };

  /**
   * Render mini preview of template
   * @param {Object} template - Template for preview
   * @returns {JSX.Element} Preview component
   */
  const renderTemplatePreview = (template) => {
    return (
      <div
        style={{
          width: "70%",
          height: "75%",
          background: "white",
          borderRadius: 6,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* Header with avatar and name */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: `${template.accent}33`,
            }}
          />
          <div>
            <div style={{ width: 60, height: 6, background: "#ddd", borderRadius: 3 }} />
            <div style={{ width: 40, height: 4, background: "#eee", borderRadius: 3, marginTop: 3 }} />
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "#eee" }} />

        {/* Experience lines */}
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ width: `${90 - n * 15}%`, height: 4, background: "#eee", borderRadius: 3 }} />
        ))}

        {/* Education divider */}
        <div style={{ width: "100%", height: 1, background: "#eee", marginTop: 2 }} />

        {/* Skills lines */}
        {[1, 2].map((n) => (
          <div key={n} style={{ width: `${80 - n * 10}%`, height: 4, background: "#f0f0f0", borderRadius: 3 }} />
        ))}
      </div>
    );
  };

  /**
   * Render document type selection (initial view)
   */
  const renderDocTypeSelection = () => {
    const legalDocs = getAvailableDocuments();
    
    return (
      <div className="animate-fadeIn">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: "-1px" }}>
            O que você deseja criar?
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Selecione o tipo de documento</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 800, margin: "0 auto" }}>
          {/* Currículo Card */}
          <Card
            onClick={() => handleSelectDocType("resume")}
            style={{
              cursor: "pointer",
              padding: 32,
              textAlign: "center",
              border: "2px solid var(--border)",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--coral)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(233, 69, 96, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Icon name="User" className="w-8 h-8" style={{ color: "var(--coral)" }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Currículo</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Crie currículos profissionais com múltiplos modelos e customizações
            </p>
          </Card>

          {/* Documento Jurídico Card */}
          <Card
            onClick={() => handleSelectDocType("legal")}
            style={{
              cursor: "pointer",
              padding: 32,
              textAlign: "center",
              border: "2px solid var(--border)",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(0, 210, 211, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <Icon name="FileText" className="w-8 h-8" style={{ color: "var(--teal)" }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Documento Jurídico</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Contratos, procurações e outros documentos legais
            </p>
            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {legalDocs.map(doc => (
                <span key={doc.id} style={{ 
                  background: "var(--surface-2)", 
                  padding: "4px 10px", 
                  borderRadius: 100, 
                  fontSize: 11, 
                  color: "var(--text-muted)" 
                }}>
                  {doc.name}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  /**
   * Render resume templates
   */
  const renderResumeTemplates = () => {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: "-1px" }}>
            Modelos de Currículo
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>Escolha o estilo que combina com você e sua área</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {RESUME_TEMPLATES.map((template, index) => (
            <Card
              key={template.id}
              className="animate-fadeUp"
              onClick={() => handleTemplateSelect(template)}
              style={{
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Template Preview Area */}
              <div
                style={{
                  height: 200,
                  background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}CC 100%)`,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Tag Badge */}
                {template.tag && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "4px 10px",
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 700,
                      ...getTagStyle(template),
                    }}
                  >
                    {template.tag}
                  </span>
                )}

                {/* Mini Resume Preview */}
                {renderTemplatePreview(template)}
              </div>

              {/* Template Info */}
              <div style={{ padding: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{template.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{template.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Main render based on document type selection
   */
  const renderContent = () => {
    if (docType === "resume") {
      return renderResumeTemplates();
    }
    if (docType === "legal") {
      return renderLegalDocTypes();
    }
    return renderDocTypeSelection();
  };
  
  // Render legal document types
  const renderLegalDocTypes = () => {
    const available = getAvailableDocuments();
    
    return (
      <div className="animate-fadeIn">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>
            <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
          </button>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Documentos Jurídicos</h2>
          <p style={{ color: "var(--text-muted)" }}>Selecione o tipo de documento</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
          {available.map((doc) => (
            <Card
              key={doc.id}
              onClick={() => handleLegalDocSelect(doc)}
              style={{ cursor: "pointer", padding: 24 }}
            >
              <Icon name={doc.icon} className="w-8 h-8" style={{ color: "var(--teal)", marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 16 }}>{doc.name}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  };
   
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {renderContent()}
    </div>
  );
};

export default TemplatesPage;