/**
 * ============================================
 * KRIOU DOCS — Legal PDF Generator
 * ============================================
 * Generates legal documents in PDF with refined editorial design.
 *
 * Design principles:
 * - Serif body (Times) for authentic legal document feel
 * - Sans-serif (Helvetica) for labels and metadata
 * - Never pure black (#000) or pure white (#FFF)
 * - Compact layout optimized for 2 A4 pages
 * - Notary stamp space on last page
 * - Variable rhythm spacing between sections
 * - Clauses grouped — never orphaned
 * - Intelligent page breaks
 *
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";
import { getDocumentBody } from "../data/legalDocuments";
import { generateDocumentCode, shortDocumentCode, getValidationURL } from "./documentHash";
import { drawQRCode } from "./qrHelper";

// ─── Layout (compact A4 — tudo em 1 folha) ─────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 18;
const MR = 16;
const MT = 12;
const MB = 12;
const CW = PAGE_W - ML - MR;

// ─── Typography (compact) ─────────────────────────────────────────────────────
const FONT_BODY   = "times";
const FONT_LABEL  = "helvetica";
const SIZE_TITLE  = 14;
const SIZE_BODY   = 9;
const SIZE_SMALL  = 7.5;
const SIZE_CAPTION = 6.5;
const LEAD_BODY   = 4.2;
const LEAD_TIGHT  = 3.8;
const LEAD_CLAUSE = 7;

// ─── Spacing (compact) ────────────────────────────────────────────────────────
const GAP_SECTION = 4;
const GAP_CLAUSE  = 2;
const GAP_PARA    = 1;
const GAP_TITLE   = 6;

// ─── Colors (warm-tinted neutrals) ────────────────────────────────────────────
const C_INK       = [0, 0, 0];
const C_TEXT      = [15, 15, 15];
const C_SUBTLE    = [80, 80, 85];
const C_MUTED     = [140, 140, 145];
const C_DIVIDER   = [228, 226, 220];
const C_GOLD      = [165, 135, 55];
const C_CREAM     = [253, 251, 246];
const C_STAMP_BG  = [252, 250, 244];

// ─── Page state ──────────────────────────────────────────────────────────────
let pageY = 0;

const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

/**
 * Ensures content fits on current page. Advances if needed.
 */
const ensureSpace = (doc, needed = 12) => {
  if (pageY + needed > PAGE_H - MB) {
    newPage(doc);
  }
  return pageY;
};

/**
 * Check if a set of lines would cross a page boundary.
 * Returns true if the block should start on a new page.
 */
const wouldOrphan = (startY, headerLines) => {
  const headerHeight = headerLines * LEAD_BODY;
  const minBodyHeight = 2 * LEAD_BODY;
  const available = PAGE_H - MB - startY;
  return available < headerHeight + minBodyHeight;
};

// ─── Editorial Header ────────────────────────────────────────────────────────

/**
 * Draws the editorial header on the first page.
 */
const drawHeader = (doc, title, legislation, documentCode) => {
  // Top decorative rule
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.6);
  const topRuleW = Math.min(CW * 0.6, 90);
  doc.line(PAGE_W / 2 - topRuleW / 2, MT + 3, PAGE_W / 2 + topRuleW / 2, MT + 3);

  pageY = MT + 13;

  // Title — bold, uppercase, centered
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), CW - 16);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, pageY, { align: "center" });
    pageY += 7;
  });

  // Bottom decorative rule (shorter)
  pageY += 1;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  const ruleW = Math.min(CW * 0.3, 50);
  doc.line(PAGE_W / 2 - ruleW / 2, pageY, PAGE_W / 2 + ruleW / 2, pageY);

  // Kriou Docs label
  pageY += 6;
  doc.setFont(FONT_LABEL, "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C_MUTED);
  doc.text("Documento gerado por Kriou Docs", PAGE_W / 2, pageY, { align: "center" });

  // Legislation (fundamento legal)
  if (legislation) {
    pageY += 5;
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(8);

    // "Fundamento Legal:" in gold
    doc.setTextColor(...C_GOLD);
    doc.text("Fundamento Legal: ", ML, pageY);

    // Law text in dark
    const lawX = ML + doc.getTextWidth("Fundamento Legal: ") + 1;
    doc.setTextColor(...C_SUBTLE);
    doc.text(legislation, lawX, pageY, { maxWidth: PAGE_W - MR - lawX - 2 });
    pageY += 5;
  }

  // Document code
  if (documentCode) {
    pageY += 3;
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text(`Codigo: ${documentCode}`, PAGE_W - MR, pageY, { align: "right" });
  }

  pageY += 8;
  doc.setTextColor(...C_TEXT);
};

