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
const CONTENT_BOTTOM = PAGE_H - MB - 8;

// ─── Tipografia ───────────────────────────────────────────────────────────────
const FONT_SERIF = "times";
const FONT_SANS  = "helvetica";
const BODY_SIZE  = 12.5;
const LEAD       = 6.25;
const LEAD_TIGHT = 6.05;
const SIGNATURE_SLOT_H = 24;

// ─── Cores ────────────────────────────────────────────────────────────────────
const C_INK       = [10, 10, 15];
const C_TEXT      = [44, 44, 52];
const C_SUBTLE    = [82, 80, 88];
const C_MUTED     = [105, 101, 110];
const C_DIVIDER   = [226, 224, 218];
const C_DIVIDER_H = [235, 233, 227];
const C_GOLD      = [165, 135, 55];
const C_GOLD_DARK = [132, 103, 34];
const C_GOLD_LIGHT = [235, 225, 200];
const C_BURGUNDY  = [139, 58, 58];
const C_BURGUNDY_DARK = [99, 35, 43];
const C_CREAM     = [252, 250, 245];
const C_HEADER_BG = [253, 251, 247];

// ─── Estado global ───────────────────────────────────────────────────────────
let pageY = 0;
let docCode = "";
let useLargeSignatures = false;
let signatureAtRequest = null;
let witnessesRendered = false;

// ─── Helpers de página ──────────────────────────────────────────────────────

const newPage = (doc) => {
  doc.addPage();
  pageY = MT;
};

const ensureSpace = (doc, needed) => {
  if (pageY + (needed || 10) > CONTENT_BOTTOM) newPage(doc);
};

const wouldOrphan = (startY, headerLines) => {
  const h = headerLines * LEAD;
  const available = CONTENT_BOTTOM - startY;
  return available < h + LEAD * 2;
};

// ─── Extrair cidade da data ──────────────────────────────────────────────────

const extractDate = (text) => {
  if (!text) return text;
  const m = text.match(/(\d{1,2} de \w+ de \d{4}|\d{2}\/\d{2}\/\d{4})/);
  return m ? m[1] : text;
};

const normalizePdfText = (value) => String(value ?? "")
  .replace(/\r\n/g, "\n")
  .replace(/\u00a0/g, " ")
  .replace(/[\u200b-\u200d\ufeff]/g, "")
  .replace(/[“”]/g, "\"")
  .replace(/[‘’]/g, "'")
  .replace(/[–—]/g, " - ")
  .replace(/\u2022/g, "-")
  .replace(/[ \t]+\n/g, "\n")
  .replace(/\n[ \t]+/g, "\n")
  .replace(/[ \t]{2,}/g, " ");

// ─── Render helpers ─────────────────────────────────────────────────────────

const renderTextBlock = (doc, text, size, { indent = 0, align = "left", font = FONT_SERIF, style = "normal", color = C_TEXT, leading = LEAD } = {}) => {
  const cleanText = normalizePdfText(text);
  if (!cleanText.trim()) return;
  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const x = align === "center" ? PAGE_W / 2 : align === "right" ? PAGE_W - MR : ML + indent;
  const hardParagraphs = cleanText.split(/\n{2,}/);

  hardParagraphs.forEach((paragraph, paragraphIndex) => {
    const forcedLines = paragraph.split("\n");
    forcedLines.forEach((segment, segmentIndex) => {
      const segmentText = segment.trim();
      if (!segmentText) {
        pageY += leading * 0.7;
        return;
      }

      const lines = doc.splitTextToSize(segmentText, CW - indent);
      lines.forEach((line) => {
        ensureSpace(doc, leading + 0.5);
        doc.text(line, x, pageY, { align, maxWidth: CW - indent });
        pageY += leading;
      });

      if (segmentIndex < forcedLines.length - 1) pageY += leading * 0.35;
    });

    if (paragraphIndex < hardParagraphs.length - 1) pageY += leading * 0.75;
  });
};

// ─── Draw functions ─────────────────────────────────────────────────────────

const drawQRTopRight = (doc, url) => {
  const qrSize = 20;
  const qrX = PAGE_W - MR - qrSize - 5;
  const qrY = MT + 19;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_DIVIDER);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 1.5, 1.5, "FD");
  drawQRCode(doc, url, qrX, qrY, qrSize);
};

