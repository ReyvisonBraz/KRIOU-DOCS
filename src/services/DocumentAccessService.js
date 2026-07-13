import { supabase } from "../lib/supabase";

async function invoke(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) throw new Error(error.message || `Falha ao executar ${functionName}`);
  if (data?.error) throw new Error(data.error);

  return data;
}

export const DocumentAccessService = {
  async authorizeDownload(documentId) {
    if (!documentId) throw new Error("Documento inválido para download");

    const authorization = await invoke("authorize-download", { documentId });
    if (!authorization?.authorized || authorization.documentId !== documentId) {
      throw new Error("Download não autorizado");
    }

    return authorization;
  },
};
