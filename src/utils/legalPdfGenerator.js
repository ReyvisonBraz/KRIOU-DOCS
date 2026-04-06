/**
 * ============================================
 * KRIOU DOCS - Legal PDF Generator Utility
 * ============================================
 * Handles legal document PDF generation using jsPDF.
 *
 * Dois modos de geração:
 * 1. Com documentBody (ex: comodato) → contrato real com cláusulas numeradas
 * 2. Sem documentBody → lista de campos (label: valor) — fallback
 *
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";
import { getDocumentBody } from "../data/legalDocuments";

// ─── Constantes de layout ───────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Cores
const COLOR_HEADER = [15, 52, 96];
const COLOR_TEXT   = [30, 30, 30];
const COLOR_MUTED  = [100, 100, 100];
const COLOR_LINE   = [200, 200, 200];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Garante nova página se o conteúdo não couber.
 * Retorna o currentY atualizado.
 */
const ensurePage = (doc, y, neededHeight = 15) => {
  if (y + neededHeight > PAGE_H - 25) {
    doc.addPage();
    return MARGIN + 5;
  }
  return y;
};

/**
 * Desenha o cabeçalho azul padrão Kriou Docs.
 */
const drawHeader = (doc, title) => {
  doc.setFillColor(...COLOR_HEADER);
  doc.rect(0, 0, PAGE_W, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title || "Documento Jurídico", MARGIN, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Kriou Docs — Serviço de Geração de Documentos", MARGIN, 24);

  doc.setTextColor(...COLOR_TEXT);
};

/**
 * Desenha o rodapé em todas as páginas.
 */
const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - 12;
    doc.setDrawColor(...COLOR_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, fy - 4, PAGE_W - MARGIN, fy - 4);
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text("Documento gerado por Kriou Docs", MARGIN, fy);
    doc.text(
      `Pág. ${i}/${totalPages}   ${new Date().toLocaleDateString("pt-BR")}`,
      PAGE_W - MARGIN,
      fy,
      { align: "right" }
    );
  }
};

// ─── Geração por documentBody ────────────────────────────────────────────────

/**
 * Gera PDF a partir de um array de blocos (documentBody interpolado).
 * Produz um contrato real com título centralizado, parágrafos justificados,
 * cláusulas numeradas, assinaturas e testemunhas.
 *
 * @param {jsPDF}    doc  - Instância jsPDF já com cabeçalho
 * @param {Array}    body - Resultado de getDocumentBody()
 * @param {number}   startY
 * @returns {number} Y final
 */
