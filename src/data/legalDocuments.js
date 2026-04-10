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

/**
 * Retorna o corpo do documento para uma variante, interpolando os valores do formulário.
 *
 * Sintaxes suportadas nos templates:
 *   {fieldKey}           → obrigatório: mostra [fieldKey] se ausente
 *   {fieldKey?}          → opcional simples: vira \x00 se ausente (limpeza posterior)
 *   {?, texto {field}}   → segmento condicional: remove TUDO se algum field dentro estiver ausente
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
   * Interpola o texto e limpa artefatos gramaticais.
   * Opera em 4 passos para garantir ordem correta de substituição.
   */
  const interpolateAdaptive = (text) => {
    // ── Passo 1: segmentos condicionais {?, ...{field1}... {field2}...} ─────
    // Remove o segmento inteiro se QUALQUER campo dentro estiver ausente.
    // Suporta múltiplos campos no mesmo segmento.
    let result = text.replace(
      /\{\?,\s*((?:[^{}]|\{[^}]*\})*)\}/g,
      (_, segment) => {
        // Coleta todas as chaves de campo referenciadas dentro do segmento
        const keys = [];
        segment.replace(/\{(\w+)\}/g, (__, k) => keys.push(k));

        // Remove o segmento se qualquer chave estiver ausente
        if (keys.length === 0 || keys.some(isAbsent)) return "";

        // Interpola todos os campos dentro do segmento
        return segment.replace(/\{(\w+)\}/g, (__, k) => formData[k] || "");
      }
    );

    // ── Passo 2: campos opcionais simples {fieldKey?} ─────────────────────
    // Converte campos ausentes em marcador \x00 para limpeza posterior
    result = result.replace(/\{(\w+)\?\}/g, (_, key) => {
      if (isAbsent(key)) return "\x00";
      return formData[key];
    });

    // ── Passo 3: campos obrigatórios {fieldKey} ───────────────────────────
    // Mostra o valor ou [fieldKey] se ausente (indica que o campo é obrigatório)
    result = result.replace(/\{(\w+)\}/g, (_, key) => formData[key] || `[${key}]`);

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

      case "clause":
        return {
          ...block,
          text: block.text ? interpolateAdaptive(block.text) : undefined,
          paragraphs: block.paragraphs
            ? block.paragraphs
                .map(interpolateAdaptive)
                // Remove parágrafos que ficaram completamente vazios após interpolação
                .filter((p) => p.trim() !== "")
            : undefined,
        };

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
  });
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
