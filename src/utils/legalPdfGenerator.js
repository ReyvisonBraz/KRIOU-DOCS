/**
 * ============================================
 * KRIOU DOCS — Legal PDF Generator
 * ============================================
 * Gera documentos juridicos em PDF com design editorial limpo,
 * tipografia distinta (times para corpo / helvetica para rotulos),
 * quebra de pagina inteligente e adaptacao por densidade de conteudo.
 *
 * Principios de design:
 * - Neutros tingidos (nunca preto puro #000 nem branco puro #fff)
 * - Sem faixas laterais decorativas (side-stripe ban)
 * - Ritmo de espacamento variavel entre secoes
 * - Clausulas agrupadas, nunca orfas
 *
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";
import { getDocumentBody } from "../data/legalDocuments";

// ─── Layout ──────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 24;             // margin left
const MR = 20;             // margin right
const MT = 18;             // margin top
const MB = 20;             // margin bottom
const CW = PAGE_W - ML - MR; // content width (166mm)

// ─── Tipografia ──────────────────────────────────────────────────────────────
const FONT_BODY   = "times";
const FONT_LABEL  = "helvetica";
const SIZE_TITLE  = 15;
const SIZE_BODY   = 10.5;
const SIZE_SMALL  = 8.5;
const SIZE_CAPTION = 7.5;
const LEAD_BODY   = 5.6;   // line advance for body paragraphs
const LEAD_TIGHT  = 5.0;   // line advance for dense lists
const LEAD_CLAUSE = 11.0;  // clause header height

// ─── Espacamento ─────────────────────────────────────────────────────────────
const GAP_SECTION = 9;      // between major sections
const GAP_CLAUSE  = 5;      // between clauses
const GAP_PARA    = 2.5;    // between paragraphs within clause
const GAP_TITLE   = 14;     // space after document title

// ─── Cores (neutros tingidos com azul quente) ────────────────────────────────
const C_INK      = [22, 29, 38];     // titulos — azul escuro quente
const C_TEXT     = [56, 62, 70];     // corpo — cinza azulado
const C_SUBTLE   = [118, 124, 134];  // rotulos — cinza medio
const C_MUTED    = [170, 175, 182];  // separadores
const C_DIVIDER  = [228, 226, 220];  // linhas finas — cinza quente
const C_GOLD     = [165, 135, 55];   // destaque — dourado quente
const C_CREAM    = [253, 251, 246];  // fundo sutil (nunca branco puro)

// ─── Estado da pagina ────────────────────────────────────────────────────────
let pageY = 0;
let currentClauseGroup = [];

/**
 * Avanca para nova pagina e desenha elementos fixos.
 * @param {jsPDF} doc
 */
const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

/**
 * Garante que o conteudo caiba na pagina atual.
 * Se nao couber, avanca. Retorna o Y atualizado.
 * @param {jsPDF} doc
 * @param {number} needed — altura minima necessaria em mm
 * @returns {number} pageY atualizado
 */
const ensureSpace = (doc, needed = 14) => {
  if (pageY + needed > PAGE_H - MB) {
    newPage(doc);
  }
  return pageY;
};

// ─── Header editorial ─────────────────────────────────────────────────────────

/**
 * Desenha o cabecalho editorial na primeira pagina.
 * Sem blocos solidos — apenas tipografia e uma linha fina.
 */
const drawHeader = (doc, title, legislation) => {
  // Titulo do documento — centralizado, times bold
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), CW - 16);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, pageY, { align: "center" });
    pageY += 7;
  });

  // Linha dourada decorativa — fina, centralizada
  pageY += 2;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  const ruleW = Math.min(CW * 0.4, 60);
  doc.line(PAGE_W / 2 - ruleW / 2, pageY, PAGE_W / 2 + ruleW / 2, pageY);

  // Subtitulo — helvetica normal, cinza
  pageY += 6;
  doc.setFont(FONT_LABEL, "normal");
  doc.setFontSize(SIZE_CAPTION);
  doc.setTextColor(...C_SUBTLE);
  doc.text("Documento gerado por Kriou Docs", PAGE_W / 2, pageY, { align: "center" });

  // Legislacao se houver
  if (legislation) {
    pageY += 4.5;
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text(legislation, PAGE_W / 2, pageY, { align: "center", maxWidth: CW * 0.8 });
  }

  pageY += 12;
  doc.setTextColor(...C_TEXT);
};

