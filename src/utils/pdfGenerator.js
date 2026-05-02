/**
 * ============================================
 * KRIOU DOCS — Professional Resume PDF Generator
 * ============================================
 * Two-column layout: sidebar (30%) + main content (70%).
 * No solid colored blocks. Clean editorial design with
 * fine lines and subtle accents.
 *
 * Design principles:
 * - Never pure black (#000) or pure white (#FFF)
 * - No side-stripe borders as decorative elements
 * - Typography: Times (serif) for name/headings, Helvetica for body
 * - Template color used sparingly — accents only, not backgrounds
 * - Fine dividers (0.15mm), generous whitespace
 *
 * @module utils/pdfGenerator
 */

import { jsPDF } from "jspdf";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;

// Sidebar occupies left portion
const SIDEBAR_W = 58;
const SIDEBAR_X = MARGIN;
const MAIN_GAP = 7;                     // gap between sidebar and main column
const MAIN_X = SIDEBAR_X + SIDEBAR_W + MAIN_GAP;
const MAIN_W = PAGE_W - MAIN_X - MARGIN;

// Color palette — neutros tingidos (never pure black)
const C_DARK      = [38, 42, 52];       // body heading text
const C_TEXT      = [58, 62, 72];       // body paragraph text
const C_MUTED     = [130, 134, 140];    // secondary labels
const C_LIGHT     = [175, 178, 182];    // very subtle text
const C_DIVIDER   = [222, 220, 215];    // fine lines — warm gray
const C_BG_TINT   = 0.04;               // sidebar background tint opacity

// Typography
const FONT_HEADING  = "times";
const FONT_BODY     = "helvetica";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 15, g: 52, b: 96 };
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Draw a thin horizontal divider line.
 */
const drawDivider = (doc, x, y, width, alpha = 0.6) => {
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.15);
  doc.line(x, y, x + width, y);
};

/**
 * Draw sidebar background tint (subtle colored rectangle with low opacity).
 * Uses GState for transparency support in jsPDF v4.
 */
const drawSidebarBg = (doc, primaryRgb) => {
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const gs = new doc.GState({ opacity: C_BG_TINT });
    doc.setGState(gs);
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(SIDEBAR_X, MARGIN, SIDEBAR_W, PAGE_H - MARGIN * 2, "F");
    // Reset GState to full opacity
    doc.setGState(new doc.GState({ opacity: 1 }));
  }
};

// ─── Sidebar Content ──────────────────────────────────────────────────────────

/**
 * Draw the monogram circle (initials avatar) in the sidebar.
 */
const drawMonogram = (doc, initials, primaryRgb, accentRgb, y) => {
  const centerX = SIDEBAR_X + SIDEBAR_W / 2;
  const radius = 13;

  // Outer circle — primary color
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.circle(centerX, y + radius, radius, "F");

  // Inner circle — accent color (smaller, inset)
  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.circle(centerX, y + radius, radius - 2, "F");

  // Initials — white, times bold
  doc.setTextColor(255, 255, 255);
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(radius * 0.9);
  doc.text(initials, centerX, y + radius + 1.2, { align: "center" });

  doc.setTextColor(...C_TEXT);
};

/**
 * Render a sidebar section (label + items).
 */
const renderSidebarSection = (doc, label, items, y, primaryRgb, indent = 3) => {
  if (!items || items.length === 0) return y;

  // Section label — accent color, small caps
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(label, SIDEBAR_X + indent, y);
  y += 5;

  // Thin line under label
  drawDivider(doc, SIDEBAR_X + indent, y - 1, SIDEBAR_W - indent * 2);
  y += 4;

  // Items
  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C_TEXT);

  items.forEach((item) => {
    const isObject = typeof item === "object";
    const text = isObject ? item.text : item;
    const lines = doc.splitTextToSize(text, SIDEBAR_W - indent * 2 - 3);

    lines.forEach((line) => {
      doc.text(line, SIDEBAR_X + indent + 3, y);
      y += 4.2;
    });

    if (isObject && item.sub) {
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(7);
      doc.setTextColor(...C_MUTED);
      doc.text(item.sub, SIDEBAR_X + indent + 3, y);
      y += 3.8;
      doc.setFontSize(8);
      doc.setTextColor(...C_TEXT);
    }
  });

  return y + 4;
};

// ─── Main Content ─────────────────────────────────────────────────────────────

/**
 * Render a section header in the main column — accent-colored with thin underline.
 */
