/**
 * ============================================
 * KRIOU DOCS - Document Code & Person Utils
 * ============================================
 * Codigos sequenciais por tipo de documento,
 * extracao de dados pessoais (nome, CPF, RG).
 */

export const CODE_PREFIX = {
  resume: "CV",
  curriculo: "CV",
  "compra-venda": "CB",
  locacao: "LC",
  procuracao: "PR",
  comodato: "CM",
  doacao: "DC",
  recibo: "RC",
  "uniao-estavel": "UE",
  "autorizacao-viagem": "AV",
  permuta: "PM",
  "prestacao-servicos": "PS",
};

export function getCodePrefix(docType) {
  return CODE_PREFIX[docType] || "DC";
}

export function padCode(num) {
  return String(num).padStart(3, "0");
}

/**
 * Encontra o proximo codigo sequencial para um tipo de documento.
 * Analisa todos os documentos existentes do mesmo tipo e extrai o maior numero.
 *
 * @param {Array}  allDocs  - Todos os documentos do usuario (finalizados + rascunhos)
 * @param {string} docType  - Tipo do documento (resume, compra-venda, etc.)
 * @returns {string} Codigo formatado (ex: "CB-004")
 */
export function generateDocumentCode(allDocs, docType) {
  const prefix = getCodePrefix(docType);
  const sameType = (allDocs || []).filter((doc) => {
    if (docType === "resume" || docType === "curriculo") {
      return doc.type === "resume" || doc.type === "curriculo";
    }
    return doc.documentType === docType;
  });

  let maxNum = 0;
  for (const doc of sameType) {
    if (!doc.code) continue;
    const match = doc.code.match(/^[A-Z]+-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return `${prefix}-${padCode(maxNum + 1)}`;
}

/**
 * Mapeia prefixo de parte principal por tipo de documento juridico.
 */
const PRIMARY_PARTY = {
  "compra-venda": ["vendedor"],
  locacao: ["locador"],
  procuracao: ["outorgante"],
  comodato: ["comodante"],
  doacao: ["doador"],
  recibo: ["recebedor"],
  "uniao-estavel": ["companheiro1"],
  "autorizacao-viagem": ["autorizante"],
  permuta: ["permutante1"],
  "prestacao-servicos": ["contratante"],
};

/**
 * Extrai dados pessoais (nome, CPF, RG) de um documento.
 * Para curriculos, usa formData.nome.
 * Para documentos juridicos, busca a parte principal no legalData.
 *
 * @param {Object} doc - Documento completo
 * @returns {{ nome: string|null, cpf: string|null, rg: string|null }}
 */
export function extractPersonData(doc) {
  if (!doc) return { nome: null, cpf: null, rg: null };

  // Curriculo: pega do formData
  if (doc.type === "resume") {
    const fd = doc.formData || {};
    return {
      nome: fd.nome || null,
      cpf: null,
      rg: null,
    };
  }

  // Documento juridico: busca a parte principal
  if (doc.type === "legal") {
    const data = doc.legalData || {};
    const prefixes = PRIMARY_PARTY[doc.documentType] || [];

    for (const prefix of prefixes) {
      const nome = data[`${prefix}_nome`];
      const cpf = data[`${prefix}_cpf`];
      const rg = data[`${prefix}_rg`];
      if (nome || cpf) {
        return { nome: nome || null, cpf: cpf || null, rg: rg || null };
      }
    }

    // Fallback: procura qualquer campo _nome no legalData
    for (const key of Object.keys(data)) {
      if (key.endsWith("_nome") && data[key]) {
        return {
          nome: data[key],
          cpf: data[key.replace("_nome", "_cpf")] || null,
          rg: data[key.replace("_nome", "_rg")] || null,
        };
      }
    }
  }

  return { nome: null, cpf: null, rg: null };
}

/**
 * Normaliza CPF removendo pontuacao para buscas.
 */
export function normalizeCPF(cpf) {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "");
}

/**
 * Normaliza RG removendo pontuacao para buscas.
 */
export function normalizeRG(rg) {
  if (!rg) return "";
  return rg.replace(/\D/g, "");
}

/**
 * Verifica se uma string parece um CPF (apenas digitos ou com mascara).
 */
export function looksLikeCPF(query) {
  const digits = query.replace(/\D/g, "");
  return digits.length >= 3 && digits.length <= 11 &&
    (query.includes(".") || query.includes("-") || /^\d{3,11}$/.test(digits));
}

/**
 * Verifica se uma string parece um codigo de documento (ex: CV-003).
 */
export function looksLikeCode(query) {
  return /^[A-Z]{2,3}-\d+/i.test(query);
}

/**
 * Remove espaco e normaliza nome para busca.
 */
export function normalizeName(name) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
