import fs from "node:fs/promises";
import path from "node:path";
import { LEGAL_DOCUMENTS, getSectionsForVariant } from "../src/data/legalDocuments.js";
import { RESUME_TEMPLATES } from "../src/data/constants.js";
import { generateMockFormData } from "../src/utils/mockData.js";
import { generateLegalPDF } from "../src/utils/legalPdfGenerator.js";
import { generateResumePDF } from "../src/utils/pdfGenerator.js";

const outputDir = path.resolve("output/pdf");
await fs.mkdir(outputDir, { recursive: true });

const stressText = "Texto extenso de avaliação com acentuação: ação, cláusula, São José, ç, ã, ê. ".repeat(5).trim();
const resumeData = {
  nome: "Alexandre José de Albuquerque Montenegro dos Santos",
  email: "alexandre.qa.documentos+avaliacao@exemplo.com.br",
  telefone: "(85) 99999-9999",
  cidade: "Fortaleza, Ceará - Brasil",
  linkedin: "linkedin.com/in/alexandre-jose-albuquerque-montenegro",
  portfolio: "portfolio.exemplo.com.br/projetos/documentacao-e-qualidade",
  dataNascimento: "13/07/1990",
  cargo: "Especialista Sênior em Qualidade, Documentação e Processos Corporativos",
  objetivo: stressText,
  resumo: stressText,
  experiencias: Array.from({ length: 5 }, (_, i) => ({
    empresa: `Organização Brasileira de Tecnologia e Serviços Integrados ${i + 1}`,
    cargo: "Especialista em Qualidade e Melhoria Contínua",
    periodo: `0${i + 1}/2018 - 12/202${i}`,
    descricao: stressText,
  })),
  formacoes: Array.from({ length: 4 }, (_, i) => ({
    instituicao: `Universidade Metropolitana de Ciências Aplicadas ${i + 1}`,
    curso: "Pós-graduação em Gestão Estratégica, Qualidade e Transformação Digital",
    periodo: `201${i} - 201${i + 2}`,
    status: "Completo",
  })),
  habilidades: ["Gestão da qualidade", "Auditoria", "Documentação", "Análise de dados", "Automação", "Acessibilidade", "Liderança", "Planejamento", "Comunicação", "Melhoria contínua"],
  habilidadesExtras: "ISO 9001; WCAG; LGPD; mapeamento de processos; testes de software",
  idiomas: [
    { idioma: "Português", nivel: "Nativo" },
    { idioma: "Inglês", nivel: "Avançado" },
    { idioma: "Espanhol", nivel: "Intermediário" },
    { idioma: "Francês", nivel: "Básico" },
  ],
  cursos: stressText,
  extras: stressText,
};

const manifest = [];
const save = async (doc, filename, kind, model, variant) => {
  const bytes = Buffer.from(doc.output("arraybuffer"));
  await fs.writeFile(path.join(outputDir, filename), bytes);
  manifest.push({ filename, kind, model, variant, bytes: bytes.length, pages: doc.getNumberOfPages() });
};

for (const document of LEGAL_DOCUMENTS.filter((item) => item.available)) {
  for (const variant of document.variants || []) {
    const sections = getSectionsForVariant(document.id, variant.id);
    const formData = generateMockFormData(document.id, variant.id, sections);
    for (const section of sections) {
      for (const field of section.fields || []) {
        if (field.type === "textarea" && formData[field.key]) formData[field.key] = `${formData[field.key]} ${stressText}`;
      }
    }
    const pdf = generateLegalPDF(formData, document, {}, variant.id);
    await save(pdf, `juridico-${document.id}-${variant.id}.pdf`, "juridico", document.name, variant.name);
  }
}

for (const template of RESUME_TEMPLATES) {
  const pdf = generateResumePDF(resumeData, template);
  await save(pdf, `curriculo-${template.id}.pdf`, "curriculo", template.name, null);
}

await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Gerados ${manifest.length} PDFs em ${outputDir}`);
console.log(`Páginas totais: ${manifest.reduce((sum, item) => sum + item.pages, 0)}`);
