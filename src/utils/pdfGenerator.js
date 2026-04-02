/**
 * ============================================
 * KRIOU DOCS - PDF Generation Utility
 * ============================================
 * Handles resume PDF generation using jsPDF
 * with template-specific styling.
 * 
 * @module utils/pdfGenerator
 */

import { jsPDF } from "jspdf";

/**
 * Generate a resume PDF document
 * 
 * @param {Object} formData - Resume form data
 * @param {Object} template - Selected template configuration
 * @returns {jsPDF} Generated PDF instance
 */
export const generateResumePDF = (formData, template) => {
  // Create new PDF document (A4 format)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Get template styling or use defaults
  const primaryColor = template?.color || "#0F3460";
  const accentColor = template?.accent || "#E94560";
  
  // Convert hex to RGB for jsPDF
  const primaryRGB = hexToRgb(primaryColor);
  const accentRGB = hexToRgb(accentColor);

  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // ─── Header Section ───
  doc.setFillColor(primaryRGB.r, primaryRGB.g, primaryRGB.b);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(formData.nome || "Seu Nome Completo", margin, 20);

  // Contact info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const contactLines = [];
  if (formData.email) contactLines.push(formData.email);
  if (formData.telefone) contactLines.push(formData.telefone);
  if (formData.cidade) contactLines.push(formData.cidade);
  if (formData.linkedin) contactLines.push(formData.linkedin);
  
  doc.text(contactLines.join(" | "), margin, 30);

  currentY = 55;

  // ─── Reset text color for body ───
  doc.setTextColor(30, 30, 30);

  // ─── Objective Section ───
  if (formData.objetivo) {
    currentY = addSectionHeader(doc, "OBJETIVO", currentY, primaryRGB);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const objectiveLines = doc.splitTextToSize(formData.objetivo, contentWidth);
    doc.text(objectiveLines, margin, currentY);
    currentY += objectiveLines.length * 5 + 10;
  }

  // ─── Experience Section ───
  const hasExperiencias = formData.experiencias?.some((exp) => exp.empresa);
  if (hasExperiencias) {
    currentY = addSectionHeader(doc, "EXPERIÊNCIA PROFISSIONAL", currentY, primaryRGB);
    
    formData.experiencias
      .filter((exp) => exp.empresa)
      .forEach((exp) => {
        // Job title and period
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(exp.cargo || "Cargo", margin, currentY);
        
        const periodWidth = doc.getTextWidth(exp.periodo || "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(exp.periodo || "", pageWidth - margin - periodWidth, currentY);
        
        currentY += 5;

        // Company
        doc.setTextColor(accentRGB.r, accentRGB.g, accentRGB.b);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(exp.empresa, margin, currentY);
        doc.setTextColor(30, 30, 30);
        
        currentY += 5;

        // Description
        if (exp.descricao) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const descLines = doc.splitTextToSize(exp.descricao, contentWidth);
          doc.text(descLines, margin, currentY);
          currentY += descLines.length * 4 + 8;
        } else {
          currentY += 8;
        }
      });
  }

  // ─── Education Section ───
  const hasFormacoes = formData.formacoes?.some((f) => f.instituicao);
  if (hasFormacoes) {
    currentY = addSectionHeader(doc, "FORMAÇÃO ACADÊMICA", currentY, primaryRGB);
    
    formData.formacoes
      .filter((f) => f.instituicao)
      .forEach((f) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(f.curso || "Curso", margin, currentY);
        
        const periodWidth = doc.getTextWidth(f.periodo || "");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(f.periodo || "", pageWidth - margin - periodWidth, currentY);
        
        currentY += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`${f.instituicao} - ${f.status}`, margin, currentY);
        doc.setTextColor(30, 30, 30);
        
        currentY += 8;
      });
  }

  // ─── Skills Section ───
  const hasHabilidades = formData.habilidades?.length > 0;
  if (hasHabilidades) {
    currentY = addSectionHeader(doc, "HABILIDADES", currentY, primaryRGB);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // Display skills in a wrapped format
    let skillText = formData.habilidades.join(" • ");
    const skillLines = doc.splitTextToSize(skillText, contentWidth);
    doc.text(skillLines, margin, currentY);
    currentY += skillLines.length * 5 + 10;
  }

  // ─── Languages Section ───
  const hasIdiomas = formData.idiomas?.some((i) => i.idioma);
  if (hasIdiomas) {
    currentY = addSectionHeader(doc, "IDIOMAS", currentY, primaryRGB);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    formData.idiomas
      .filter((i) => i.idioma)
      .forEach((idioma) => {
        doc.text(`• ${idioma.idioma}: ${idioma.nivel}`, margin, currentY);
        currentY += 5;
      });
    
    currentY += 5;
  }

  // ─── Courses/Extras Section ───
  if (formData.cursos && formData.cursos.trim()) {
    currentY = addSectionHeader(doc, "CURSOS E CERTIFICAÇÕES", currentY, primaryRGB);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const coursesLines = doc.splitTextToSize(formData.cursos, contentWidth);
    doc.text(coursesLines, margin, currentY);
  }

  // ─── Footer ───
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Gerado por Kriou Docs", margin, footerY);
  doc.text(new Date().toLocaleDateString("pt-BR"), pageWidth - margin - 20, footerY);

  return doc;
};

/**
 * Add a section header to the PDF
 * 
 * @param {jsPDF} doc - PDF document instance
 * @param {string} title - Section title
 * @param {number} y - Y position
 * @param {Object} color - RGB color object
 * @returns {number} New Y position
 */
const addSectionHeader = (doc, title, y, color) => {
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(margin, y - 3, contentWidth, 6, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(title, margin + 3, y + 1.5);
  
  doc.setTextColor(30, 30, 30);
  
  return y + 12;
};

/**
 * Convert hex color to RGB object
 * 
 * @param {string} hex - Hex color string
 * @returns {Object} RGB object
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 15, g: 52, b: 96 }; // Default to primary blue
};

/**
 * Download PDF file
 * 
 * @param {jsPDF} doc - PDF document instance
 * @param {string} filename - Output filename
 */
export const downloadPDF = (doc, filename = "curriculo.pdf") => {
  doc.save(filename);
};

export default {
  generateResumePDF,
  downloadPDF,
};