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

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

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

  const SidebarSection = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "1.2px",
        color: templateColor,
        marginBottom: 8,
      }}>
        {title}
      </div>
      <div style={{
        width: 40,
        height: 1.5,
        background: templateAccent,
        opacity: 0.4,
        marginBottom: 10,
      }} />
      {children}
    </div>
  );

  const MainSectionHeader = ({ title }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        color: templateAccent,
        marginBottom: 4,
      }}>
        {title}
      </div>
      <div style={{
        width: 60,
        height: 2,
        borderRadius: 1,
        background: templateAccent,
        opacity: 0.5,
      }} />
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
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 8, borderRadius: 8 }}
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

      {isLegalDocument ? (
        // Legal document preview — simple info card
        <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
          <Card style={{ padding: 40, textAlign: "center" }}>
            <Icon name="FileText" className="w-16 h-16" style={{ color: templateAccent, marginBottom: 16, opacity: 0.6 }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: templateColor, margin: "0 0 8px 0" }}>
              {documentType?.name || "Documento Jurídico"}
            </h2>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
              Seu documento jurídico será gerado em formato profissional com estrutura editorial completa, 
              tipografia Times para corpo de texto, cláusulas numeradas e espaço para assinaturas.
            </p>
            <div style={{ marginTop: 24, padding: 16, background: `${templateAccent}10`, borderRadius: 12, border: `1px solid ${templateAccent}20` }}>
              <p style={{ fontSize: 12, color: templateAccent, margin: 0, fontWeight: 600 }}>
                Clique em "PDF" para baixar uma prévia ou "Finalizar" para concluir.
              </p>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <Button variant="secondary" icon="Edit" onClick={() => navigate("legalEditor")}>
              Voltar e Editar
            </Button>
            <Button variant="primary" icon="CreditCard" onClick={handleFinalize} style={{ padding: "12px 28px" }}>
              Finalizar Compra
            </Button>
          </div>
        </div>
      ) : (
        // Resume preview — two-column professional layout
        <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px" }}>
          <Card style={{ padding: 0, overflow: "hidden", borderRadius: 16 }}>
            <div style={{ display: "flex", minHeight: 600 }}>

              {/* ── Left Sidebar ──────────────────────────────── */}
              <div style={{
                width: 220,
                minWidth: 220,
                background: `${templateColor}0A`,
                borderRight: `1px solid ${templateColor}10`,
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}>
                {/* Avatar monogram */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${templateColor} 0%, ${templateAccent} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  alignSelf: "center",
                }}>
                  <span style={{ color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "Georgia, serif" }}>
                    {getInitials(formData.nome)}
                  </span>
                </div>

                {/* Name in sidebar */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <h2 style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: templateColor,
                    margin: "0 0 4px 0",
                    fontFamily: "Georgia, serif",
                    lineHeight: 1.3,
                  }}>
                    {formData.nome || "Nome Completo"}
                  </h2>
                  <p style={{
                    fontSize: 10,
                    color: "#999",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}>
                    Currículo Profissional
                  </p>
                </div>

                {/* Divider */}
                <div style={{
                  width: "100%",
                  height: 1,
                  background: `${templateColor}15`,
                  marginBottom: 20,
                }} />

                {/* Contact */}
                <SidebarSection title="Contato">
                  {formData.email && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#555", alignItems: "flex-start" }}>
                      <Icon name="Mail" className="w-3.5 h-3.5" style={{ color: templateAccent, marginTop: 2, flexShrink: 0 }} />
                      <span style={{ wordBreak: "break-all" }}>{formData.email}</span>
                    </div>
                  )}
                  {formData.telefone && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#555", alignItems: "flex-start" }}>
                      <Icon name="Phone" className="w-3.5 h-3.5" style={{ color: templateAccent, marginTop: 2, flexShrink: 0 }} />
                      <span>{formData.telefone}</span>
                    </div>
                  )}
                  {formData.cidade && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, color: "#555", alignItems: "flex-start" }}>
                      <Icon name="MapPin" className="w-3.5 h-3.5" style={{ color: templateAccent, marginTop: 2, flexShrink: 0 }} />
                      <span>{formData.cidade}</span>
                    </div>
                  )}
                  {formData.linkedin && (
                    <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#777", alignItems: "flex-start" }}>
                      <Icon name="Link" className="w-3.5 h-3.5" style={{ color: templateAccent, marginTop: 2, flexShrink: 0 }} />
                      <span style={{ wordBreak: "break-all" }}>{formData.linkedin}</span>
                    </div>
                  )}
                </SidebarSection>

                {/* Skills */}
                {hasHabilidades && (
                  <SidebarSection title="Habilidades">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {formData.habilidades.slice(0, 8).map((skill) => (
                        <div key={skill} style={{ fontSize: 12, color: "#555", paddingLeft: 8, position: "relative" }}>
                          <span style={{
                            position: "absolute",
                            left: 0,
                            top: 6,
                            width: 3,
                            height: 3,
                            borderRadius: "50%",
                            background: templateAccent,
                            opacity: 0.6,
                          }} />
                          {skill}
                        </div>
                      ))}
                      {formData.habilidades.length > 8 && (
                        <span style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                          +{formData.habilidades.length - 8} mais
                        </span>
                      )}
                    </div>
                  </SidebarSection>
                )}

                {/* Languages */}
                {hasIdiomas && (
                  <SidebarSection title="Idiomas">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {formData.idiomas.filter((i) => i.idioma).map((idioma, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: "#555" }}>
                          <strong style={{ color: templateColor }}>{idioma.idioma}</strong>
                          <span style={{ color: "#999", fontSize: 11 }}> — {idioma.nivel}</span>
                        </div>
                      ))}
                    </div>
                  </SidebarSection>
                )}
              </div>

              {/* ── Main Content ─────────────────────────────── */}
              <div style={{ flex: 1, padding: "32px 40px" }}>
                {/* Objective */}
                {formData.objetivo && (
                  <div style={{ marginBottom: 28 }}>
                    <MainSectionHeader title="Resumo Profissional" />
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: "#444", margin: 0 }}>
                      {formData.objetivo}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {hasExperiencias ? (
                  <div style={{ marginBottom: 28 }}>
                    <MainSectionHeader title="Experiência Profissional" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {formData.experiencias.filter((exp) => exp.empresa).map((exp, idx) => (
                        <div key={idx}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                            <strong style={{ fontSize: 14, color: "#222" }}>{exp.cargo || "Cargo"}</strong>
                            <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>{exp.periodo}</span>
                          </div>
                          <div style={{ fontSize: 13, color: templateAccent, fontWeight: 600, marginBottom: 3 }}>
                            {exp.empresa}
                          </div>
                          {exp.descricao && (
                            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: 0 }}>
                              {exp.descricao}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 28 }}>
                    <MainSectionHeader title="Experiência Profissional" />
                    <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic", margin: 0 }}>
                      Nenhuma experiência profissional adicionada
                    </p>
                  </div>
                )}

                {/* Education */}
                {hasFormacoes ? (
                  <div style={{ marginBottom: 28 }}>
                    <MainSectionHeader title="Formação Acadêmica" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {formData.formacoes.filter((f) => f.instituicao).map((edu, idx) => (
                        <div key={idx}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 }}>
                            <strong style={{ fontSize: 14, color: "#222" }}>{edu.curso || "Curso"}</strong>
                            <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>{edu.periodo}</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
                            {edu.instituicao}{edu.status ? ` — ${edu.status}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: 28 }}>
                    <MainSectionHeader title="Formação Acadêmica" />
                    <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic", margin: 0 }}>
                      Nenhuma formação acadêmica adicionada
                    </p>
                  </div>
                )}

                {/* Courses */}
                {hasCursos && (
                  <div>
                    <MainSectionHeader title="Cursos e Certificações" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {formData.cursos.split(/[\n,;]+/).filter(Boolean).map((item, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: templateAccent, opacity: 0.5, marginTop: 6, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom branding */}
            <div style={{ padding: "12px 40px", borderTop: `1px solid ${templateColor}08`, textAlign: "center" }}>
              <span style={{ fontSize: 10, color: "#ccc", fontWeight: 600, letterSpacing: "0.05em" }}>
                KRIOU DOCS
              </span>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <Button variant="secondary" icon="Edit" onClick={() => navigate("editor")}>
              Voltar e Editar
            </Button>
            <Button variant="primary" icon="CreditCard" onClick={handleFinalize} style={{ padding: "12px 28px" }}>
              Finalizar Compra
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;