// ─── Footer (compact) ─────────────────────────────────────────────────────────

const drawFooter = (doc, shortCode) => {
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
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(6.5);
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });

    // Left side: short code or domain
    if (shortCode) {
      doc.text(shortCode, ML, fy + 1);
    } else {
      doc.text("krioudocs.com.br", ML, fy + 1);
    }
  }
};

// ─── Block Renderers ─────────────────────────────────────────────────────────

/**
 * Render a paragraph with optional first-line indent.
 */
const renderParagraph = (doc, text, { indent = 8, font = FONT_BODY, size = SIZE_BODY, color = C_TEXT, leading = LEAD_BODY } = {}) => {
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
 * Render a clause header with gold number and title.
 */
const renderClauseHeader = (doc, number, title) => {
  ensureSpace(doc, 14);

  const hasTitle = title && title.trim() !== "";

  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C_GOLD);
  doc.text(`CL\u00C1USULA ${number}`, ML, pageY - 0.5);
  pageY += LEAD_BODY;

  if (hasTitle) {
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(SIZE_BODY);
    doc.setTextColor(...C_INK);
    doc.text(title, ML, pageY);
    pageY += LEAD_BODY + 0.5;
  }

  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(ML, pageY - 1.5, ML + CW * 0.5, pageY - 1.5);
  pageY += 1;

  doc.setTextColor(...C_TEXT);
};

/**
 * Render a complete clause: header + text + paragraphs.
 */
const renderClause = (doc, clause) => {
  const textLines = clause.text
    ? doc.splitTextToSize(clause.text, CW).length
    : 0;
  const paraLines = clause.paragraphs
    ? clause.paragraphs.reduce((acc, p) => acc + doc.splitTextToSize(p, CW).length, 0)
    : 0;
  const totalLines = textLines + paraLines;
  const estimatedHeight = LEAD_CLAUSE + totalLines * LEAD_BODY + GAP_CLAUSE;

  const headerLines = clause.title ? 2 : 1;

  if (wouldOrphan(pageY, headerLines)) {
    newPage(doc);
  }

  if (totalLines > 4) {
    ensureSpace(doc, LEAD_CLAUSE + 2 * LEAD_BODY);
  } else {
    ensureSpace(doc, estimatedHeight);
  }

  renderClauseHeader(doc, clause.number, clause.title);

  if (clause.text) {
    renderParagraph(doc, clause.text, { indent: 0 });
  }

  if (clause.paragraphs?.length) {
    clause.paragraphs.forEach((p) => {
      ensureSpace(doc, LEAD_BODY + 1);
      const isSubItem = /^[§IVX]+/.test(p.trim());
      const indent = isSubItem ? 10 : 5;

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

/**
 * Render the closing statement.
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
 * Render date and location.
 */
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

/**
 * Render signature block with dotted lines.
 */
const renderSignatures = (doc, parties) => {
  if (!parties?.length) return pageY;
  ensureSpace(doc, 45);

  pageY += 8;
  const colW = CW / parties.length;

  parties.forEach((party, i) => {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.7;
    const lineStartX = centerX - lineW / 2;

    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.25);
    const dash = 1.8;
    const gap = 1.2;
    let dx = lineStartX;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + dash, lineStartX + lineW), pageY);
      dx += dash + gap;
    }

    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C_TEXT);
    doc.text(party.name || "", centerX, pageY + 5, {
      align: "center",
      maxWidth: lineW,
    });

    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C_GOLD);
    doc.text(party.role, centerX, pageY + 9.5, { align: "center" });
  });

  pageY += 12;
  doc.setTextColor(...C_TEXT);
};

