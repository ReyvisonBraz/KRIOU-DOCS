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
 * Design premium com:
 * - Cabeçalho elegante com gradiente
 * - Faixa lateral decorativa
 * - Cláusulas com numeração em destaque
 * - Assinaturas com linhas pontilhadas
 * - Rodapé profissional
 *
 * @module utils/legalPdfGenerator
 */

import { jsPDF } from "jspdf";
import { getDocumentBody } from "../data/legalDocuments";

// ─── Constantes de layout ───────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_LEFT = 22;
const MARGIN_RIGHT = 18;
const MARGIN_TOP = 20;
const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const FOOTER_H = 18;

// Cores – paleta premium
const C_NAVY       = [15, 32, 65];   // Azul escuro profissional
const C_NAVY_MED   = [25, 55, 100];  // Azul médio
const C_TEAL       = [0, 180, 180];  // Teal / verde-azulado
const C_TEXT       = [30, 30, 30];   // Texto principal
const C_TEXT_LIGHT = [80, 80, 80];   // Texto secundário
const C_MUTED      = [130, 130, 130]; // Texto suave
const C_LINE       = [210, 210, 210]; // Linhas divisórias
const C_LINE_LIGHT = [230, 230, 230]; // Linha muito sutil
const C_ACCENT     = [0, 150, 150];   // Accent para cláusulas
const C_BG_LIGHT   = [247, 249, 252]; // Fundo levemente azulado

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Garante nova página se o conteúdo não couber.
 * Desenha automaticamente a faixa lateral decorativa na nova página.
 * Retorna o currentY atualizado.
 */
const ensurePage = (doc, y, neededHeight = 15) => {
  if (y + neededHeight > PAGE_H - FOOTER_H - 8) {
    doc.addPage();
    drawSideStripe(doc);
    return MARGIN_TOP + 5;
  }
  return y;
};

/**
 * Desenha a faixa lateral decorativa no lado esquerdo da página.
 * Dá um aspecto premium de documento formal.
 */
const drawSideStripe = (doc) => {
  // Faixa fina na margem esquerda
  doc.setDrawColor(...C_TEAL);
  doc.setLineWidth(0.6);
  doc.line(8, 40, 8, PAGE_H - FOOTER_H);
  // Ponto no topo da faixa
  doc.setFillColor(...C_TEAL);
  doc.circle(8, 38, 1.2, "F");
};

/**
 * Desenha o cabeçalho premium com gradiente simulado.
 */
const drawHeader = (doc, title, legislation) => {
  // Fundo do header — gradiente simulado com 2 faixas
  const headerH = 36;
  doc.setFillColor(...C_NAVY);
  doc.rect(0, 0, PAGE_W, headerH, "F");
  // Faixa de brilho sutil no topo
  doc.setFillColor(...C_NAVY_MED);
  doc.rect(0, 0, PAGE_W, 2, "F");

  // Linha decorativa teal no bottom do header
  doc.setFillColor(...C_TEAL);
  doc.rect(0, headerH, PAGE_W, 1.2, "F");

  // Título do documento
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title || "Documento Jurídico", MARGIN_LEFT, 16);

  // Subtítulo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 240);
  doc.text("Kriou Docs — Geração Inteligente de Documentos Jurídicos", MARGIN_LEFT, 25);

  // Legislação, se houver
  if (legislation) {
    doc.setFontSize(7.5);
    doc.setTextColor(160, 180, 210);
    doc.text(legislation, MARGIN_LEFT, 31);
  }

  doc.setTextColor(...C_TEXT);
};

/**
 * Desenha o rodapé profissional em todas as páginas.
 */
const drawFooter = (doc) => {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const fy = PAGE_H - FOOTER_H + 4;

    // Linha separadora
    doc.setDrawColor(...C_LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_LEFT, fy - 6, PAGE_W - MARGIN_RIGHT, fy - 6);

    // Esquerda: branding
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C_MUTED);
    doc.text("Documento gerado por Kriou Docs — krioudocs.com.br", MARGIN_LEFT, fy);

    // Direita: paginação e data
    const dateStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.setFont("helvetica", "bold");
    doc.text(
      `Página ${i} de ${totalPages}`,
      PAGE_W - MARGIN_RIGHT,
      fy,
      { align: "right" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      dateStr,
      PAGE_W - MARGIN_RIGHT,
      fy + 5,
      { align: "right" }
    );
  }
};

// ─── Geração por documentBody ────────────────────────────────────────────────

/**
 * Gera PDF a partir de um array de blocos (documentBody interpolado).
 * Produz um contrato real com título centralizado, parágrafos justificados,
 * cláusulas numeradas com design premium, assinaturas e testemunhas.
 */
