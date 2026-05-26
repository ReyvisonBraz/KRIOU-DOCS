/**
 * ============================================
 * KRIOU DOCS - Landing Page
 * ============================================
 * Homepage visual com foco em documentos, automacao
 * e conversao para o fluxo de login.
 */

import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { DOC_TYPES, PRICING_PLANS, RESUME_TEMPLATES } from "../data/constants";

const TEMPLATE_PREVIEWS = RESUME_TEMPLATES.slice(0, 4);

const FEATURE_CARDS = [
  {
    icon: "FileText",
    title: "Documentos prontos para assinar",
    text: "Contratos, declaracoes e curriculos com estrutura limpa, campos guiados e PDF final profissional.",
    accent: "var(--teal)",
  },
  {
    icon: "Search",
    title: "Organizacao do cliente",
    text: "Busca por nome, CPF, codigo, tipo de documento, status e arquivos arquivados.",
    accent: "var(--gold)",
  },
  {
    icon: "Edit",
    title: "Edicao sem retrabalho",
    text: "Renomeie, duplique, imprima, baixe, arquive e retome rascunhos direto do painel.",
    accent: "var(--coral)",
  },
];

const LEGAL_FLOW = [
  "Escolha o modelo",
  "Preencha os dados",
  "Revise o layout",
  "Gere o PDF",
];

