/**
 * ============================================
 * KRIOU DOCS - Theme & Global Styles
 * ============================================
 * Centralized CSS-in-JS styles and theme
 * configuration for consistent application
 * appearance.
 */

import React from "react";

// ─── Configuração do Tema ───
const theme = {
  colors: {
    navy: "#0F0F1E",
    navyLight: "#1A1A2E",
    blue: "#0F3460",
    coral: "#E94560",
    coralLight: "#FF6B81",
    purple: "#533483",
    teal: "#00D2D3",
    gold: "#F9A825",
    surface: "#16162A",
    surface2: "#1E1E36",
    surface3: "#26264A",
    text: "#F0F0F5",
    textMuted: "#8888A8",
    border: "#2A2A4A",
    success: "#00C897",
  },
  fonts: {
    display: "'Outfit', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
};

// ─── String de Estilos CSS ───
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --navy: #0F0F1E;
    --navy-light: #1A1A2E;
    --blue: #0F3460;
    --coral: #E94560;
    --coral-light: #FF6B81;
    --purple: #533483;
    --teal: #00D2D3;
    --gold: #F9A825;
    --surface: #16162A;
    --surface-2: #1E1E36;
    --surface-3: #26264A;
    --text: #F0F0F5;
    --text-muted: #8888A8;
    --border: #2A2A4A;
    --success: #00C897;
    --font-display: 'Outfit', sans-serif;
    --font-body: 'Plus Jakarta Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body, #root { 
    font-family: var(--font-body); 
    background: var(--navy); 
    color: var(--text); 
  }

  .font-display { font-family: var(--font-display); }

  /* ─── Animations ─── */
  @keyframes fadeUp { 
    from { opacity:0; transform: translateY(24px) } 
    to { opacity:1; transform: translateY(0) } 
  }
  
  @keyframes fadeIn { 
    from { opacity:0 } 
    to { opacity:1 } 
  }
  
  @keyframes slideRight { 
    from { opacity:0; transform: translateX(-20px) } 
    to { opacity:1; transform: translateX(0) } 
  }
  
  @keyframes slideLeft { 
    from { opacity:0; transform: translateX(20px) } 
    to { opacity:1; transform: translateX(0) } 
  }
  
  @keyframes pulse-glow { 
    0%,100% { box-shadow: 0 0 20px rgba(233,69,96,0.3) } 
    50% { box-shadow: 0 0 40px rgba(233,69,96,0.6) } 
  }
  
  @keyframes float { 
    0%,100% { transform: translateY(0) } 
    50% { transform: translateY(-10px) } 
  }
  
  @keyframes shimmer { 
    0% { background-position: -200% 0 } 
    100% { background-position: 200% 0 } 
  }
  
  @keyframes typing { 
    0%,100% { opacity:.3 } 
    50% { opacity:1 } 
  }
  
  @keyframes scaleIn { 
    from { opacity:0; transform: scale(0.9) } 
    to { opacity:1; transform: scale(1) } 
  }
  
  @keyframes checkmark { 
    0% { stroke-dashoffset: 100 } 
    100% { stroke-dashoffset: 0 } 
  }
  
  @keyframes confetti { 
    0% { transform: translateY(0) rotate(0); opacity:1 } 
    100% { transform: translateY(400px) rotate(720deg); opacity:0 } 
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ─── Animation Utilities ─── */
  .animate-fadeUp { animation: fadeUp .6s ease both }
  .animate-fadeIn { animation: fadeIn .5s ease both }
  .animate-slideRight { animation: slideRight .5s ease both }
  .animate-slideLeft { animation: slideLeft .5s ease both }
  .animate-scaleIn { animation: scaleIn .4s ease both }
  .animate-pulse { animation: pulse 2s ease-in-out infinite }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite }
  .animate-spin { animation: spin 1s linear infinite }

  .delay-1 { animation-delay: .1s }
  .delay-2 { animation-delay: .2s }
  .delay-3 { animation-delay: .3s }
  .delay-4 { animation-delay: .4s }
  .delay-5 { animation-delay: .5s }
  .delay-6 { animation-delay: .6s }

  /* ─── Button Styles ─── */
  .btn-primary {
    background: linear-gradient(135deg, var(--coral), #D63851);
    color: white; border: none; border-radius: 12px; padding: 14px 32px;
    font-weight: 700; font-size: 15px; cursor: pointer; transition: all .25s;
    font-family: var(--font-body); letter-spacing: 0.3px;
  }
  .btn-primary:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 8px 30px rgba(233,69,96,0.4); 
  }
  .btn-primary:active { 
    transform: translateY(0); 
  }

  .btn-secondary {
    background: var(--surface-2); 
    color: var(--text); 
    border: 1px solid var(--border);
    border-radius: 12px; 
    padding: 14px 32px; 
    font-weight: 600; 
    font-size: 15px;
    cursor: pointer; 
    transition: all .25s; 
    font-family: var(--font-body);
  }
  .btn-secondary:hover { 
    background: var(--surface-3); 
    border-color: var(--coral); 
  }

  .btn-small {
    padding: 8px 18px; 
    font-size: 13px; 
    border-radius: 8px;
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-muted);
    border: none;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    transition: color .2s;
  }
  .btn-ghost:hover { color: var(--text); }

  /* ─── Card Styles ─── */
  .card {
    background: var(--surface); 
    border: 1px solid var(--border); 
    border-radius: 16px;
    padding: 24px; 
    transition: all .3s;
  }
  .card:hover { 
    border-color: var(--coral); 
    transform: translateY(-3px); 
    box-shadow: 0 12px 40px rgba(0,0,0,0.3); 
  }

  .card-static {
    background: var(--surface); 
    border: 1px solid var(--border); 
    border-radius: 16px;
    padding: 24px;
  }

  /* ─── Input Styles ─── */
  .input-field {
    width: 100%; 
    background: var(--surface-2); 
    border: 1.5px solid var(--border);
    border-radius: 10px; 
    padding: 14px 16px; 
    color: var(--text); 
    font-size: 15px;
    font-family: var(--font-body); 
    transition: all .25s; 
    outline: none;
  }
  .input-field:focus { 
    border-color: var(--coral); 
    box-shadow: 0 0 0 3px rgba(233,69,96,0.15); 
  }
  .input-field::placeholder { 
    color: var(--text-muted); 
  }

  /* ─── Utility Classes ─── */
  .glass { 
    background: rgba(22,22,42,0.8); 
    backdrop-filter: blur(20px); 
    -webkit-backdrop-filter: blur(20px); 
  }

  .gradient-text {
    background: linear-gradient(135deg, var(--coral), var(--coral-light), var(--teal));
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .watermark {
    position: absolute; 
    top: 50%; 
    left: 50%; 
    transform: translate(-50%,-50%) rotate(-35deg);
    font-size: 48px; 
    font-weight: 900; 
    color: rgba(233,69,96,0.12); 
    white-space: nowrap;
    pointer-events: none; 
    user-select: none; 
    letter-spacing: 8px;
  }

  /* ─── Scrollbar ─── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--navy); }
  ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 3px; }

  /* ─── Focus States ─── */
  .focus-ring:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(233,69,96,0.3);
  }

  /* ─── Label Style ─── */
  .label {
    font-size: 12px; 
    font-weight: 600; 
    color: var(--text-muted); 
    margin-bottom: 6px; 
    display: block; 
    text-transform: uppercase; 
    letter-spacing: 0.5px;
  }

  /* ─── Responsive Utilities ─── */
  @media (max-width: 767px) {
    .hide-mobile { display: none !important; }
    .container { padding: 0 16px; }
    .card { padding: 16px; }
    .btn-primary, .btn-secondary { padding: 12px 20px; font-size: 14px; }
    .text-responsive { font-size: 14px; }
    .font-display { font-size: 24px !important; }
  }

  @media (min-width: 768px) {
    .hide-desktop { display: none !important; }
  }

  /* ─── Mobile Touch Targets ─── */
  @media (max-width: 767px) {
    .touch-target {
      min-height: 48px;
      min-width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    input, textarea, select {
      font-size: 16px; /* Prevents iOS zoom */
    }
  }

  /* ─── Responsive Layout ─────────────────────────────
   * 375px  — iPhone SE / small Android
   * 390px  — iPhone 14/15
   * 768px  — tablet portrait
   * 1280px — desktop
   * ────────────────────────────────────────────────── */

  /* ── 375–767px : mobile ── */
  @media (max-width: 767px) {

    /* Headings */
    h1 { font-size: clamp(26px, 7vw, 36px) !important; letter-spacing: -0.5px !important; }
    h2 { font-size: clamp(20px, 5vw, 28px) !important; }
    h3 { font-size: clamp(16px, 4vw, 20px) !important; }

    /* Section padding — prevents content touching edges at 375px */
    section, .page-section {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }

    /* Hero vertical breathing room */
    .hero-section {
      padding-top: 48px !important;
      padding-bottom: 40px !important;
    }

    /* CTA button groups — stack vertically on small screens */
    .cta-group {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 10px !important;
    }
    .cta-group .btn-primary,
    .cta-group .btn-secondary {
      width: 100%;
      justify-content: center;
    }

    /* Stats row — tighter gap */
    .stats-row {
      gap: 24px !important;
      flex-wrap: wrap;
    }

    /* Card grid — single column */
    .grid-auto { grid-template-columns: 1fr !important; }

    /* Dashboard — reduce top padding */
    .dashboard-content { padding: 20px 16px 24px !important; }

    /* Tabs — always scrollable, no overflow bleed */
    .tabs-row {
      gap: 4px !important;
      padding-bottom: 4px;
    }

    /* AppNavbar title font size */
    .app-navbar-title { font-size: 0.85rem !important; }

    /* Wizard bottom nav buttons — full width */
    .bottom-nav-btn { font-size: 0.85rem !important; padding: 12px 16px !important; }

    /* Preview / checkout pages — remove horizontal padding */
    .preview-container, .checkout-container {
      padding-left: 12px !important;
      padding-right: 12px !important;
    }

    /* Profile / legal editor / editor containers */
    .page-container { padding: 16px 16px 100px !important; }

    /* Form inputs — ensure readable size, prevent iOS zoom */
    .input-field { font-size: 16px !important; padding: 12px 14px !important; }

    /* Variant selector — force single column */
    .variant-selector { flex-direction: column !important; }
    .variant-selector > button { max-width: 100% !important; flex: 1 1 100% !important; }

    /* Legal section header — tighten margins */
    .section-header-inner { gap: 10px !important; padding: 12px 0 8px !important; }

    /* DocumentCard title truncate on narrow widths */
    .doc-card-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    /* Landing hero stats — 2-col wrap on 375px */
    .hero-stats { gap: 28px 40px !important; }
    .hero-stats > div { min-width: 80px; }
  }

  /* ── 390–767px : iPhone 14/15 slight adjustment ── */
  @media (min-width: 376px) and (max-width: 767px) {
    h1 { font-size: clamp(28px, 7vw, 38px) !important; }
  }

  /* ── 768–1279px : tablet ── */
  @media (min-width: 768px) and (max-width: 1279px) {

    /* Tablet padding for page containers */
    .page-container { padding: 24px 24px 120px !important; }
    .dashboard-content { padding: 28px 24px !important; }

    /* Grid collapses to 2 columns */
    .grid-auto { grid-template-columns: repeat(2, 1fr) !important; }

    /* Hero section */
    .hero-section { padding: 60px 32px 48px !important; }
  }

  /* ── 1280px+ : desktop refinements ── */
  @media (min-width: 1280px) {
    .page-container { padding: 32px 32px 120px !important; }
    .dashboard-content { padding: 40px 32px !important; }
  }

  /* ── Transição de página ── */
  @keyframes pageEnter {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .page-enter {
    animation: pageEnter 0.18s ease-out both;
  }

  /* ── Reduced motion — respect user preference ── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Componente Provider do Tema ───
export const ThemeProvider = ({ children }) => {
  return (
    <>
      <style>{globalStyles}</style>
      {children}
    </>
  );
};

// ─── Exportar tema para uso em componentes ───
export { theme };

// ─── Exportação Padrão ───
export default globalStyles;