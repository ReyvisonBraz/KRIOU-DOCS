/**
 * ============================================
 * KRIOU DOCS - Shared Style Constants
 * ============================================
 * Centralized style objects used across pages
 * and components. Import from here instead of
 * redefining inline in each file.
 *
 * @module constants/styles
 */

/** Label style for form fields */
export const LABEL_STYLE = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: "600",
  color: "var(--text-muted)",
  marginBottom: "6px",
  letterSpacing: "0.03em",
  textTransform: "uppercase",
};

/** Error message style for validation feedback */
export const ERROR_STYLE = {
  color: "#ef4444",
  fontSize: "0.78rem",
  marginTop: "5px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

/** Section title style for form groups */
export const SECTION_TITLE_STYLE = {
  fontSize: "1rem",
  fontWeight: "700",
  color: "var(--text-primary)",
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: "2px solid var(--border-color, #2A2A4A)",
};

/** Base input style */
export const INPUT_BASE_STYLE = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1.5px solid var(--border-color, #2A2A4A)",
  background: "var(--bg-secondary, #1E1E36)",
  color: "var(--text-primary, #F0F0F5)",
  fontSize: "0.95rem",
  transition: "border-color 0.2s",
  outline: "none",
  boxSizing: "border-box",
};

/** Card container style */
export const CARD_STYLE = {
  background: "var(--bg-secondary, #1E1E36)",
  borderRadius: "16px",
  border: "1px solid var(--border-color, #2A2A4A)",
  padding: "16px",
};

/** Glass card style (used in navbars and overlays) */
export const GLASS_STYLE = {
  background: "rgba(15, 15, 30, 0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

/** Page container style */
export const PAGE_CONTAINER_STYLE = {
  minHeight: "100vh",
  background: "var(--bg-primary, #0F0F1E)",
  color: "var(--text-primary, #F0F0F5)",
  fontFamily: "var(--font-body, 'Plus Jakarta Sans', sans-serif)",
};

/** Hint text below a field */
export const HINT_STYLE = {
  fontSize: "0.75rem",
  color: "var(--text-muted, #8888A8)",
  marginTop: "4px",
};
