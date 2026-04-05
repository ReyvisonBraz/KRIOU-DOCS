/**
 * ============================================
 * KRIOU DOCS - Input Sanitization Utilities
 * ============================================
 * Sanitizes user-supplied text before storing
 * or rendering. Prevents XSS and data injection.
 *
 * Does NOT depend on DOMPurify so it works in
 * any environment (including Web Workers).
 * If you add DOMPurify later, replace the
 * stripHtml implementation below.
 *
 * @module utils/sanitization
 */

/**
 * Strip all HTML tags from a string.
 * This is a lightweight alternative to DOMPurify
 * for plain-text fields where no HTML is expected.
 * @param {string} text
 * @returns {string} Text with all HTML tags removed
 */
function stripHtml(text) {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a single text value.
 * - Returns empty string for non-string inputs
 * - Strips HTML tags
 * - Trims leading/trailing whitespace
 * @param {any} value
 * @returns {string}
 */
export function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return stripHtml(value).trim();
}

/**
 * Sanitize all string fields in a flat or nested object.
 * Arrays of objects (e.g. experiencias, formacoes) are handled recursively.
 * @param {Object} data - Form data object
 * @returns {Object} New object with sanitized string values
 */
export function sanitizeFormData(data) {
  if (!data || typeof data !== "object") return data;

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, sanitizeText(value)];
      }
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) =>
            typeof item === "object" && item !== null
              ? sanitizeFormData(item)
              : typeof item === "string"
              ? sanitizeText(item)
              : item
          ),
        ];
      }
      if (typeof value === "object" && value !== null) {
        return [key, sanitizeFormData(value)];
      }
      return [key, value];
    })
  );
}