const drawHeader = (doc, title) => {
  const safeTitle = normalizePdfText(title || "Documento Juridico").toUpperCase();
  const headerX = ML;
  const headerY = MT + 3;
  const titleMaxW = CW - 55;

  doc.setFont(FONT_SERIF, "bold");
  doc.setFontSize(19);
  let titleLines = doc.splitTextToSize(safeTitle, titleMaxW);
  if (titleLines.length > 2) {
    doc.setFontSize(16);
    titleLines = doc.splitTextToSize(safeTitle, titleMaxW);
  }

  const headerH = Math.max(51, 34 + titleLines.length * 7.5);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_DIVIDER_H);
  doc.setLineWidth(0.25);
  doc.rect(headerX, headerY, CW, headerH, "FD");

  doc.setFillColor(...C_BURGUNDY_DARK);
  doc.rect(headerX, headerY, CW, 8.5, "F");

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(7.4);
  doc.setTextColor(255, 255, 255);
  doc.text("INSTRUMENTO PARTICULAR  |  KRIOU DOCS", headerX + 8, headerY + 5.6);

  doc.setFont(FONT_SERIF, "bold");
  doc.setFontSize(titleLines.length > 2 ? 16.5 : 19);
  doc.setTextColor(...C_BURGUNDY_DARK);
  let titleY = headerY + 20;
  titleLines.forEach((line) => {
    doc.text(line, headerX + 9, titleY, { maxWidth: titleMaxW });
    titleY += 7.5;
  });

  doc.setDrawColor(...C_GOLD);
  doc.setLineWidth(0.55);
  doc.line(headerX + 9, titleY - 3, headerX + 62, titleY - 3);

  if (docCode) {
    const codeLabel = `CÓDIGO DO DOCUMENTO: ${docCode}`;
    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...C_BURGUNDY_DARK);
    doc.setFillColor(247, 240, 224);
    const codeX = headerX + 10;
    const codeWidth = Math.min(doc.getTextWidth(codeLabel) + 12, CW - 55);
    doc.roundedRect(codeX, headerY + headerH - 10.5, codeWidth, 7, 1.4, 1.4, "F");
    doc.text(codeLabel, codeX + 6, headerY + headerH - 5.7);
  }

  pageY = headerY + headerH + 8;

  doc.setTextColor(...C_TEXT);
};

const renderLegalBasis = (doc, legislation) => {
  const cleanLegislation = normalizePdfText(legislation);
  if (!cleanLegislation.trim()) return;
  doc.setFont(FONT_SERIF, "normal");
  doc.setFontSize(10.2);
  const lawLines = doc.splitTextToSize(cleanLegislation, CW - 24);
  const lineH = 5.35;
  const boxH = Math.max(18, 12.5 + lawLines.length * lineH);
  ensureSpace(doc, boxH + 8);

  pageY += 1;
  const boxX = ML;
  const boxW = CW;
  const boxY = pageY;

  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(...C_DIVIDER);
  doc.rect(boxX, boxY, boxW, boxH, "FD");

  doc.setFillColor(...C_GOLD);
  doc.rect(boxX, boxY, 3, boxH, "F");

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...C_GOLD_DARK);
  doc.text("FUNDAMENTO LEGAL", boxX + 14, boxY + 5.5);

  doc.setFont(FONT_SERIF, "normal");
  doc.setFontSize(10.2);
  doc.setTextColor(...C_INK);
  lawLines.forEach((line, i) => {
    doc.text(line, boxX + 14, boxY + 11.5 + i * lineH);
  });

  pageY = boxY + boxH + 7;
  doc.setTextColor(...C_TEXT);
};

// ─── Block renderers ────────────────────────────────────────────────────────

const renderParagraph = (doc, text) => {
  if (!text || !text.trim()) return;
  renderTextBlock(doc, text, BODY_SIZE, { indent: 5, leading: LEAD });
  pageY += 3;
};

