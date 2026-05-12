import React from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button, AppNavbar, Card } from "../components/UI";
import { usePDF } from "../hooks/usePDF";
import showToast from "../utils/toast";

const SidebarSection = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{
      fontSize: 10,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "1.6px",
      color: "var(--text-muted)",
      marginBottom: 8,
      fontFamily: "'Outfit', sans-serif",
    }}>
      {title}
    </div>
    <div style={{
      width: 32,
      height: 2,
      background: "var(--gold)",
      opacity: 0.3,
      marginBottom: 10,
    }} />
    {children}
  </div>
);

const MainSectionHeader = ({ title }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{
      fontSize: 11,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "1.8px",
      color: "var(--coral)",
      marginBottom: 6,
      fontFamily: "'Outfit', sans-serif",
    }}>
      {title}
    </div>
    <div style={{
      width: 48,
      height: 2,
      background: "var(--coral)",
      opacity: 0.25,
    }} />
  </div>
);

const PreviewPage = () => {
  const { navigate, selectedTemplate, formData, documentType, legalFormData, disabledFields, selectedVariant } = useApp();
  const { generatePDF, isGenerating } = usePDF();

  const isLegalDocument = !!documentType;

  const hasExperiencias = formData.experiencias?.some((exp) => exp.empresa);
  const hasFormacoes = formData.formacoes?.some((f) => f.instituicao);
  const hasHabilidades = formData.habilidades?.length > 0;
  const hasIdiomas = formData.idiomas?.some((i) => i.idioma);
  const hasCursos = formData.cursos && formData.cursos.trim().length > 0;

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleDownloadPDF = async () => {
    try {
      if (isLegalDocument) {
        await generatePDF({ type: "GENERATE_LEGAL", formData: legalFormData, docType: documentType, disabledFields: disabledFields || {}, variantId: selectedVariant || null });
      } else {
        await generatePDF({ type: "GENERATE_RESUME", formData, template: selectedTemplate });
      }
    } catch {
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const handleFinalize = () => navigate("checkout");

  const editTarget = isLegalDocument ? "legalEditor" : "editor";

  const navbarTitle = isLegalDocument
    ? `Preview — ${documentType?.name || "Documento"}`
    : "Preview do Currículo";

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <AppNavbar
        title={navbarTitle}
        leftAction={
          <button
            onClick={() => navigate(editTarget, { replace: true })}
            aria-label="Voltar ao editor"
            className="kf"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              padding: 8,
              borderRadius: 10,
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
        rightAction={
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="secondary" size="small" icon="Edit"
              className="preview-navbar-btn"
              onClick={() => navigate(editTarget, { replace: true })}>
              <span>Editar</span>
            </Button>
            <Button variant="secondary" size="small" icon="Download"
              className="preview-navbar-btn"
              onClick={handleDownloadPDF} disabled={isGenerating}>
              <span>{isGenerating ? "Gerando..." : "PDF"}</span>
            </Button>
            <Button variant="primary" size="small" icon="CreditCard"
              className="preview-navbar-btn"
              onClick={handleFinalize}>
              <span>Finalizar</span>
            </Button>
          </div>
        }
      />

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 680px) {
          .preview-card-inner { flex-direction: column !important; }
          .preview-sidebar {
            width: 100% !important; min-width: unset !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
            padding: 24px 20px !important;
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 20px;
          }
          .preview-sidebar > * { min-width: 140px; flex: 1; }
          .preview-main { padding: 24px 20px !important; }
          .preview-bottom-actions { flex-direction: column !important; }
          .preview-bottom-actions > * { width: 100% !important; justify-content: center; }
          .preview-navbar-btn span { display: none !important; }
        }
      `}</style>
      {isLegalDocument ? (
        /* ── Legal document preview ────────────────────────────────── */
        <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
          <Card style={{ padding: 48, textAlign: "center" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(244,63,94,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <Icon name="FileText" className="w-8 h-8" style={{ color: "var(--coral)", opacity: 0.7 }} />
            </div>

            <h2 style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--text)",
              margin: "0 0 10px 0",
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.02em",
            }}>
              {documentType?.name || "Documento Jurídico"}
            </h2>

            <p style={{
              fontSize: 14,
              color: "var(--text-dim)",
              lineHeight: 1.8,
              margin: "0 auto",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              maxWidth: 420,
            }}>
              Seu documento jurídico será gerado em formato profissional com estrutura editorial completa,
              tipografia Times para corpo de texto, cláusulas numeradas e espaço para assinaturas.
            </p>

            <div style={{
              marginTop: 28,
              padding: "14px 20px",
              background: "rgba(20,184,166,0.06)",
              borderRadius: 12,
              border: "1px solid rgba(20,184,166,0.15)",
            }}>
              <p style={{
                fontSize: 12,
                color: "var(--teal)",
                margin: 0,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "-0.005em",
              }}>
                Clique em "PDF" para baixar uma prévia ou "Finalizar" para concluir.
              </p>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28 }}>
            <Button variant="secondary" icon="Edit" onClick={() => navigate("legalEditor", { replace: true })}>
              Voltar e Editar
            </Button>
            <Button variant="primary" icon="CreditCard" onClick={handleFinalize}>
              Finalizar Compra
            </Button>
          </div>
        </div>
      ) : (
        /* ── Resume preview — two-column professional layout ────────── */
        <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px 80px" }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="preview-card-inner" style={{ display: "flex", minHeight: 600 }}>

              {/* ── Left Sidebar ──────────────────────────────── */}
              <div className="preview-sidebar" style={{
                width: 220,
                minWidth: 220,
                background: "var(--surface-2)",
                borderRight: "1px solid var(--border)",
                padding: "36px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}>
                {/* Avatar monogram */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--coral)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  alignSelf: "center",
                }}>
                  <span style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                  }}>
                    {getInitials(formData.nome)}
                  </span>
                </div>

                {/* Name */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <h2 style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text)",
                    margin: "0 0 6px 0",
                    fontFamily: "'Outfit', sans-serif",
                    letterSpacing: "-0.015em",
                    lineHeight: 1.3,
                  }}>
                    {formData.nome || "Nome Completo"}
                  </h2>
                  <p style={{
                    fontSize: 9,
                    color: "var(--text-muted)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "1.2px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                  }}>
                    Currículo Profissional
                  </p>
                </div>

                {/* Divider */}
                <div style={{
                  width: "100%",
                  height: 1,
                  background: "var(--border)",
                  marginBottom: 20,
                }} />

                {/* Contact */}
                <SidebarSection title="Contato">
                  {formData.email && (
                    <div style={{
                      display: "flex", gap: 8, marginBottom: 6,
                      fontSize: 12, color: "var(--text-dim)", alignItems: "flex-start",
                    }}>
                      <Icon name="Mail" className="w-3.5 h-3.5" style={{
                        color: "var(--coral)", marginTop: 2, flexShrink: 0, opacity: 0.7,
                      }} />
                      <span style={{
                        wordBreak: "break-all", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {formData.email}
                      </span>
                    </div>
                  )}
                  {formData.telefone && (
                    <div style={{
                      display: "flex", gap: 8, marginBottom: 6,
                      fontSize: 12, color: "var(--text-dim)", alignItems: "flex-start",
                    }}>
                      <Icon name="Phone" className="w-3.5 h-3.5" style={{
                        color: "var(--coral)", marginTop: 2, flexShrink: 0, opacity: 0.7,
                      }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {formData.telefone}
                      </span>
                    </div>
                  )}
                  {formData.cidade && (
                    <div style={{
                      display: "flex", gap: 8, marginBottom: 6,
                      fontSize: 12, color: "var(--text-dim)", alignItems: "flex-start",
                    }}>
                      <Icon name="MapPin" className="w-3.5 h-3.5" style={{
                        color: "var(--coral)", marginTop: 2, flexShrink: 0, opacity: 0.7,
                      }} />
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {formData.cidade}
                      </span>
                    </div>
                  )}
                  {formData.linkedin && (
                    <div style={{
                      display: "flex", gap: 8, fontSize: 11,
                      color: "var(--text-muted)", alignItems: "flex-start",
                    }}>
                      <Icon name="Link" className="w-3.5 h-3.5" style={{
                        color: "var(--coral)", marginTop: 2, flexShrink: 0, opacity: 0.7,
                      }} />
                      <span style={{
                        wordBreak: "break-all", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {formData.linkedin}
                      </span>
                    </div>
                  )}
                </SidebarSection>

                {/* Skills */}
                {hasHabilidades && (
                  <SidebarSection title="Habilidades">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {formData.habilidades.slice(0, 8).map((skill) => (
                        <div key={skill} style={{
                          fontSize: 12, color: "var(--text-dim)", paddingLeft: 10,
                          position: "relative", fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          <span style={{
                            position: "absolute",
                            left: 0,
                            top: 7,
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "var(--gold)",
                            opacity: 0.6,
                          }} />
                          {skill}
                        </div>
                      ))}
                      {formData.habilidades.length > 8 && (
                        <span style={{
                          fontSize: 11, color: "var(--text-muted)", marginTop: 2,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          +{formData.habilidades.length - 8} mais
                        </span>
                      )}
                    </div>
                  </SidebarSection>
                )}

                {/* Languages */}
                {hasIdiomas && (
                  <SidebarSection title="Idiomas">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {formData.idiomas.filter((i) => i.idioma).map((idioma, idx) => (
                        <div key={idx} style={{
                          fontSize: 12, color: "var(--text-dim)",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                          <strong style={{ color: "var(--text)" }}>{idioma.idioma}</strong>
                          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                            {" "}— {idioma.nivel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </SidebarSection>
                )}
              </div>

              {/* ── Main Content ─────────────────────────────── */}
              <div className="preview-main" style={{ flex: 1, padding: "36px 32px", background: "var(--surface" }}>
                {/* Objective */}
                {formData.objetivo && (
                  <div style={{ marginBottom: 32 }}>
                    <MainSectionHeader title="Resumo Profissional" />
                    <p style={{
                      fontSize: 14, lineHeight: 1.8, color: "var(--text-dim)",
                      margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {formData.objetivo}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {hasExperiencias ? (
                  <div style={{ marginBottom: 32 }}>
                    <MainSectionHeader title="Experiência Profissional" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {formData.experiencias.filter((exp) => exp.empresa).map((exp, idx) => (
                        <div key={idx}>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "baseline", marginBottom: 3,
                          }}>
                            <strong style={{
                              fontSize: 14, color: "var(--text)",
                              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                            }}>
                              {exp.cargo || "Cargo"}
                            </strong>
                            <span style={{
                              fontSize: 11, color: "var(--text-muted)", fontWeight: 500,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}>
                              {exp.periodo}
                            </span>
                          </div>
                          <div style={{
                            fontSize: 13, color: "var(--teal)", fontWeight: 600,
                            marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {exp.empresa}
                          </div>
                          {exp.descricao && (
                            <p style={{
                              fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7,
                              margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}>
                              {exp.descricao}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 32 }}>
                    <MainSectionHeader title="Experiência Profissional" />
                    <p style={{
                      fontSize: 13, color: "var(--text-faint)", fontStyle: "italic",
                      margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      Nenhuma experiência profissional adicionada
                    </p>
                  </div>
                )}

                {/* Education */}
                {hasFormacoes ? (
                  <div style={{ marginBottom: 32 }}>
                    <MainSectionHeader title="Formação Acadêmica" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {formData.formacoes.filter((f) => f.instituicao).map((edu, idx) => (
                        <div key={idx}>
                          <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "baseline", marginBottom: 2,
                          }}>
                            <strong style={{
                              fontSize: 14, color: "var(--text)",
                              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                            }}>
                              {edu.curso || "Curso"}
                            </strong>
                            <span style={{
                              fontSize: 11, color: "var(--text-muted)", fontWeight: 500,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}>
                              {edu.periodo}
                            </span>
                          </div>
                          <p style={{
                            fontSize: 13, color: "var(--text-dim)", margin: 0,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {edu.instituicao}{edu.status ? ` — ${edu.status}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 32 }}>
                    <MainSectionHeader title="Formação Acadêmica" />
                    <p style={{
                      fontSize: 13, color: "var(--text-faint)", fontStyle: "italic",
                      margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      Nenhuma formação acadêmica adicionada
                    </p>
                  </div>
                )}

                {/* Courses */}
                {hasCursos && (
                  <div>
                    <MainSectionHeader title="Cursos e Certificações" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {formData.cursos.split(/[\n,;]+/).filter(Boolean).map((item, idx) => (
                        <div key={idx} style={{
                          display: "flex", gap: 10, alignItems: "flex-start",
                        }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "var(--teal)", opacity: 0.5,
                            marginTop: 7, flexShrink: 0,
                          }} />
                          <span style={{
                            fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                            {item.trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom branding */}
            <div style={{
              padding: "12px 44px",
              borderTop: "1px solid var(--border)",
              textAlign: "center",
              background: "var(--surface-2)",
            }}>
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                fontFamily: "'Outfit', sans-serif",
              }}>
                KRIOU DOCS
              </span>
            </div>
          </Card>

          <div className="preview-bottom-actions" style={{
            display: "flex", justifyContent: "center", gap: 12, marginTop: 20,
          }}>
            <Button variant="secondary" icon="Edit" onClick={() => navigate("editor", { replace: true })}>
              Voltar e Editar
            </Button>
            <Button variant="primary" icon="CreditCard" onClick={handleFinalize} style={{ padding: "12px 32px" }}>
              Finalizar Compra
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;
