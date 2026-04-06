/**
 * ============================================
 * KRIOU DOCS - PDF Web Worker
 * ============================================
 * Executa a geração de PDF em background thread
 * para não travar a UI durante a geração.
 *
 * Protocolo de mensagens:
 *
 * Entrada (main → worker):
 *   { type: "GENERATE_RESUME", formData, template }
 *   { type: "GENERATE_LEGAL",  formData, docType  }
 *
 * Saída (worker → main):
 *   { type: "PDF_SUCCESS", blob, filename }
 *   { type: "PDF_ERROR",   message         }
 *
 * @module workers/pdfWorker
 */

import { generateResumePDF } from "../utils/pdfGenerator";
import { generateLegalPDF } from "../utils/legalPdfGenerator";

self.addEventListener("message", (event) => {
  const { type, formData, template, docType, disabledFields, variantId } = event.data;

  try {
    let doc;
    let filename;

    if (type === "GENERATE_RESUME") {
      doc = generateResumePDF(formData, template);
      filename = formData?.nome
        ? `curriculo-${formData.nome.toLowerCase().replace(/\s+/g, "-")}.pdf`
        : "curriculo-kriou-docs.pdf";
    } else if (type === "GENERATE_LEGAL") {
      doc = generateLegalPDF(formData, docType, disabledFields || {}, variantId || null);
      filename = docType?.id
        ? `${docType.id}-kriou-docs.pdf`
        : "documento-kriou-docs.pdf";
    } else {
      throw new Error(`Tipo de mensagem desconhecido: ${type}`);
    }

    // Converte o jsPDF para ArrayBuffer e envia de volta
    const arrayBuffer = doc.output("arraybuffer");

    self.postMessage({ type: "PDF_SUCCESS", arrayBuffer, filename }, [arrayBuffer]);
  } catch (error) {
    self.postMessage({ type: "PDF_ERROR", message: error.message });
  }
});