/**
 * Render witness block with signature lines and fields.
 */
const renderWitnesses = (doc, count = 2) => {
  ensureSpace(doc, 42);
  pageY += 3;

  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C_SUBTLE);
  doc.text("TESTEMUNHAS", ML, pageY);
  pageY += 10;

  const colW = CW / count;
  for (let i = 0; i < count; i++) {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.76;
    const lineStartX = centerX - lineW / 2;

    doc.setFillColor(...C_GOLD);
    doc.setDrawColor(...C_GOLD);
    doc.circle(lineStartX + 4, pageY - 1, 3.5, "FD");
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, lineStartX + 4, pageY, { align: "center" });

    doc.setDrawColor(...C_MUTED);
    doc.setLineWidth(0.2);
    let dx = lineStartX + 9;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + 1.5, lineStartX + lineW), pageY);
      dx += 2.5;
    }

    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text("Nome:", lineStartX + 9, pageY + 4.5);
    doc.text("CPF:", lineStartX + 9, pageY + 9);

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(lineStartX + 21, pageY + 5, lineStartX + lineW, pageY + 5);
    doc.line(lineStartX + 17, pageY + 9.5, lineStartX + lineW * 0.7, pageY + 9.5);
  }
  pageY += 12;
  doc.setTextColor(...C_TEXT);
};

// ─── Notary Stamp Section ─────────────────────────────────────────────────────

/**
 * Draw a single notary stamp box with dashed gold border.
 */
const drawStampBox = (doc, title, subtitle, lines, boxW = 68, boxH = 34) => {
  const boxX = PAGE_W / 2 - boxW / 2;
  const boxY = pageY;

  // Background tint
  doc.setFillColor(...C_STAMP_BG);
  doc.setDrawColor(...C_STAMP_BG);
  doc.rect(boxX, boxY, boxW, boxH, "FD");

  // Dashed gold border
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.3);
  const dashLen = 2.5;
  const gapLen = 1.8;
  let pos = 0;
  const perim = 2 * (boxW + boxH);

  while (pos < perim) {
    const segLen = Math.min(dashLen, perim - pos);
    const [x1, y1] = pointOnRect(boxX, boxY, boxW, boxH, pos);
    const [x2, y2] = pointOnRect(boxX, boxY, boxW, boxH, pos + segLen);
    doc.line(x1, y1, x2, y2);
    pos += dashLen + gapLen;
  }

  // Title inside box
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(SIZE_CAPTION);
  doc.setTextColor(...C_GOLD);
  doc.text(title, PAGE_W / 2, boxY + 6, { align: "center" });

  // Subtitle
  doc.setFont(FONT_LABEL, "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C_SUBTLE);
  doc.text(subtitle, PAGE_W / 2, boxY + 11.5, { align: "center" });

  // Dotted fill lines
  const lineStartY = boxY + 18;
  const lineGap = 6.5;
  const lineInsetL = boxX + 22;
  const lineInsetR = boxX + boxW - 14;

  lines.forEach((label, idx) => {
    const ly = lineStartY + idx * lineGap;
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C_MUTED);
    doc.text(label, boxX + 8, ly, { baseline: "middle" });

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    const dotDash = 1.2;
    const dotGap = 1.0;
    let dx = lineInsetL;
    while (dx < lineInsetR) {
      doc.line(dx, ly, Math.min(dx + dotDash, lineInsetR), ly);
      dx += dotDash + dotGap;
    }
  });

  pageY += boxH + 8;
};