// ─── Rodape ───────────────────────────────────────────────────────────────────

const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - MB + 4;

    // Linha separadora sutil
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(ML, fy - 4, PAGE_W - MR, fy - 4);

    // Paginacao centralizada
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(SIZE_CAPTION);
    doc.setTextColor(...C_MUTED);
    doc.text(`${i} / ${totalPages}`, PAGE_W / 2, fy + 1, { align: "center" });

    // Data a direita
    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(7);
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });

    // Branding sutil a esquerda
    doc.text("krioudocs.com.br", ML, fy + 1);
  }
};

// ─── Renderizacao de blocos ───────────────────────────────────────────────────

/**
 * Renderiza um paragrafo de texto com indentacao opcional na primeira linha.
 * Suporta multiplas linhas com quebra automatica.
 *
 * @returns {number} Novo pageY
 */
const renderParagraph = (doc, text, { indent = 6, font = FONT_BODY, size = SIZE_BODY, color = C_TEXT, leading = LEAD_BODY } = {}) => {
  if (!text || text.trim() === "") return pageY;

  doc.setFont(font, "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);

  const lines = doc.splitTextToSize(text, CW - indent);
  lines.forEach((line, li) => {
    ensureSpace(doc, leading);
    const xOff = li === 0 ? indent : 0;
    doc.text(line, ML + xOff, pageY, { maxWidth: CW - xOff });
    pageY += leading;
  });
  return pageY;
};

/**
 * Renderiza titulo de clausula com numero em destaque dourado.
 * Design limpo: numero + titulo em bold, linha fina separadora.
 */
const renderClauseHeader = (doc, number, title) => {
  ensureSpace(doc, 14);

  const hasTitle = title && title.trim() !== "";
  const fullLabel = hasTitle
    ? `CLÁUSULA ${number} — ${title.toUpperCase()}`
    : `CLÁUSULA ${number}`;

  // Numero em destaque dourado
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C_GOLD);
  doc.text(`CLÁUSULA ${number}`, ML, pageY - 0.5);
  pageY += LEAD_BODY;

  // Titulo da clausula
  if (hasTitle) {
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...C_INK);
    doc.text(title, ML, pageY);
    pageY += LEAD_BODY + 0.5;
  }

  // Linha fina separadora
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(ML, pageY - 1.5, ML + CW * 0.55, pageY - 1.5);
  pageY += 1;

  doc.setTextColor(...C_TEXT);
};

/**
 * Renderiza uma clausula completa: cabecalho + texto/paragrafos.
 * Agrupa a clausula — se nao couber na pagina atual, move inteira.
 *
 * @param {Object} clause — { number, title, text?, paragraphs? }
 */
const renderClause = (doc, clause) => {
  // Estima altura da clausula
  const textLines = clause.text
    ? doc.splitTextToSize(clause.text, CW).length
    : 0;
  const paraLines = clause.paragraphs
    ? clause.paragraphs.reduce((acc, p) => acc + doc.splitTextToSize(p, CW).length, 0)
    : 0;
  const totalLines = textLines + paraLines;
  const estimatedHeight = 10 + totalLines * LEAD_BODY + GAP_CLAUSE;

  // Se for curta (ate 4 linhas), tenta manter com a proxima
  // Se for longa, garante que cabe na pagina
  if (totalLines > 4) {
    // Clausula longa: garante cabecalho + 2 linhas minimo
    ensureSpace(doc, 10 + 2 * LEAD_BODY);
  } else {
    // Clausula curta: tenta manter 2 juntas
    ensureSpace(doc, estimatedHeight);
  }

  const startY = pageY;

  renderClauseHeader(doc, clause.number, clause.title);

  // Texto principal da clausula (paragrafo unico)
  if (clause.text) {
    renderParagraph(doc, clause.text, { indent: 0 });
  }

  // Paragrafos numerados ou lista
  if (clause.paragraphs?.length) {
    clause.paragraphs.forEach((p) => {
      ensureSpace(doc, LEAD_BODY + 1);
      // Detecta sub-item (numeros romanos ou §)
      const isSubItem = /^[§IVX]+/.test(p.trim());
      const indent = isSubItem ? 8 : 4;

      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);

      const pLines = doc.splitTextToSize(p, CW - indent);
      pLines.forEach((line, li) => {
        ensureSpace(doc, LEAD_TIGHT);
        doc.text(line, ML + indent, pageY, { maxWidth: CW - indent });
        pageY += LEAD_TIGHT;
      });
      pageY += GAP_PARA;
    });
  }

  pageY += GAP_CLAUSE;
  return pageY;
};

