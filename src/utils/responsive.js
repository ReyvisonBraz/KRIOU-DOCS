/**
 * ============================================
 * KRIOU DOCS - Responsive Breakpoints
 * ============================================
 * Media query breakpoints and responsive
 * utility styles.
 * 
 * @module utils/responsive
 */

// ─── Breakpoint Values ───
export const BREAKPOINTS = {
  xs: 480,    // Extra small devices
  sm: 640,    // Small tablets
  md: 768,    // Tablets
  lg: 1024,   // Small laptops
  xl: 1280,   // Laptops
  xxl: 1536,  // Large screens
};

// ─── Media Query Helpers ───
export const mediaQueries = {
  xs: `(max-width: ${BREAKPOINTS.xs}px)`,
  sm: `(max-width: ${BREAKPOINTS.sm}px)`,
  md: `(max-width: ${BREAKPOINTS.md}px)`,
  lg: `(max-width: ${BREAKPOINTS.lg}px)`,
  xl: `(max-width: ${BREAKPOINTS.xl}px)`,
  
  // Min-width queries
  minSm: `(min-width: ${BREAKPOINTS.sm + 1}px)`,
  minMd: `(min-width: ${BREAKPOINTS.md + 1}px)`,
  minLg: `(min-width: ${BREAKPOINTS.lg + 1}px)`,
};

// ─── Responsive CSS String ───
export const responsiveStyles = `
  /* ─── Base Responsive Container ─── */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  }

  @media (min-width: 768px) {
    .container {
      padding: 0 24px;
    }
  }

  /* ─── Grid System ─── */
  .grid {
    display: grid;
    gap: 16px;
  }
  
  .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
  
  @media (min-width: 640px) {
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  }
  
  @media (min-width: 1024px) {
    .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  }
  
  @media (min-width: 1280px) {
    .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  }

  /* ─── Hide on Mobile ─── */
  .hide-mobile {
    display: none;
  }
  
  @media (min-width: 768px) {
    .hide-mobile {
      display: block;
    }
  }

  /* ─── Hide on Desktop ─── */
  .hide-desktop {
    display: block;
  }
  
  @media (min-width: 768px) {
    .hide-desktop {
      display: none;
    }
  }

  /* ─── Mobile First Typography ─── */
  .text-xs { font-size: 12px; }
  .text-sm { font-size: 14px; }
  .text-base { font-size: 16px; }
  .text-lg { font-size: 18px; }
  .text-xl { font-size: 20px; }
  .text-2xl { font-size: 24px; }
  .text-3xl { font-size: 30px; }
  .text-4xl { font-size: 36px; }
  
  @media (min-width: 768px) {
    .sm\\:text-xs { font-size: 12px; }
    .sm\\:text-sm { font-size: 14px; }
    .sm\\:text-base { font-size: 16px; }
    .sm\\:text-lg { font-size: 18px; }
    .sm\\:text-xl { font-size: 20px; }
    .sm\\:text-2xl { font-size: 24px; }
    .sm\\:text-3xl { font-size: 30px; }
    .sm\\:text-4xl { font-size: 36px; }
  }

  /* ─── Spacing Responsive ─── */
  .p-2 { padding: 8px; }
  .p-4 { padding: 16px; }
  .p-6 { padding: 24px; }
  .p-8 { padding: 32px; }
  
  @media (min-width: 768px) {
    .sm\\:p-2 { padding: 8px; }
    .sm\\:p-4 { padding: 16px; }
    .sm\\:p-6 { padding: 24px; }
    .sm\\:p-8 { padding: 32px; }
  }

  /* ─── Flex Direction ─── */
  .flex-col { flex-direction: column; }
  .flex-row { flex-direction: row; }
  
  @media (min-width: 768px) {
    .sm\\:flex-col { flex-direction: column; }
    .sm\\:flex-row { flex-direction: row; }
  }

  /* ─── Spacing ─── */
  .gap-1 { gap: 4px; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .gap-6 { gap: 24px; }
  .gap-8 { gap: 32px; }

  /* ─── Stack (vertical stack for mobile, row for desktop) ─── */
  .stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  @media (min-width: 768px) {
    .stack {
      flex-direction: row;
    }
  }

  /* ─── Full Width Mobile ─── */
  .w-full { width: 100%; }
  .w-auto { width: auto; }
  
  @media (min-width: 768px) {
    .sm\\:w-auto { width: auto; }
  }

  /* ─── Mobile Navigation ─── */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 12px;
    display: flex;
    justify-content: space-around;
  }
  
  @media (min-width: 768px) {
    .mobile-nav {
      display: none;
    }
  }

  /* ─── Touch-friendly Buttons ─── */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }

  /* ─── Card Responsive ─── */
  .card-responsive {
    padding: 16px;
  }
  
  @media (min-width: 768px) {
    .card-responsive {
      padding: 24px;
    }
  }

  /* ─── Input Responsive ─── */
  .input-responsive {
    font-size: 16px; /* Prevents zoom on iOS */
    padding: 14px;
  }
  
  @media (min-width: 768px) {
    .input-responsive {
      font-size: 15px;
      padding: 14px 16px;
    }
  }
`;

// ─── Responsive Helper Functions ───
export const getResponsiveValue = (mobileValue, tabletValue, desktopValue) => {
  return {
    xs: mobileValue,
    sm: mobileValue,
    md: tabletValue,
    lg: desktopValue,
    xl: desktopValue,
  };
};

export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
};

export default responsiveStyles;