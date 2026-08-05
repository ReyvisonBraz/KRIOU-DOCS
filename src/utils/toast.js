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
    toast.success(message, { duration: 3500, ...options }),

  error: (message, options = {}) =>
    toast.error(message, { duration: 6000, ...options }),

  info: (message, options = {}) =>
    toast.info(message, { duration: 4000, ...options }),

  warning: (message, options = {}) =>
    toast.warning(message, { duration: 4500, ...options }),

  loading: (message, options = {}) =>
    toast.loading(message, { ...options }),

  promise: (task, options = {}) =>
    toast.promise(task, {
      loading: "Processando...",
      success: "Operação concluída.",
      error: "Não foi possível concluir a operação.",
      ...options,
    }),

  dismiss: (id) => toast.dismiss(id),
};

export default showToast;
