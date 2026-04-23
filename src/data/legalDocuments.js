/**
 * ============================================
 * KRIOU DOCS - Legal Documents Data
 * ============================================
 * Ponto central de exportação de todos os documentos jurídicos.
 * Cada tipo de documento está em seu próprio módulo em src/data/documents/.
 *
 * Para adicionar ou editar um tipo de documento, edite o arquivo correspondente:
 *   src/data/documents/comodato.js
 *   src/data/documents/compra-venda.js
 *   src/data/documents/locacao.js
 *   src/data/documents/procuracao.js
 *   src/data/documents/doacao.js
 *   src/data/documents/recibo.js
 *   src/data/documents/uniao-estavel.js
 *   src/data/documents/autorizacao-viagem.js
 *   src/data/documents/permuta.js
 *
 * Campos e helpers compartilhados estão em:
 *   src/data/documents/_shared.js
 *
 * Motor de limpeza gramatical (pt-BR) está em:
 *   src/utils/textCleanup.js
 */

import compraVenda from "./documents/compra-venda.js";
import locacao from "./documents/locacao.js";
import procuracao from "./documents/procuracao.js";
import doacao from "./documents/doacao.js";
import recibo from "./documents/recibo.js";
import uniaoEstavel from "./documents/uniao-estavel.js";
import autorizacaoViagem from "./documents/autorizacao-viagem.js";
import comodato from "./documents/comodato.js";
import permuta from "./documents/permuta.js";
import { applyPortugueseCleanup } from "../utils/textCleanup.js";

// ─── Lista completa de documentos ───────────────────────────────────────────
export const LEGAL_DOCUMENTS = [
  compraVenda,
  locacao,
  procuracao,
  doacao,
  recibo,
  uniaoEstavel,
  autorizacaoViagem,
  comodato,
  permuta,
];

// ─── Helpers para acesso fácil ──────────────────────────────────────────────

/**
 * Busca documento por ID
 */
export const getDocumentById = (id) => LEGAL_DOCUMENTS.find((doc) => doc.id === id);

/**
 * Retorna todos os documentos disponíveis
 */
export const getAvailableDocuments = () => LEGAL_DOCUMENTS.filter((doc) => doc.available);

/**
 * Retorna todas as seções de um documento para uma variante específica,
 * com a ordem correta: partes → seções da variante → seções gerais.
 */
export const getSectionsForVariant = (docId, variantId) => {
  const doc = getDocumentById(docId);
  if (!doc) return [];

  const variantSections = doc.variantSections?.[variantId] || [];
  const commonSections = [...doc.commonSections];

  const partySections = commonSections.filter(
    (s) =>
      s.id.includes("vendedor") ||
      s.id.includes("comprador") ||
      s.id.includes("locador") ||
      s.id.includes("locatario") ||
      s.id.includes("outorgante") ||
      s.id.includes("outorgado") ||
      s.id.includes("doador") ||
      s.id.includes("donatario") ||
      s.id.includes("recebedor") ||
      s.id.includes("pagador") ||
      s.id.includes("companheiro") ||
      s.id.includes("autorizante") ||
      s.id.includes("menor") ||
      s.id.includes("acompanhante") ||
      s.id.includes("comodante") ||
      s.id.includes("comodatario") ||
      s.id.includes("permutante")
  );
  const otherSections = commonSections.filter((s) => !partySections.includes(s));

  return [...partySections, ...variantSections, ...otherSections];
};

/**
 * Retorna todos os campos (flat) para uma variante específica
 */
export const getAllFieldsForVariant = (docId, variantId) => {
  const sections = getSectionsForVariant(docId, variantId);
  return sections.flatMap((s) => s.fields);
};

/**
 * Retorna os campos obrigatórios para uma variante
 */
export const getRequiredFields = (docId, variantId) => {
  return getAllFieldsForVariant(docId, variantId).filter((f) => f.required);
};

// ─── Utilitários de formatação ───────────────────────────────────────────────

