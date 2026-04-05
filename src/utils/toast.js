/**
 * ============================================
 * KRIOU DOCS - Toast Notifications
 * ============================================
 * Thin wrapper around Sonner to provide
 * consistent toast notifications with app styling.
 *
 * Usage:
 *   import { showToast } from "../utils/toast";
 *   showToast.success("Salvo com sucesso!");
 *   showToast.error("Erro ao gerar PDF.");
 *
 * @module utils/toast
 */

import { toast } from "sonner";

export const showToast = {
  success: (message, options = {}) =>
    toast.success(message, { duration: 3000, ...options }),

  error: (message, options = {}) =>
    toast.error(message, { duration: 5000, ...options }),

  info: (message, options = {}) =>
    toast(message, { duration: 3000, ...options }),

  loading: (message, options = {}) =>
    toast.loading(message, { ...options }),

  dismiss: (id) => toast.dismiss(id),
};

export default showToast;