const renderBodyToPDF = (doc, body, startY) => {
  let y = startY;

  body.forEach((block) => {
    switch (block.type) {

      case "title": {
        y = ensurePage(doc, y, 24);
        y += 4;

        // Título do contrato — centralizado, tipografia impactante
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...C_NAVY);
        const titleLines = doc.splitTextToSize(block.text, CONTENT_W - 20);
        titleLines.forEach((line) => {
          doc.text(line, PAGE_W / 2, y, { align: "center" });
          y += 6.5;
        });

        // Linha decorativa central dupla
        const lineCenter = PAGE_W / 2;
        const lineW = 50;
        doc.setDrawColor(...C_TEAL);
        doc.setLineWidth(0.8);
        doc.line(lineCenter - lineW / 2, y + 2, lineCenter + lineW / 2, y + 2);
        doc.setLineWidth(0.3);
        doc.line(lineCenter - lineW / 2 + 10, y + 4.5, lineCenter + lineW / 2 - 10, y + 4.5);

        y += 12;
        doc.setTextColor(...C_TEXT);
        break;
      }

      case "paragraph": {
        y = ensurePage(doc, y, 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...C_TEXT);

        // Indent de primeira linha (estilo jurídico)
        const fullText = block.text;
        const lines = doc.splitTextToSize(fullText, CONTENT_W);
        lines.forEach((line, li) => {
          y = ensurePage(doc, y, 5.5);
          const xOffset = li === 0 ? 8 : 0; // Recuo na primeira linha
          doc.text(line, MARGIN_LEFT + xOffset, y, { maxWidth: CONTENT_W - xOffset });
          y += 5.2;
        });
        y += 3;
        break;
      }

      case "clause": {
        y = ensurePage(doc, y, 20);

        // ─── Badge da cláusula (número em destaque) ───
        const hasTitle = block.title && block.title.trim() !== "";
        const clauseLabel = hasTitle
          ? `CLÁUSULA ${block.number} — ${block.title}`
          : `CLÁUSULA ${block.number}`;

        // Background sutil para o header da cláusula
        doc.setFillColor(...C_BG_LIGHT);
        const labelWidth = doc.getTextWidth(clauseLabel) + 8;
        doc.roundedRect(MARGIN_LEFT - 2, y - 4, Math.min(labelWidth + 6, CONTENT_W), 7.5, 1.5, 1.5, "F");

        // Texto da cláusula
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...C_ACCENT);
        doc.text(clauseLabel, MARGIN_LEFT, y);
        y += 7;

        // Linha fina abaixo do header
        doc.setDrawColor(...C_LINE_LIGHT);
        doc.setLineWidth(0.2);
        doc.line(MARGIN_LEFT, y - 2, MARGIN_LEFT + CONTENT_W * 0.6, y - 2);
        y += 2;

        doc.setTextColor(...C_TEXT);

        // Texto principal da cláusula
        if (block.text) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10.5);
          const lines = doc.splitTextToSize(block.text, CONTENT_W);
          lines.forEach((line) => {
            y = ensurePage(doc, y, 5.5);
            doc.text(line, MARGIN_LEFT, y, { maxWidth: CONTENT_W });
            y += 5.2;
          });
        }

        // Parágrafos numerados
        if (block.paragraphs?.length) {
          block.paragraphs.forEach((p) => {
            y = ensurePage(doc, y, 6);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);

            // Detecta se é um sub-item (§ ou numeração romana)
            const isSubItem = /^[§IVX]+/.test(p) || p.startsWith("I ") || p.startsWith("II ") || p.startsWith("III ") || p.startsWith("IV ") || p.startsWith("V ");
            const indent = isSubItem ? 6 : 0;

            const pLines = doc.splitTextToSize(p, CONTENT_W - indent);
            pLines.forEach((line, li) => {
              y = ensurePage(doc, y, 5.5);
              doc.text(line, MARGIN_LEFT + indent + (li === 0 ? 0 : 2), y, { maxWidth: CONTENT_W - indent });
              y += 5.2;
            });
          });
        }
        y += 5;
        break;
      }

      case "closing": {
        y = ensurePage(doc, y, 14);
        y += 2;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10.5);
        doc.setTextColor(...C_TEXT_LIGHT);
        const lines = doc.splitTextToSize(block.text, CONTENT_W);
        lines.forEach((line) => {
          y = ensurePage(doc, y, 5.5);
          doc.text(line, MARGIN_LEFT, y);
          y += 5.2;
        });
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C_TEXT);
        break;
      }

      case "date": {
        y = ensurePage(doc, y, 12);
        y += 2;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(...C_TEXT);
        doc.text(block.text, PAGE_W / 2, y, { align: "center" });
        y += 12;
        break;
      }

      case "signatures": {
        const parties = block.parties || [];
        y = ensurePage(doc, y, 50);
        y += 10;

        const colW = CONTENT_W / parties.length;
        parties.forEach((party, i) => {
          const centerX = MARGIN_LEFT + i * colW + colW / 2;
          const lineW = colW * 0.75;
          const lineStartX = centerX - lineW / 2;

          // Linha de assinatura pontilhada
          doc.setDrawColor(...C_TEXT);
          doc.setLineWidth(0.3);
          const dashLen = 2;
          const gapLen = 1.5;
          let dx = lineStartX;
          while (dx < lineStartX + lineW) {
            doc.line(dx, y, Math.min(dx + dashLen, lineStartX + lineW), y);
            dx += dashLen + gapLen;
          }

          // Nome abaixo da linha
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(...C_TEXT);
          doc.text(party.name || "", centerX, y + 5.5, { align: "center", maxWidth: lineW });

          // Papel em destaque
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(...C_ACCENT);
          doc.text(party.role, centerX, y + 10.5, { align: "center" });
        });
        y += 20;
        doc.setTextColor(...C_TEXT);
        break;
      }

      case "witnesses": {
        const count = block.count || 2;
        y = ensurePage(doc, y, 45);
        y += 4;

        // Título "Testemunhas"
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...C_MUTED);
        doc.text("TESTEMUNHAS", MARGIN_LEFT, y);
        y += 10;

        const colW = CONTENT_W / count;
        for (let i = 0; i < count; i++) {
          const centerX = MARGIN_LEFT + i * colW + colW / 2;
          const lineW = colW * 0.8;
          const lineStartX = centerX - lineW / 2;

          // Número da testemunha em badge
          doc.setFillColor(...C_BG_LIGHT);
          doc.circle(lineStartX, y - 1.5, 4, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(...C_ACCENT);
          doc.text(`${i + 1}`, lineStartX, y, { align: "center" });

          // Linha pontilhada
          doc.setDrawColor(...C_MUTED);
          doc.setLineWidth(0.25);
          let dx = lineStartX + 6;
          while (dx < lineStartX + lineW) {
            doc.line(dx, y, Math.min(dx + 2, lineStartX + lineW), y);
            dx += 3.5;
          }

          // Labels: Nome e CPF
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...C_MUTED);
          doc.text("Nome:", lineStartX + 6, y + 5);
          doc.setDrawColor(...C_LINE_LIGHT);
          doc.setLineWidth(0.2);
          doc.line(lineStartX + 16, y + 5.5, lineStartX + lineW, y + 5.5);

          doc.text("CPF:", lineStartX + 6, y + 10);
          doc.line(lineStartX + 14, y + 10.5, lineStartX + lineW * 0.7, y + 10.5);
        }
        y += 20;
        doc.setTextColor(...C_TEXT);
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
 * Gera PDF de documento jurídico com design premium.
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

  drawHeader(doc, docType?.name || "Documento Jurídico", docType?.legislation);
  drawSideStripe(doc);

  let y = 46;

  // Tenta gerar pelo documentBody
  const vId = variantId || docType?.defaultVariant;
  const body = vId
    ? getDocumentBody(docType?.id, vId, formData, disabledFields)
    : null;

  if (body && body.length > 0) {
    // Contrato real com cláusulas
    y = renderBodyToPDF(doc, body, y);
  } else {
    // Fallback: lista de campos com design melhorado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...C_NAVY);
    doc.text(docType?.name || "CONTRATO", PAGE_W / 2, y, { align: "center" });

    // Linha decorativa
    doc.setDrawColor(...C_TEAL);
    doc.setLineWidth(0.6);
    doc.line(PAGE_W / 2 - 30, y + 4, PAGE_W / 2 + 30, y + 4);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...C_TEXT);

    (docType?.fields || []).forEach((f) => {
      if (disabledFields[f.key]) return;
      const value = formData[f.key] || "—";
      y = ensurePage(doc, y, 14);

      // Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C_MUTED);
      doc.text(f.label.toUpperCase(), MARGIN_LEFT, y);

      // Value
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...C_TEXT);
      const lines = doc.splitTextToSize(value, CONTENT_W);
      doc.text(lines, MARGIN_LEFT, y + 5);
      y += 8 + (lines.length - 1) * 5;

      // Separador sutil
      doc.setDrawColor(...C_LINE_LIGHT);
      doc.setLineWidth(0.15);
      doc.line(MARGIN_LEFT, y, MARGIN_LEFT + CONTENT_W, y);
      y += 3;
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
