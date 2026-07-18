import { describe, expect, it } from "vitest";
import { LEGAL_DOCUMENTS, getSectionsForVariant } from "../data/legalDocuments";
import { generateMockFormData } from "./mockData";
import { generateLegalPDF } from "./legalPdfGenerator";

const scenariosFor = (document, variant) => {
  const sections = getSectionsForVariant(document.id, variant.id);
  const complete = generateMockFormData(document.id, variant.id, sections);
  const normal = { ...complete };

  sections
    .flatMap((section) => section.fields || [])
    .filter((field) => !field.required)
    .forEach((field) => delete normal[field.key]);

  return { normal, complete };
};

describe("paginacao dos documentos juridicos", () => {
  for (const document of LEGAL_DOCUMENTS) {
    for (const variant of document.variants || []) {
      it(`${document.id}/${variant.id} usa no maximo duas paginas no cenario normal`, () => {
        const { normal } = scenariosFor(document, variant);
        const pdf = generateLegalPDF(normal, document, {}, variant.id);

        expect(pdf.getNumberOfPages()).toBeLessThanOrEqual(2);
      });

      it(`${document.id}/${variant.id} limita o cenario completo a tres paginas`, () => {
        const { complete } = scenariosFor(document, variant);
        const pdf = generateLegalPDF(complete, document, {}, variant.id);

        expect(pdf.getNumberOfPages()).toBeLessThanOrEqual(3);
      });
    }
  }
});