/**
 * Formata uma data ISO (YYYY-MM-DD) para o formato extenso pt-BR.
 * Ex: "2026-04-22" → "22 de abril de 2026"
 * @param {string} dateStr - Data no formato ISO ou já formatada
 * @returns {string} - Data formatada em pt-BR
 */
export const formatDateBR = (dateStr) => {
  if (!dateStr) return dateStr;
  // Verifica se já está no formato extenso
  if (/\d{1,2} de \w+ de \d{4}/.test(dateStr)) return dateStr;
  // Tenta parsear ISO (YYYY-MM-DD)
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const mesNome = meses[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} de ${mesNome} de ${year}`;
};

/**
 * Retorna o corpo do documento para uma variante, interpolando os valores do formulário.
 *
 * Sintaxes suportadas nos templates:
 *   {fieldKey}           → obrigatório: mostra [fieldKey] se ausente
 *   {fieldKey?}          → opcional simples: vira \x00 se ausente (limpeza posterior)
 *   {?, texto {field}}   → segmento condicional: remove TUDO se algum field dentro estiver ausente
 *   {caucao_ausente_aviso} → placeholder especial para fallback de garantia locatícia
 *
 * Datas ISO (YYYY-MM-DD) são automaticamente convertidas para extenso pt-BR.
 *
 * O motor de limpeza em src/utils/textCleanup.js remove artefatos gramaticais
 * (palavras órfãs, vírgulas duplas, preposições pendentes, etc.).
 */
export const getDocumentBody = (docId, variantId, formData = {}, disabledFields = {}) => {
  const doc = getDocumentById(docId);
  if (!doc?.documentBody) return null;

  const template = doc.documentBody[variantId];
  if (!template) return null;

  // Verifica se um campo está ausente (desabilitado ou vazio)
  const isAbsent = (key) =>
    disabledFields[key] || !formData[key] || String(formData[key]).trim() === "";

  /**
   * Formata o valor de um campo antes de inserir no template.
   * Datas ISO são convertidas para pt-BR extenso.
   */
  const formatFieldValue = (key, value) => {
    if (!value) return value;
    // Campos de data: formata para extenso pt-BR
    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return formatDateBR(str);
    return str;
  };

  /**
   * Interpola o texto e limpa artefatos gramaticais.
   * Opera em 6 passos para garantir ordem correta de substituição.
   */
  const interpolateAdaptive = (text) => {
    // ── Passo especial: placeholder de aviso de garantia ausente ──────────
    // {caucao_ausente_aviso} → texto explicativo quando caução não está preenchida
    let result = text.replace(/\{caucao_ausente_aviso\}/g, () => {
      const caucaoPreenchida = !isAbsent("valor_caucao");
      if (caucaoPreenchida) return ""; // já tem cláusula com valor — sem aviso
      return "As partes acordam, de forma expressa e consensual, que não será exigida qualquer modalidade de garantia locatícia (caução, fiança, seguro de fiança ou cessão fiduciária), ficando o contrato desprovido de garantia, nos termos do artigo 37 da Lei 8.245/91.";
    });

    // ── Passo 0: segmentos "qualquer campo" {?any, ...} ──────────────────
    // Renderiza o segmento se PELO MENOS UM campo opcional ({field?}) tiver valor.
    // Campos opcionais dentro: {field?} → valor ou \x00 se ausente.
    // Útil para blocos com prefixo fixo (ex: "residente em {endereco?}, {cidade?}"):
    // garante que o prefixo só apareça quando ao menos um dado estiver preenchido.
    result = result.replace(
      /\{\?any,\s*((?:[^{}]|\{[^}]*\})*)\}/g,
      (_, segment) => {
        // Coleta todas as chaves referenciadas (com ou sem ?)
        const keys = [];
        segment.replace(/\{(\w+)\??\}/g, (__, k) => keys.push(k));

        // Remove o segmento inteiro se TODOS os campos estiverem ausentes
        if (keys.length === 0 || keys.every(isAbsent)) return "";

        // Pelo menos um campo presente: interpola opcionais ({field?} → valor ou \x00)
        return segment.replace(/\{(\w+)\?\}/g, (__, k) =>
          isAbsent(k) ? "\x00" : (formatFieldValue(k, formData[k]) || "")
        );
        // Nota: {field} sem ? dentro de {?any} serão tratados no Passo 3
      }
    );

    // ── Passo 1: segmentos condicionais {?, ...{field1}... {field2}...} ─────
    // Remove o segmento inteiro se QUALQUER campo dentro estiver ausente.
    // Suporta múltiplos campos no mesmo segmento.
    result = result.replace(
      /\{\?,\s*((?:[^{}]|\{[^}]*\})*)\}/g,
      (_, segment) => {
        // Coleta todas as chaves de campo referenciadas dentro do segmento
        const keys = [];
        segment.replace(/\{(\w+)\}/g, (__, k) => keys.push(k));

        // Remove o segmento se qualquer chave estiver ausente
        if (keys.length === 0 || keys.some(isAbsent)) return "";

        // Interpola todos os campos dentro do segmento, com formatação
        return segment.replace(/\{(\w+)\}/g, (__, k) =>
          formatFieldValue(k, formData[k]) || ""
        );
      }
    );

    // ── Passo 2: campos opcionais simples {fieldKey?} ─────────────────────
    // Converte campos ausentes em marcador \x00 para limpeza posterior
    result = result.replace(/\{(\w+)\?\}/g, (_, key) => {
      if (isAbsent(key)) return "\x00";
      return formatFieldValue(key, formData[key]);
    });

    // ── Passo 3: campos obrigatórios {fieldKey} ───────────────────────────
    // Mostra o valor ou [fieldKey] se ausente (indica que o campo é obrigatório)
    result = result.replace(/\{(\w+)\}/g, (_, key) =>
      formatFieldValue(key, formData[key]) || `[${key}]`
    );

    // ── Passo 4: limpeza gramatical ───────────────────────────────────────
    // Remove palavras órfãs e artefatos deixados pelo marcador \x00
    result = applyPortugueseCleanup(result);

    return result;
  };

  return template.map((block) => {
    switch (block.type) {
      case "title":
      case "paragraph":
      case "closing":
      case "date":
        return { ...block, text: interpolateAdaptive(block.text) };

      case "clause": {
        const interpolatedText = block.text
          ? interpolateAdaptive(block.text)
          : undefined;
        const interpolatedParagraphs = block.paragraphs
          ? block.paragraphs
              .map(interpolateAdaptive)
              // Remove parágrafos que ficaram completamente vazios após interpolação
              .filter((p) => p.trim() !== "")
          : undefined;

        // Se a cláusula ficou sem nenhum conteúdo após interpolação,
        // descarta o bloco inteiro para não renderizar um título órfão.
        const hasContent =
          (interpolatedText && interpolatedText.trim() !== "") ||
          (interpolatedParagraphs && interpolatedParagraphs.length > 0);

        if (!hasContent) return null;

        return {
          ...block,
          text: interpolatedText,
          paragraphs: interpolatedParagraphs,
        };
      }

      case "signatures":
        return {
          ...block,
          parties: block.parties.map((p) => ({
            ...p,
            name: formData[p.fieldKey] || "[Nome não informado]",
          })),
        };

      default:
        return block;
    }
  }).filter(Boolean); // Remove blocos nulos (cláusulas sem conteúdo)
};

/**
 * Valida os campos preenchidos de um documento
 */
export const validateFields = (docId, variantId, formData, disabledFields = {}) => {
  const required = getRequiredFields(docId, variantId);
  const errors = {};

  required.forEach((f) => {
    if (disabledFields[f.key]) return; // campo desabilitado, não valida
    const value = formData[f.key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors[f.key] = `${f.label} é obrigatório`;
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
};
