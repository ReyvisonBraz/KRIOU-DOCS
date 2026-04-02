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
import { STEPS, DOC_TYPES, PRICING_PLANS, RESUME_TEMPLATES, THEME } from "../data/constants";

/**
 * LandingPage - Main marketing landing page
 */
const LandingPage = () => {
  const { navigate } = useApp();

  /**
   * Feature card data for mapping
   */
  const features = [
    { icon: "Layout", title: "Modelos Prontos", desc: "Templates profissionais com design moderno. Só preencher e baixar.", color: "var(--coral)" },
    { icon: "Zap", title: "Preenchimento Guiado", desc: "Passo a passo inteligente. Sem curva de aprendizado.", color: "var(--teal)" },
    { icon: "Save", title: "Salvamento Automático", desc: "Nunca perca seu progresso. Salva a cada alteração.", color: "var(--gold)" },
    { icon: "MessageCircle", title: "Entrega via WhatsApp", desc: "Receba seu documento pronto direto no seu WhatsApp.", color: "var(--success)" },
    { icon: "Shield", title: "Documentos Válidos", desc: "Estrutura jurídica validada para contratos e declarações.", color: "var(--purple)" },
    { icon: "Edit", title: "Edite Depois", desc: "Atualize seus documentos quando quiser, sem refazer.", color: "var(--blue)" },
  ];

  /**
   * Stats data for hero section
   */
  const stats = [
    { number: "12+", label: "Tipos de documentos" },
    { number: "5", label: "Modelos de currículo" },
    { number: "< 5min", label: "Tempo médio" },
  ];

  /**
   * Objective suggestions for quick fill
   */
  const objectiveSuggestions = ["Desenvolvedor", "Designer", "Analista", "Gerente"];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Navbar ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="font-display" style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-1px" }}>
            <span style={{ color: "var(--coral)" }}>Kriou</span>
            <span style={{ color: "var(--text)", marginLeft: 4 }}>Docs</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" size="small" onClick={() => navigate("login")}>
              Entrar
            </Button>
            <Button variant="primary" size="small" onClick={() => navigate("login")}>
              Criar Grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center", position: "relative" }}>
        {/* Background decorative elements */}
        <div style={{ position: "absolute", top: 40, left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 100, right: "5%", width: 200, height: 200, background: "radial-gradient(circle, rgba(0,210,211,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Badge */}
        <div className="animate-fadeUp" style={{ display: "inline-block", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 100, padding: "8px 20px", marginBottom: 24 }}>
          <span style={{ color: "var(--teal)", fontSize: 13, fontWeight: 600 }}>✨ Novo — Crie seu currículo em 5 minutos</span>
        </div>

        {/* Headline */}
        <h1 className="font-display animate-fadeUp delay-1" style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: "-2px" }}>
          Documentos profissionais<br />
          <span className="gradient-text">sem complicação</span>
        </h1>

        {/* Subheadline */}
        <p className="animate-fadeUp delay-2" style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 560, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Currículos, contratos e documentos jurídicos prontos em minutos. Modelos profissionais, preenchimento guiado e entrega via WhatsApp.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fadeUp delay-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="large" icon="ChevronRight" iconPosition="right" onClick={() => navigate("login")}>
            Começar Agora — É Grátis
          </Button>
          <Button variant="secondary" size="large" onClick={() => document.getElementById("docs-section")?.scrollIntoView({ behavior: "smooth" })}>
            Ver Documentos
          </Button>
        </div>

        {/* Stats */}
        <div className="animate-fadeUp delay-4" style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 64, flexWrap: "wrap" }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 32, fontWeight: 900, color: "var(--coral)" }}>{stat.number}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <h2 className="font-display" style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48, letterSpacing: "-1px" }}>
          Por que o <span style={{ color: "var(--coral)" }}>Kriou Docs</span>?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {features.map((feature, index) => (
            <Card key={index} className="animate-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${feature.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name={feature.icon} className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feature.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Documents Section ─── */}
      <section id="docs-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
        <h2 className="font-display" style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 12, letterSpacing: "-1px" }}>
          Documentos Disponíveis
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 48, fontSize: 16 }}>Currículos profissionais agora. Contratos e documentos jurídicos em breve.</p>

        {/* Resume Highlight Card */}
        <Card style={{ border: "1px solid var(--coral)", padding: 32, marginBottom: 32, background: "linear-gradient(135deg, var(--surface) 0%, rgba(233,69,96,0.05) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Badge variant="coral">DISPONÍVEL</Badge>
                <Badge variant="teal">5 MODELOS</Badge>
              </div>
              <h3 className="font-display" style={{ fontSize: 26, fontWeight: 800 }}>Currículos Profissionais</h3>
              <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Wizard de 7 etapas com preview em tempo real</p>
            </div>
            <Button variant="primary" icon="ChevronRight" iconPosition="right" onClick={() => navigate("login")}>
              Criar Currículo
            </Button>
          </div>
        </Card>

        {/* Coming Soon Documents Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {DOC_TYPES.map((doc, index) => {
            const IconComponent = Icon;
            return (
              <Card key={doc.id} className="animate-fadeUp" style={{ opacity: 0.6, cursor: "default", padding: 20, animationDelay: `${index * 0.05}s` }}>
                <Icon name={doc.icon} className="w-5 h-5" style={{ color: "var(--text-muted)", marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Em breve</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>
        <h2 className="font-display" style={{ textAlign: "center", fontSize: 32, fontWeight: 800, marginBottom: 48, letterSpacing: "-1px" }}>Planos Simples</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {PRICING_PLANS.map((plan, index) => (
            <Card
              key={plan.id}
              style={{
                textAlign: "center",
                padding: 32,
                position: "relative",
                border: plan.highlight ? "2px solid var(--coral)" : "1px solid var(--border)",
                background: plan.highlight ? "linear-gradient(180deg, rgba(233,69,96,0.08) 0%, var(--surface) 50%)" : "var(--surface)",
              }}
            >
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--coral)", color: "white", padding: "4px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                  MAIS POPULAR
                </div>
              )}
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
              <div className="font-display" style={{ fontSize: 36, fontWeight: 900, color: "var(--coral)", marginBottom: 0 }}>{plan.price}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>{plan.sub}</div>
              {plan.features.map((feature, fIndex) => (
                <div key={fIndex} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, justifyContent: "center" }}>
                  <Icon name="Check" className="w-4 h-4" style={{ color: "var(--success)" }} />
                  <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{feature}</span>
                </div>
              ))}
              <Button variant={plan.highlight ? "primary" : "secondary"} style={{ width: "100%", marginTop: 16 }} onClick={() => navigate("login")}>
                Começar
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          <span style={{ color: "var(--coral)" }}>Kriou</span> Docs
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Documentos profissionais ao alcance de todos. © 2026</p>
      </footer>
    </div>
  );
};

export default LandingPage;