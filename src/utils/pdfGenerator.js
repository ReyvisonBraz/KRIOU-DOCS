/**
 * ============================================
 * KRIOU DOCS — Professional Resume PDF Generator
 * ============================================
 * Two-column layout: sidebar (30%) + main content (70%).
 * Clean editorial design with fine lines and subtle accents.
 *
 * Design principles:
 * - Never pure black (#000) or pure white (#FFF)
 * - Typography: Times (serif) for name/headings, Helvetica for body
 * - Template color used sparingly — accents only, not backgrounds
 * - Fine dividers (0.15mm), generous whitespace
 * - Full multi-page support with automatic page breaks
 * - Sidebar background drawn BEFORE content (correct PDF layering)
 *
 * @module utils/pdfGenerator
 */

import { jsPDF } from "jspdf";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN  = 14;

// Sidebar occupies left portion
const SIDEBAR_W   = 58;
const SIDEBAR_X   = MARGIN;
const MAIN_GAP    = 7;
const MAIN_X      = SIDEBAR_X + SIDEBAR_W + MAIN_GAP;
const MAIN_W      = PAGE_W - MAIN_X - MARGIN;

// Footer reserve (mm from bottom)
const FOOTER_RESERVE = 16;
const CONTENT_BOTTOM = PAGE_H - MARGIN - FOOTER_RESERVE;

// Color palette — neutros tingidos (never pure black)
const C_DARK    = [38, 42, 52];
const C_TEXT    = [58, 62, 72];
const C_MUTED   = [130, 134, 140];
const C_LIGHT   = [175, 178, 182];
const C_DIVIDER = [222, 220, 215];
const C_BG_TINT = 0.04;

// Typography
const FONT_HEADING = "times";
const FONT_BODY    = "helvetica";

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

const drawDivider = (doc, x, y, width) => {
  doc.setDrawColor(...C_DIVIDER);
  doc.setLineWidth(0.15);
  doc.line(x, y, x + width, y);
};

// ─── Sidebar Background ───────────────────────────────────────────────────────

/**
 * Draw sidebar tinted background on the CURRENT page.
 * Must be called at the start of each new page, before any content.
 */
