import React from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button, AppNavbar, Card } from "../components/UI";
import { usePDF } from "../hooks/usePDF";
import showToast from "../utils/toast";

const PreviewPage = () => {
  const { navigate, selectedTemplate, formData, documentType, legalFormData } = useApp();
  const { generatePDF, isGenerating } = usePDF();

  const isLegalDocument = !!documentType;
  const templateColor = selectedTemplate?.color || "#0F3460";
  const templateAccent = selectedTemplate?.accent || "#E94560";

  const hasExperiencias = formData.experiencias?.some((exp) => exp.empresa);
  const hasFormacoes = formData.formacoes?.some((f) => f.instituicao);
  const hasHabilidades = formData.habilidades?.length > 0;
  const hasIdiomas = formData.idiomas?.some((i) => i.idioma);
  const hasCursos = formData.cursos && formData.cursos.trim().length > 0;

  const handleDownloadPDF = async () => {
    try {
      if (isLegalDocument) {
        await generatePDF({ type: "GENERATE_LEGAL", formData: legalFormData, docType: documentType });
      } else {
        await generatePDF({ type: "GENERATE_RESUME", formData, template: selectedTemplate });
      }
    } catch {
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const handleFinalize = () => navigate("checkout");

  const SectionDivider = () => (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "24px 0",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        background: templateAccent,
        opacity: 0.6,
      }} />
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );

  const EmptyState = ({ message }) => (
    <div style={{
      padding: "24px",
      textAlign: "center",
      color: "rgba(255,255,255,0.3)",
      fontSize: 13,
      fontStyle: "italic",
    }}>
      {message}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-1)" }}>
      <AppNavbar
        title={isLegalDocument ? `Preview — ${documentType?.name || "Documento"}` : "Preview do Currículo"}
        leftAction={
          <button
            onClick={() => navigate(isLegalDocument ? "legalEditor" : "editor")}
            aria-label="Voltar ao editor"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8, borderRadius: 8, transition: "all 0.15s" }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
        rightAction={
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
              style={{ minWidth: 100 }}
            >
              {isGenerating ? "Gerando..." : "PDF"}
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
        }
      />

      <div style={{ 
        maxWidth: 720, 
        margin: "40px auto", 
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        <Card style={{ padding: 32, position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${templateColor} 0%, ${templateAccent} 100%)`,
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              paddingBottom: 20,
              marginBottom: 24,
              borderBottom: `2px solid ${templateAccent}30`,
            }}>
              <h1 style={{ 
                fontSize: 26, 
                fontWeight: 800, 
                color: templateColor, 
                margin: "0 0 8px 0",
                letterSpacing: "-0.5px",
              }}>
                {formData.nome || "Seu Nome Completo"}
              </h1>
              
              <div style={{ 
                display: "flex", 
                gap: 20, 
                flexWrap: "wrap",
                fontSize: 13, 
                color: "#666" 
              }}>
                {formData.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="Mail" className="w-4 h-4" style={{ color: templateAccent }} />
                    {formData.email}
                  </span>
                )}
                {formData.telefone && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="Phone" className="w-4 h-4" style={{ color: templateAccent }} />
                    {formData.telefone}
                  </span>
                )}
                {formData.cidade && (
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="MapPin" className="w-4 h-4" style={{ color: templateAccent }} />
                    {formData.cidade}
                  </span>
                )}
              </div>
              
              {formData.linkedin && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666", marginTop: 8 }}>
                  <Icon name="Link" className="w-4 h-4" style={{ color: templateAccent }} />
                  {formData.linkedin}
                </div>
              )}
            </div>

            {formData.objetivo && (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: templateAccent,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: templateColor,
                    margin: 0,
                  }}>
                    Objetivo
                  </h2>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444" }}>{formData.objetivo}</p>
              </div>
            )}

            <SectionDivider />

            {hasExperiencias ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: templateAccent,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: templateColor,
                    margin: 0,
                  }}>
                    Experiência Profissional
                  </h2>
                </div>
                {formData.experiencias
                  .filter((exp) => exp.empresa)
                  .map((exp, index) => (
                    <div key={index} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                        <strong style={{ fontSize: 15, color: "#222" }}>{exp.cargo || "Cargo"}</strong>
                        <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{exp.periodo}</span>
                      </div>
                      <div style={{ fontSize: 14, color: templateAccent, fontWeight: 600, marginBottom: 4 }}>
                        {exp.empresa}
                      </div>
                      {exp.descricao && (
                        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{exp.descricao}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState message="Nenhuma experiência profissional adicionada" />
            )}

            <SectionDivider />

            {hasFormacoes ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: templateAccent,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: templateColor,
                    margin: 0,
                  }}>
                    Formação Acadêmica
                  </h2>
                </div>
                {formData.formacoes
                  .filter((f) => f.instituicao)
                  .map((f, index) => (
                    <div key={index} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: 14 }}>{f.curso || "Curso"}</strong>
                        <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{f.periodo}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {f.instituicao} • {f.status}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <EmptyState message="Nenhuma formação acadêmica adicionada" />
            )}

            <SectionDivider />

            {hasHabilidades ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: templateAccent,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: templateColor,
                    margin: 0,
                  }}>
                    Habilidades
                  </h2>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formData.habilidades.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: `${templateColor}15`,
                        color: templateColor,
                        padding: "6px 14px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${templateColor}25`,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Nenhuma habilidade adicionada" />
            )}

            <SectionDivider />

            {hasIdiomas ? (
              <div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}>
                  <div style={{
                    width: 3,
                    height: 16,
                    borderRadius: 2,
                    background: templateAccent,
                  }} />
                  <h2 style={{
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    color: templateColor,
                    margin: 0,
                  }}>
                    Idiomas
                  </h2>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {formData.idiomas
                    .filter((i) => i.idioma)
                    .map((idioma, index) => (
                      <span key={index} style={{ fontSize: 14, color: "#444" }}>
                        <strong style={{ color: templateColor }}>{idioma.idioma}</strong>
                        {" — "}
                        {idioma.nivel}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Nenhum idioma adicionado" />
            )}

            {hasCursos && (
              <>
                <SectionDivider />
                <div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}>
                    <div style={{
                      width: 3,
                      height: 16,
                      borderRadius: 2,
                      background: templateAccent,
                    }} />
                    <h2 style={{
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      color: templateColor,
                      margin: 0,
                    }}>
                      Cursos e Certificações
                    </h2>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#444" }}>{formData.cursos}</p>
                </div>
              </>
            )}
          </div>

          <div style={{
            position: "absolute",
            bottom: 16,
            right: 20,
            fontSize: 10,
            color: "rgba(0,0,0,0.15)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}>
            KRIOU DOCS
          </div>
        </Card>

        <div style={{ 
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}>
          <Button 
            variant="secondary" 
            icon="Edit" 
            onClick={() => navigate(isLegalDocument ? "legalEditor" : "editor")}
          >
            Voltar e Editar
          </Button>
          <Button 
            variant="primary" 
            icon="CreditCard" 
            onClick={handleFinalize}
            style={{ padding: "12px 28px" }}
          >
            Finalizar Compra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
