/**
 * ============================================
 * KRIOU DOCS - Welcome / Onboarding Page
 * ============================================
 * Exibida uma única vez após o primeiro cadastro.
 * Apresenta as funcionalidades do app em 3 slides
 * interativos antes de enviar ao dashboard.
 */

import React, { useState, useCallback } from "react";
import { Icon } from "../components/Icons";
import { DocumentService } from "../services/DocumentService";

// ─── Dados dos slides ────────────────────────────────────────────────────────

const slides = [
  {
    id: "welcome",
    emoji: "👋",
    badge: null,
    title: (nome) => (
      <>
        Olá, <span className="text-coral">{nome}</span>!
      </>
    ),
    subtitle: "Bem-vindo ao Kriou Docs",
    description:
      "A plataforma que cria documentos profissionais em minutos — sem complicação, sem burocracia.",
    features: [
      { icon: "Zap", text: "Rápido e intuitivo", color: "text-teal" },
      { icon: "Shield", text: "Seguro e confiável", color: "text-purple" },
      { icon: "Save", text: "Salvamento automático", color: "text-gold" },
    ],
  },
  {
    id: "features",
    emoji: "📄",
    badge: "O que você pode fazer",
    title: () => "Tudo que você precisa",
    subtitle: "em um só lugar",
    description: null,
    cards: [
      {
        icon: "Layout",
        title: "Currículos",
        desc: "5 modelos profissionais com wizard guiado de 7 etapas",
        color: "bg-coral/10",
        iconColor: "text-coral",
        available: true,
        tag: "Disponível",
      },
      {
        icon: "FileText",
        title: "Contratos",
        desc: "Contratos jurídicos validados para diversas situações",
        color: "bg-teal/10",
        iconColor: "text-teal",
        available: true,
        tag: "Disponível",
      },
      {
        icon: "MessageCircle",
        title: "Entrega WhatsApp",
        desc: "Receba seus documentos prontos direto no WhatsApp",
        color: "bg-success/10",
        iconColor: "text-success",
        available: false,
        tag: "Em breve",
      },
    ],
  },
  {
    id: "start",
    emoji: "🚀",
    badge: null,
    title: () => "Tudo pronto!",
    subtitle: "Que tal começar agora?",
    description:
      "Crie seu primeiro documento em menos de 5 minutos. É simples, rápido e profissional.",
    stats: [
      { number: "12+", label: "Tipos de documentos" },
      { number: "5", label: "Modelos de currículo" },
      { number: "< 5min", label: "Tempo médio" },
    ],
  },
];

// ─── Componente do Slide 1: Boas-vindas ──────────────────────────────────────

