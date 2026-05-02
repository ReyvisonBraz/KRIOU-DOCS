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
 * - No decorative side stripes
 * - Variable rhythm spacing between sections
 * - Clauses grouped — never orphaned
 * - Intelligent page breaks
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

// ─── Typography ──────────────────────────────────────────────────────────────
const FONT_BODY   = "times";
const FONT_LABEL  = "helvetica";
const SIZE_TITLE  = 15;
const SIZE_BODY   = 11;
const SIZE_SMALL  = 9;
const SIZE_CAPTION = 7.5;
const LEAD_BODY   = 5.8;   // line advance for body paragraphs
const LEAD_TIGHT  = 5.0;   // line advance for dense lists
const LEAD_CLAUSE = 11.0;  // clause header height

// ─── Spacing ─────────────────────────────────────────────────────────────────
const GAP_SECTION = 10;     // between major sections
const GAP_CLAUSE  = 5.5;    // between clauses
const GAP_PARA    = 3;      // between paragraphs within clause
const GAP_TITLE   = 15;     // space after document title

// ─── Colors (warm-tinted neutrals) ───────────────────────────────────────────
const C_INK      = [22, 29, 38];     // titles — warm dark blue
const C_TEXT     = [52, 58, 66];     // body — blue-gray
const C_SUBTLE   = [115, 120, 130];  // labels — medium gray
const C_MUTED    = [165, 170, 178];  // separators
const C_DIVIDER  = [228, 226, 220];  // fine lines — warm gray
const C_GOLD     = [165, 135, 55];   // accent — warm gold
const C_CREAM    = [253, 251, 246];  // subtle background (never pure white)

// ─── Page state ──────────────────────────────────────────────────────────────
let pageY = 0;
let currentClauseGroup = [];

const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

/**
 * Ensures content fits on current page. Advances if needed.
 */
const ensureSpace = (doc, needed = 14) => {
  if (pageY + needed > PAGE_H - MB) {
    newPage(doc);
  }
  return pageY;
};

// ─── Editorial Header ────────────────────────────────────────────────────────

/**
 * Draws the editorial header on the first page.
 * Clean typography — no solid blocks, just text + one gold line.
 */
const drawHeader = (doc, title, legislation) => {
  // Top accent line — thin gold, centered, elegant
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.5);
  doc.line(PAGE_W / 2 - 35, MT + 4, PAGE_W / 2 + 35, MT + 4);

  pageY = MT + 14;

  // Document title — centered, times bold, uppercase
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  const titleLines = doc.splitTextToSize(title.toUpperCase(), CW - 20);
  titleLines.forEach((line) => {
    doc.text(line, PAGE_W / 2, pageY, { align: "center" });
    pageY += 7.5;
  });

  // Gold decorative line below title — centered
  pageY += 2;
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  const ruleW = Math.min(CW * 0.35, 55);
  doc.line(PAGE_W / 2 - ruleW / 2, pageY, PAGE_W / 2 + ruleW / 2, pageY);

  // Subtitle — helvetica normal, muted gray
  pageY += 7;
  doc.setFont(FONT_LABEL, "normal");
  doc.setFontSize(SIZE_CAPTION);
  doc.setTextColor(...C_SUBTLE);
  doc.text("Documento gerado por Kriou Docs", PAGE_W / 2, pageY, { align: "center" });

  // Legislation reference if available
  if (legislation) {
    pageY += 5;
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text(legislation, PAGE_W / 2, pageY, { align: "center", maxWidth: CW * 0.8 });
  }

  pageY += 13;
  doc.setTextColor(...C_TEXT);
};

// ─── Footer ──────────────────────────────────────────────────────────────────

const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - MB + 4;

    // Subtle separator line
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.2);
    doc.line(ML, fy - 4, PAGE_W - MR, fy - 4);

    // Page number — centered
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(SIZE_CAPTION);
    doc.setTextColor(...C_MUTED);
    doc.text(`${i} / ${totalPages}`, PAGE_W / 2, fy + 1, { align: "center" });

    // Date — right
    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(7);
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });

    // Branding — left
    doc.text("krioudocs.com.br", ML, fy + 1);
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
  ensureSpace(doc, 16);

  const hasTitle = title && title.trim() !== "";

  // Clause number — gold, helvetica bold
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C_GOLD);
  doc.text(`CL\u00C1USULA ${number}`, ML, pageY - 0.5);
  pageY += LEAD_BODY;

  // Clause title — times bold, ink color
  if (hasTitle) {
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(SIZE_BODY);
    doc.setTextColor(...C_INK);
    doc.text(title, ML, pageY);
    pageY += LEAD_BODY + 0.5;
  }

  // Thin separator line below header
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.2);
  doc.line(ML, pageY - 1.5, ML + CW * 0.5, pageY - 1.5);
  pageY += 1;

  doc.setTextColor(...C_TEXT);
};

