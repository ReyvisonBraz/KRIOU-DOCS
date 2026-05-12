/**
 * ============================================
 * KRIOU DOCS — Legal PDF Generator
 * ============================================
 * Gera documentos jurídicos em PDF com
 * padrão Visual Law: destaque cromático,
 * hierarquia visual clara, box para base
 * legal, cláusulas numeradas com barras
 * laterais, e espaçamento profissional.
 *
 * Cores:
 *   Ouro (#a58737) — base legal, cláusulas, destaques
 *   Tinto (#8B3A3A) — títulos de seção
 *   Grafite (#2C2C34) — corpo do texto
 *   Cream (#FCFAF5) — fundo de boxes
 *
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";
import { getDocumentBody } from "../data/legalDocuments";
import { generateDocumentCode, shortDocumentCode, getValidationURL } from "./documentHash";
import { drawQRCode } from "./qrHelper";

// ─── Layout A4 ────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 20;
const MR = 18;
const MT = 14;
const MB = 14;
const CW = PAGE_W - ML - MR;

// ─── Tipografia ───────────────────────────────────────────────────────────────
const FONT_BODY   = "times";
const FONT_LABEL  = "helvetica";
const SIZE_TITLE  = 13;
const SIZE_BODY   = 9.5;
const SIZE_SMALL  = 8;
const SIZE_CAPTION = 6.5;
const LEAD_BODY   = 4.5;
const LEAD_TIGHT  = 4;
const LEAD_CLAUSE = 7.5;

// ─── Espaçamentos ─────────────────────────────────────────────────────────────
const GAP_SECTION = 5;
const GAP_CLAUSE  = 3;
const GAP_PARA    = 1.5;
const GAP_TITLE   = 7;

// ─── Cores Visual Law ─────────────────────────────────────────────────────────
const C_INK       = [10, 10, 15];       // grafite escuro (corpo)
const C_TEXT      = [44, 44, 52];       // grafite médio
const C_SUBTLE    = [108, 104, 112];    // cinza elegante (textos secundários)
const C_MUTED     = [160, 156, 162];    // cinza claro (numeração, rodapé)
const C_DIVIDER   = [224, 222, 216];    // bege claro (linhas)
const C_GOLD      = [165, 135, 55];     // ouro (destaques, cláusulas)
const C_GOLD_LIGHT = [235, 225, 200];   // ouro claro (bordas)
const C_BURGUNDY  = [139, 58, 58];      // tinto (títulos de seção)
const C_CREAM     = [252, 250, 245];    // creme (fundo de boxes)
const C_CREAM_DARK = [245, 242, 235];   // creme escuro (fundo alternativo)

// ─── Estado da página ─────────────────────────────────────────────────────────
let pageY = 0;
let docCodeVertical = "";

const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

const ensureSpace = (doc, needed = 12) => {
  if (pageY + needed > PAGE_H - MB) newPage(doc);
  return pageY;
};

const wouldOrphan = (startY, headerLines) => {
  const headerHeight = headerLines * LEAD_BODY;
  const minBodyHeight = 2 * LEAD_BODY;
  const available = PAGE_H - MB - startY;
  return available < headerHeight + minBodyHeight;
};

// ─── Side Stamp — código vertical em TODAS as páginas (frente e verso) ────────

const drawSideStamp = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Fundo da faixa lateral
    doc.setFillColor(248, 247, 244);
    doc.setDrawColor(220, 218, 212);
    doc.rect(ML - 6, MT - 2, 6, PAGE_H - MT - MB + 4, "FD");

    // Código vertical — caractere por caractere (sem translate/rotate)
    if (docCodeVertical) {
      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(6);
      doc.setTextColor(...C_MUTED);
      const chars = docCodeVertical.split("");
      const startY = PAGE_H - MB - 8;
      chars.forEach((char, i) => {
        doc.text(char, ML - 3, startY - i * 3.5, { baseline: "middle" });
      });
    }
  }
};

// ─── Header — título centralizado com filetes dourados ──────────────────────

const drawHeader = (doc, title) => {
  // Filete superior dourado
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.6);
  const topRuleW = Math.min(CW * 0.5, 80);
  doc.line(PAGE_W / 2 - topRuleW / 2, MT + 3, PAGE_W / 2 + topRuleW / 2, MT + 3);

  pageY = MT + 13;

  // Título em tinto (burgundy) — destaque, sem cinza
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_BURGUNDY);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), CW - 20);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, pageY, { align: "center" });
    pageY += 7;
  });

  // Filete inferior dourado (mais curto)
  pageY += 1;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.35);
  const ruleW = Math.min(CW * 0.3, 50);
  doc.line(PAGE_W / 2 - ruleW / 2, pageY, PAGE_W / 2 + ruleW / 2, pageY);

  // Marca d'água "Kriou Docs" em dourado claro
  pageY += 5;
  doc.setFont(FONT_LABEL, "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C_MUTED);
  doc.text("Documento gerado por Kriou Docs", PAGE_W / 2, pageY, { align: "center" });

  pageY += 6;
  doc.setTextColor(...C_TEXT);
};

// ─── Legal Basis — box destacado Visual Law ─────────────────────────────────

const renderLegalBasis = (doc, legislation) => {
  if (!legislation || legislation.trim() === "") return;
  ensureSpace(doc, 22);

  pageY += 2;

  const boxX = ML;
  const boxW = CW;
  const boxH = 16;
  const boxY = pageY;

  // Fundo suave creme
  doc.setFillColor(...C_CREAM);
  doc.setDrawColor(...C_CREAM_DARK);
  doc.rect(boxX, boxY, boxW, boxH, "FD");

  // Barra lateral esquerda dourada (Visual Law)
  doc.setFillColor(...C_GOLD);
  doc.rect(boxX, boxY, 3, boxH, "F");

  // Ícone estilizado "Lex" (⚖) como marcador visual
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_GOLD);
  doc.text("\u2696", boxX + 7, boxY + 6);

  // Rótulo "Fundamento Legal"
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C_GOLD);
  doc.text("FUNDAMENTO LEGAL", boxX + 16, boxY + 6);

  // Texto da lei — em grafite escuro (nada cinza)
  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C_INK);
  const lawLines = doc.splitTextToSize(legislation, boxW - 24);
  lawLines.forEach((line, i) => {
    doc.text(line, boxX + 16, boxY + 11 + i * 4.5);
  });

  pageY += boxH + 6;
  doc.setTextColor(...C_TEXT);
};

// ─── Footer com código e QR ───────────────────────────────────────────────────

const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - MB + 2;

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(ML, fy - 2, PAGE_W - MR, fy - 2);

    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text(`${i} / ${totalPages}`, PAGE_W / 2, fy + 1, { align: "center" });

    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });
    doc.text("krioudocs.com.br", ML, fy + 1);
  }
};

// ─── Block Renderers ─────────────────────────────────────────────────────────

const renderParagraph = (doc, text, { indent = 8, font = FONT_BODY, size = SIZE_BODY, color = C_TEXT, leading = LEAD_BODY } = {}) => {
  if (!text || text.trim() === "") return pageY;
  doc.setFont(font, "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, CW - indent);
  lines.forEach((line, li) => {
    ensureSpace(doc, leading);
    doc.text(line, ML + (li === 0 ? indent : 0), pageY, { maxWidth: CW - (li === 0 ? indent : 0) });
    pageY += leading;
  });
  return pageY;
};

const renderClauseHeader = (doc, number, title) => {
  ensureSpace(doc, 16);
  const hasTitle = title && title.trim() !== "";

  // Barra lateral dourada (Visual Law)
  doc.setFillColor(...C_GOLD);
  doc.rect(ML, pageY - 1, 2.5, hasTitle ? 11 : 8, "F");

  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C_GOLD);
  doc.text(`CL\u00C1USULA ${number}`, ML + 6, pageY + 0.5);
  pageY += LEAD_BODY;

  if (hasTitle) {
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(SIZE_BODY);
    doc.setTextColor(...C_BURGUNDY);
    doc.text(title, ML + 6, pageY + 0.5);
    pageY += LEAD_BODY + 0.5;
  }

  // Filete fino abaixo
  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.12);
  doc.line(ML + 6, pageY - 0.5, ML + CW * 0.45, pageY - 0.5);
  pageY += 1;
  doc.setTextColor(...C_TEXT);
};

const renderClause = (doc, clause) => {
  const textLines = clause.text ? doc.splitTextToSize(clause.text, CW).length : 0;
  const paraLines = clause.paragraphs ? clause.paragraphs.reduce((acc, p) => acc + doc.splitTextToSize(p, CW).length, 0) : 0;
  const totalLines = textLines + paraLines;
  const estimatedHeight = LEAD_CLAUSE + totalLines * LEAD_BODY + GAP_CLAUSE;
  const headerLines = clause.title ? 2 : 1;

  if (wouldOrphan(pageY, headerLines)) newPage(doc);

  if (totalLines > 4) ensureSpace(doc, LEAD_CLAUSE + 2 * LEAD_BODY);
  else ensureSpace(doc, estimatedHeight);

  renderClauseHeader(doc, clause.number, clause.title);

  if (clause.text) renderParagraph(doc, clause.text, { indent: 0 });

  if (clause.paragraphs?.length) {
    clause.paragraphs.forEach((p) => {
      ensureSpace(doc, LEAD_BODY + 1);
      const indent = /^[§IVX]+/.test(p.trim()) ? 10 : 5;
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);
      const pLines = doc.splitTextToSize(p, CW - indent);
      pLines.forEach((line) => {
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

const renderDate = (doc, text) => {
  if (!text || text.trim() === "") return pageY;
  ensureSpace(doc, 10);
  pageY += 3;
  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(...C_TEXT);
  doc.text(text, PAGE_W / 2, pageY, { align: "center" });
  pageY += 12;
};

// ─── Assinaturas — linhas longas com espaço extra ────────────────────────────

const renderSignatures = (doc, parties) => {
  if (!parties?.length) return pageY;
  ensureSpace(doc, 55);

  pageY += 10;
  const colW = CW / parties.length;

  parties.forEach((party, i) => {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.82;
    const lineStartX = centerX - lineW / 2;

    // Linha tracejada para assinatura — 50% mais larga
    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.3);
    const dash = 2.5;
    const gap = 1.5;
    let dx = lineStartX;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + dash, lineStartX + lineW), pageY);
      dx += dash + gap;
    }

    // Nome da parte
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT);
    doc.text(party.name || "", centerX, pageY + 5.5, { align: "center", maxWidth: lineW });

    // Função (ex: Vendedor, Comprador)
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_GOLD);
    doc.text(party.role, centerX, pageY + 10.5, { align: "center" });
  });

  pageY += 20;
  doc.setTextColor(...C_TEXT);
};

// ─── Testemunhas — mais espaço para assinar ─────────────────────────────────

const renderWitnesses = (doc, count = 2) => {
  ensureSpace(doc, 50);
  pageY += 4;

  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_SUBTLE);
  doc.text("TESTEMUNHAS", ML, pageY);
  pageY += 12;

  const colW = CW / count;
  for (let i = 0; i < count; i++) {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.8;
    const lineStartX = centerX - lineW / 2;

    // Círculo numerado
    doc.setFillColor(...C_GOLD);
    doc.setDrawColor(...C_GOLD);
    doc.circle(lineStartX + 4, pageY - 1, 4, "FD");
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, lineStartX + 4, pageY, { align: "center" });

    // Linha de assinatura
    doc.setDrawColor(...C_MUTED);
    doc.setLineWidth(0.25);
    let dx = lineStartX + 11;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + 2, lineStartX + lineW), pageY);
      dx += 3;
    }

    // Labels Nome / CPF
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text("Nome:", lineStartX + 11, pageY + 5);
    doc.text("CPF:", lineStartX + 11, pageY + 10.5);

    // Linhas guia para Nome/CPF
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(lineStartX + 23, pageY + 5.5, lineStartX + lineW, pageY + 5.5);
    doc.line(lineStartX + 19, pageY + 11, lineStartX + lineW * 0.7, pageY + 11);
  }
  pageY += 18;
  doc.setTextColor(...C_TEXT);
};

// ─── Seção de Assinatura (Visual Law divider) ──────────────────────────────

const renderSectionDivider = (doc, label) => {
  ensureSpace(doc, 14);
  pageY += 4;

  // Barra lateral dupla (ouro + tinto)
  doc.setFillColor(...C_GOLD);
  doc.rect(ML, pageY, 2.5, 10, "F");
  doc.setFillColor(...C_BURGUNDY);
  doc.rect(ML + 3, pageY, 1, 10, "F");

  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_BURGUNDY);
  doc.text(label.toUpperCase(), ML + 8, pageY + 4);

  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.12);
  doc.line(ML + 8, pageY + 7, ML + CW * 0.35, pageY + 7);

  pageY += 12;
  doc.setTextColor(...C_TEXT);
};

// ─── Selos do Cartório — espaço vazio, sem campos fixos ─────────────────────

const renderStampSpace = (doc) => {
  ensureSpace(doc, 70);

  pageY += 3;
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C_GOLD);
  doc.text("ESPA\u00C7O PARA SELOS E RECONHECIMENTO DE FIRMA", PAGE_W / 2, pageY, { align: "center" });

  pageY += 2;
  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.15);
  doc.line(PAGE_W / 2 - 50, pageY, PAGE_W / 2 + 50, pageY);

  pageY += 5;

  const boxW = 70;
  const boxH = 32;
  const boxX = PAGE_W / 2 - boxW / 2;
  const boxY = pageY;

  doc.setFillColor(...C_CREAM);
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  const dashLen = 3;
  const gapLen = 2;
  const perim = 2 * (boxW + boxH);
  let pos = 0;
  while (pos < perim) {
    const segLen = Math.min(dashLen, perim - pos);
    const [x1, y1] = pointOnRect(boxX, boxY, boxW, boxH, pos);
    const [x2, y2] = pointOnRect(boxX, boxY, boxW, boxH, pos + segLen);
    doc.line(x1, y1, x2, y2);
    pos += dashLen + gapLen;
  }

  pageY += boxH + 10;
};

const pointOnRect = (x, y, w, h, d) => {
  const top = d;
  const right = d - w;
  const bottom = d - w - h;
  const left = d - 2 * w - h;
  if (top <= w) return [x + top, y];
  if (right <= h) return [x + w, y + right];
  if (bottom <= w) return [x + w - bottom, y + h];
  return [x, y + h - (left >= 0 ? left : 0)];
};

// ─── Document Body ───────────────────────────────────────────────────────────

const renderBody = (doc, body) => {
  body.forEach((block) => {
    if (!block) return;
    switch (block.type) {
      case "title": break;
      case "paragraph":
        renderParagraph(doc, block.text, { indent: 8 });
        pageY += GAP_SECTION - 2;
        break;
      case "clause":
        renderClause(doc, block);
        break;
      case "closing":
        renderClosing(doc, block.text);
        break;
      case "date":
        renderDate(doc, block.text);
        break;
      case "signatures":
        renderSectionDivider(doc, "Assinaturas");
        renderSignatures(doc, block.parties);
        break;
      case "witnesses":
        renderSectionDivider(doc, "Testemunhas");
        renderWitnesses(doc, block.count || 2);
        break;
      default: break;
    }
  });
};

// ─── Fallback ────────────────────────────────────────────────────────────────

const generateFallback = (doc, docType, formData, disabledFields) => {
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  doc.text((docType?.name || "DOCUMENTO").toUpperCase(), PAGE_W / 2, pageY, { align: "center" });
  pageY += GAP_TITLE;

  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  doc.line(PAGE_W / 2 - 30, pageY, PAGE_W / 2 + 30, pageY);
  pageY += 12;

  const sections = docType?.commonSections || [];
  sections.forEach((section) => {
    ensureSpace(doc, 16);
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(SIZE_SMALL);
    doc.setTextColor(...C_GOLD);
    doc.text(section.title.toUpperCase(), ML, pageY);
    pageY += 5;

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(ML, pageY - 2, ML + CW * 0.4, pageY - 2);
    pageY += 1;

    section.fields?.forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "";
      if (!value || value.trim() === "") return;
      ensureSpace(doc, 9);
      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(7);
      doc.setTextColor(...C_SUBTLE);
      doc.text(f.label, ML, pageY);
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);
      const vLines = doc.splitTextToSize(value, CW - 3);
      vLines.forEach((l) => {
        doc.text(l, ML + 3, pageY + 4.5);
        pageY += 5;
      });
      pageY += 2;
    });
    pageY += 3;
  });
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Gera PDF do documento jurídico com padrão Visual Law.
 */