const WelcomeSlide = ({ slide, nome }) => (
  <div className="flex flex-col items-center text-center animate-fadeUp">
    {/* Emoji grande */}
    <div className="text-6xl md:text-7xl mb-6 animate-scaleIn">
      {slide.emoji}
    </div>

    {/* Título */}
    <h1 className="font-display text-3xl md:text-4xl font-black mb-2 tracking-tight text-white">
      {slide.title(nome)}
    </h1>
    <p className="text-lg md:text-xl text-coral font-semibold mb-4">
      {slide.subtitle}
    </p>

    {/* Descrição */}
    <p className="text-text-muted text-base md:text-lg max-w-md leading-relaxed mb-10">
      {slide.description}
    </p>

    {/* Features mini */}
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      {slide.features.map((f, i) => (
        <div
          key={i}
          className="flex-1 flex items-center gap-3 bg-surface-2 border border-border rounded-2xl px-4 py-3.5 animate-fadeUp"
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        >
          <div className="w-10 h-10 rounded-xl bg-surface-3 flex items-center justify-center flex-shrink-0">
            <Icon name={f.icon} className={`w-5 h-5 ${f.color}`} />
          </div>
          <span className="text-sm font-semibold text-text">{f.text}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Componente do Slide 2: Features ─────────────────────────────────────────

const FeaturesSlide = ({ slide }) => (
  <div className="flex flex-col items-center text-center animate-fadeUp">
    <div className="text-5xl md:text-6xl mb-6 animate-scaleIn">
      {slide.emoji}
    </div>

    {/* Badge */}
    <div className="bg-surface-2 border border-border rounded-full px-5 py-2 mb-6">
      <span className="text-teal text-xs md:text-sm font-semibold tracking-wide uppercase">
        {slide.badge}
      </span>
    </div>

    <h1 className="font-display text-3xl md:text-4xl font-black mb-1 tracking-tight text-white">
      {slide.title()}
    </h1>
    <p className="text-lg text-text-muted mb-10">{slide.subtitle}</p>

    {/* Cards de features */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
      {slide.cards.map((card, i) => (
        <div
          key={i}
          className="relative bg-surface border border-border rounded-2xl p-5 flex flex-col items-center text-center animate-fadeUp group hover:border-coral/40 transition-all duration-300"
          style={{ animationDelay: `${0.15 + i * 0.1}s` }}
        >
          {/* Tag */}
          <div
            className={`absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              card.available
                ? "bg-success/20 text-success"
                : "bg-surface-3 text-text-muted"
            }`}
          >
            {card.tag}
          </div>

          <div
            className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon name={card.icon} className={`w-6 h-6 ${card.iconColor}`} />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">
            {card.title}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {card.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Componente do Slide 3: Começo ───────────────────────────────────────────

const StartSlide = ({ slide }) => (
  <div className="flex flex-col items-center text-center animate-fadeUp">
    <div className="text-6xl md:text-7xl mb-6 animate-scaleIn">
      {slide.emoji}
    </div>

    <h1 className="font-display text-3xl md:text-4xl font-black mb-2 tracking-tight text-white">
      {slide.title()}
    </h1>
    <p className="text-lg text-coral font-semibold mb-4">{slide.subtitle}</p>

    <p className="text-text-muted text-base md:text-lg max-w-md leading-relaxed mb-10">
      {slide.description}
    </p>

    {/* Stats */}
    <div className="flex justify-center gap-8 md:gap-14 mb-6">
      {slide.stats.map((stat, i) => (
        <div
          key={i}
          className="text-center animate-fadeUp"
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        >
          <div className="font-display text-3xl md:text-4xl font-black text-coral">
            {stat.number}
          </div>
          <div className="text-xs text-text-muted mt-1 font-medium tracking-wide uppercase">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Slide renderer ──────────────────────────────────────────────────────────

const SlideRenderer = ({ index, nome }) => {
  const slide = slides[index];
  switch (slide.id) {
    case "welcome":
      return <WelcomeSlide slide={slide} nome={nome} />;
    case "features":
      return <FeaturesSlide slide={slide} />;
    case "start":
      return <StartSlide slide={slide} />;
    default:
      return null;
  }
};

// ─── Página Principal ────────────────────────────────────────────────────────

const WelcomePage = ({ onNavigate, displayName }) => {
  const [current, setCurrent] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const total = slides.length;
  const isLast = current === total - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      // Finaliza onboarding e vai pro dashboard
      setIsFinishing(true);
      DocumentService.markOnboardingDone()
        .catch((err) =>
          console.warn("[Welcome] Erro ao marcar onboarding:", err)
        )
        .finally(() => {
          onNavigate("dashboard");
        });
    } else {
      setCurrent((c) => c + 1);
    }
  }, [isLast, onNavigate]);

  const handleSkip = useCallback(() => {
    setIsFinishing(true);
    DocumentService.markOnboardingDone()
      .catch((err) =>
        console.warn("[Welcome] Erro ao marcar onboarding:", err)
      )
      .finally(() => {
        onNavigate("dashboard");
      });
  }, [onNavigate]);

  const nome = displayName?.split(" ")[0] || "Usuário";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-navy relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-coral/8 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Logo no topo */}
      <div className="absolute top-6 left-6 font-display text-xl font-black">
        <span className="text-coral">Kriou</span>
        <span className="text-white ml-0.5">Docs</span>
      </div>

      {/* Botão Pular */}
      {!isLast && (
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-text-muted text-sm font-medium hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          Pular
        </button>
      )}

      {/* Container principal */}
      <div className="w-full max-w-[600px] relative z-10">
        {/* Slide atual */}
        <div key={current} className="min-h-[420px] flex items-center justify-center">
          <SlideRenderer index={current} nome={nome} />
        </div>

        {/* Controles de navegação */}
        <div className="flex flex-col items-center gap-6 mt-8">
          {/* Dots / Indicadores */}
          <div className="flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 border-none cursor-pointer ${
                  i === current
                    ? "w-8 h-2.5 bg-coral shadow-lg shadow-coral/30"
                    : "w-2.5 h-2.5 bg-surface-3 hover:bg-border"
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Botão principal */}
          <button
            onClick={handleNext}
            disabled={isFinishing}
            className="w-full max-w-xs py-4 bg-coral hover:bg-coral-light text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-lg shadow-coral/20 hover:shadow-coral/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none cursor-pointer"
          >
            {isFinishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Preparando...
              </>
            ) : isLast ? (
              <>
                <Icon name="Zap" className="w-5 h-5" />
                Começar a criar
              </>
            ) : (
              <>
                Próximo
                <Icon name="ChevronRight" className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Texto auxiliar no último slide */}
          {isLast && (
            <p className="text-xs text-text-muted text-center animate-fadeIn">
              Seu primeiro documento está a poucos cliques de distância ✨
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
