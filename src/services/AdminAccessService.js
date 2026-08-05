import { supabase } from "../lib/supabase";

async function functionErrorMessage(error, fallback) {
  try {
    const payload = await error?.context?.json();
    return payload?.error || fallback;
  } catch {
    return error?.message || fallback;
  }
}

export const AdminAccessService = {
  async changeRole({ targetUserId, role, reason }) {
    const operationId = crypto.randomUUID();
    const { data, error } = await supabase.functions.invoke("admin-access", {
      body: { targetUserId, role, reason, operationId },
    });
    if (error) {
      throw new Error(await functionErrorMessage(error, "Não foi possível alterar o acesso."));
    }
    return data;
  },
};

export default AdminAccessService;