const renderBodyToPDF = (doc, body, startY) => {
  let y = startY;

  body.forEach((block) => {
    switch (block.type) {

      case "title": {
        y = ensurePage(doc, y, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...COLOR_HEADER);
        const titleLines = doc.splitTextToSize(block.text, CONTENT_W);
        titleLines.forEach((line) => {
          doc.text(line, PAGE_W / 2, y, { align: "center" });
          y += 6;
        });
        // Linha decorativa
        doc.setDrawColor(...COLOR_HEADER);
        doc.setLineWidth(0.5);
        doc.line(MARGIN + 20, y + 1, PAGE_W - MARGIN - 20, y + 1);
        y += 8;
        doc.setTextColor(...COLOR_TEXT);
        break;
      }

      case "paragraph": {
        y = ensurePage(doc, y, 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(block.text, CONTENT_W);
        lines.forEach((line) => {
          y = ensurePage(doc, y, 6);
          doc.text(line, MARGIN, y, { maxWidth: CONTENT_W });
          y += 5.5;
        });
        y += 4;
        break;
      }

      case "clause": {
        y = ensurePage(doc, y, 18);
        // Título da cláusula
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...COLOR_HEADER);
        doc.text(`CLÁUSULA ${block.number} — ${block.title}`, MARGIN, y);
        y += 6;
        doc.setTextColor(...COLOR_TEXT);

        // Texto principal
        if (block.text) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(block.text, CONTENT_W);
          lines.forEach((line) => {
            y = ensurePage(doc, y, 6);
            doc.text(line, MARGIN, y, { maxWidth: CONTENT_W });
            y += 5.5;
          });
        }

        // Parágrafos numerados
        if (block.paragraphs?.length) {
          block.paragraphs.forEach((p) => {
            y = ensurePage(doc, y, 6);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const pLines = doc.splitTextToSize(p, CONTENT_W - 6);
            pLines.forEach((line, li) => {
              y = ensurePage(doc, y, 6);
              doc.text(line, MARGIN + (li === 0 ? 0 : 4), y);
              y += 5.5;
            });
          });
        }
        y += 4;
        break;
      }

      case "closing": {
        y = ensurePage(doc, y, 12);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(block.text, CONTENT_W);
        lines.forEach((line) => {
          y = ensurePage(doc, y, 6);
          doc.text(line, MARGIN, y);
          y += 5.5;
        });
        y += 4;
        doc.setFont("helvetica", "normal");
        break;
      }

      case "date": {
        y = ensurePage(doc, y, 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(block.text, PAGE_W / 2, y, { align: "center" });
        y += 10;
        break;
      }

      case "signatures": {
        const parties = block.parties || [];
        y = ensurePage(doc, y, 40);
        y += 6;

        const colW = CONTENT_W / parties.length;
        parties.forEach((party, i) => {
          const x = MARGIN + i * colW + colW * 0.1;
          const lineW = colW * 0.8;
          // Linha de assinatura
          doc.setDrawColor(...COLOR_TEXT);
          doc.setLineWidth(0.4);
          doc.line(x, y, x + lineW, y);
          // Nome
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...COLOR_TEXT);
          doc.text(party.name, x + lineW / 2, y + 5, { align: "center", maxWidth: lineW });
          // Papel
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(...COLOR_MUTED);
          doc.text(party.role, x + lineW / 2, y + 10, { align: "center" });
        });
        y += 20;
        doc.setTextColor(...COLOR_TEXT);
        break;
      }

      case "witnesses": {
        const count = block.count || 2;
        y = ensurePage(doc, y, 35);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLOR_MUTED);
        doc.text("TESTEMUNHAS:", MARGIN, y);
        y += 8;

        const colW = CONTENT_W / count;
        for (let i = 0; i < count; i++) {
          const x = MARGIN + i * colW + colW * 0.05;
          const lineW = colW * 0.85;
          doc.setDrawColor(...COLOR_TEXT);
          doc.setLineWidth(0.4);
          doc.line(x, y, x + lineW, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...COLOR_MUTED);
          doc.text(`Testemunha ${i + 1} — Nome / CPF`, x + lineW / 2, y + 5, { align: "center" });
        }
        y += 15;
        doc.setTextColor(...COLOR_TEXT);
        break;
      }

      default:
        break;
    }
  });

  return y;
};

// ─── Exportação principal ────────────────────────────────────────────────────

/**
 * Gera PDF de documento jurídico.
 *
 * Se o documento tiver `documentBody` definido, gera um contrato real.
 * Caso contrário, usa o fallback de lista de campos (label: valor).
 *
 * @param {Object} formData      - Dados preenchidos no formulário
 * @param {Object} docType       - Objeto do documento (da legalDocuments)
 * @param {Object} disabledFields - Campos marcados como "não preencher"
 * @param {string} variantId     - ID da variante selecionada
 * @returns {jsPDF}
 */
export const generateLegalPDF = (formData, docType, disabledFields = {}, variantId = null) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(doc, docType?.name || "Documento Jurídico");

  let y = 40;

  // Tenta gerar pelo documentBody
  const vId = variantId || docType?.defaultVariant;
  const body = vId
    ? getDocumentBody(docType?.id, vId, formData, disabledFields)
    : null;

  if (body && body.length > 0) {
    // Contrato real com cláusulas
    y = renderBodyToPDF(doc, body, y);
  } else {
    // Fallback: lista de campos
    const pageWidth = PAGE_W;
    const margin = MARGIN;
    const contentWidth = CONTENT_W;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLOR_HEADER);
    doc.text(docType?.name || "CONTRATO", margin, y);
    doc.setDrawColor(...COLOR_HEADER);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 3, pageWidth - margin, y + 3);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_TEXT);

    (docType?.fields || []).forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "—";
      y = ensurePage(doc, y, 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLOR_MUTED);
      doc.text(f.label, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...COLOR_TEXT);
      const lines = doc.splitTextToSize(value, contentWidth);
      doc.text(lines, margin, y + 5);
      y += 8 + (lines.length - 1) * 5;
    });
  }

  drawFooter(doc);
  return doc;
};

/**
 * Download legal PDF
 */
export const downloadLegalPDF = (doc, filename = "documento.pdf") => {
  doc.save(filename);
};

/**
 * Generate PDF based on document type ID (legacy helper)
 */
export const generatePDFByType = (docTypeId, formData) => {
  return generateLegalPDF(formData, { id: docTypeId, name: "Documento", fields: [] });
};

export default {
  generateLegalPDF,
  generatePDFByType,
  downloadLegalPDF,
};
