/**
 * ============================================
 * KRIOU DOCS - PrivacyService
 * ============================================
 * Direitos do titular previstos na LGPD.
 *
 * Hoje cobre apenas a exportação de dados. A exclusão de conta virá aqui
 * também, quando os prazos de retenção estiverem definidos — ver a frente
 * F2 do ROADMAP.md.
 */

import { supabase } from "../lib/supabase";

async function invoke(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) throw new Error(error.message || `Falha ao executar ${functionName}`);
  if (data?.error) throw new Error(data.error);

  return data;
}

/** Nome do arquivo com a data no formato brasileiro: kriou-docs-meus-dados-2026-08-08.json */
export function buildExportFilename(date = new Date()) {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  return `kriou-docs-meus-dados-${date.getFullYear()}-${mes}-${dia}.json`;
}

/**
 * Dispara o download de um objeto como arquivo JSON.
 * Isolado do resto para poder ser testado e para deixar claro que a
 * exportação nunca passa por servidor de terceiro — o arquivo é montado
 * no próprio navegador do titular.
 */
export function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Sem isto o blob fica retido em memória enquanto a aba estiver aberta.
  URL.revokeObjectURL(url);
}

export const PrivacyService = {
  /** Busca no servidor tudo que a plataforma guarda sobre o titular. */
  exportMyData() {
    return invoke("export-user-data", {});
  },

  /**
   * Exporta e entrega o arquivo ao titular, em um passo.
   * Devolve o conteúdo exportado, para quem quiser inspecionar ou testar.
   */
  async downloadMyData() {
    const dados = await PrivacyService.exportMyData();
    downloadJson(dados, buildExportFilename());
    return dados;
  },
};

export default PrivacyService;
