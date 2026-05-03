/**
 * ============================================
 * KRIOU DOCS - Theme Configuration
 * ============================================
 * Design direction: Luxury Refined + Bold Editorial
 *
 * Physical scene: A professional working from home or office,
 * natural light by day, warm ambient lighting at night.
 * Mood: focused, confident, authoritative.
 *
 * Color strategy: Deep navy as anchor, coral as energetic accent,
 * warm gold for prestige touches. Teal reserved for success/positive states.
 */

import React from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const colors = {
  // Surfaces (dark navy spectrum)
  navy:         "#090914",
  navyLight:    "#111127",
  base:         "#14142B",
  surface:      "#1A1A36",
  surface2:     "#212145",
  surface3:     "#2A2A52",

  // Accent
  coral:        "#F43F5E",
  coralHover:   "#FB7185",
  coralMuted:   "rgba(244,63,94,0.12)",

  // Gold (prestige / secondary)
  gold:         "#D4AF37",
  goldMuted:    "rgba(212,175,55,0.10)",

  // Teal (success / legal)
  teal:         "#14B8A6",
  tealMuted:    "rgba(20,184,166,0.10)",

  // Text
  text:         "#E8E8F0",
  textDim:      "#A0A0B8",
  textMuted:    "#6B6B88",
  textFaint:    "#484866",

  // Border
  border:       "#2A2A4D",
  borderHover:  "#3D3D66",

  // Status
  success:      "#10B981",
  warning:      "#F59E0B",
  danger:       "#EF4444",
};

export const fonts = {
  display: "'Outfit', sans-serif",
  body:    "'Plus Jakarta Sans', sans-serif",
};

export const radii = {
  sm:    "10px",
  md:    "14px",
  lg:    "20px",
  xl:    "24px",
  full:  "9999px",
};

export const shadows = {
  card:       "0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.15)",
  elevated:   "0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.2)",
  button:     "0 2px 8px rgba(244,63,94,0.25)",
  buttonHover:"0 6px 24px rgba(244,63,94,0.35)",
  glow:       "0 0 40px rgba(244,63,94,0.15)",
};

export const theme = { colors, fonts, radii, shadows };

// ─── ThemeProvider ─────────────────────────────────────────────────────────────
export const ThemeProvider = ({ children }) => {
  return (
    <div className="theme-provider-root">
      {children}
    </div>
  );
};
