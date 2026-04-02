/**
 * ============================================
 * KRIOU DOCS - Preview Page Component
 * ============================================
 * Real-time resume preview with template
 * styling and export options.
 * Supports both resume and legal documents.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button } from "../components/UI";
import { generateResumePDF, downloadPDF } from "../utils/pdfGenerator";
import { generateLegalPDF, downloadLegalPDF } from "../utils/legalPdfGenerator";

/**
 * PreviewPage - Resume/Legal document preview with template styling
 */
const PreviewPage = () => {
  const { navigate, selectedTemplate, formData, documentType, legalFormData } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if viewing a legal document
  const isLegalDocument = !!documentType;

  /**
   * Get template colors or defaults
   */
  const templateColor = selectedTemplate?.color || "#0F3460";
  const templateAccent = selectedTemplate?.accent || "#E94560";

  /**
   * Check if experience entries have content
   */
  const hasExperiencias = formData.experiencias.some((exp) => exp.empresa);

  /**
   * Check if education entries have content
   */
  const hasFormacoes = formData.formacoes.some((f) => f.instituicao);

  /**
   * Check if skills are selected
   */
  const hasHabilidades = formData.habilidades.length > 0;

  /**
   * Check if languages are added
   */
  const hasIdiomas = formData.idiomas.some((i) => i.idioma);

  /**
   * Check if extras/courses are added
   */
  const hasCursos = formData.cursos && formData.cursos.trim().length > 0;

  /**
   * Handle PDF download
   * Generates and downloads the resume or legal document as PDF
   */
  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      
      if (isLegalDocument) {
        // Gerar PDF de documento jurídico
        const doc = generateLegalPDF(legalFormData, documentType);
        const filename = documentType?.id 
          ? `${documentType.id}-kriou-docs.pdf`
          : "documento-kriou-docs.pdf";
        downloadLegalPDF(doc, filename);
      } else {
        // Gerar PDF de currículo
        const doc = generateResumePDF(formData, selectedTemplate);
        const filename = formData.nome 
          ? `curriculo-${formData.nome.toLowerCase().replace(/\s+/g, "-")}.pdf`
          : "curriculo-kriou-docs.pdf";
        downloadPDF(doc, filename);
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGenerating(false);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  /**
   * Handle finalize - go to checkout
   */
  const handleFinalize = () => {
    navigate("checkout");
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Top Navigation Bar ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Left: Back button and title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(isLegalDocument ? "legalEditor" : "editor")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </button>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 800 }}>
              {isLegalDocument ? `Preview - ${documentType?.name || "Documento"}` : "Preview do Currículo"}
            </div>
          </div>

          {/* Right: Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <Button 
              variant="secondary" 
              size="small" 
              icon="Edit" 
              onClick={() => navigate(isLegalDocument ? "legalEditor" : "editor")}
            >
              Editar
            </Button>
            <Button 
              variant="secondary" 
              size="small" 
              icon="Download" 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
            >
              {isGenerating ? "Gerando..." : "Baixar PDF"}
            </Button>
            <Button 
              variant="primary" 
              size="small" 
              icon="CreditCard" 
              onClick={handleFinalize}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Resume Preview Container ─── */}
      <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 24px" }}>
        <div
          className="animate-scaleIn"
          style={{
            background: "white",
            borderRadius: 8,
            padding: 48,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            color: "#1a1a2e",
          }}
        >
          {/* Watermark for preview */}
          <div
            className="watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%) rotate(-35deg)",
              fontSize: 48,
              fontWeight: 900,
              color: "rgba(233,69,96,0.12)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
              letterSpacing: 8,
            }}
          >
            PREVIEW — KRIOU DOCS
          </div>

          {/* ─── Resume Content ─── */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Header Section */}
            <div
              style={{
                borderBottom: `3px solid ${templateAccent}`,
                paddingBottom: 20,
                marginBottom: 24,
              }}
            >
              <h1 style={{ fontSize: 28, fontWeight: 800, color: templateColor, margin: 0 }}>
                {formData.nome || "Seu Nome Completo"}
              </h1>
              <div style={{ fontSize: 13, color: "#666", marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
                {formData.email && <span>✉ {formData.email}</span>}
                {formData.telefone && <span>📱 {formData.telefone}</span>}
                {formData.cidade && <span>📍 {formData.cidade}</span>}
              </div>
              {formData.linkedin && (
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  🔗 {formData.linkedin}
                </div>
              )}
            </div>

            {/* Objective Section */}
            {formData.objetivo && (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 8,
                  }}
                >
                  Objetivo
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444" }}>{formData.objetivo}</p>
              </div>
            )}

            {/* Experience Section */}
            {hasExperiencias && (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 12,
                  }}
                >
                  Experiência Profissional
                </h2>
                {formData.experiencias
                  .filter((exp) => exp.empresa)
                  .map((exp, index) => (
                    <div key={index} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <strong style={{ fontSize: 15, color: "#222" }}>{exp.cargo || "Cargo"}</strong>
                        <span style={{ fontSize: 12, color: "#888" }}>{exp.periodo}</span>
                      </div>
                      <div style={{ fontSize: 14, color: templateAccent, fontWeight: 600 }}>{exp.empresa}</div>
                      {exp.descricao && <p style={{ fontSize: 13, color: "#555", marginTop: 4, lineHeight: 1.6 }}>{exp.descricao}</p>}
                    </div>
                  ))}
              </div>
            )}

            {/* Education Section */}
            {hasFormacoes && (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 12,
                  }}
                >
                  Formação Acadêmica
                </h2>
                {formData.formacoes
                  .filter((f) => f.instituicao)
                  .map((f, index) => (
                    <div key={index} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 14 }}>{f.curso || "Curso"}</strong>
                        <span style={{ fontSize: 12, color: "#888" }}>{f.periodo}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {f.instituicao} • {f.status}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Skills Section */}
            {hasHabilidades && (
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 10,
                  }}
                >
                  Habilidades
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {formData.habilidades.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: `${templateColor}11`,
                        color: templateColor,
                        padding: "4px 12px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {hasIdiomas && (
              <div>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 10,
                  }}
                >
                  Idiomas
                </h2>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {formData.idiomas
                    .filter((i) => i.idioma)
                    .map((idioma, index) => (
                      <span key={index} style={{ fontSize: 14, color: "#444" }}>
                        {idioma.idioma} — <strong>{idioma.nivel}</strong>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Courses/Extras Section */}
            {hasCursos && (
              <div style={{ marginTop: 24 }}>
                <h2
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: templateColor,
                    marginBottom: 10,
                  }}
                >
                  Cursos e Certificações
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444" }}>{formData.cursos}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;