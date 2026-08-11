import { extractText } from "unpdf";
import { describe, expect, it, vi } from "vitest";
import { downloadPDF, generateResumePDF } from "./pdfGenerator";

const parsePdf = async (doc) => {
  const arrayBuffer = doc.output("arraybuffer");
  const bytes = Buffer.from(arrayBuffer);

  expect(bytes.byteLength).toBeGreaterThan(4_000);
  expect(bytes.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(bytes.subarray(-20).toString("latin1")).toContain("%%EOF");

  return extractText(new Uint8Array(arrayBuffer), { mergePages: false });
};

describe("generateResumePDF", () => {
  it("gera um PDF real com os dados mínimos e fallbacks seguros", async () => {
    const doc = generateResumePDF({ nome: "", profissao: "Analista" }, {
      color: "cor-invalida",
      accent: null,
    });
    const { totalPages, text } = await parsePdf(doc);
    const [pageText] = text;

    expect(totalPages).toBe(1);
    expect(pageText).toContain("?");
    expect(pageText).toContain("Nome completo");
    expect(pageText).toContain("ANALISTA");
    expect(pageText).toContain("KRIOU DOCS");
    expect(pageText).toContain("Página 1 de 1");
  });

  it("preserva o conteúdo essencial de um currículo completo sem snapshot binário", async () => {
    const doc = generateResumePDF({
      nome: "Ana Silva",
      cargo: "Engenheira de Software",
      email: "ana@example.com",
      telefone: "(91) 99999-0000",
      cidade: "Belém - PA",
      linkedin: "linkedin.com/in/ana",
      portfolio: "ana.dev",
      dataNascimento: "01/02/1990",
      habilidades: ["JavaScript", "Arquitetura"],
      habilidadesExtras: "Liderança; Mentoria\nObservabilidade",
      idiomas: [
        { idioma: "Inglês", nivel: "Avançado" },
        { idioma: "", nivel: "Básico" },
      ],
      objetivo: "Lider\u00a0de equipes\u200b — foco • em resultados",
      resumo: "não deve substituir o objetivo",
      experiencias: [
        {
          empresa: "Kriou",
          cargo: "Tech Lead",
          periodo: "2022 - atual",
          descricao: "Desenvolvimento de produtos digitais.",
        },
        { empresa: "", cargo: "Registro incompleto", descricao: "ignorado" },
      ],
      formacoes: [
        {
          instituicao: "UFPA",
          curso: "Ciência da Computação",
          periodo: "2010 - 2014",
          status: "Concluído",
        },
        { instituicao: "Instituto K", curso: "Especialização" },
        { instituicao: "", curso: "Registro incompleto" },
      ],
      cursos: "Arquitetura de Software\nCloud Computing",
      cnh: "B",
      disponibilidade: "Imediata",
      pretensaoSalarial: "A combinar",
      extras: "Disponível para viagens",
    }, {
      color: "#ffffff",
      accent: "#2563A6",
    });
    const { totalPages, text } = await parsePdf(doc);
    const documentText = text.join("\n");

    expect(totalPages).toBeLessThanOrEqual(2);
    [
      "Ana Silva",
      "RESUMO PROFISSIONAL",
      "Lider de equipes - foco - em resultados",
      "EXPERIÊNCIA PROFISSIONAL",
      "Tech Lead",
      "Kriou",
      "FORMAÇÃO ACADÊMICA",
      "UFPA - Concluído",
      "Instituto K",
      "INFORMAÇÕES ADICIONAIS",
      "CNH: B",
    ].forEach((value) => expect(documentText).toContain(value));
    expect(documentText).not.toContain("não deve substituir o objetivo");
    expect(documentText).not.toContain("Registro incompleto");
  });

  it("pagina descrições longas e identifica todas as páginas e continuações", async () => {
    const description = Array(80)
      .fill("Entrega resultados com qualidade e colaboração.")
      .join(" ");
    const doc = generateResumePDF({
      nome: "João Souza",
      experiencias: [{
        empresa: "Empresa Exemplo",
        cargo: "Especialista",
        periodo: "2020 - atual",
        descricao: description,
      }],
    });
    const { totalPages, text } = await parsePdf(doc);

    expect(totalPages).toBe(2);
    expect(text).toHaveLength(2);
    expect(text[1]).toContain("CONTINUAÇÃO");
    expect(text[0]).toContain("Página 1 de 2");
    expect(text[1]).toContain("Página 2 de 2");
  });
});

describe("downloadPDF", () => {
  it("usa o nome padrão e respeita um nome personalizado", () => {
    const doc = { save: vi.fn() };

    downloadPDF(doc);
    downloadPDF(doc, "ana-silva.pdf");

    expect(doc.save).toHaveBeenNthCalledWith(1, "curriculo.pdf");
    expect(doc.save).toHaveBeenNthCalledWith(2, "ana-silva.pdf");
  });
});