/**
 * Renderiza o paragrafo de encerramento (closing).
 */
const renderClosing = (doc, text) => {
  if (!text || text.trim() === "") return pageY;
  ensureSpace(doc, 14);
  pageY += 3;

  doc.setFont(FONT_BODY, "italic");
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(...C_SUBTLE);

  const lines = doc.splitTextToSize(text, CW);
  lines.forEach((line) => {
    ensureSpace(doc, LEAD_BODY);
    doc.text(line, ML, pageY);
    pageY += LEAD_BODY;
  });
  pageY += 4;
  doc.setTextColor(...C_TEXT);
  doc.setFont(FONT_BODY, "normal");
};

/**
 * Renderiza data e local.
 */
const renderDate = (doc, text) => {
  if (!text || text.trim() === "") return pageY;
  ensureSpace(doc, 10);
  pageY += 3;

  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(...C_TEXT);
  doc.text(text, PAGE_W / 2, pageY, { align: "center" });
  pageY += 14;
};

/**
 * Renderiza bloco de assinaturas com linhas pontilhadas.
 * Distribui igualmente no espaco horizontal.
 */
const renderSignatures = (doc, parties) => {
  if (!parties?.length) return pageY;
  ensureSpace(doc, 50);

  pageY += 8;
  const colW = CW / parties.length;

  parties.forEach((party, i) => {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.72;
    const lineStartX = centerX - lineW / 2;

    // Linha pontilhada
    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.25);
    const dash = 1.8;
    const gap = 1.2;
    let dx = lineStartX;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + dash, lineStartX + lineW), pageY);
      dx += dash + gap;
    }

    // Nome
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C_TEXT);
    doc.text(party.name || "", centerX, pageY + 5.5, {
      align: "center",
      maxWidth: lineW,
    });

    // Papel
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C_GOLD);
    doc.text(party.role, centerX, pageY + 10.5, { align: "center" });
  });

  pageY += 22;
  doc.setTextColor(...C_TEXT);
};

/**
 * Renderiza bloco de testemunhas.
 */
const renderWitnesses = (doc, count = 2) => {
  ensureSpace(doc, 45);
  pageY += 3;

  // Titulo
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C_SUBTLE);
  doc.text("TESTEMUNHAS", ML, pageY);
  pageY += 11;

  const colW = CW / count;
  for (let i = 0; i < count; i++) {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.78;
    const lineStartX = centerX - lineW / 2;

    // Circulo com numero
    doc.setFillColor(...C_GOLD);
    doc.setDrawColor(...C_GOLD);
    doc.circle(lineStartX + 4, pageY - 1, 3.5, "FD");
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, lineStartX + 4, pageY, { align: "center" });

    // Linha pontilhada
    doc.setDrawColor(...C_MUTED);
    doc.setLineWidth(0.2);
    let dx = lineStartX + 9;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + 1.5, lineStartX + lineW), pageY);
      dx += 2.5;
    }

    // Labels
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text("Nome:", lineStartX + 9, pageY + 5);
    doc.text("CPF:", lineStartX + 9, pageY + 10);

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(lineStartX + 21, pageY + 5.5, lineStartX + lineW, pageY + 5.5);
    doc.line(lineStartX + 17, pageY + 10.5, lineStartX + lineW * 0.7, pageY + 10.5);
  }
  pageY += 22;
  doc.setTextColor(...C_TEXT);
};

// ─── Gera documento completo ──────────────────────────────────────────────────

/**
 * Renderiza o corpo do documento (array de blocos interpolados).
 */