/**
 * Render a complete clause: header + text + paragraphs.
 * Groups clauses — never orphans header from content.
 */
const renderClause = (doc, clause) => {
  const textLines = clause.text
    ? doc.splitTextToSize(clause.text, CW).length
    : 0;
  const paraLines = clause.paragraphs
    ? clause.paragraphs.reduce((acc, p) => acc + doc.splitTextToSize(p, CW).length, 0)
    : 0;
  const totalLines = textLines + paraLines;
  const estimatedHeight = 10 + totalLines * LEAD_BODY + GAP_CLAUSE;

  // Ensure header + at least 2 lines fit
  if (totalLines > 4) {
    ensureSpace(doc, 10 + 2 * LEAD_BODY);
  } else {
    ensureSpace(doc, estimatedHeight);
  }

  renderClauseHeader(doc, clause.number, clause.title);

  // Main clause text (single paragraph)
  if (clause.text) {
    renderParagraph(doc, clause.text, { indent: 0 });
  }

  // Numbered paragraphs
  if (clause.paragraphs?.length) {
    clause.paragraphs.forEach((p) => {
      ensureSpace(doc, LEAD_BODY + 1);
      const isSubItem = /^[§IVX]+/.test(p.trim());
      const indent = isSubItem ? 10 : 5;

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
 * Render the closing statement (italic, subtle).
 */
const renderClosing = (doc, text) => {
  if (!text || text.trim() === "") return pageY;
  ensureSpace(doc, 16);
  pageY += 4;

  doc.setFont(FONT_BODY, "italic");
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(...C_SUBTLE);

  const lines = doc.splitTextToSize(text, CW);
  lines.forEach((line) => {
    ensureSpace(doc, LEAD_BODY);
    doc.text(line, ML, pageY);
    pageY += LEAD_BODY;
  });
  pageY += 5;
  doc.setTextColor(...C_TEXT);
  doc.setFont(FONT_BODY, "normal");
};

/**
 * Render date and location — centered.
 */
const renderDate = (doc, text) => {
  if (!text || text.trim() === "") return pageY;
  ensureSpace(doc, 12);
  pageY += 4;

  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(SIZE_BODY);
  doc.setTextColor(...C_TEXT);
  doc.text(text, PAGE_W / 2, pageY, { align: "center" });
  pageY += 16;
};

/**
 * Render signature block with dotted lines.
 * Evenly distributes parties across the content width.
 */
const renderSignatures = (doc, parties) => {
  if (!parties?.length) return pageY;
  ensureSpace(doc, 55);

  pageY += 10;
  const colW = CW / parties.length;

  parties.forEach((party, i) => {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.7;
    const lineStartX = centerX - lineW / 2;

    // Dotted signature line
    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.25);
    const dash = 1.8;
    const gap = 1.2;
    let dx = lineStartX;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + dash, lineStartX + lineW), pageY);
      dx += dash + gap;
    }

    // Name below line
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C_TEXT);
    doc.text(party.name || "", centerX, pageY + 5.5, {
      align: "center",
      maxWidth: lineW,
    });

    // Role label — gold, helvetica bold
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C_GOLD);
    doc.text(party.role, centerX, pageY + 10.5, { align: "center" });
  });

  pageY += 24;
  doc.setTextColor(...C_TEXT);
};

/**
 * Render witness block with signature lines and fields.
 */
