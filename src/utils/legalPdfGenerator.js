/**
 * ============================================
 * KRIOU DOCS — Legal PDF Generator
 * ============================================
 * Gera documentos jurídicos em PDF com layout
 * elegante, adaptável e profissional.
 *
 * Design:
 * - Nome do documento em destaque no topo
 * - QR code discreto no canto superior direito (12mm)
 * - Espaçamento adaptável para caber em 2 páginas
 * - Local extraído da data → marca d'água na última página
 * - Paleta: ouro + burgundy + grafite
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
const ML = 18;
const MR = 16;
const MT = 14;
const MB = 14;
const CW = PAGE_W - ML - MR;

// ─── Tipografia ───────────────────────────────────────────────────────────────
const FONT_SERIF = "times";
const FONT_SANS  = "helvetica";
const LEAD       = 4.2;
const LEAD_TIGHT = 3.8;

// ─── Cores ────────────────────────────────────────────────────────────────────
const C_INK       = [10, 10, 15];
const C_TEXT      = [44, 44, 52];
const C_SUBTLE    = [108, 104, 112];
const C_MUTED     = [160, 156, 162];
const C_DIVIDER   = [226, 224, 218];
const C_DIVIDER_H = [235, 233, 227];
const C_GOLD      = [165, 135, 55];
const C_GOLD_LIGHT = [235, 225, 200];
const C_BURGUNDY  = [139, 58, 58];
const C_CREAM     = [252, 250, 245];

// ─── Estado global ───────────────────────────────────────────────────────────
let pageY = 0;
let docCode = "";
let watermarkCity = "";

// ─── Helpers de página ──────────────────────────────────────────────────────

const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

const ensureSpace = (doc, needed) => {
  if (pageY + (needed || 10) > PAGE_H - MB) newPage(doc);
};

const wouldOrphan = (startY, headerLines) => {
  const h = headerLines * LEAD;
  const available = PAGE_H - MB - startY;
  return available < h + LEAD * 2;
};

// ─── Extrair cidade da data ──────────────────────────────────────────────────

const extractCity = (text) => {
  if (!text) return "";
  const m = text.match(/(?:,?\s*)(\d{1,2} de \w+ de \d{4}|\d{2}\/\d{2}\/\d{4})$/);
  if (m) return text.substring(0, m.index).replace(/,\s*$/, "").trim();
  return "";
};

const extractDate = (text) => {
  if (!text) return text;
  const m = text.match(/(\d{1,2} de \w+ de \d{4}|\d{2}\/\d{2}\/\d{4})/);
  return m ? m[1] : text;
};

// ─── Render helpers ─────────────────────────────────────────────────────────

const renderTextBlock = (doc, text, size, { indent = 0, align = "left", font = FONT_SERIF, style = "normal", color = C_TEXT, leading = LEAD } = {}) => {
  if (!text || !text.trim()) return;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, CW - indent);
  lines.forEach((line) => {
    ensureSpace(doc, leading);
    doc.text(line, ML + indent, pageY, { align, maxWidth: CW - indent });
    pageY += leading;
  });
};

// ─── Draw functions ─────────────────────────────────────────────────────────

const drawQRTopRight = (doc, url) => {
  const qrSize = 12;
  const qrX = PAGE_W - MR - qrSize;
  const qrY = MT - 1;
  drawQRCode(doc, url, qrX, qrY, qrSize);
};

const drawHeader = (doc, title) => {
  // Fine gold rule above title
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  const ruleW = Math.min(CW * 0.35, 60);
  doc.line(PAGE_W / 2 - ruleW / 2, MT + 4, PAGE_W / 2 + ruleW / 2, MT + 4);

  pageY = MT + 16;

  doc.setFont(FONT_SERIF, "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C_BURGUNDY);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), CW - 30);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, pageY, { align: "center" });
    pageY += 7;
  });

  // Lower gold rule (shorter)
  pageY += 1;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.25);
  const ruleW2 = Math.min(CW * 0.2, 40);
  doc.line(PAGE_W / 2 - ruleW2 / 2, pageY, PAGE_W / 2 + ruleW2 / 2, pageY);
  pageY += 9;

  // Kriou docs discreet label
  doc.setFont(FONT_SANS, "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...C_MUTED);
  doc.text("krioudocs.com.br", PAGE_W / 2, pageY, { align: "center" });
  pageY += 5;

  doc.setTextColor(...C_TEXT);
};

const renderLegalBasis = (doc, legislation) => {
  if (!legislation || !legislation.trim()) return;
  ensureSpace(doc, 22);

  pageY += 2;
  const boxX = ML;
  const boxW = CW;
  const boxH = 15;
  const boxY = pageY;

  doc.setFillColor(...C_CREAM);
  doc.setDrawColor(...C_DIVIDER);
  doc.rect(boxX, boxY, boxW, boxH, "FD");

  doc.setFillColor(...C_GOLD);
  doc.rect(boxX, boxY, 2.5, boxH, "F");

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C_GOLD);
  doc.text("FUNDAMENTO LEGAL", boxX + 14, boxY + 5);

  doc.setFont(FONT_SERIF, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C_INK);
  const lawLines = doc.splitTextToSize(legislation, boxW - 22);
  lawLines.forEach((line, i) => {
    doc.text(line, boxX + 14, boxY + 10 + i * 4.2);
  });

  pageY = boxY + boxH + 6;
  doc.setTextColor(...C_TEXT);
};

// ─── Block renderers ────────────────────────────────────────────────────────

const renderParagraph = (doc, text) => {
  if (!text || !text.trim()) return;
  renderTextBlock(doc, text, 9, { indent: 7 });
  pageY += 2;
};

const renderClause = (doc, clause) => {
  const hasTitle = clause.title && clause.title.trim();
  const hasText = clause.text && clause.text.trim();
  const hasParagraphs = clause.paragraphs && clause.paragraphs.length > 0;
  if (!hasTitle && !hasText && !hasParagraphs) return;

  if (wouldOrphan(pageY, hasTitle ? 2 : 1)) newPage(doc);

  ensureSpace(doc, 12);

  // Gold left bar
  doc.setFillColor(...C_GOLD);
  doc.rect(ML, pageY - 1, 2, hasTitle ? 10 : 7, "F");

  // Clause number
  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_GOLD);
  doc.text(`CL\u00c1USULA ${clause.number}`, ML + 6, pageY + 0.5);
  pageY += LEAD;

  if (hasTitle) {
    doc.setFont(FONT_SERIF, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C_BURGUNDY);
    doc.text(clause.title, ML + 6, pageY + 0.5);
    pageY += LEAD + 0.5;
  }

  // Fine underline
  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.1);
  doc.line(ML + 6, pageY - 0.3, ML + CW * 0.4, pageY - 0.3);
  pageY += 1.5;

  if (hasText) {
    renderTextBlock(doc, clause.text, 9, { indent: 0 });
  }

  if (hasParagraphs) {
    clause.paragraphs.forEach((p) => {
      ensureSpace(doc, LEAD + 1);
      const indent = /^[§IVX\d]/.test(p.trim()) ? 8 : 4;
      doc.setFont(FONT_SERIF, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C_TEXT);
      const pLines = doc.splitTextToSize(p, CW - indent);
      pLines.forEach((line) => {
        ensureSpace(doc, LEAD_TIGHT);
        doc.text(line, ML + indent, pageY, { maxWidth: CW - indent });
        pageY += LEAD_TIGHT;
      });
      pageY += 1.2;
    });
  }

  pageY += 2.5;
};

const renderClosing = (doc, text) => {
  if (!text || !text.trim()) return;
  ensureSpace(doc, 12);
  pageY += 2;
  doc.setFont(FONT_SERIF, "italic");
  doc.setFontSize(9);
  doc.setTextColor(...C_SUBTLE);
  const lines = doc.splitTextToSize(text, CW);
  lines.forEach((line) => {
    ensureSpace(doc, LEAD);
    doc.text(line, ML, pageY);
    pageY += LEAD;
  });
  pageY += 4;
  doc.setTextColor(...C_TEXT);
  doc.setFont(FONT_SERIF, "normal");
};

const renderDate = (doc, text) => {
  if (!text || !text.trim()) return;
  const dateOnly = extractDate(text);
  const city = extractCity(text);
  if (city) watermarkCity = city;

  ensureSpace(doc, 10);
  pageY += 4;
  doc.setFont(FONT_SERIF, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C_TEXT);
  doc.text(dateOnly, PAGE_W / 2, pageY, { align: "center" });
  pageY += 10;
};

// ─── Signatures (Page 2) ──────────────────────────────────────────────────

const renderSignaturesHeader = (doc) => {
  ensureSpace(doc, 14);
  pageY += 3;

  doc.setFillColor(...C_GOLD);
  doc.rect(ML, pageY, 2.5, 9, "F");
  doc.setFillColor(...C_BURGUNDY);
  doc.rect(ML + 3, pageY, 1, 9, "F");

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C_BURGUNDY);
  doc.text("ASSINATURAS", ML + 8, pageY + 4);

  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.1);
  doc.line(ML + 8, pageY + 6, ML + CW * 0.3, pageY + 6);

  pageY += 12;
  doc.setTextColor(...C_TEXT);
};

const renderSignatures = (doc, parties) => {
  if (!parties || !parties.length) return;
  ensureSpace(doc, 55);

  pageY += 6;
  const colW = CW / parties.length;

  parties.forEach((party, i) => {
    const cx = ML + i * colW + colW / 2;
    const lineW = colW * 0.82;
    const lx = cx - lineW / 2;

    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.25);
    let dx = lx;
    while (dx < lx + lineW) {
      doc.line(dx, pageY, Math.min(dx + 2.5, lx + lineW), pageY);
      dx += 4;
    }

    doc.setFont(FONT_SERIF, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_TEXT);
    doc.text(party.name || "", cx, pageY + 5, { align: "center", maxWidth: lineW });

    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_GOLD);
    doc.text(party.role, cx, pageY + 9.5, { align: "center" });
  });

  pageY += 18;
  doc.setTextColor(...C_TEXT);
};

const renderWitnesses = (doc, count = 2) => {
  ensureSpace(doc, 45);
  pageY += 3;

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C_SUBTLE);
  doc.text("TESTEMUNHAS", ML, pageY);
  pageY += 10;

  const colW = CW / count;
  for (let i = 0; i < count; i++) {
    const cx = ML + i * colW + colW / 2;
    const lineW = colW * 0.78;
    const lx = cx - lineW / 2;

    doc.setFillColor(...C_GOLD);
    doc.setDrawColor(...C_GOLD);
    doc.circle(lx + 3.5, pageY - 1, 3.5, "FD");
    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, lx + 3.5, pageY, { align: "center" });

    doc.setDrawColor(...C_MUTED);
    doc.setLineWidth(0.2);
    let dx = lx + 10;
    while (dx < lx + lineW) {
      doc.line(dx, pageY, Math.min(dx + 2, lx + lineW), pageY);
      dx += 3;
    }

    doc.setFont(FONT_SANS, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text("Nome:", lx + 10, pageY + 4.5);
    doc.text("CPF:", lx + 10, pageY + 9);

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.12);
    doc.line(lx + 21, pageY + 5, lx + lineW, pageY + 5);
    doc.line(lx + 18, pageY + 9.5, lx + lineW * 0.65, pageY + 9.5);
  }
  pageY += 16;
  doc.setTextColor(...C_TEXT);
};

// ─── Stamp space ──────────────────────────────────────────────────────────

const renderStampSpace = (doc) => {
  ensureSpace(doc, 55);
  pageY += 2;

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C_GOLD);
  doc.text("ESPA\u00c7O PARA SELOS E RECONHECIMENTO DE FIRMA", PAGE_W / 2, pageY, { align: "center" });
  pageY += 1.5;
  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.1);
  doc.line(PAGE_W / 2 - 45, pageY, PAGE_W / 2 + 45, pageY);
  pageY += 4;

  const boxW = 65;
  const boxH = 28;
  const boxX = PAGE_W / 2 - boxW / 2;
  const boxY = pageY;

  doc.setFillColor(...C_CREAM);
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.25);
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

  pageY = boxY + boxH + 8;
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

// ─── Watermark on last page ──────────────────────────────────────────────

const drawWatermark = (doc) => {
  if (!watermarkCity) return;
  const totalPages = doc.getNumberOfPages();
  doc.setPage(totalPages);

  const cx = PAGE_W / 2;
  const cy = PAGE_H - MB - 30;

  doc.saveGraphicsState();
  try {
    const gs = new doc.GState({ opacity: 0.06 });
    doc.setGState(gs);
    doc.setFont(FONT_SERIF, "italic");
    doc.setFontSize(32);
    doc.setTextColor(...C_SUBTLE);
    doc.text(watermarkCity, cx, cy, { align: "center", angle: -45 });
  } catch {
    // fallback if angle not supported
    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setFont(FONT_SERIF, "italic");
    doc.setFontSize(28);
    doc.setTextColor(...C_DIVIDER_H);
    doc.text(watermarkCity, cx, cy, { align: "center" });
  }
  doc.restoreGraphicsState();
};

// ─── Side stamp (code vertical, subtle) ──────────────────────────────────

const drawSideStamp = (doc) => {
  if (!docCode) return;
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(5);
    doc.setTextColor(...C_MUTED);
    const chars = docCode.split("");
    const startY = PAGE_H - MB - 6;
    chars.forEach((char, i) => {
      doc.text(char, ML - 2.5, startY - i * 3.2, { baseline: "middle" });
    });
  }
};

// ─── Footer ─────────────────────────────────────────────────────────────

const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - MB + 2;

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(ML, fy - 2, PAGE_W - MR, fy - 2);

    doc.setFont(FONT_SANS, "normal");
    doc.setFontSize(6);
    doc.setTextColor(...C_MUTED);
    doc.text(`${i} / ${totalPages}`, PAGE_W / 2, fy + 1, { align: "center" });

    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });
    doc.text(docCode || "", ML, fy + 1);
  }
};

// ─── Document body renderer ─────────────────────────────────────────────

const renderBody = (doc, bodyBlocks) => {
  for (const block of bodyBlocks) {
    if (!block) continue;
    switch (block.type) {
      case "title":
        break;
      case "paragraph":
        renderParagraph(doc, block.text);
        pageY += 1.5;
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
        renderSignaturesHeader(doc);
        renderSignatures(doc, block.parties);
        break;
      case "witnesses":
        renderWitnesses(doc, block.count || 2);
        break;
      default:
        break;
    }
  }
};

// ─── Fallback render ────────────────────────────────────────────────────

const renderFallback = (doc, docType, formData, disabledFields) => {
  pageY += 2;
  doc.setFont(FONT_SERIF, "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C_INK);
  doc.text((docType?.name || "DOCUMENTO").toUpperCase(), PAGE_W / 2, pageY, { align: "center" });
  pageY += 10;

  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  doc.line(PAGE_W / 2 - 25, pageY, PAGE_W / 2 + 25, pageY);
  pageY += 10;

  const sections = docType?.commonSections || [];
  sections.forEach((section) => {
    ensureSpace(doc, 14);
    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_GOLD);
    doc.text(section.title.toUpperCase(), ML, pageY);
    pageY += 4;

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.1);
    doc.line(ML, pageY - 2, ML + CW * 0.35, pageY - 2);
    pageY += 0.5;

    section.fields?.forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key];
      if (!value || !value.trim()) return;
      ensureSpace(doc, 8);
      doc.setFont(FONT_SANS, "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...C_SUBTLE);
      doc.text(f.label, ML, pageY);
      doc.setFont(FONT_SERIF, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C_TEXT);
      const vLines = doc.splitTextToSize(value, CW - 3);
      vLines.forEach((l) => {
        doc.text(l, ML + 3, pageY + 4);
        pageY += 4.5;
      });
      pageY += 1.5;
    });
    pageY += 2.5;
  });
};

// ─── Main Export ───────────────────────────────────────────────────────

export const generateLegalPDF = (formData, docType, disabledFields = {}, variantId = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  pageY = MT;
  watermarkCity = "";

  const documentCode = generateDocumentCode(docType, variantId);
  docCode = shortDocumentCode(documentCode);
  const validationURL = getValidationURL(documentCode);

  // QR code at top-right (small, discreet)
  drawQRTopRight(doc, validationURL);

  // Header with document name in gold/burgundy
  drawHeader(doc, docType?.name || "Documento Jur\u00eddico");

  // Legal basis box
  renderLegalBasis(doc, docType?.legislation);

  // Document body
  const vId = variantId || docType?.defaultVariant;
  const body = vId ? getDocumentBody(docType?.id, vId, formData, disabledFields) : null;
  const hasStructuredBody = body && body.length > 0;

  if (hasStructuredBody) renderBody(doc, body);
  else renderFallback(doc, docType, formData, disabledFields);

  // Stamp/seal space on last page
  renderStampSpace(doc);

  // Side stamp on all pages
  drawSideStamp(doc);

  // Footer on all pages
  drawFooter(doc);

  // Watermark on last page
  drawWatermark(doc);

  return doc;
};

export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

export const generatePDFByType = (docTypeId, formData) => {
  return generateLegalPDF(formData, { id: docTypeId, name: "Documento", fields: [] });
};

export default { generateLegalPDF, generatePDFByType, downloadLegalPDF };