const drawSidebarTint = (doc, primaryRgb) => {
  const gs = new doc.GState({ opacity: C_BG_TINT });
  doc.setGState(gs);
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(SIDEBAR_X, MARGIN, SIDEBAR_W, PAGE_H - MARGIN * 2, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setTextColor(...C_TEXT);
};

// ─── Sidebar Content ──────────────────────────────────────────────────────────

/**
 * Draw the monogram circle (initials avatar) in the sidebar.
 */
const drawMonogram = (doc, initials, primaryRgb, accentRgb, y) => {
  const centerX = SIDEBAR_X + SIDEBAR_W / 2;
  const radius  = 13;

  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.circle(centerX, y + radius, radius, "F");

  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.circle(centerX, y + radius, radius - 2, "F");

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

  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(label, SIDEBAR_X + indent, y);
  y += 5;

  drawDivider(doc, SIDEBAR_X + indent, y - 1, SIDEBAR_W - indent * 2);
  y += 4;

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
 * Render a section header in the main column.
 */
const renderMainSectionHeader = (doc, title, y, accentRgb) => {
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.text(title, MAIN_X, y);
  y += 3.5;

  doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.setLineWidth(0.3);
  doc.line(MAIN_X, y, MAIN_X + MAIN_W * 0.4, y);
  y += 5;

  doc.setTextColor(...C_TEXT);
  return y;
};

// ─── Main Generator ───────────────────────────────────────────────────────────

/**
 * Generate a professional resume PDF with automatic page breaks.
 *
 * @param {Object} formData  - Resume form data
 * @param {Object} template  - Selected template config { color, accent, id, name }
 * @returns {jsPDF} Generated PDF instance
 */
export const generateResumePDF = (formData, template) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryRgb = hexToRgb(template?.color || "#1E3A5F");
  const accentRgb  = hexToRgb(template?.accent || "#3498DB");
  const initials   = getInitials(formData.nome);
  const fullName   = (formData.nome || "Nome Completo").trim();

  // ── Page management ──────────────────────────────────────────────────────
  let mainY = MARGIN + 9;

  const addMainPage = () => {
    doc.addPage();
    drawSidebarTint(doc, primaryRgb);
    mainY = MARGIN + 9;
  };

  const ensureMain = (needed) => {
    if (mainY + (needed || 10) > CONTENT_BOTTOM) addMainPage();
  };

  // ── Draw sidebar background on page 1 BEFORE any content ────────────────
  drawSidebarTint(doc, primaryRgb);

  // ── Build sidebar data ───────────────────────────────────────────────────
  const contactItems = [];
  if (formData.email)          contactItems.push(formData.email);
  if (formData.telefone)       contactItems.push(formData.telefone);
  if (formData.cidade)         contactItems.push(formData.cidade);
  if (formData.linkedin)       contactItems.push(formData.linkedin);
  if (formData.portfolio)      contactItems.push(formData.portfolio);
  if (formData.dataNascimento) contactItems.push(formData.dataNascimento);

  const skillItems = (formData.habilidades || []).map((s) => ({ text: s }));
  if (formData.habilidadesExtras && formData.habilidadesExtras.trim()) {
    formData.habilidadesExtras
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => skillItems.push({ text: s }));
  }

  const langItems = (formData.idiomas || [])
    .filter((i) => i.idioma)
    .map((i) => ({ text: i.idioma, sub: i.nivel }));

  // ── Sidebar rendering ────────────────────────────────────────────────────
  let sidebarY = MARGIN + 9;

  drawMonogram(doc, initials, primaryRgb, accentRgb, sidebarY);
  sidebarY += 35;

  const nameLines = doc.splitTextToSize(fullName, SIDEBAR_W - 8);
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(14);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  nameLines.forEach((line) => {
    doc.text(line, SIDEBAR_X + SIDEBAR_W / 2, sidebarY, { align: "center" });
    sidebarY += 7;
  });
  sidebarY += 2;

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

  sidebarY += 2;
  drawDivider(doc, SIDEBAR_X + 8, sidebarY, SIDEBAR_W - 16);
  sidebarY += 8;

  sidebarY = renderSidebarSection(doc, "CONTATO", contactItems, sidebarY, primaryRgb);

  if (skillItems.length > 0) {
    sidebarY = renderSidebarSection(doc, "HABILIDADES", skillItems, sidebarY, primaryRgb);
  }

  if (langItems.length > 0) {
    sidebarY = renderSidebarSection(doc, "IDIOMAS", langItems, sidebarY, primaryRgb);
  }

  // ── Main content rendering ───────────────────────────────────────────────

  // Objective / Professional Summary
  if (formData.objetivo && formData.objetivo.trim()) {
    ensureMain(22);
    mainY = renderMainSectionHeader(doc, "RESUMO PROFISSIONAL", mainY, accentRgb);

    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...C_TEXT);
    const objLines = doc.splitTextToSize(formData.objetivo, MAIN_W);
    objLines.forEach((line) => {
      ensureMain(5);
      doc.text(line, MAIN_X, mainY);
      mainY += 5;
    });
    mainY += 7;
  }

  // Professional Experience
  const activeExps = (formData.experiencias || []).filter((e) => e.empresa);
  if (activeExps.length > 0) {
    ensureMain(22);
    mainY = renderMainSectionHeader(doc, "EXPERIÊNCIA PROFISSIONAL", mainY, accentRgb);

    activeExps.forEach((exp, idx) => {
      // Estimate height for this entry to avoid orphaned headers
      const descLines = exp.descricao
        ? doc.splitTextToSize(exp.descricao, MAIN_W).length
        : 0;
      const entryH = 10 + descLines * 4.2 + 6;
      ensureMain(Math.min(entryH, 40));

      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(...C_DARK);
      doc.text(exp.cargo || "Cargo", MAIN_X, mainY);

      if (exp.periodo) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_MUTED);
        const pw = doc.getTextWidth(exp.periodo);
        doc.text(exp.periodo, MAIN_X + MAIN_W - pw, mainY);
      }

      mainY += 5;

      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      doc.text(exp.empresa, MAIN_X, mainY);
      mainY += 5;

      if (exp.descricao && exp.descricao.trim()) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C_TEXT);
        const descLines = doc.splitTextToSize(exp.descricao, MAIN_W);
        descLines.forEach((line) => {
          ensureMain(4.5);
          doc.text(line, MAIN_X, mainY);
          mainY += 4.2;
        });
      }

      mainY += idx < activeExps.length - 1 ? 6 : 4;
    });

    mainY += 8;
  }

  // Education
  const activeEdus = (formData.formacoes || []).filter((f) => f.instituicao);
  if (activeEdus.length > 0) {
    ensureMain(22);
    mainY = renderMainSectionHeader(doc, "FORMAÇÃO ACADÊMICA", mainY, accentRgb);

    activeEdus.forEach((edu, idx) => {
      ensureMain(16);

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
      const instText = `${edu.instituicao}${edu.status ? " — " + edu.status : ""}`;
      const instLines = doc.splitTextToSize(instText, MAIN_W);
      instLines.forEach((line) => {
        ensureMain(5);
        doc.text(line, MAIN_X, mainY);
        mainY += 5;
      });

      mainY += idx < activeEdus.length - 1 ? 3 : 2;
    });

    mainY += 8;
  }

  // Courses / Certifications
  if (formData.cursos && formData.cursos.trim()) {
    ensureMain(20);
    mainY = renderMainSectionHeader(doc, "CURSOS E CERTIFICAÇÕES", mainY, accentRgb);

    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT);

    // Split by newlines to get individual course items
    const courseItems = formData.cursos
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    courseItems.forEach((item) => {
      const lines = doc.splitTextToSize(item, MAIN_W - 6);
      ensureMain(lines.length * 4.5 + 2);

      // First line gets bullet
      doc.text(`• ${lines[0]}`, MAIN_X, mainY);
      mainY += 4.5;

      // Continuation lines indented (no extra bullet)
      for (let i = 1; i < lines.length; i++) {
        ensureMain(4.5);
        doc.text(lines[i], MAIN_X + 4, mainY);
        mainY += 4.5;
      }
      mainY += 1;
    });

    mainY += 3;
  }

  // Additional info
  const extras = [];
  if (formData.cnh)               extras.push(`CNH: ${formData.cnh}`);
  if (formData.disponibilidade)   extras.push(`Disponibilidade: ${formData.disponibilidade}`);
  if (formData.pretensaoSalarial) extras.push(`Pretensão Salarial: ${formData.pretensaoSalarial}`);

  if (extras.length > 0) {
    ensureMain(18 + extras.length * 5);
    mainY = renderMainSectionHeader(doc, "INFORMAÇÕES ADICIONAIS", mainY, accentRgb);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C_TEXT);
    extras.forEach((extra) => {
      ensureMain(5);
      doc.text(`• ${extra}`, MAIN_X, mainY);
      mainY += 5;
    });
  }

  // ── Footer on every page ─────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);

    const footerY = PAGE_H - MARGIN + 2;

    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.15);
    doc.line(MARGIN, footerY - 4, PAGE_W - MARGIN, footerY - 4);

    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(6);
    doc.setTextColor(...C_LIGHT);
    doc.text("krioudocs.com.br", MARGIN, footerY);

    doc.text(`${p} / ${pageCount}`, PAGE_W / 2, footerY, { align: "center" });

    const dateStr = new Date().toLocaleDateString("pt-BR");
    doc.text(dateStr, PAGE_W - MARGIN, footerY, { align: "right" });
  }

  return doc;
};

/**
 * Download a generated PDF file.
 *
 * @param {jsPDF} doc       - PDF document instance
 * @param {string} filename - Output filename
 */
export const downloadPDF = (doc, filename = "curriculo.pdf") => {
  doc.save(filename);
};

export default {
  generateResumePDF,
  downloadPDF,
};
