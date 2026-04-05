/**
 * ============================================
 * KRIOU DOCS - Formatting Utilities
 * ============================================
 * Centralized input formatting functions.
 * Use these instead of defining formatters
 * locally in each component/page.
 *
 * @module utils/formatting
 */

/**
 * Format a Brazilian CPF number as the user types.
 * @param {string} value - Raw input value
 * @returns {string} Formatted CPF: 000.000.000-00
 */
export function formatCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Format a Brazilian phone number as the user types.
 * Supports 10-digit (landline) and 11-digit (mobile).
 * @param {string} value - Raw input value
 * @returns {string} Formatted phone: (00) 00000-0000
 */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Format a Brazilian CNPJ number as the user types.
 * @param {string} value - Raw input value
 * @returns {string} Formatted CNPJ: 00.000.000/0000-00
 */
export function formatCnpj(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/**
 * Format a Brazilian CEP (postal code) as the user types.
 * @param {string} value - Raw input value
 * @returns {string} Formatted CEP: 00000-000
 */
export function formatCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Format a value as Brazilian currency (BRL).
 * @param {number} value - Numeric value
 * @returns {string} Formatted currency: R$ 0,00
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format a date string to Brazilian short format.
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date: dd/mm/aaaa
 */
export function formatDate(isoDate) {
  if (!isoDate) return "";
  // Parse YYYY-MM-DD manually to avoid UTC-offset day shift
  const parts = isoDate.split("T")[0].split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("pt-BR");
  }
  return new Date(isoDate).toLocaleDateString("pt-BR");
}