/**
 * Find a point on a rectangle perimeter at a given distance along the edge.
 */
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

/**
 * Render the notary stamp section inline (after signatures, same page).
 */
const renderNotaryStampSection = (doc) => {
  ensureSpace(doc, 80);

  pageY += 2;
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...C_GOLD);
  doc.text("SELOS E RECONHECIMENTO DE FIRMA", PAGE_W / 2, pageY, { align: "center" });

  pageY += 1;
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.15);
  doc.line(ML + 20, pageY, PAGE_W - MR - 20, pageY);

  pageY += 4;

  drawStampBox(doc, "Selo do Cart\u00F3rio", "Reconhecimento de Firma", [
    "Data:",
    "Livro:",
    "Folha:",
  ], 64, 30);

  drawStampBox(doc, "Autentica\u00E7\u00E3o / Apostila", "Carimbo", [
    "Data:",
    "C\u00F3digo:",
  ], 64, 24);
};

// ─── Document Body Rendering ─────────────────────────────────────────────────

const renderBody = (doc, body) => {
  body.forEach((block) => {
    if (!block) return;

    switch (block.type) {
      case "title":
        break;

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
        renderSignatures(doc, block.parties);
        break;

      case "witnesses":
        renderWitnesses(doc, block.count || 2);
        break;

      default:
        break;
    }
  });
};

// ─── Fallback (documents without documentBody template) ───────────────────────

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

  const fields = docType?.fields || [];
  if (fields.length === 0) {
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
  } else {
    fields.forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "\u2014";
      ensureSpace(doc, 14);

      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C_SUBTLE);
      doc.text(f.label.toUpperCase(), ML, pageY);

      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);
      const lines = doc.splitTextToSize(value, CW);
      doc.text(lines, ML, pageY + 4.5);
      pageY += 9 + (lines.length - 1) * 5;
    });
  }
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Generate a legal document PDF with professional editorial design.
 *
 * @param {Object} formData       - Filled form data
 * @param {Object} docType        - Document type definition (from legalDocuments)
 * @param {Object} disabledFields - Fields marked as "do not fill"
 * @param {string} variantId      - Selected variant ID
 * @returns {jsPDF} Generated PDF instance
 */
export const generateLegalPDF = (formData, docType, disabledFields = {}, variantId = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  pageY = MT;

  // Generate unique document code
  const documentCode = generateDocumentCode(docType, variantId);
  const shortCode = shortDocumentCode(documentCode);
  const validationURL = getValidationURL(documentCode);

  drawHeader(doc, docType?.name || "Documento Jur\u00EDdico", docType?.legislation, documentCode);

  const vId = variantId || docType?.defaultVariant;
  const body = vId
    ? getDocumentBody(docType?.id, vId, formData, disabledFields)
    : null;

  const hasStructuredBody = body && body.length > 0;

  if (hasStructuredBody) {
    renderBody(doc, body);
  } else {
    generateFallback(doc, docType, formData, disabledFields);
  }

  // Notary stamp section — sempre na mesma pagina, apos assinaturas
  renderNotaryStampSection(doc);

  // QR Code — bottom of the last page, relative to content flow
  pageY += 6;
  ensureSpace(doc, 30);
  const qrSize = 18;
  drawQRCode(doc, validationURL, ML, pageY, qrSize, {
    label: "Escanear para validar",
    labelSize: 5,
  });
  pageY += qrSize + 8;

  drawFooter(doc, shortCode);

  return doc;
};

/**
 * Download the generated PDF.
 */
export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

/**
 * Legacy helper for generation by document type ID.
 */
export const generatePDFByType = (docTypeId, formData) => {
  return generateLegalPDF(formData, { id: docTypeId, name: "Documento", fields: [] });
};

export default {
  generateLegalPDF,
  generatePDFByType,
  downloadLegalPDF,
};
