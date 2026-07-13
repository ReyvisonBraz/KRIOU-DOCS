import { jsPDF } from "jspdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const SIDEBAR_W = 58;
const SIDEBAR_X = MARGIN;
const MAIN_GAP = 8;
const MAIN_X = SIDEBAR_X + SIDEBAR_W + MAIN_GAP;
const MAIN_W = PAGE_W - MAIN_X - MARGIN;
const CONTENT_TOP = 18;
const CONTENT_BOTTOM = 278;
const C_DARK = [30, 35, 45];
const C_TEXT = [48, 54, 65];
const C_MUTED = [92, 99, 109];
const C_DIVIDER = [205, 209, 214];
const FONT_HEADING = "times";
const FONT_BODY = "helvetica";

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return match
    ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
    : { r: 30, g: 58, b: 95 };
};

const accessibleColor = ({ r, g, b }) => {
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (luminance <= 0.52) return { r, g, b };
  const factor = 0.5 / luminance;
  return { r: Math.round(r * factor), g: Math.round(g * factor), b: Math.round(b * factor) };
};

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase() : (parts[0]?.[0] || "?").toUpperCase();
};

const clean = (value) => String(value ?? "")
  .replace(/\u00a0/g, " ")
  .replace(/[\u200b-\u200d\ufeff]/g, "")
  .replace(/[\u2011\u2012\u2013\u2014]/g, "-")
  .replace(/\u2022/g, "-")
  .replace(/[ \t]{2,}/g, " ")
  .trim();

const drawSidebarBackground = (doc, primary) => {
  doc.setFillColor(246, 248, 249);
  doc.rect(SIDEBAR_X, MARGIN, SIDEBAR_W, PAGE_H - MARGIN * 2, "F");
  doc.setFillColor(primary.r, primary.g, primary.b);
  doc.rect(SIDEBAR_X, MARGIN, 1.4, PAGE_H - MARGIN * 2, "F");
};

const drawFooter = (doc) => {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...C_DIVIDER);
    doc.setLineWidth(0.18);
    doc.line(MARGIN, 283, PAGE_W - MARGIN, 283);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C_MUTED);
    doc.text("KRIOU DOCS", MARGIN, 288);
    doc.text(`Página ${page} de ${pages}`, PAGE_W / 2, 288, { align: "center" });
    doc.text(new Date().toLocaleDateString("pt-BR"), PAGE_W - MARGIN, 288, { align: "right" });
  }
};

const drawSidebarSection = (doc, label, items, y, primary) => {
  if (!items.length || y > 266) return y;
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(8.2);
  doc.setTextColor(primary.r, primary.g, primary.b);
  doc.text(label, SIDEBAR_X + 6, y);
  y += 3;
  doc.setDrawColor(...C_DIVIDER);
  doc.line(SIDEBAR_X + 6, y, SIDEBAR_X + SIDEBAR_W - 6, y);
  y += 5;
  for (const item of items) {
    if (y > 268) break;
    const value = typeof item === "object" ? item.text : item;
    const lines = doc.splitTextToSize(clean(value), SIDEBAR_W - 15);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...C_TEXT);
    for (const line of lines) {
      if (y > 268) break;
      doc.text(line, SIDEBAR_X + 8, y);
      y += 4.1;
    }
    if (typeof item === "object" && item.sub && y <= 268) {
      doc.setFontSize(7.4);
      doc.setTextColor(...C_MUTED);
      doc.text(clean(item.sub), SIDEBAR_X + 8, y);
      y += 4;
    }
    y += 1;
  }
  return y + 4;
};

const drawSidebar = (doc, data, primary, accent, compact = false) => {
  drawSidebarBackground(doc, primary);
  let y = CONTENT_TOP;
  const center = SIDEBAR_X + SIDEBAR_W / 2;
  doc.setFillColor(primary.r, primary.g, primary.b);
  doc.circle(center, y + 10, 10, "F");
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.circle(center, y + 10, 7.8, "F");
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(initials(data.nome), center, y + 11.4, { align: "center" });
  y += 26;
  doc.setFont(FONT_HEADING, "bold");
  doc.setFontSize(compact ? 12 : 13.5);
  doc.setTextColor(primary.r, primary.g, primary.b);
  const nameLines = doc.splitTextToSize(clean(data.nome) || "Nome completo", SIDEBAR_W - 12);
  for (const line of nameLines.slice(0, 4)) {
    doc.text(line, center, y, { align: "center" });
    y += 6;
  }
  if (compact) {
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C_MUTED);
    doc.text("CONTINUAÇÃO", center, y + 3, { align: "center" });
    return;
  }
  const role = clean(data.cargo || data.profissao);
  if (role) {
    y += 1;
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...C_MUTED);
    const roleLines = doc.splitTextToSize(role.toUpperCase(), SIDEBAR_W - 12);
    for (const line of roleLines.slice(0, 4)) {
      doc.text(line, center, y, { align: "center" });
      y += 3.7;
    }
  }
  y += 6;
  const contacts = [data.email, data.telefone, data.cidade, data.linkedin, data.portfolio, data.dataNascimento].filter(Boolean);
  y = drawSidebarSection(doc, "CONTATO", contacts, y, primary);
  const skills = [...(data.habilidades || [])];
  if (data.habilidadesExtras) skills.push(...data.habilidadesExtras.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean));
  y = drawSidebarSection(doc, "HABILIDADES", skills, y, primary);
  const languages = (data.idiomas || []).filter((item) => item.idioma).map((item) => ({ text: item.idioma, sub: item.nivel }));
  drawSidebarSection(doc, "IDIOMAS", languages, y, primary);
};

