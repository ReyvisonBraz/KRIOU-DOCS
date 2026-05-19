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
  color: "var(--danger, #EF4444)",
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
  color: "var(--text, #E8E8F0)",
  marginBottom: "16px",
  paddingBottom: "8px",
  borderBottom: "2px solid var(--border, #2A2A4D)",
};

/** Base input style */
export const INPUT_BASE_STYLE = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1.5px solid var(--border, #2A2A4D)",
  background: "var(--surface-2, #212145)",
  color: "var(--text, #E8E8F0)",
  fontSize: "0.95rem",
  transition: "border-color 0.2s",
  outline: "none",
  boxSizing: "border-box",
};

/** Card container style */
export const CARD_STYLE = {
  background: "var(--surface-2, #212145)",
  borderRadius: "16px",
  border: "1px solid var(--border, #2A2A4D)",
  padding: "16px",
};

/** Page container style */
export const PAGE_CONTAINER_STYLE = {
  minHeight: "100dvh",
  background: "var(--navy, #090914)",
  color: "var(--text, #E8E8F0)",
  fontFamily: "var(--font-body, var(--font-body))",
};

/** Hint text below a field */
export const HINT_STYLE = {
  fontSize: "0.75rem",
  color: "var(--text-muted, #6B6B88)",
  marginTop: "4px",
};