export const generateLegalPDF = (formData, docType, disabledFields = {}, variantId = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  pageY = MT;

  // Código único do documento
  const documentCode = generateDocumentCode(docType, variantId);
  docCodeVertical = shortDocumentCode(documentCode);
  const validationURL = getValidationURL(documentCode);

  drawHeader(doc, docType?.name || "Documento Jur\u00EDdico");

  // Box Visual Law: Fundamento Legal (com destaque, nada cinza)
  renderLegalBasis(doc, docType?.legislation);

  // Corpo do documento
  const vId = variantId || docType?.defaultVariant;
  const body = vId ? getDocumentBody(docType?.id, vId, formData, disabledFields) : null;
  const hasStructuredBody = body && body.length > 0;

  if (hasStructuredBody) renderBody(doc, body);
  else generateFallback(doc, docType, formData, disabledFields);

  // QR Code — lado direito
  pageY += 4;
  ensureSpace(doc, 30);
  const qrSize = 20;
  const qrX = PAGE_W - MR - qrSize;
  drawQRCode(doc, validationURL, qrX, pageY, qrSize, {
    label: "Escanear para validar",
    labelSize: 5,
  });
  pageY += qrSize + 6;

  // Espaço para selos do cartório — sem campos fixos
  renderStampSpace(doc);

  // Side stamp em todas as páginas
  drawSideStamp(doc);

  drawFooter(doc);

  return doc;
};

export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

export const generatePDFByType = (docTypeId, formData) => {
  return generateLegalPDF(formData, { id: docTypeId, name: "Documento", fields: [] });
};

export default { generateLegalPDF, generatePDFByType, downloadLegalPDF };
