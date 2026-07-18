import { describe, expect, it } from "vitest";
import {
  getDocumentBody,
  getSectionsForVariant,
  LEGAL_DOCUMENTS,
} from "./legalDocuments";
import { generateMockFormData } from "../utils/mockData";

const paragraphText = (body) => body
  .filter(Boolean)
  .flatMap((block) => [block.text || "", ...(block.paragraphs || [])])
  .join("\n");

describe("interpolacao de campos opcionais juridicos", () => {
  it("mantem o acompanhante quando somente o nome foi informado", () => {
    const body = getDocumentBody("autorizacao-viagem", "nacional", {
      nome_acompanhante: "Maria de Souza",
    });

    expect(paragraphText(body)).toContain("acompanhado(a) de Maria de Souza");
  });

  it("inclui todas as medidas preenchidas do terreno", () => {
    const body = getDocumentBody("compra-venda", "terreno", {
      medida_frente: "20 m",
      medida_fundo: "18 m",
      medida_direita: "50 m",
      medida_esquerda: "48 m",
    });
    const text = paragraphText(body);

    expect(text).toContain("frente com 20 m");
    expect(text).toContain("fundos com 18 m");
    expect(text).toContain("lateral direita com 50 m");
    expect(text).toContain("lateral esquerda com 48 m");
  });

  it("usa a cidade do contrato como foro sem duplicar o prefixo comarca", () => {
    const body = getDocumentBody("compra-venda", "terreno", {
      cidade_contrato: "Santa Maria, RS",
      foro: "Comarca de Santa Maria, RS",
    });
    const text = paragraphText(body);

    expect(text).toContain("Foro da Comarca de Santa Maria, RS");
    expect(text).not.toContain("Comarca de Comarca de");
  });

  it("calcula e identifica a area estimada quando as quatro medidas existem", () => {
    const body = getDocumentBody("compra-venda", "terreno", {
      medida_frente: "12,00 m",
      medida_fundo: "10,00 m",
      medida_direita: "25,00 m",
      medida_esquerda: "25,00 m",
    });

    expect(paragraphText(body)).toContain("área estimada de 275,00 m²");
  });

  it("prioriza a area informada e nao a classifica como calculada", () => {
    const body = getDocumentBody("compra-venda", "terreno", {
      area_terreno: "280,00 m²",
      medida_frente: "12 m",
      medida_fundo: "10 m",
      medida_direita: "25 m",
      medida_esquerda: "25 m",
    });
    const text = paragraphText(body);

    expect(text).toContain("área total aproximada de 280,00 m²");
    expect(text).not.toContain("área estimada de 275,00 m²");
  });
});

describe("integridade de todos os modelos juridicos", () => {
  for (const document of LEGAL_DOCUMENTS) {
    for (const variant of document.variants || []) {
      it(`${document.id}/${variant.id} resolve todos os placeholders com dados completos`, () => {
        const sections = getSectionsForVariant(document.id, variant.id);
        const formData = generateMockFormData(document.id, variant.id, sections);
        const body = getDocumentBody(document.id, variant.id, formData);
        const text = paragraphText(body);

        expect(text).not.toMatch(/\[[a-z][a-z0-9_]*\]/i);
        expect(text).not.toContain("\x00");
        expect(text).not.toMatch(/\{\??(?:any,)?[^}]*\}/);
      });

      it(`${document.id}/${variant.id} nao oferece campos ignorados pelo documento`, () => {
        const fields = getSectionsForVariant(document.id, variant.id)
          .flatMap((section) => section.fields)
          .map((field) => field.key);
        const rawBody = JSON.stringify(document.documentBody?.[variant.id] || []);
        const ignoredFields = fields.filter((key) => !rawBody.includes(key));

        expect(ignoredFields).toEqual([]);
      });

      it(`${document.id}/${variant.id} preserva cada campo opcional preenchido isoladamente`, () => {
        const fields = getSectionsForVariant(document.id, variant.id)
          .flatMap((section) => section.fields);
        const requiredData = Object.fromEntries(
          fields.filter((field) => field.required).map((field) => [field.key, `BASE_${field.key}`]),
        );
        const missingOptionalFields = fields
          .filter((field) => !field.required)
          .filter((field) => {
            const marker = `MARCADOR_${field.key}`;
            const dependencyData = field.dependsOn
              ? { [field.dependsOn]: `BASE_${field.dependsOn}` }
              : {};
            const body = getDocumentBody(document.id, variant.id, {
              ...requiredData,
              ...dependencyData,
              [field.key]: marker,
            });
            return !paragraphText(body).includes(marker);
          })
          .map((field) => field.key);

        expect(missingOptionalFields).toEqual([]);
      });
    }
  }
});
