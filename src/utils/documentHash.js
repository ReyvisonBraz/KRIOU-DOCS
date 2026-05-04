/**
 * ============================================
 * KRIOU DOCS — Document Hash Generator
 * ============================================
 * Generates unique, traceable document codes.
 *
 * Format: KRD-{TYPE}-{VARIANT}-{DATE}-{HASH}
 * Example: KRD-LOC-RES-20260504-A7F3B2C1
 *
 * @module utils/documentHash
 */

/**
 * Simple 32-bit hash function (djb2 variant).
 */
const hashCode = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

/**
 * Generate a short, unique alphanumeric hash (8 chars).
 */
const shortHash = (seed) => {
  const h = hashCode(seed);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  let val = h;
  for (let i = 0; i < 8; i++) {
    result += chars[val % chars.length];
    val = Math.floor(val / chars.length);
    if (val === 0) val = h + i * 7919;
  }
  return result;
};

/**
 * Extract first 3 meaningful chars from a string (uppercased).
 */
const shortCode = (str) => {
  if (!str) return "DEF";
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 3) || "DEF";
};

/**
 * Generate a unique document code.
 *
 * @param {Object}  docType  - Document type definition { id, name }
 * @param {string}  variantId - Variant identifier
 * @returns {string} Document code (e.g. "KRD-LOC-RES-20260504-A7F3B2C1")
 */
export const generateDocumentCode = (docType, variantId = null) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const timestamp = today.getTime().toString(36).slice(-6);
  const random = Math.random().toString(36).slice(2, 6);

  const typeCode = shortCode(docType?.id || docType?.name || "DOC");
  const variantCode = shortCode(variantId || "");

  const seed = `${typeCode}|${variantCode}|${dateStr}|${timestamp}|${random}`;
  const hash = shortHash(seed);

  return `KRD-${typeCode}-${variantCode}-${dateStr}-${hash}`;
};

/**
 * Short version of the code for display in tight spaces.
 * Example: "LOC-20260504-A7F3"
 */
export const shortDocumentCode = (fullCode) => {
  if (!fullCode) return "";
  const parts = fullCode.split("-");
  if (parts.length >= 5) {
    return `${parts[1]}-${parts[3]}-${parts[4]}`;
  }
  if (parts.length >= 4) {
    return `${parts[1]}-${parts[2]}-${parts[3]}`;
  }
  return fullCode;
};

/**
 * Generate a validation URL for the QR code.
 * Example: "https://krioudocs.com.br/v/KRD-LOC-RES-20260504-A7F3B2C1"
 */
export const getValidationURL = (code) => {
  return `https://krioudocs.com.br/v/${code}`;
};

export default {
  generateDocumentCode,
  shortDocumentCode,
  getValidationURL,
};