const renderClause = (doc, clause) => {
  const hasTitle = clause.title && clause.title.trim();
  const hasText = clause.text && clause.text.trim();
  const hasParagraphs = clause.paragraphs && clause.paragraphs.length > 0;
  if (!hasTitle && !hasText && !hasParagraphs) return;

  doc.setFont(FONT_SERIF, "bold");
  doc.setFontSize(10.2);
  const titleLines = hasTitle
    ? doc.splitTextToSize(normalizePdfText(clause.title).toUpperCase(), CW - 20)
    : [];
  const headerH = hasTitle ? 4.5 + titleLines.length * 4.8 : 6;

  if (wouldOrphan(pageY, Math.ceil(headerH / LEAD) + 1)) newPage(doc);
  ensureSpace(doc, headerH + 6);

  const headerY = pageY;
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.18);
  doc.line(ML + 5, headerY + headerH, ML + CW, headerY + headerH);

  doc.setFillColor(...C_BURGUNDY_DARK);
  doc.rect(ML, headerY - 0.7, 1.8, headerH + 0.7, "F");

  const normalizedTitle = normalizePdfText(clause.title || "").trim();
  const titleAlreadyContainsClause = /^CLÁUSULA\b/i.test(normalizedTitle);
  if (!titleAlreadyContainsClause) {
    doc.setFillColor(...C_GOLD_DARK);
    doc.roundedRect(ML + 5, headerY - 0.4, 25, 5.7, 1, 1, "F");
    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text(`CLÁUSULA ${clause.number}`, ML + 17.5, headerY + 3.4, { align: "center" });
  }

  if (hasTitle) {
    doc.setFont(FONT_SERIF, "bold");
    doc.setFontSize(10.7);
    doc.setTextColor(...C_BURGUNDY_DARK);
    titleLines.forEach((line, index) => {
      doc.text(
        line,
        ML + (titleAlreadyContainsClause ? 5 : 34),
        headerY + 3.8 + index * 4.8,
        { maxWidth: CW - (titleAlreadyContainsClause ? 12 : 40) }
      );
    });
  }

  // Zona de segurança: impede que o primeiro parágrafo encoste na linha do título.
  pageY = headerY + headerH + 4.4;

  if (hasText) {
    renderTextBlock(doc, clause.text, BODY_SIZE, { indent: 0, leading: LEAD_TIGHT });
    pageY += 0.8;
  }

  if (hasParagraphs) {
    clause.paragraphs.forEach((p) => {
      const cleanParagraph = normalizePdfText(p).trim();
      if (!cleanParagraph) return;
      const indent = /^[§IVX\d]/.test(cleanParagraph) ? 8 : 4;
      renderTextBlock(doc, cleanParagraph, BODY_SIZE, { indent, leading: LEAD_TIGHT });
      pageY += 1.1;
    });
  }

  pageY += 2;
};

const renderClosing = (doc, text) => {
  if (!text || !text.trim()) return;
  ensureSpace(doc, 12);
  pageY += 2;
  doc.setFont(FONT_SERIF, "italic");
  doc.setFontSize(9.6);
  doc.setTextColor(...C_SUBTLE);
  const lines = doc.splitTextToSize(normalizePdfText(text), CW);
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
  ensureSpace(doc, 10);
  pageY += 4;
  doc.setFont(FONT_SERIF, "normal");
  doc.setFontSize(9.8);
  doc.setTextColor(...C_TEXT);
  doc.text(normalizePdfText(dateOnly), PAGE_W / 2, pageY, { align: "center" });
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
  const cols = useLargeSignatures ? 1 : parties.length <= 2 ? parties.length : 2;
  const rows = Math.ceil(parties.length / cols);
  const slotH = useLargeSignatures ? (signatureAtRequest ? 34 : 30) : (signatureAtRequest ? 34 : SIGNATURE_SLOT_H);
  const requiredH = rows * slotH + 8;
  ensureSpace(doc, requiredH);

  pageY += 6;
  const startY = pageY;
  const colW = CW / cols;

  parties.forEach((party, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const slotY = startY + row * slotH;
    const cx = ML + col * colW + colW / 2;
    const lineW = useLargeSignatures ? Math.min(colW * 0.82, 140) : Math.min(colW * 0.72, 62);
    const lx = cx - lineW / 2;

    doc.setDrawColor(...C_TEXT);
    doc.setLineWidth(0.22);
    let dx = lx;
    while (dx < lx + lineW) {
      doc.line(dx, slotY, Math.min(dx + 2.5, lx + lineW), slotY);
      dx += 4;
    }

    doc.setFont(FONT_SERIF, "normal");
    doc.setFontSize(useLargeSignatures ? 10.5 : 9);
    doc.setTextColor(...C_TEXT);
    const isAtRequest = signatureAtRequest
      && signatureAtRequest.partyName === party.name
      && signatureAtRequest.partyRole === party.role;
    const rawName = isAtRequest ? signatureAtRequest.signerName : (party.name || "");
    const nameLines = doc.splitTextToSize(rawName, lineW).slice(0, 2);
    const visibleNameLines = nameLines.length ? nameLines : [" "];
    visibleNameLines.forEach((line, lineIdx) => {
      doc.text(line, cx, slotY + 5.5 + lineIdx * 3.7, { align: "center", maxWidth: lineW });
    });

    doc.setFont(FONT_SANS, "bold");
    doc.setFontSize(useLargeSignatures ? 8 : 7.2);
    doc.setTextColor(...C_GOLD);
    const roleLabel = isAtRequest ? "ASSINANTE A ROGO" : String(party.role || "").toUpperCase();
    const roleLines = doc.splitTextToSize(roleLabel, lineW).slice(0, 2);
    const roleY = slotY + 7 + visibleNameLines.length * 3.7;
    roleLines.forEach((line, lineIdx) => {
      doc.text(line, cx, roleY + lineIdx * 3.3, { align: "center", maxWidth: lineW });
    });

    if (isAtRequest) {
      doc.setFont(FONT_SANS, "normal");
      doc.setFontSize(useLargeSignatures ? 8 : 7.2);
      doc.setTextColor(...C_SUBTLE);
      const assisted = `A rogo de ${party.name} (${party.role}), que declarou ${signatureAtRequest.reason}.`;
      const signerCpf = signatureAtRequest.signerCpf ? `CPF do assinante: ${signatureAtRequest.signerCpf}` : "";
      doc.text(doc.splitTextToSize(assisted, lineW), cx, roleY + 7, { align: "center", maxWidth: lineW });
      if (signerCpf) doc.text(signerCpf, cx, roleY + 13, { align: "center", maxWidth: lineW });
    }
  });

  pageY = startY + rows * slotH + 2;
  doc.setTextColor(...C_TEXT);
};