const renderMainSectionHeader = (doc, title, y, accentRgb) => {
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.text(title, MAIN_X, y);
  y += 3.5;

  // Thin accent underline (40% of content width)
  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(0.3);
  doc.line(MAIN_X, y, MAIN_X + MAIN_W * 0.4, y);
  y += 5;

  doc.setTextColor(...C_TEXT);
  return y;
};

/**
 * Render text with optional leading and indent.
 */
const renderText = (doc, text, x, y, maxWidth, { font = FONT_BODY, size = 9, color = C_TEXT, leading = 4.5 } = {}) => {
  if (!text || text.trim() === "") return y;

  doc.setFont(font, "normal");
  doc.setFontSize(size);
  doc.setTextColor(...color);

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    doc.text(line, x, y);
    y += leading;
  });

  return y;
};

// ─── Main Generator ───────────────────────────────────────────────────────────

/**
 * Generate a professional resume PDF.
 *
 * @param {Object} formData  - Resume form data
 * @param {Object} template  - Selected template config { color, accent, id, name }
 * @returns {jsPDF} Generated PDF instance
 */
export const generateResumePDF = (formData, template) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryRgb   = hexToRgb(template?.color || "#1E3A5F");
  const accentRgb    = hexToRgb(template?.accent || "#3498DB");
  const initials     = getInitials(formData.nome);
  const fullName     = (formData.nome || "Nome Completo").trim();

  // ── Build contact items for sidebar ──────────────────────────────────────
  const contactItems = [];
  if (formData.email)        contactItems.push(formData.email);
  if (formData.telefone)     contactItems.push(formData.telefone);
  if (formData.cidade)       contactItems.push(formData.cidade);
  if (formData.linkedin)     contactItems.push(formData.linkedin);
  if (formData.portfolio)    contactItems.push(formData.portfolio);
  if (formData.dataNascimento) contactItems.push(formData.dataNascimento);

  // ── Build skills list ────────────────────────────────────────────────────
  const skillItems = (formData.habilidades || []).map((s) => ({ text: s }));
  // Add custom skills if present
  if (formData.habilidadesExtras && formData.habilidadesExtras.trim()) {
    formData.habilidadesExtras
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => skillItems.push({ text: s }));
  }

  // ── Build languages list ─────────────────────────────────────────────────
  const langItems = (formData.idiomas || [])
    .filter((i) => i.idioma)
    .map((i) => ({ text: i.idioma, sub: i.nivel }));

  // ── Sidebar rendering ────────────────────────────────────────────────────
  let sidebarY = MARGIN + 9;

  // Monogram avatar
  drawMonogram(doc, initials, primaryRgb, accentRgb, sidebarY);
  sidebarY += 35;

  // Full name in sidebar — times bold, primary color
  const nameLines = doc.splitTextToSize(fullName, SIDEBAR_W - 8);
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  nameLines.forEach((line) => {
    doc.text(line, SIDEBAR_X + SIDEBAR_W / 2, sidebarY, { align: "center" });
    sidebarY += 7;
  });
  sidebarY += 2;

  // Accent title below name
  if (formData.cargo || formData.profissao) {
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MUTED);
    doc.text(
      (formData.cargo || formData.profissao).toUpperCase(),
      SIDEBAR_X + SIDEBAR_W / 2,
      sidebarY,
      { align: "center", maxWidth: SIDEBAR_W - 10 }
    );
    sidebarY += 6;
  }

  // Divider below name
  sidebarY += 2;
  drawDivider(doc, SIDEBAR_X + 8, sidebarY, SIDEBAR_W - 16);
  sidebarY += 8;

  // Contact section
  sidebarY = renderSidebarSection(
    doc, "CONTATO", contactItems, sidebarY, primaryRgb
  );

  // Skills section
  if (skillItems.length > 0) {
    sidebarY = renderSidebarSection(
      doc, "HABILIDADES", skillItems, sidebarY, primaryRgb
    );
  }

  // Languages section
  if (langItems.length > 0) {
    sidebarY = renderSidebarSection(
      doc, "IDIOMAS", langItems, sidebarY, primaryRgb
    );
  }

  // ── Main content rendering ───────────────────────────────────────────────
  let mainY = MARGIN + 9;

  // Objective / Professional Summary
  if (formData.objetivo && formData.objetivo.trim()) {
    mainY = renderMainSectionHeader(doc, "RESUMO PROFISSIONAL", mainY, accentRgb);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C_TEXT);
    const objLines = doc.splitTextToSize(formData.objetivo, MAIN_W);
    objLines.forEach((line) => {
      doc.text(line, MAIN_X, mainY);
      mainY += 5;
    });
    mainY += 7;
  }

  // Professional Experience
  const activeExps = (formData.experiencias || []).filter((e) => e.empresa);
  if (activeExps.length > 0) {
    mainY = renderMainSectionHeader(doc, "EXPERIÊNCIA PROFISSIONAL", mainY, accentRgb);

    activeExps.forEach((exp, idx) => {
      // Job title — bold
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C_DARK);
      doc.text(exp.cargo || "Cargo", MAIN_X, mainY);

      // Period — right aligned, muted
      if (exp.periodo) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_MUTED);
        const pw = doc.getTextWidth(exp.periodo);
        doc.text(exp.periodo, MAIN_X + MAIN_W - pw, mainY);
      }

      mainY += 5;

      // Company — accent color, semibold
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      doc.text(exp.empresa, MAIN_X, mainY);
      mainY += 5;

      // Description
      if (exp.descricao && exp.descricao.trim()) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C_TEXT);
        const descLines = doc.splitTextToSize(exp.descricao, MAIN_W);
        descLines.forEach((line) => {
          doc.text(line, MAIN_X, mainY);
          mainY += 4.2;
        });
      }

      // Space between entries except last
      mainY += idx < activeExps.length - 1 ? 6 : 4;
    });

    mainY += 8;
  }

  // Education
  const activeEdus = (formData.formacoes || []).filter((f) => f.instituicao);
  if (activeEdus.length > 0) {
    mainY = renderMainSectionHeader(doc, "FORMAÇÃO ACADÊMICA", mainY, accentRgb);

    activeEdus.forEach((edu, idx) => {
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C_DARK);
      doc.text(edu.curso || "Curso", MAIN_X, mainY);

      if (edu.periodo) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_MUTED);
        const pw = doc.getTextWidth(edu.periodo);
        doc.text(edu.periodo, MAIN_X + MAIN_W - pw, mainY);
      }

      mainY += 5;

      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...C_TEXT);
      doc.text(`${edu.instituicao}${edu.status ? " \u2014 " + edu.status : ""}`, MAIN_X, mainY);
      mainY += 5;

      mainY += idx < activeEdus.length - 1 ? 3 : 2;
    });

    mainY += 8;
  }

  // Courses / Certifications
  if (formData.cursos && formData.cursos.trim()) {
    mainY = renderMainSectionHeader(doc, "CURSOS E CERTIFICAÇÕES", mainY, accentRgb);

    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT);
    const courseLines = doc.splitTextToSize(formData.cursos, MAIN_W);
    courseLines.forEach((line) => {
      doc.text(`\u2022 ${line}`, MAIN_X, mainY);
      mainY += 5;
    });
    mainY += 4;
  }

  // Additional info (optional fields like CNH, disponibilidade, etc.)
  const extras = [];
  if (formData.cnh)                  extras.push(`CNH: ${formData.cnh}`);
  if (formData.disponibilidade)      extras.push(`Disponibilidade: ${formData.disponibilidade}`);
  if (formData.pretensaoSalarial)    extras.push(`Pretensão Salarial: ${formData.pretensaoSalarial}`);
  if (extras.length > 0) {
    mainY = renderMainSectionHeader(doc, "INFORMAÇÕES ADICIONAIS", mainY, accentRgb);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT);
    extras.forEach((extra) => {
      doc.text(`\u2022 ${extra}`, MAIN_X, mainY);
      mainY += 5;
    });
  }

  // ── Sidebar background (drawn after all content for full page coverage) ──
  // Use a very subtle tinted sidebar background
  drawSidebarBg(doc, primaryRgb);

  // ── Footer on every page ─────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    const footerY = PAGE_H - MARGIN + 2;

    // Thin divider line
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4);

    // Left: branding
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(6);
    doc.setTextColor(...C_LIGHT);
    doc.text("krioudocs.com.br", MARGIN, footerY);

    // Center: page number
    doc.text(`${p} / ${pageCount}`, PAGE_W / 2, footerY, { align: "center" });

    // Right: generation date
    const dateStr = new Date().toLocaleDateString("pt-BR");
    doc.text(dateStr, PAGE_W - MARGIN, footerY, { align: "right" });
  }

  return doc;
};

/**
 * Download a generated PDF file.
 *
 * @param {jsPDF} doc      - PDF document instance
 * @param {string} filename - Output filename
 */
export const downloadPDF = (doc, filename = "curriculo.pdf") => {
  doc.save(filename);
};

export default {
  generateResumePDF,
  downloadPDF,
};
