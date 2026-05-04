/**
 * ============================================
 * KRIOU DOCS — QR Code Helper
 * ============================================
 * Generates QR codes as jsPDF-renderable pixel matrices.
 * Uses qrcode-generator (pure JS, no DOM, works in Web Workers).
 *
 * @module utils/qrHelper
 */

import qrcode from "qrcode-generator";

/**
 * Generate a QR code data object and draw it onto a jsPDF instance.
 *
 * @param {jsPDF}  doc       - jsPDF document instance
 * @param {string} text      - Text to encode in the QR code
 * @param {number} x         - X position (mm from left)
 * @param {number} y         - Y position (mm from top)
 * @param {number} size      - QR code dimension in mm (square)
 * @param {Object} [options] - Extra options
 * @param {string} [options.label] - Label text below the QR code
 * @param {number} [options.labelSize] - Font size for label (default 5)
 */
export const drawQRCode = (doc, text, x, y, size, options = {}) => {
  const { label = null, labelSize = 5 } = options;

  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const cellSize = size / moduleCount;

  // Draw QR code modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        doc.setFillColor(0, 0, 0);
        doc.rect(
          x + col * cellSize,
          y + row * cellSize,
          cellSize,
          cellSize,
          "F"
        );
      }
    }
  }

  // White border around QR (quiet zone)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.1);
  doc.rect(x - 1, y - 1, size + 2, size + 2);

  // Optional label below QR
  if (label) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(labelSize);
    doc.setTextColor(100, 100, 100);
    doc.text(label, x + size / 2, y + size + 3.5, { align: "center" });
  }
};

export default { drawQRCode };
