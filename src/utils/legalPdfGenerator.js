/**
 * ============================================
 * KRIOU DOCS - Legal PDF Generator Utility
 * ============================================
 * Handles legal document PDF generation using jsPDF.
 * Supports contract types: compra-venda, aluguel,
 * procuração, and future document types.
 * 
 * [AGUARDANDO MODELO PADRÃO]
 * Os campos base estão implementados. Quando você
 * informar o modelo padrão completo, complementaremos
 * com campos e formatação específicos.
 * 
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";

/**
 * Generate a legal document PDF
 * 
 * @param {Object} formData - Legal document form data
 * @param {Object} docType - Document type configuration
 * @returns {jsPDF} Generated PDF instance
 */
export const generateLegalPDF = (formData, docType) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  // Colors
  const headerColor = { r: 15, g: 52, b: 96 };
  const textColor = { r: 30, g: 30, b: 30 };
  const mutedColor = { r: 100, g: 100, b: 100 };

  // ─── Header ───
  doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(docType?.name || "Documento Jurídico", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Kriou Docs - Serviço de Geração de Documentos", margin, 25);

  currentY = 45;

  // ─── Reset text color ───
  doc.setTextColor(textColor.r, textColor.g, textColor.b);

  // ─── Document Title ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(docType?.name || "CONTRATO", margin, currentY);
  
  doc.setDrawColor(headerColor.r, headerColor.g, headerColor.b);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY + 3, pageWidth - margin, currentY + 3);
  
  currentY += 15;

  // ─── Document Fields ───
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  docType?.fields?.forEach((field) => {
    const value = formData[field.key] || "—";
    
    // Check if we need a new page
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }

    // Field label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(mutedColor.r, mutedColor.g, mutedColor.b);
    doc.text(field.label, margin, currentY);
    
    // Field value
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    
    const valueLines = doc.splitTextToSize(value, contentWidth);
    doc.text(valueLines, margin, currentY + 5);
    
    currentY += 8 + (valueLines.length - 1) * 5;
  });

  // ─── Footer ───
  const footerY = pageHeight - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(mutedColor.r, mutedColor.g, mutedColor.b);
  doc.text("Documento gerado por Kriou Docs", margin, footerY);
  doc.text(new Date().toLocaleDateString("pt-BR"), pageWidth - margin - 25, footerY);

  return doc;
};

/**
 * Generate specific contract type PDFs
 */

// Compra e Venda
export const generateCompraVendaPDF = (formData) => {
  const docType = {
    name: "CONTRATO DE COMPRA E VENDA",
    fields: [
      { key: "nome_comprador", label: "COMPRADOR" },
      { key: "cpf_comprador", label: "CPF do Comprador" },
      { key: "nome_vendedor", label: "VENDEDOR" },
      { key: "cpf_vendedor", label: "CPF do Vendedor" },
      { key: "descricao_imovel", label: "DESCRIÇÃO DO IMÓVEL/VEÍCULO" },
      { key: "valor", label: "VALOR DA TRANSAÇÃO" },
      { key: "forma_pagamento", label: "FORMA DE PAGAMENTO" },
      { key: "data_assinatura", label: "DATA DE ASSINATURA" },
    ],
  };
  return generateLegalPDF(formData, docType);
};

// Aluguel
export const generateAluguelPDF = (formData) => {
  const docType = {
    name: "CONTRATO DE LOCAÇÃO",
    fields: [
      { key: "nome_locador", label: "LOCADOR (Proprietário)" },
      { key: "cpf_locador", label: "CPF do Locador" },
      { key: "nome_locatario", label: "LOCATÁRIO (Inquilino)" },
      { key: "cpf_locatario", label: "CPF do Locatário" },
      { key: "endereco_imovel", label: "ENDEREÇO DO IMÓVEL" },
      { key: "valor_aluguel", label: "VALOR DO ALUGUEL" },
      { key: "valor_caucao", label: "VALOR DA CAUÇÃO" },
      { key: "prazo_inicio", label: "DATA DE INÍCIO" },
      { key: "prazo_fim", label: "DATA DE TÉRMINO" },
    ],
  };
  return generateLegalPDF(formData, docType);
};

// Procuração
export const generateProcuraçãoPDF = (formData) => {
  const docType = {
    name: "PROCURAÇÃO",
    fields: [
      { key: "nome_outorgante", label: "OUTORGANTE (quem concede)" },
      { key: "cpf_outorgante", label: "CPF do Outorgante" },
      { key: "nome_outorgado", label: "OUTORGADO (quem recebe)" },
      { key: "cpf_outorgado", label: "CPF do Outorgado" },
      { key: "poderes", label: "PODERES CONCEDIDOS" },
      { key: "validade", label: "VALIDADE" },
    ],
  };
  return generateLegalPDF(formData, docType);
};

/**
 * Download legal PDF
 * 
 * @param {jsPDF} doc - PDF document instance
 * @param {string} filename - Output filename
 */
export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

/**
 * Generate PDF based on document type
 * 
 * @param {string} docTypeId - Document type ID
 * @param {Object} formData - Form data
 * @returns {jsPDF} Generated PDF instance
 */
export const generatePDFByType = (docTypeId, formData) => {
  switch (docTypeId) {
    case "compra-venda":
      return generateCompraVendaPDF(formData);
    case "aluguel":
      return generateAluguelPDF(formData);
    case "procuracao":
      return generateProcuraçãoPDF(formData);
    default:
      return generateLegalPDF(formData, { name: "Documento", fields: [] });
  }
};

export default {
  generateLegalPDF,
  generateCompraVendaPDF,
  generateAluguelPDF,
  generateProcuraçãoPDF,
  generatePDFByType,
  downloadLegalPDF,
};