const renderWitnesses = (doc, count = 2) => {
  ensureSpace(doc, 50);
  pageY += 4;

  // Section header
  doc.setFont(FONT_LABEL, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C_SUBTLE);
  doc.text("TESTEMUNHAS", ML, pageY);
  pageY += 12;

  const colW = CW / count;
  for (let i = 0; i < count; i++) {
    const centerX = ML + i * colW + colW / 2;
    const lineW = colW * 0.76;
    const lineStartX = centerX - lineW / 2;

    // Gold circle with number
    doc.setFillColor(...C_GOLD);
    doc.setDrawColor(...C_GOLD);
    doc.circle(lineStartX + 4, pageY - 1, 3.5, "FD");
    doc.setFont(FONT_LABEL, "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, lineStartX + 4, pageY, { align: "center" });

    // Dotted signature line
    doc.setDrawColor(...C_MUTED);
    doc.setLineWidth(0.2);
    let dx = lineStartX + 9;
    while (dx < lineStartX + lineW) {
      doc.line(dx, pageY, Math.min(dx + 1.5, lineStartX + lineW), pageY);
      dx += 2.5;
    }

    // Field labels
    doc.setFont(FONT_LABEL, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text("Nome:", lineStartX + 9, pageY + 5);
    doc.text("CPF:", lineStartX + 9, pageY + 10);

    // Fill lines
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(lineStartX + 21, pageY + 5.5, lineStartX + lineW, pageY + 5.5);
    doc.line(lineStartX + 17, pageY + 10.5, lineStartX + lineW * 0.7, pageY + 10.5);
  }
  pageY += 24;
  doc.setTextColor(...C_TEXT);
};

// ─── Document Body Rendering ─────────────────────────────────────────────────

const renderBody = (doc, body) => {
  body.forEach((block) => {
    if (!block) return;

    switch (block.type) {
      case "title":
        // Already rendered in header
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
  // Title
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(SIZE_TITLE);
  doc.setTextColor(...C_INK);
  doc.text((docType?.name || "DOCUMENTO").toUpperCase(), PAGE_W / 2, pageY, { align: "center" });

  pageY += GAP_TITLE;

  // Gold decorative line
  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.4);
  doc.line(PAGE_W / 2 - 30, pageY, PAGE_W / 2 + 30, pageY);
  pageY += 16;

  const fields = docType?.fields || [];
  if (fields.length === 0) {
    // Generic fallback: render sections
    const sections = docType?.commonSections || [];
    sections.forEach((section) => {
      ensureSpace(doc, 18);

      // Section title
      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C_GOLD);
      doc.text(section.title.toUpperCase(), ML, pageY);
      pageY += 6;

      // Thin separator
      doc.setDrawColor(...C_DIVIDER);
      doc.setLineWidth(0.15);
      doc.line(ML, pageY - 2, ML + CW * 0.4, pageY - 2);
      pageY += 1;

      section.fields?.forEach((f) => {
        if (disabledFields[f.key]) return;
        const value = formData[f.key] || "";
        if (!value || value.trim() === "") return;

        ensureSpace(doc, 10);

        // Field label
        doc.setFont(FONT_LABEL, "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C_SUBTLE);
        doc.text(f.label, ML, pageY);

        // Field value
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(SIZE_BODY);
        doc.setTextColor(...C_TEXT);
        const vLines = doc.splitTextToSize(value, CW - 3);
        vLines.forEach((l) => {
          doc.text(l, ML + 3, pageY + 5);
          pageY += 5.5;
        });
        pageY += 2;
      });

      pageY += 4;
    });
  } else {
    fields.forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "\u2014";
      ensureSpace(doc, 16);

      doc.setFont(FONT_LABEL, "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C_SUBTLE);
      doc.text(f.label.toUpperCase(), ML, pageY);

      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(SIZE_BODY);
      doc.setTextColor(...C_TEXT);
      const lines = doc.splitTextToSize(value, CW);
      doc.text(lines, ML, pageY + 5);
      pageY += 10 + (lines.length - 1) * 5.5;
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

  // Reset page state
  pageY = MT;

  // Editorial header
  drawHeader(doc, docType?.name || "Documento Jur\u00EDdico", docType?.legislation);

  // Get interpolated document body
  const vId = variantId || docType?.defaultVariant;
  const body = vId
    ? getDocumentBody(docType?.id, vId, formData, disabledFields)
    : null;

  if (body && body.length > 0) {
    // Full contract with clauses
    renderBody(doc, body);
  } else {
    // Simple field list fallback
    generateFallback(doc, docType, formData, disabledFields);
  }

  // Footer on all pages
  drawFooter(doc);

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
