/**
 * ============================================
 * KRIOU DOCS - Welcome / Onboarding Page
 * ============================================
 * Exibida uma única vez após o primeiro login.
 * Tour visual de 5 slides com as funcionalidades
 * do sistema. Marcada como vista no localStorage.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TOTAL = 5;

const TEMPLATES = [
  { name: "Executivo", color: "#0F3460", accent: "#E94560" },
  { name: "Criativo",  color: "#2d1060", accent: "#00D2D3" },
  { name: "Clássico",  color: "#111827", accent: "#F9A825" },
  { name: "Tech",      color: "#0d2137", accent: "#00D2D3" },
  { name: "1º Emp.",   color: "#1a0f2e", accent: "#E94560" },
];

const LEGAL_TYPES = [
  { icon: "Home",      label: "Aluguel",      color: "#60a5fa" },
  { icon: "Tag",       label: "Compra/Venda", color: "#fbbf24" },
  { icon: "Shield",    label: "Procuração",   color: "#34d399" },
  { icon: "Heart",     label: "União Estável",color: "#f87171" },
  { icon: "Plane",     label: "Aut. Viagem",  color: "#a78bfa" },
  { icon: "Wrench",    label: "Prest. Serv.", color: "#22d3ee" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────

const WelcomePage = () => {
  const { profile, navigate, userId } = useApp();
  const [slide, setSlide]             = useState(0);
  const firstName                     = profile?.nome || "Usuário";

  const finish = () => {
    if (userId) localStorage.setItem(`kriou_onboarding_${userId}_seen`, "1");
    navigate("dashboard");
  };

  const next = () => (slide < TOTAL - 1 ? setSlide((s) => s + 1) : finish());
  const prev = () => slide > 0 && setSlide((s) => s - 1);

  return (
    <div
      className="min-h-screen bg-navy flex flex-col relative overflow-hidden"
      style={{ userSelect: "none" }}
    >
      {/* ── Ambient blobs ── */}
      <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(233,69,96,0.07) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(83,52,131,0.08) 0%, transparent 70%)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,210,211,0.03) 0%, transparent 60%)" }} />

      {/* ── Skip button ── */}
      {slide < TOTAL - 1 && (
        <button
          onClick={finish}
          className="absolute top-5 right-5 z-20 flex items-center gap-1 text-text-muted text-sm font-semibold hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          Pular <Icon name="ChevronRight" className="w-4 h-4" />
        </button>
      )}

      {/* ── Slide area ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div key={slide} className="animate-fadeUp w-full max-w-md">
          {slide === 0 && <SlideWelcome firstName={firstName} />}
          {slide === 1 && <SlideResume />}
          {slide === 2 && <SlideLegal />}
          {slide === 3 && <SlideCheckout />}
          {slide === 4 && <SlideReady firstName={firstName} onGo={finish} />}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      {slide < TOTAL - 1 && (
        <div className="pb-10 flex flex-col items-center gap-5">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === slide
                    ? "var(--coral)"
                    : i < slide
                      ? "rgba(233,69,96,0.35)"
                      : "rgba(255,255,255,0.12)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {slide > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-text-muted hover:text-white hover:border-white/30 transition-all text-sm font-semibold bg-transparent cursor-pointer"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
                Voltar
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-sm transition-all border-none cursor-pointer"
              style={{
                background: "var(--coral)",
                boxShadow: "0 8px 24px rgba(233,69,96,0.25)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--coral-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--coral)"; }}
            >
              {slide === 0 ? "Começar tour" : "Próximo"}
              <Icon name="ChevronRight" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Slide 0 — Boas-vindas pessoais ──────────────────────────────────────────

const SlideWelcome = ({ firstName }) => (
  <div className="flex flex-col items-center gap-7 text-center">
    {/* Avatar com anel pulsante */}
    <div className="relative flex items-center justify-center">
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{
          background: "rgba(233,69,96,0.12)",
          border: "1.5px solid rgba(233,69,96,0.25)",
          animationDuration: "2.2s",
        }}
      />
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-4xl text-white"
        style={{
          background: "linear-gradient(135deg, rgba(233,69,96,0.25) 0%, rgba(83,52,131,0.3) 100%)",
          border: "2px solid rgba(233,69,96,0.4)",
          boxShadow: "0 0 32px rgba(233,69,96,0.2)",
        }}
      >
        <span style={{ color: "var(--coral)" }}>{firstName[0]?.toUpperCase()}</span>
      </div>
    </div>

    {/* Badge "Novo membro" */}
    <div
      className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
      style={{
        background: "rgba(233,69,96,0.08)",
        border: "1px solid rgba(233,69,96,0.2)",
        color: "var(--coral)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "var(--coral)" }}
      />
      Novo membro
    </div>

    {/* Título */}
    <div>
      <h1 className="font-display font-black text-white leading-tight mb-3" style={{ fontSize: "clamp(2rem, 8vw, 2.75rem)" }}>
        Bem-vindo,{" "}
        <span style={{ color: "var(--coral)" }}>{firstName}!</span>
      </h1>
      <p className="text-text-muted leading-relaxed" style={{ fontSize: 15 }}>
        Seu espaço para criar documentos profissionais em minutos.
        Deixa eu te mostrar o que você pode fazer aqui.
      </p>
    </div>

    {/* Feature pills */}
    <div className="flex flex-wrap justify-center gap-2 mt-1">
      {["Currículos Profissionais", "Documentos Jurídicos", "PDF na hora"].map((f, i) => (
        <span
          key={i}
          className="animate-fadeUp px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            animationDelay: `${0.3 + i * 0.1}s`,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          {f}
        </span>
      ))}
    </div>
  </div>
);

// ─── Slide 1 — Currículo Profissional ─────────────────────────────────────────

const SlideResume = () => (
  <div className="flex flex-col items-center gap-6 text-center">
    {/* Ícone */}
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(233,69,96,0.1)",
        border: "1.5px solid rgba(233,69,96,0.2)",
        boxShadow: "0 0 24px rgba(233,69,96,0.1)",
      }}
    >
      <Icon name="FileText" className="w-8 h-8" style={{ color: "var(--coral)" }} />
    </div>

    {/* Texto */}
    <div>
      <div className="flex items-center justify-center gap-2.5 flex-wrap mb-3">
        <h2 className="font-display text-2xl font-black text-white">Currículo Profissional</h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.2)", color: "var(--coral)" }}
        >
          5 templates
        </span>
      </div>
      <p className="text-text-muted leading-relaxed max-w-xs mx-auto" style={{ fontSize: 14 }}>
        Templates premium, formulário passo a passo e PDF gerado em segundos — pronto para enviar.
      </p>
    </div>

    {/* Mini templates */}
    <div className="flex gap-3 mt-1">
      {TEMPLATES.map((tpl, i) => (
        <div
          key={i}
          className="animate-scaleIn flex-shrink-0 relative overflow-hidden"
          style={{
            animationDelay: `${i * 0.08}s`,
            width: 58, height: 78, borderRadius: 10,
            background: tpl.color,
            border: `1.5px solid ${tpl.accent}35`,
            boxShadow: `0 4px 16px rgba(0,0,0,0.3), 0 0 8px ${tpl.accent}10`,
          }}
        >
          <div style={{ padding: "7px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ width: "100%", height: 3, borderRadius: 2, background: tpl.accent }} />
            <div style={{ width: "65%", height: 2, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
            <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2.5 }}>
              {[100, 75, 90, 60].map((w, j) => (
                <div key={j} style={{ width: `${w}%`, height: 1.5, borderRadius: 1, background: "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
          </div>
          {/* Nome do template */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              padding: "3px 4px",
              background: tpl.accent + "18",
              borderTop: `1px solid ${tpl.accent}30`,
            }}
          >
            <div style={{ fontSize: 7, color: tpl.accent, fontWeight: 700, textAlign: "center" }}>{tpl.name}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Slide 2 — Documentos Jurídicos ──────────────────────────────────────────

const SlideLegal = () => (
  <div className="flex flex-col items-center gap-6 text-center">
    {/* Ícone */}
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(83,52,131,0.15)",
        border: "1.5px solid rgba(83,52,131,0.35)",
        boxShadow: "0 0 24px rgba(83,52,131,0.15)",
      }}
    >
      <Icon name="Bookmark" className="w-8 h-8" style={{ color: "#a78bfa" }} />
    </div>

    {/* Texto */}
    <div>
      <div className="flex items-center justify-center gap-2.5 flex-wrap mb-3">
        <h2 className="font-display text-2xl font-black text-white">Documentos Jurídicos</h2>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: "rgba(83,52,131,0.15)", border: "1px solid rgba(83,52,131,0.35)", color: "#a78bfa" }}
        >
          10+ modelos
        </span>
      </div>
      <p className="text-text-muted leading-relaxed max-w-xs mx-auto" style={{ fontSize: 14 }}>
        Contratos, procurações, recibos e muito mais. Formulário guiado, sem juridiquês, pronto para assinar.
      </p>
    </div>

    {/* Grid de tipos */}
    <div className="grid grid-cols-3 gap-2.5 w-full mt-1">
      {LEGAL_TYPES.map((item, i) => (
        <div
          key={i}
          className="animate-scaleIn flex flex-col items-center gap-1.5 p-3.5 rounded-xl"
          style={{
            animationDelay: `${i * 0.07}s`,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Icon name={item.icon} className="w-5 h-5" style={{ color: item.color }} />
          <span className="text-[10px] font-semibold leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Slide 3 — Checkout / Preço ───────────────────────────────────────────────

const SlideCheckout = () => (
  <div className="flex flex-col items-center gap-6 text-center">
    {/* Ícone */}
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(0,210,211,0.08)",
        border: "1.5px solid rgba(0,210,211,0.2)",
        boxShadow: "0 0 24px rgba(0,210,211,0.08)",
      }}
    >
      <Icon name="CreditCard" className="w-8 h-8" style={{ color: "#00D2D3" }} />
    </div>

    {/* Texto */}
    <div>
      <h2 className="font-display text-2xl font-black text-white mb-3">Simples e Acessível</h2>
      <p className="text-text-muted leading-relaxed max-w-xs mx-auto" style={{ fontSize: 14 }}>
        Pague apenas pelo que usar. Sem mensalidade, sem surpresas — cada documento sai por:
      </p>
    </div>

    {/* Cartão de preço */}
    <div
      className="w-full max-w-xs animate-scaleIn"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: "linear-gradient(90deg, var(--coral), #533483, transparent)" }} />

      <div style={{ padding: "24px 28px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>
          Por documento
        </div>
        <div className="font-display font-black" style={{ fontSize: 52, lineHeight: 1, color: "var(--coral)", marginBottom: 4 }}>
          R$ 9,90
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          PDF gerado e liberado na hora
        </div>

        {/* Métodos de pagamento */}
        <div className="flex gap-2 justify-center" style={{ marginTop: 20 }}>
          {[
            { label: "PIX",    color: "#00C897" },
            { label: "Cartão", color: "#60a5fa" },
            { label: "Boleto", color: "#fbbf24" },
          ].map((p) => (
            <span
              key={p.label}
              style={{
                padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                color: p.color,
                background: p.color + "12",
                border: `1px solid ${p.color}30`,
              }}
            >
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </div>

    <p className="text-text-muted" style={{ fontSize: 11 }}>
      🔒 Pagamento seguro processado por Mercado Pago
    </p>
  </div>
);

// ─── Slide 4 — Tudo pronto ────────────────────────────────────────────────────

const SlideReady = ({ firstName, onGo }) => (
  <div className="flex flex-col items-center gap-7 text-center">
    {/* Check animado */}
    <div
      className="animate-scaleIn w-24 h-24 rounded-full flex items-center justify-center"
      style={{
        background: "rgba(0,200,151,0.1)",
        border: "2px solid rgba(0,200,151,0.25)",
        boxShadow: "0 0 40px rgba(0,200,151,0.15)",
      }}
    >
      <Icon name="Check" className="w-12 h-12" style={{ color: "var(--success)" }} />
    </div>

    {/* Título */}
    <div>
      <h2 className="font-display font-black text-white leading-tight mb-3" style={{ fontSize: "clamp(1.75rem, 7vw, 2.25rem)" }}>
        Tudo pronto,{" "}
        <span style={{ color: "var(--coral)" }}>{firstName}!</span>
      </h2>
      <p className="text-text-muted leading-relaxed max-w-xs mx-auto" style={{ fontSize: 14 }}>
        Seu perfil está completo. Agora é só criar — seu primeiro documento está a poucos cliques de distância.
      </p>
    </div>

    {/* CTA */}
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <button
        onClick={onGo}
        className="w-full flex items-center justify-center gap-2 font-black text-white transition-all border-none cursor-pointer"
        style={{
          padding: "16px 32px",
          borderRadius: 16,
          fontSize: 16,
          background: "var(--coral)",
          boxShadow: "0 12px 32px rgba(233,69,96,0.3)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--coral-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--coral)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Ir ao Dashboard
        <Icon name="ArrowRight" className="w-5 h-5" />
      </button>
      <button
        onClick={onGo}
        className="text-text-muted hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        style={{ fontSize: 12 }}
      >
        Ver mais tarde
      </button>
    </div>
  </div>
);

export default WelcomePage;