const renderBody = (doc, body) => {
  body.forEach((block) => {
    // Pula blocos nulos (clausulas condicionais removidas)
    if (!block) return;

    switch (block.type) {
      case "title": {
        // Titulo ja foi renderizado no header — pular
        // (O header editorial ja mostra o titulo do documento)
        break;
      }

      case "paragraph": {
        renderParagraph(doc, block.text, { indent: 6 });
        pageY += GAP_SECTION - 3;
        break;
      }

      case "clause": {
        renderClause(doc, block);
        break;
      }

      case "closing": {
        renderClosing(doc, block.text);
        break;
      }

      case "date": {
        renderDate(doc, block.text);
        break;
      }

      case "signatures": {
        renderSignatures(doc, block.parties);
        break;
      }

      case "witnesses": {
        renderWitnesses(doc, block.count || 2);
        break;
      }

      default:
        break;
    }
  });
};

// ─── Fallback (documentos sem documentBody) ────────────────────────────────────

const generateFallback = (doc, docType, formData, disabledFields) => {
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  doc.text((docType?.name || "DOCUMENTO").toUpperCase(), PAGE_W / 2, pageY, { align: "center" });

  pageY += GAP_TITLE;

  // Linha decorativa
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  doc.line(PAGE_W / 2 - 30, pageY, PAGE_W / 2 + 30, pageY);
  pageY += 14;

  const fields = docType?.fields || [];
  if (fields.length === 0) {
    // Fallback generico: renderiza as sections
    const sections = docType?.commonSections || [];
    sections.forEach((section) => {
      ensureSpace(doc, 16);
      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C_GOLD);
      doc.text(section.title.toUpperCase(), ML, pageY);
      pageY += 6;

      section.fields?.forEach((f) => {
        if (disabledFields[f.key]) return;
        const value = formData[f.key] || "";
        if (!value || value.trim() === "") return;

        ensureSpace(doc, 8);
        doc.setFont(FONT_LABEL, "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_SUBTLE);
        doc.text(f.label, ML, pageY);

        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(SIZE_BODY);
        doc.setTextColor(...C_TEXT);
        doc.text(value, ML + 2, pageY + 5, { maxWidth: CW - 2 });
        pageY += 10;
      });
    });
  } else {
    fields.forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "\u2014";
      ensureSpace(doc, 14);

      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C_SUBTLE);
      doc.text(f.label.toUpperCase(), ML, pageY);

      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);
      const lines = doc.splitTextToSize(value, CW);
      doc.text(lines, ML, pageY + 5);
      pageY += 10 + (lines.length - 1) * 5;
    });
  }
};

// ─── Exportacao principal ──────────────────────────────────────────────────────

/**
 * Gera PDF de documento juridico com design editorial.
 *
 * Usa times (serif) para o corpo do documento — da aparencia de contrato real.
 * Usa helvetica para rotulos e metadata — contraste limpo.
 * Sem barras laterais, sem caixas de fundo, sem pretos puros.
 *
 * @param {Object} formData       — dados preenchidos no formulario
 * @param {Object} docType        — objeto do documento (da legalDocuments)
 * @param {Object} disabledFields — campos marcados como "nao preencher"
 * @param {string} variantId      — ID da variante selecionada
 * @returns {jsPDF}
 */
export const generateLegalPDF = (formData, docType, disabledFields = {}, variantId = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Reseta estado global da pagina
  pageY = MT;

  // Header editorial
  drawHeader(doc, docType?.name || "Documento Juridico", docType?.legislation);

  // Busca o corpo do documento interpolado
  const vId = variantId || docType?.defaultVariant;
  const body = vId
    ? getDocumentBody(docType?.id, vId, formData, disabledFields)
    : null;

  if (body && body.length > 0) {
    // Contrato real com clausulas e estrutura completa
    renderBody(doc, body);
  } else {
    // Fallback: lista de campos
    generateFallback(doc, docType, formData, disabledFields);
  }

  // Rodape em todas as paginas
  drawFooter(doc);

  return doc;
};

/**
 * Download do PDF gerado.
 */
export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

/**
 * Helper legado para geracao por ID de tipo.
 */
export const generatePDFByType = (docTypeId, formData) => {
  return generateLegalPDF(formData, { id: docTypeId, name: "Documento", fields: [] });
};

export default {
  generateLegalPDF,
  generatePDFByType,
  downloadLegalPDF,
};
