/**
 * ============================================
 * KRIOU DOCS - AdminService
 * ============================================
 * Painel administrativo. Todas as ações passam pela Edge Function `admin`,
 * que confere o papel de administrador no servidor a cada chamada.
 */

import { supabase } from "../lib/supabase";

async function invoke(action, params = {}) {
  const { data, error } = await supabase.functions.invoke("admin", {
    body: { action, ...params },
  });

  if (error) throw new Error(error.message || `Falha ao executar admin/${action}`);
  if (data?.error) throw new Error(data.error);

  return data;
}

export const AdminService = {
  getStats() {
    return invoke("stats");
  },

  /** Retorna { users, total, page, pageSize }. */
  getUsers({ page = 1, pageSize = 20, search = "" } = {}) {
    return invoke("users", { page, pageSize, search });
  },

  getUserDocs(userId) {
    if (!userId) throw new Error("userId é obrigatório");
    return invoke("user-docs", { userId });
  },
};

export default AdminService;
