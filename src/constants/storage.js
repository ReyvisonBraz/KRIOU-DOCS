/**
 * ============================================
 * KRIOU DOCS - Storage Key Constants
 * ============================================
 * Centralized storage key definitions to avoid
 * typos and hard-coded strings scattered across
 * the codebase.
 *
 * @module constants/storage
 */

/** Prefix for all app keys */
export const STORAGE_PREFIX = "kriou";

/** Per-user key builders */
export const storageKeys = {
  /** User-scoped session: kriou_user_{userId}_session */
  session:   (userId) => `${STORAGE_PREFIX}_user_${userId}_session`,
  /** User-scoped resume draft */
  resumeDraft: (userId) => `${STORAGE_PREFIX}_user_${userId}_draft_resume`,
  /** User-scoped legal draft */
  legalDraft:  (userId) => `${STORAGE_PREFIX}_user_${userId}_draft_legal`,
  /** User-scoped documents list */
  documents:   (userId) => `${STORAGE_PREFIX}_user_${userId}_documents`,
  /** Guest form data (no userId) */
  formData:   () => `${STORAGE_PREFIX}_docs_form_data`,
  /** Guest legal form data */
  legalFormData: () => `${STORAGE_PREFIX}_docs_legal_form_data`,
  /** Template preferences */
  templatePrefs: () => `${STORAGE_PREFIX}_template_preferences`,
};

/** Regex to scan all session keys at boot */
export const SESSION_KEY_PATTERN = new RegExp(
  `^${STORAGE_PREFIX}_user_(.+)_session$`
);
