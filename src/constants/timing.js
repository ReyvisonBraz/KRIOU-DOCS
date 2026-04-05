/**
 * ============================================
 * KRIOU DOCS - Timing Constants
 * ============================================
 * Centralized timing values to replace magic
 * numbers and keep debounce/delay behaviour
 * consistent across the app.
 *
 * @module constants/timing
 */

/** Auto-save debounce delay (ms) — used in AppContext and useAutoSave */
export const DEBOUNCE_AUTOSAVE_MS = 1500;

/** Delay after save to show "saved" status (ms) */
export const SAVE_FEEDBACK_DELAY_MS = 800;

/** App initialisation delay before reading localStorage (ms) */
export const APP_INIT_DELAY_MS = 100;

/** Redirect delay after login (ms) */
export const LOGIN_REDIRECT_DELAY_MS = 500;