const LandingPage = () => {
  const { navigate, userId } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (userId) navigate("dashboard", { replace: true });
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ background: "var(--navy)" }}>
      <style>{`
        .landing-shell {
          position: relative;
          isolation: isolate;
        }
        .landing-shell::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(120deg, rgba(244,63,94,0.10), transparent 32%),
            linear-gradient(235deg, rgba(20,184,166,0.12), transparent 38%),
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.08), transparent 30%),
            var(--navy);
        }
        .landing-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(420px, 1.08fr);
          gap: 54px;
          align-items: center;
        }
        .hero-preview {
          position: relative;
          min-height: 560px;
          perspective: 1400px;
        }
        .doc-stack {
          position: absolute;
          inset: 16px 0 0 34px;
          transform: rotateX(7deg) rotateY(-12deg) rotateZ(1deg);
          transform-origin: center;
        }
        .doc-sheet {
          position: absolute;
          width: min(410px, 78vw);
          min-height: 520px;
          border-radius: 8px;
          background: #fbfaf6;
          color: #15151f;
          border: 1px solid rgba(255,255,255,0.24);
          box-shadow: 0 30px 90px rgba(0,0,0,0.42);
          overflow: hidden;
        }
        .doc-sheet.back {
          top: 34px;
          left: 84px;
          transform: rotate(4deg) scale(0.92);
          opacity: 0.42;
        }
        .doc-sheet.front {
          top: 0;
          left: 0;
        }
        .document-toolbar {
          position: absolute;
          right: 0;
          bottom: 42px;
          width: min(340px, calc(100vw - 40px));
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(26,26,54,0.92);
          backdrop-filter: blur(18px);
          border-radius: 18px;
          box-shadow: 0 26px 70px rgba(0,0,0,0.32);
          padding: 16px;
        }
        .doc-action-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 12px;
          border-radius: 12px;
          background: rgba(255,255,255,0.055);
          color: var(--text-dim);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
        .workflow-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .landing-grid {
            grid-template-columns: 1fr;
            gap: 34px;
          }
          .hero-preview {
            min-height: 500px;
          }
          .doc-stack {
            left: 50%;
            transform: translateX(-50%) rotateX(5deg) rotateY(-7deg);
          }
          .document-toolbar {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            bottom: 8px;
          }
        }
        @media (max-width: 700px) {
          .hero-preview {
            min-height: 390px;
            margin-top: 10px;
          }
          .doc-sheet {
            width: min(315px, 82vw);
            min-height: 405px;
          }
          .doc-sheet.back {
            left: 44px;
          }
          .document-toolbar {
            width: calc(100vw - 32px);
          }
          .workflow-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <div className="landing-shell">
        <header className="sticky top-0 z-50 border-b border-border" style={{ background: "rgba(9,9,20,0.88)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-[1220px] mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">
            <button
              onClick={() => navigate("landing")}
              className="font-display text-2xl font-black tracking-tight text-text bg-transparent border-none cursor-pointer touch-target px-2"
            >
              <span className="text-coral">Kriou</span>Docs
            </button>

            <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-text-dim">
              <button onClick={() => document.getElementById("modelos")?.scrollIntoView({ behavior: "smooth" })} className="btn-ghost">
                Modelos
              </button>
              <button onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })} className="btn-ghost">
                Recursos
              </button>
              <button onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })} className="btn-ghost">
                Planos
              </button>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => navigate("login")} className="btn-secondary btn-small touch-target">
                Entrar
              </button>
              <button onClick={() => navigate("login")} className="btn-primary btn-small touch-target">
                Começar agora
              </button>
            </div>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden bg-surface border border-border rounded-xl w-[44px] h-[44px] flex items-center justify-center cursor-pointer focus-ring"
              aria-label="Menu"
            >
              <Icon name={mobileOpen ? "X" : "Grid"} className="w-5 h-5 text-text-dim" />
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-border bg-navy px-5 py-4 flex flex-col gap-3 animate-fade-up">
              <button onClick={() => { navigate("login"); setMobileOpen(false); }} className="btn-primary w-full justify-center touch-target">
                Começar agora
              </button>
              <button onClick={() => { navigate("login"); setMobileOpen(false); }} className="btn-secondary w-full justify-center touch-target">
                Entrar
              </button>
            </div>
          )}
        </header>

        <main>
          <section className="max-w-[1220px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-16 md:pb-24">
            <div className="landing-grid">
              <div className="max-w-[640px]">
                <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 mb-7 text-xs font-bold tracking-wide text-teal uppercase">
                  <Icon name="Sparkles" className="w-4 h-4" />
                  Documentos inteligentes em PDF
                </div>

                <h1 className="font-display text-[clamp(2.6rem,6vw,5.4rem)] font-black leading-[0.98] text-text mb-7">
                  Crie documentos bonitos, organizados e prontos para assinar.
                </h1>

                <p className="text-base md:text-lg text-text-dim max-w-[580px] mb-9 leading-relaxed">
                  Preencha contratos, currículos e documentos jurídicos com fluxo guiado, biblioteca do cliente e PDFs que se adaptam ao conteúdo sem sobrepor textos ou assinaturas.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-9">
                  <button onClick={() => navigate("login")} className="btn-primary !px-8 !py-4 !text-base font-bold touch-target">
                    Criar documento
                    <Icon name="ArrowRight" className="w-4 h-4" />
                  </button>
                <button
                  onClick={() => document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" })}
                  className="btn-secondary !px-8 !py-4 !text-base touch-target !text-text"
                >
                  Ver recursos
                </button>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-[520px]">
                  {[
                    ["12+", "modelos"],
                    ["PDF", "adaptável"],
                    ["Web", "e mobile"],
                  ].map(([value, label]) => (
                    <div key={label} className="surface-card" style={{ padding: "14px 16px", borderRadius: 14 }}>
                      <strong className="font-display text-xl text-text block">{value}</strong>
                      <span className="text-xs text-text-muted font-semibold uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-preview" aria-hidden="true">
                <div className="doc-stack">
                  <div className="doc-sheet back" />
                  <div className="doc-sheet front">
                    <div style={{ padding: "42px 42px 22px", textAlign: "center" }}>
                      <div style={{ height: 2, width: 132, margin: "0 auto 20px", background: "#b59b49" }} />
                      <h2 style={{ fontFamily: "Times New Roman, serif", fontSize: 24, color: "#8b3a3a", margin: 0, letterSpacing: 0 }}>
                        COMPRA E VENDA
                      </h2>
                      <div style={{ height: 1, width: 84, margin: "22px auto 0", background: "#d4af37" }} />
                    </div>

                    <div style={{ margin: "0 34px", padding: "13px 16px", borderLeft: "4px solid #a58737", background: "#faf7ee", border: "1px solid #e8e1cf" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#a58737", marginBottom: 6 }}>FUNDAMENTO LEGAL</div>
                      <div style={{ height: 7, width: "84%", background: "#1f2937", opacity: 0.18, borderRadius: 10 }} />
                    </div>

                    <div style={{ padding: "24px 34px 0", display: "grid", gap: 9 }}>
                      {[92, 100, 96, 72, 88, 98, 58].map((w, index) => (
                        <div key={index} style={{ height: 7, width: `${w}%`, background: "#252936", opacity: 0.16, borderRadius: 10 }} />
                      ))}
                    </div>

                    <div style={{ padding: "28px 34px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                        <div style={{ width: 4, height: 34, background: "#a58737" }} />
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: "#8b3a3a" }}>ASSINATURAS</div>
                          <div style={{ width: 110, height: 1, background: "#eadfbd", marginTop: 7 }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 28px" }}>
                        {["VENDEDOR(A)", "COMPRADOR(A)", "TESTEMUNHA 1", "TESTEMUNHA 2"].map((label) => (
                          <div key={label}>
                            <div style={{ borderTop: "1px dashed #2b2c35", height: 12 }} />
                            <div style={{ height: 6, width: "72%", margin: "0 auto 5px", background: "#252936", opacity: 0.14, borderRadius: 10 }} />
                            <div style={{ fontSize: 8, fontWeight: 800, color: "#a58737", textAlign: "center" }}>{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="document-toolbar">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-text-muted m-0">Biblioteca do cliente</p>
                      <h3 className="font-display text-lg font-extrabold text-text m-0">Ações rápidas</h3>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-coral/15 text-coral flex items-center justify-center">
                      <Icon name="FileText" className="w-5 h-5" />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ["Copy", "Copiar"],
                      ["Edit", "Renomear"],
                      ["Archive", "Arquivar"],
                      ["Search", "Filtrar"],
                    ].map(([icon, label]) => (
                      <div key={label} className="doc-action-pill">
                        <Icon name={icon} className="w-4 h-4" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="recursos" className="max-w-[1220px] mx-auto px-5 md:px-8 py-16 md:py-22 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURE_CARDS.map((feature, index) => (
                <article
                  key={feature.title}
                  className="surface-card surface-hover animate-fade-up"
                  style={{
                    padding: "24px",
                    borderRadius: 16,
                    animationDelay: `${index * 0.06}s`,
                    background: `linear-gradient(180deg, ${feature.accent}10, transparent 48%), var(--surface)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${feature.accent}18`, color: feature.accent }}>
                    <Icon name={feature.icon} className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-xl font-extrabold text-text mb-3">{feature.title}</h2>
                  <p className="text-sm text-text-dim leading-relaxed m-0">{feature.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="modelos" className="max-w-[1220px] mx-auto px-5 md:px-8 py-16 md:py-22 border-t border-border">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-9">
              <div>
                <p className="text-xs text-gold font-extrabold uppercase tracking-[0.16em] mb-3">Modelos</p>
                <h2 className="font-display text-3xl md:text-4xl font-black text-text mb-3">
                  Currículos e documentos jurídicos no mesmo painel.
                </h2>
                <p className="text-text-dim text-base md:text-lg max-w-[650px]">
                  Comece por um modelo, salve rascunhos e gere uma versão final com paginação automática.
                </p>
              </div>
              <button onClick={() => navigate("login")} className="btn-primary btn-small touch-target self-start">
                Acessar modelos
                <Icon name="ArrowRight" className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATE_PREVIEWS.map((tpl, index) => (
                  <button
                    key={tpl.id}
                    onClick={() => navigate("login")}
                    className="surface-card surface-hover text-left overflow-hidden animate-fade-up"
                    style={{ borderRadius: 16, animationDelay: `${index * 0.05}s` }}
                  >
                    <div style={{ height: 116, background: `linear-gradient(135deg, ${tpl.color}, ${tpl.accent})`, padding: 18 }}>
                      <div style={{ width: 92, height: 66, borderRadius: 6, background: "rgba(9,9,20,0.76)", padding: 10 }}>
                        <div style={{ height: 4, width: "70%", borderRadius: 6, background: tpl.accent, marginBottom: 8 }} />
                        <div style={{ height: 3, width: "100%", borderRadius: 6, background: "rgba(255,255,255,0.16)", marginBottom: 5 }} />
                        <div style={{ height: 3, width: "78%", borderRadius: 6, background: "rgba(255,255,255,0.12)" }} />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display font-extrabold text-text text-base mb-1">{tpl.name}</h3>
                      <p className="text-sm text-text-muted leading-relaxed m-0">{tpl.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="surface-card" style={{ padding: 24, borderRadius: 16 }}>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-wide mb-1">Documentos jurídicos</p>
                    <h3 className="font-display text-2xl font-black text-text m-0">Tipos disponíveis</h3>
                  </div>
                  <Icon name="Shield" className="w-7 h-7 text-teal" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOC_TYPES.slice(0, 8).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => navigate("login")}
                      className="flex items-center gap-3 text-left bg-surface-2 border border-border rounded-xl p-3 transition-all hover:bg-surface-3 hover:border-border-hover"
                    >
                      <span className="w-10 h-10 rounded-lg bg-navy-light flex items-center justify-center text-teal shrink-0">
                        <Icon name={doc.icon} className="w-5 h-5" />
                      </span>
                      <span className="text-sm font-bold text-text leading-tight">{doc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-[1220px] mx-auto px-5 md:px-8 py-16 md:py-22 border-t border-border">
            <div className="workflow-row">
              {LEGAL_FLOW.map((item, index) => (
                <div key={item} className="surface-card" style={{ padding: 18, borderRadius: 16 }}>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-coral text-white flex items-center justify-center font-display font-black">
                      {index + 1}
                    </span>
                    <span className="text-sm font-extrabold text-text">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="planos" className="max-w-[1220px] mx-auto px-5 md:px-8 py-16 md:py-24 border-t border-border">
            <div className="max-w-[680px] mb-10">
              <p className="text-xs text-gold font-extrabold uppercase tracking-[0.16em] mb-3">Planos</p>
              <h2 className="font-display text-3xl md:text-4xl font-black text-text mb-3">Pague pelo documento que precisar.</h2>
              <p className="text-text-dim text-lg">Sem painel confuso, sem etapas desnecessárias e com opção personalizada quando o caso exigir.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {PRICING_PLANS.map((plan, index) => (
                <article
                  key={plan.id}
                  className="surface-card surface-hover relative"
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    borderColor: plan.highlight ? "var(--coral)" : "var(--border)",
                    background: plan.highlight ? "linear-gradient(180deg, rgba(244,63,94,0.13), var(--surface) 48%)" : "var(--surface)",
                    transform: plan.highlight ? "translateY(-4px)" : "none",
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {plan.highlight && (
                    <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wide font-black text-white bg-coral px-2 py-1 rounded-md">
                      Popular
                    </span>
                  )}
                  <h3 className="font-display text-xl font-black text-text mb-1">{plan.name}</h3>
                  <div className="font-display text-4xl font-black text-coral mb-1">{plan.price}</div>
                  <p className="text-sm text-text-muted mb-6">{plan.sub}</p>
                  <ul className="space-y-3 mb-7">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-text-dim">
                        <Icon name="Check" className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate("login")} className={plan.highlight ? "btn-primary w-full" : "btn-secondary w-full"}>
                    Escolher
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-border bg-surface/50">
          <div className="max-w-[1220px] mx-auto px-5 md:px-8 py-9 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="font-display text-2xl font-black tracking-tight text-text">
              <span className="text-coral">Kriou</span>Docs
            </div>
            <p className="text-sm text-text-muted text-center m-0">
              Documentos profissionais, organizados e prontos para PDF. &copy; {new Date().getFullYear()} Kriou Docs.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