const renderWitnesses = (doc, count = 2) => {
  witnessesRendered = true;
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
  // Reserva cartorial obrigatória para dois selos. Se não houver espaço útil na
  // última página, cria uma página limpa em vez de sobrepor assinaturas ou texto.
  const requiredH = 43;
  if (pageY + requiredH > CONTENT_BOTTOM) newPage(doc);
  pageY += 2;

  doc.setFont(FONT_SANS, "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...C_GOLD_DARK);
  doc.text("USO DO CARTÓRIO", PAGE_W / 2, pageY, { align: "center" });
  pageY += 1.5;
  doc.setDrawColor(...C_GOLD_LIGHT);
  doc.setLineWidth(0.1);
  doc.line(PAGE_W / 2 - 45, pageY, PAGE_W / 2 + 45, pageY);
  pageY += 4;

  const gap = 8;
  const boxW = (CW - gap) / 2;
  const boxH = 28;
  const boxX = ML;
  const boxY = pageY;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.25);
  [boxX, boxX + boxW + gap].forEach((x) => doc.roundedRect(x, boxY, boxW, boxH, 1.5, 1.5, "FD"));

  pageY = boxY + boxH + 8;
};

// ─── Watermark on last page ──────────────────────────────────────────────

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
    doc.setFontSize(7);
    doc.setTextColor(...C_SUBTLE);
    doc.text(`Página ${i} de ${totalPages}`, PAGE_W / 2, fy + 1, { align: "center" });

    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.text(dateStr, PAGE_W - MR, fy + 1, { align: "right" });
    doc.setFont(FONT_SANS, "bold");
    doc.text(docCode ? `Código: ${docCode}` : "", ML, fy + 1);
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
        {
          const partyCount = block.parties?.length || 0;
          const cols = useLargeSignatures ? 1 : (partyCount <= 2 ? Math.max(partyCount, 1) : 2);
          const rows = Math.ceil(partyCount / cols);
          const slotH = useLargeSignatures ? (signatureAtRequest ? 34 : 30) : (signatureAtRequest ? 34 : SIGNATURE_SLOT_H);
          ensureSpace(doc, 20 + rows * slotH);
        }
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
  useLargeSignatures = formData?._signatureLayout === "large";
  witnessesRendered = false;
  signatureAtRequest = formData?._signatureAtRequestEnabled === "yes"
    ? {
        partyName: formData._signatureAtRequestPartyName || "",
        partyRole: formData._signatureAtRequestPartyRole || "",
        signerName: formData._signatureAtRequestSignerName || "",
        signerCpf: formData._signatureAtRequestSignerCpf || "",
        reason: formData._signatureAtRequestReason || "não poder assinar",
      }
    : null;

  const documentCode = generateDocumentCode(docType, variantId);
  docCode = shortDocumentCode(documentCode);
  const validationURL = getValidationURL(documentCode);

  const vId = variantId || docType?.defaultVariant;
  const body = vId ? getDocumentBody(docType?.id, vId, formData, disabledFields) : null;
  const hasStructuredBody = body && body.length > 0;
  const exactTitle = hasStructuredBody
    ? body.find((block) => block?.type === "title" && block.text)?.text
    : null;

  // Cabeçalho usa o título exato da variante, quando disponível.
  drawHeader(doc, exactTitle || docType?.name || "Documento Jur\u00eddico");

  // QR code at top-right (small, discreet)
  drawQRTopRight(doc, validationURL);

  // Legal basis box
  renderLegalBasis(doc, docType?.legislation);

  // Document body
  if (hasStructuredBody) renderBody(doc, body);
  else renderFallback(doc, docType, formData, disabledFields);

  // O art. 595 do Código Civil exige duas testemunhas na prestação de serviço
  // assinada a rogo. Nos demais modelos, o bloco também reforça a identificação.
  if (signatureAtRequest && !witnessesRendered) renderWitnesses(doc, 2);

  // Stamp/seal space on last page
  renderStampSpace(doc);

  // Footer on all pages
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