export const generateResumePDF = (formData, template) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const primary = accessibleColor(hexToRgb(template?.color || "#1E3A5F"));
  const accent = accessibleColor(hexToRgb(template?.accent || "#2563A6"));
  let page = 1;
  let y = CONTENT_TOP;

  const preparePage = () => {
    drawSidebar(doc, formData, primary, accent, page > 1);
    y = CONTENT_TOP;
  };
  const addPage = () => {
    doc.addPage();
    page += 1;
    preparePage();
  };
  const ensure = (height) => {
    if (y + height > CONTENT_BOTTOM) addPage();
  };
  const sectionTitle = (title) => {
    ensure(14);
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(10.2);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(title, MAIN_X, y);
    y += 3;
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(0.35);
    doc.line(MAIN_X, y, MAIN_X + 44, y);
    y += 6;
  };
  const paragraph = (text, size = 9.5, leading = 4.8) => {
    const lines = doc.splitTextToSize(clean(text), MAIN_W);
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(size);
    doc.setTextColor(...C_TEXT);
    for (const line of lines) {
      ensure(leading + 1);
      doc.text(line, MAIN_X, y);
      y += leading;
    }
  };

  preparePage();
  if (formData.objetivo || formData.resumo) {
    sectionTitle("RESUMO PROFISSIONAL");
    paragraph(formData.objetivo || formData.resumo, 9.6, 4.9);
    y += 7;
  }

  const experiences = (formData.experiencias || []).filter((item) => item.empresa);
  if (experiences.length) {
    sectionTitle("EXPERIÊNCIA PROFISSIONAL");
    for (const experience of experiences) {
      const descriptionLines = doc.splitTextToSize(clean(experience.descricao), MAIN_W);
      ensure(16 + descriptionLines.length * 4.5);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9.8);
      doc.setTextColor(...C_DARK);
      const titleLines = doc.splitTextToSize(clean(experience.cargo || "Cargo"), MAIN_W - 30);
      for (const line of titleLines) {
        doc.text(line, MAIN_X, y);
        y += 4.7;
      }
      if (experience.periodo) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_MUTED);
        doc.text(clean(experience.periodo), MAIN_X + MAIN_W, y - 4.7, { align: "right" });
      }
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(8.6);
      doc.setTextColor(accent.r, accent.g, accent.b);
      const companyLines = doc.splitTextToSize(clean(experience.empresa), MAIN_W);
      for (const line of companyLines) {
        doc.text(line, MAIN_X, y);
        y += 4.3;
      }
      paragraph(experience.descricao, 8.9, 4.5);
      y += 6;
    }
  }

  const education = (formData.formacoes || []).filter((item) => item.instituicao);
  if (education.length) {
    sectionTitle("FORMAÇÃO ACADÊMICA");
    for (const item of education) {
      ensure(18);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9.7);
      doc.setTextColor(...C_DARK);
      const courseLines = doc.splitTextToSize(clean(item.curso || "Curso"), MAIN_W - 26);
      for (const line of courseLines) {
        doc.text(line, MAIN_X, y);
        y += 4.7;
      }
      if (item.periodo) {
        doc.setFont(FONT_BODY, "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C_MUTED);
        doc.text(clean(item.periodo), MAIN_X + MAIN_W, y - 4.7, { align: "right" });
      }
      paragraph(`${item.instituicao}${item.status ? ` - ${item.status}` : ""}`, 8.9, 4.5);
      y += 5;
    }
  }

  if (formData.cursos) {
    sectionTitle("CURSOS E CERTIFICAÇÕES");
    paragraph(formData.cursos, 9.2, 4.7);
    y += 5;
  }

  const extras = [];
  if (formData.cnh) extras.push(`CNH: ${formData.cnh}`);
  if (formData.disponibilidade) extras.push(`Disponibilidade: ${formData.disponibilidade}`);
  if (formData.pretensaoSalarial) extras.push(`Pretensão salarial: ${formData.pretensaoSalarial}`);
  if (formData.extras) extras.push(formData.extras);
  if (extras.length) {
    sectionTitle("INFORMAÇÕES ADICIONAIS");
    paragraph(extras.join("\n"), 9.2, 4.7);
  }

  drawFooter(doc);
  return doc;
};

export const downloadPDF = (doc, filename = "curriculo.pdf") => doc.save(filename);

export default { generateResumePDF, downloadPDF };
