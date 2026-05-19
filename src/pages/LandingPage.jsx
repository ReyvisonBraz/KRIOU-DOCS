/**
 * ============================================
 * KRIOU DOCS - Landing Page
 * ============================================
 * Luxury Refined + Bold Editorial.
 */

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { DOC_TYPES, PRICING_PLANS, RESUME_TEMPLATES } from "../data/constants";

const TEMPLATE_PREVIEWS = RESUME_TEMPLATES.slice(0, 5);

const LandingPage = () => {
  const { navigate, userId } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (userId) navigate("dashboard", { replace: true });
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-navy overflow-x-hidden">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 bg-navy/95 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-[64px] flex items-center justify-between">
          <button
            onClick={() => navigate("landing")}
            className="font-display text-2xl font-black tracking-tight text-text bg-transparent border-none cursor-pointer touch-target px-2"
          >
            <span className="text-coral">Kriou</span>Docs
          </button>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("login")}
              className="btn-secondary btn-small touch-target"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("login")}
              className="btn-primary btn-small touch-target"
            >
              Criar Gr&aacute;tis
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden bg-surface border border-border rounded-xl w-[44px] h-[44px] flex items-center justify-center cursor-pointer focus-ring"
            aria-label="Menu"
          >
            <Icon
              name={mobileOpen ? "ChevronLeft" : "ChevronRight"}
              className="w-5 h-5 text-text-dim rotate-90"
            />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-navy px-5 py-4 flex flex-col gap-3 animate-fade-up">
            <button
              onClick={() => { navigate("login"); setMobileOpen(false); }}
              className="btn-primary w-full justify-center touch-target"
            >
              Criar Gr&aacute;tis
            </button>
            <button
              onClick={() => { navigate("login"); setMobileOpen(false); }}
              className="btn-secondary w-full justify-center touch-target"
            >
              Entrar
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* ─── Hero ─── */}
        <section className="relative max-w-[1200px] mx-auto px-5 md:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
          {/* Ambient glow — subtle, no glass */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coral/6 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-teal/6 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-[720px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 mb-8 text-xs font-semibold tracking-wide text-teal uppercase">
              <span className="w-2 h-2 rounded-full bg-teal animate-glow-pulse" />
              Nova plataforma de documentos
            </div>

            <h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-black leading-[1.08] text-text mb-6 tracking-tight">
              Documentos que<br />
              <span className="text-coral">impressionam</span> em minutos
            </h1>

            <p className="text-base md:text-lg text-text-dim max-w-[560px] mx-auto mb-10 leading-relaxed">
              Crie curr&iacute;culos profissionais, contratos e documentos jur&iacute;dicos com modelos inteligentes. Preencha, revise e receba em PDF &mdash; direto no WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("login")}
                className="btn-primary !px-10 !py-4 !text-base font-bold touch-target min-w-[220px]"
              >
                Criar Gr&aacute;tis
                <Icon name="ArrowRight" className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={() => document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-ghost !px-8 !py-4 !text-[15px] touch-target min-w-[220px]"
              >
                Ver recursos
              </button>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section id="resources" className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28 border-t border-border">
          <div className="max-w-[640px] mx-auto text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4 tracking-tight">
              Tudo o que voc&ecirc; precisa
            </h2>
            <p className="text-text-dim text-lg leading-relaxed">
              Do curr&iacute;culo ao contrato jur&iacute;dico, com preenchimento guiado e entrega instant&acirc;nea.
            </p>
          </div>

          <style>{`
            .feat-wide { grid-column: span 2; }
            .feat-wide .feat-inner { flex-direction: row !important; align-items: center !important; gap: 20px !important; }
            .feat-wide .feat-icon { margin-bottom: 0 !important; flex-shrink: 0; }
            .feat-compact { align-items: center !important; gap: 16px !important; flex-direction: row !important; }
            .feat-compact .feat-icon { margin-bottom: 0 !important; flex-shrink: 0; width: 40px !important; height: 40px !important; }
            .feat-compact h3 { margin-bottom: 0 !important; }
            .feat-compact p { display: none; }
            @media (max-width: 640px) {
              .feat-wide { grid-column: span 1 !important; }
              .feat-wide .feat-inner { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
            }
          `}</style>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "FileText", label: "Currículos", desc: "5 modelos profissionais com wizard de 7 etapas e preview em tempo real.", color: "var(--coral)", wide: true },
              { icon: "Shield", label: "Documentos jurídicos", desc: "Contratos, procurações e declarações com estrutura jurídica validada.", color: "var(--teal)" },
              { icon: "Zap", label: "Preenchimento guiado", desc: "Passo a passo inteligente que qualquer pessoa consegue usar.", color: "var(--gold)", compact: true },
              { icon: "Download", label: "PDF instantâneo", desc: "Geração e download em segundos. Pronto para imprimir ou enviar.", color: "var(--coral)" },
              { icon: "MessageCircle", label: "Entrega via WhatsApp", desc: "Receba o documento finalizado direto no seu WhatsApp sem complicação.", color: "var(--success)", compact: true },
              { icon: "Edit", label: "Edite depois", desc: "Atualize seus documentos a qualquer momento sem precisar refazer.", color: "var(--teal)" },
            ].map((f, i) => (
              <div
                key={i}
                className={`surface-card surface-hover animate-fade-up ${f.wide ? "feat-wide" : ""}`}
                style={{ padding: f.compact ? "14px 18px" : "24px 22px", animationDelay: `${i * 0.06}s` }}
              >
                <div className={`feat-inner ${f.compact ? "feat-compact" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
                  {!f.compact && (
                    <div className="feat-icon" style={{
                      width: f.wide ? 48 : 44, height: f.wide ? 48 : 44,
                      borderRadius: f.wide ? 14 : 12, marginBottom: f.wide ? 0 : 16, marginRight: f.wide ? 16 : 0,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      backgroundColor: `${f.color}14`,
                    }}>
                      <Icon name={f.icon} className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                  )}
                  {f.compact && (
                    <div className="feat-icon" style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: `${f.color}14`,
                    }}>
                      <Icon name={f.icon} className="w-4 h-4" style={{ color: f.color }} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-text" style={{ fontSize: f.wide ? 17 : 15, marginBottom: f.compact ? 0 : 6 }}>
                      {f.label}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed" style={{ margin: 0 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Template Previews ─── */}
        <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-3 tracking-tight">
                Modelos de curr&iacute;culo
              </h2>
              <p className="text-text-dim text-lg">
                Escolha o estilo que combina com sua &aacute;rea.
              </p>
            </div>
            <button
              onClick={() => navigate("login")}
              className="btn-primary btn-small touch-target self-start"
            >
              Ver todos os modelos
              <Icon name="ArrowRight" className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {TEMPLATE_PREVIEWS.map((tpl, i) => (
              <div
                key={tpl.id}
                className="surface-card overflow-hidden surface-hover animate-fade-up cursor-pointer"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => navigate("login")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("login"); } }}
              >
                <div className="h-[120px] flex items-center justify-center" style={{ backgroundColor: `${tpl.color}18` }}>
                  <div className="text-center">
                    <div
                      className="w-16 h-1.5 rounded-full mx-auto mb-3"
                      style={{ backgroundColor: tpl.accent }}
                    />
                    <div className="w-28 h-2 rounded-full mx-auto mb-2 opacity-60" style={{ backgroundColor: tpl.accent }} />
                    <div className="w-20 h-1.5 rounded-full mx-auto opacity-40" style={{ backgroundColor: tpl.accent }} />
                  </div>
                </div>
                <div className="px-5 py-4">
                  <h4 className="font-display font-bold text-text text-[15px] mb-1">{tpl.name}</h4>
                  <p className="text-xs text-text-muted">{tpl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Coming Soon Documents ─── */}
        <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28 border-t border-border">
          <div className="max-w-[640px] mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4 tracking-tight">
              Documentos jur&iacute;dicos em breve
            </h2>
            <p className="text-text-dim text-lg leading-relaxed">
              Contratos, declara&ccedil;&otilde;es e procura&ccedil;&otilde;es. Tudo com preenchimento guiado e estrutura validada.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {DOC_TYPES.map((doc, i) => (
              <div
                key={doc.id}
                className="surface-card p-5 flex flex-col items-center text-center animate-fade-up opacity-70 hover:opacity-100 transition-opacity"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center mb-3">
                  <Icon name={doc.icon} className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text mb-2">{doc.name}</p>
                <span className="text-[11px] font-medium text-text-faint bg-surface-2 px-2.5 py-0.5 rounded-full">
                  Em breve
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-20 md:py-28 border-t border-border">
          <div className="max-w-[640px] mx-auto text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-text mb-4 tracking-tight">
              Precifica&ccedil;&atilde;o simples
            </h2>
            <p className="text-text-dim text-lg leading-relaxed">
              Sem surpresas. Pague pelo que usar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-[1200px] mx-auto">
            {PRICING_PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className={`flex flex-col p-8 rounded-2xl border animate-fade-up relative
                  ${plan.highlight
                    ? "bg-surface-2 border-coral shadow-[0_8px_40px_rgba(244,63,94,0.12)] md:scale-[1.03]"
                    : "bg-surface border-border"
                  }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-coral text-white px-4 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase">
                    Mais popular
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-text mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="font-display text-[2.5rem] font-black text-coral leading-none">{plan.price}</span>
                </div>
                <p className="text-sm text-text-muted mb-7 font-medium">{plan.sub}</p>

                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-text-dim">
                      <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon name="Check" className="w-3 h-3 text-success" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("login")}
                  className={plan.highlight
                    ? "btn-primary w-full justify-center touch-target font-bold"
                    : "btn-secondary w-full justify-center touch-target font-bold"
                  }
                >
                  {plan.highlight ? "Come&ccedil;ar agora" : "Escolher plano"}
                </button>
              </div>
            ))}
              <div
                className="flex flex-col p-8 rounded-2xl border animate-fade-up relative bg-surface border-[rgba(37,211,102,0.25)]"
                style={{ animationDelay: "0.4s", background: "linear-gradient(155deg, var(--surface) 0%, rgba(37,211,102,0.04) 100%)" }}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-[11px] font-extrabold tracking-widest uppercase" style={{ background: "#25D366" }}>
                  Sob medida
                </div>
                <h3 className="font-display text-xl font-bold text-text mb-1">Personalizado</h3>
                <p className="text-sm text-text-muted mb-4 font-medium">Sob consulta</p>

                <ul className="flex-1 space-y-3 mb-8">
                  {[
                    "Contrato feito para você",
                    "Consultoria jurídica inclusa",
                    "Revisão ilimitada",
                    "Atendimento via WhatsApp",
                  ].map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-text-dim">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(37,211,102,0.15)" }}>
                        <Icon name="Check" className="w-3 h-3" style={{ color: "#25D366" }} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="https://wa.me/5591986450659?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20contrato%20personalizado."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full justify-center touch-target font-bold flex items-center gap-2 py-3.5 rounded-xl text-white cursor-pointer text-[15px]"
                  style={{
                    background: "#25D366",
                    border: "none",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,211,102,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ fontSize: 18 }}>💬</span>
                  Falar no WhatsApp
                </a>
              </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-surface/50">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display text-2xl font-black tracking-tight text-text">
            <span className="text-coral">Kriou</span>Docs
          </div>
          <p className="text-sm text-text-muted text-center">
            Documentos profissionais ao alcance de todos. &copy; {new Date().getFullYear()} Kriou Docs.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
