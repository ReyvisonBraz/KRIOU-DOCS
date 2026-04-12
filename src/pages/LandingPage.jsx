/**
 * ============================================
 * KRIOU DOCS - Landing Page Component
 * ============================================
 * Main landing page with hero section,
 * features, pricing and document previews.
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Badge } from "../components/UI";
import { DOC_TYPES, PRICING_PLANS } from "../data/constants";

const LandingPage = () => {
  const { navigate } = useApp();

  const features = [
    { icon: "Layout", title: "Modelos Prontos", desc: "Templates profissionais com design moderno. Só preencher e baixar.", color: "text-coral" },
    { icon: "Zap", title: "Preenchimento Guiado", desc: "Passo a passo inteligente. Sem curva de aprendizado.", color: "text-teal" },
    { icon: "Save", title: "Salvamento Automático", desc: "Nunca perca seu progresso. Salva a cada alteração.", color: "text-gold" },
    { icon: "MessageCircle", title: "Entrega via WhatsApp", desc: "Receba seu documento pronto direto no seu WhatsApp.", color: "text-success" },
    { icon: "Shield", title: "Documentos Válidos", desc: "Estrutura jurídica validada para contratos e declarações.", color: "text-purple" },
    { icon: "Edit", title: "Edite Depois", desc: "Atualize seus documentos quando quiser, sem refazer.", color: "text-blue" },
  ];

  const stats = [
    { number: "12+", label: "Tipos de documentos" },
    { number: "5", label: "Modelos de currículo" },
    { number: "< 5min", label: "Tempo médio" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy relative overflow-hidden">
      {/* Elementos de Brilho Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-coral/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-teal/10 blur-[100px] rounded-full pointer-events-none" />

      {/* ─── Navbar ─── */}
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="font-display text-2xl md:text-3xl font-black tracking-tight cursor-pointer" onClick={() => navigate("landing")}>
            <span className="text-coral">Kriou</span>
            <span className="text-text ml-1">Docs</span>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button variant="secondary" className="btn-small hidden sm:flex" onClick={() => navigate("login")}>
              Entrar
            </Button>
            <Button variant="primary" className="btn-small" onClick={() => navigate("login")}>
              Criar Grátis
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6">
        {/* ─── Hero Section ─── */}
        <section className="relative py-16 md:py-24 text-center flex flex-col items-center">
          <div className="animate-fadeUp bg-surface-2 border border-border rounded-full px-5 py-2 mb-6">
            <span className="text-teal text-xs md:text-sm font-semibold tracking-wide flex items-center justify-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              Novo — Crie seu currículo em 5 minutos
            </span>
          </div>

          <h1 className="font-display animate-fadeUp delay-1 text-[clamp(2.25rem,6vw,4rem)] font-black leading-[1.05] mb-6 tracking-tight">
            Documentos profissionais<br />
            <span className="text-gradient drop-shadow-sm">sem complicação</span>
          </h1>

          <p className="animate-fadeUp delay-2 text-base md:text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed px-2">
            Currículos, contratos e documentos jurídicos prontos em minutos. Modelos profissionais, preenchimento guiado e entrega direta no WhatsApp.
          </p>

          <div className="animate-fadeUp delay-3 flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto px-4">
            <Button variant="primary" icon="ChevronRight" iconPosition="right" onClick={() => navigate("login")} className="w-full sm:w-auto justify-center text-lg px-8 py-4">
              Começar Agora — É Grátis
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById("docs-section")?.scrollIntoView({ behavior: "smooth" })} className="w-full sm:w-auto justify-center text-lg px-8 py-4">
              Ver Documentos
            </Button>
          </div>

          <div className="animate-fadeUp delay-4 flex justify-center gap-8 md:gap-16 mt-16 flex-wrap">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="font-display text-4xl md:text-5xl font-black text-coral group-hover:-translate-y-1 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm text-text-muted mt-2 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features Section ─── */}
        <section className="py-16 md:py-20">
          <h2 className="font-display text-center text-3xl md:text-4xl font-extrabold mb-12 tracking-tight">
            Por que o <span className="text-coral">Kriou Docs</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="glass-card p-6 md:p-8 animate-fadeUp group hover:border-coral/50" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Icon name={feature.icon} className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm md:text-base text-text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Documents Section ─── */}
        <section id="docs-section" className="py-16 md:py-20 relative">
          <h2 className="font-display text-center text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Documentos Disponíveis
          </h2>
          <p className="text-center text-text-muted mb-12 text-lg">
            Currículos profissionais agora. Contratos e documentos jurídicos em breve.
          </p>

          <div className="glass-card border-coral/30 p-6 md:p-10 mb-10 bg-gradient-premium group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="coral" className="bg-coral text-white font-bold px-3 py-1 text-xs rounded-lg uppercase shadow-lg shadow-coral/20">DISPONÍVEL</Badge>
                  <Badge variant="teal" className="bg-teal text-navy font-bold px-3 py-1 text-xs rounded-lg uppercase">5 MODELOS</Badge>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-black mb-2 text-white">Currículos Profissionais</h3>
                <p className="text-text-muted text-lg">Wizard guiado de 7 etapas com preview em tempo real</p>
              </div>
              <Button variant="primary" icon="ChevronRight" iconPosition="right" onClick={() => navigate("login")} className="w-full md:w-auto mt-4 md:mt-0 font-bold px-8 shadow-coral/30 shadow-xl group-hover:shadow-coral/50">
                Criar Currículo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DOC_TYPES.map((doc, index) => (
              <div key={doc.id} className="bg-surface border border-border/50 rounded-2xl p-5 opacity-60 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fadeUp transition-opacity hover:opacity-80" style={{ animationDelay: `${index * 0.05}s` }}>
                <Icon name={doc.icon} className="w-6 h-6 text-text-muted mb-3" />
                <div className="text-sm font-semibold text-text">{doc.name}</div>
                <div className="text-xs text-text-muted mt-2 font-medium px-2 py-1 bg-surface-3 rounded-full">Em breve</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Pricing Section ─── */}
        <section className="py-16 md:py-24">
          <h2 className="font-display text-center text-3xl md:text-4xl font-extrabold mb-16 tracking-tight">Planos Simples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col text-center p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-2
                  ${plan.highlight ? 'bg-gradient-premium border-2 border-coral shadow-[0_20px_50px_rgba(233,69,96,0.15)] z-10 scale-100 md:scale-105' : 'bg-surface border border-border shadow-lg'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-coral text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest shadow-lg shadow-coral/30">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="font-display text-5xl font-black text-coral mb-3">
                  {plan.price}
                </div>
                <div className="text-sm text-text-muted mb-8 font-medium">{plan.sub}</div>
                
                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3 justify-center text-sm text-text-muted">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <Icon name="Check" className="w-3 h-3 text-success font-bold" />
                      </div>
                      <span className="text-text/90 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button variant={plan.highlight ? "primary" : "secondary"} className="w-full justify-center py-4 font-bold rounded-xl" onClick={() => navigate("login")}>
                  {plan.highlight ? "Começar Agora" : "Escolher Plano"}
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border mt-auto backdrop-blur-lg bg-navy/80">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display text-2xl font-black tracking-tight text-white flex items-center">
            <span className="text-coral mr-1">Kriou</span> Docs
          </div>
          <p className="text-sm text-text-muted font-medium text-center md:text-right">
            Documentos profissionais ao alcance de todos.<br className="md:hidden" /> &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;