/**
 * ============================================
 * KRIOU DOCS - usePDF Hook
 * ============================================
 * Gera PDFs em Web Worker para não bloquear a UI.
 * Cria um novo worker a cada chamada e o encerra
 * logo após a geração (sem estado persistente).
 *
 * Uso:
 *   const { generatePDF, isGenerating } = usePDF();
 *
 *   // Currículo
 *   await generatePDF({ type: "GENERATE_RESUME", formData, template });
 *
 *   // Documento jurídico
 *   await generatePDF({ type: "GENERATE_LEGAL", formData, docType });
 *
 * @module hooks/usePDF
 */

import { useState, useCallback, useRef } from "react";

/**
 * Inicia o download de um ArrayBuffer como arquivo PDF no browser.
 * @param {ArrayBuffer} arrayBuffer
 * @param {string} filename
 */
function triggerDownload(arrayBuffer, filename) {
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function usePDF() {
  const [isGenerating, setIsGenerating] = useState(false);
  const workerRef = useRef(null);

  /**
   * Gera e faz download do PDF em background.
   * @param {{ type: string, formData: object, template?: object, docType?: object }} options
   * @returns {Promise<void>}
   */
  const generatePDF = useCallback((options) => {
    return new Promise((resolve, reject) => {
      setIsGenerating(true);

      // Encerra qualquer worker anterior que ainda esteja rodando
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker(
        new URL("../workers/pdfWorker.js", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;

      worker.onmessage = (event) => {
        const { type, arrayBuffer, filename, message } = event.data;
        worker.terminate();
        workerRef.current = null;
        setIsGenerating(false);

        if (type === "PDF_SUCCESS") {
          triggerDownload(arrayBuffer, filename);
          resolve();
        } else {
          reject(new Error(message || "Erro ao gerar PDF."));
        }
      };

      worker.onerror = (error) => {
        worker.terminate();
        workerRef.current = null;
        setIsGenerating(false);
        reject(new Error(error.message || "Erro no worker de PDF."));
      };

      worker.postMessage(options);
    });
  }, []);

  return { generatePDF, isGenerating };
}

export default usePDF;
