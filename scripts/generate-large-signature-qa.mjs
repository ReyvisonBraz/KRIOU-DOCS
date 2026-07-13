import fs from "node:fs/promises";
import path from "node:path";
import { LEGAL_DOCUMENTS, getDocumentBody, getSectionsForVariant } from "../src/data/legalDocuments.js";
import { generateMockFormData } from "../src/utils/mockData.js";
import { generateLegalPDF } from "../src/utils/legalPdfGenerator.js";

const document = LEGAL_DOCUMENTS.find((item) => item.id === "compra-venda");
const variantId = "veiculo";
const sections = getSectionsForVariant(document.id, variantId);
const formData = generateMockFormData(document.id, variantId, sections);
formData._signatureLayout = "large";
const representedParty = getDocumentBody(document.id, variantId, formData, {})
  .find((block) => block.type === "signatures")
  .parties[0];
formData._signatureAtRequestEnabled = "yes";
formData._signatureAtRequestPartyName = representedParty.name;
formData._signatureAtRequestPartyRole = representedParty.role;
formData._signatureAtRequestReason = "não poder assinar";
formData._signatureAtRequestSignerName = "Mariana Souza de Oliveira";
formData._signatureAtRequestSignerCpf = "123.456.789-09";

const pdf = generateLegalPDF(formData, document, {}, variantId);
const outputDir = path.resolve("tmp");
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "qa-assinatura-grande.pdf"), Buffer.from(pdf.output("arraybuffer")));
console.log(`PDF de assinatura grande gerado com ${pdf.getNumberOfPages()} páginas.`);
