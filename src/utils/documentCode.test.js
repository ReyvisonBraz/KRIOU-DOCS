import { describe, expect, it } from "vitest";
import {
  CODE_PREFIX,
  extractPersonData,
  generateDocumentCode,
  getCodePrefix,
  looksLikeCode,
  looksLikeCPF,
  normalizeCPF,
  normalizeName,
  normalizeRG,
  padCode,
} from "./documentCode";

describe("códigos sequenciais de documentos", () => {
  it("expõe os prefixos conhecidos e usa DC para tipos desconhecidos", () => {
    expect(CODE_PREFIX.resume).toBe("CV");
    expect(getCodePrefix("prestacao-servicos")).toBe("PS");
    expect(getCodePrefix("tipo-futuro")).toBe("DC");
    expect(padCode(7)).toBe("007");
    expect(padCode(1234)).toBe("1234");
  });

  it("continua a sequência compartilhada entre resume e curriculo", () => {
    const documents = [
      { type: "resume", code: "CV-002" },
      { type: "curriculo", code: "CV-011" },
      { type: "legal", documentType: "compra-venda", code: "CB-099" },
    ];

    expect(generateDocumentCode(documents, "resume")).toBe("CV-012");
    expect(generateDocumentCode(documents, "curriculo")).toBe("CV-012");
  });

  it("continua a sequência jurídica apenas com códigos válidos do tipo", () => {
    const documents = [
      { type: "legal", documentType: "locacao", code: "LC-004" },
      { type: "legal", documentType: "locacao", code: "LC-015" },
      { type: "legal", documentType: "locacao", code: null },
      { type: "legal", documentType: "locacao", code: "LC-sem-numero" },
      { type: "legal", documentType: "locacao", code: "LC-100-invalido" },
      { type: "legal", documentType: "locacao", code: "CV-900" },
      { type: "legal", documentType: "doacao", code: "DC-300" },
    ];

    expect(generateDocumentCode(documents, "locacao")).toBe("LC-016");
  });

  it("inicia em 001 quando não há documentos", () => {
    expect(generateDocumentCode(null, "doacao")).toBe("DC-001");
    expect(generateDocumentCode([], "resume")).toBe("CV-001");
  });
});

describe("extração de dados pessoais", () => {
  it("extrai o nome do currículo e tolera formData ausente", () => {
    expect(extractPersonData({
      type: "resume",
      formData: { nome: "Ana Souza", cpf: "não aplicável" },
    })).toEqual({ nome: "Ana Souza", cpf: null, rg: null });
    expect(extractPersonData({ type: "resume" })).toEqual({
      nome: null,
      cpf: null,
      rg: null,
    });
  });

  it("prioriza a parte principal de cada tipo jurídico", () => {
    const cases = [
      ["compra-venda", "vendedor"],
      ["locacao", "locador"],
      ["procuracao", "outorgante"],
      ["comodato", "comodante"],
      ["doacao", "doador"],
      ["recibo", "recebedor"],
      ["uniao-estavel", "companheiro1"],
      ["autorizacao-viagem", "autorizante"],
      ["permuta", "permutante1"],
      ["prestacao-servicos", "contratante"],
    ];

    cases.forEach(([documentType, prefix]) => {
      expect(extractPersonData({
        type: "legal",
        documentType,
        legalData: {
          [`${prefix}_nome`]: `Nome ${prefix}`,
          [`${prefix}_cpf`]: "123.456.789-00",
          [`${prefix}_rg`]: "12.345-6",
          outro_nome: "Não usar",
        },
      })).toEqual({
        nome: `Nome ${prefix}`,
        cpf: "123.456.789-00",
        rg: "12.345-6",
      });
    });
  });

  it("aceita CPF sem nome na parte principal e preenche ausências com null", () => {
    expect(extractPersonData({
      type: "legal",
      documentType: "locacao",
      legalData: { locador_cpf: "123.456.789-00" },
    })).toEqual({ nome: null, cpf: "123.456.789-00", rg: null });
  });

  it("usa qualquer campo de nome como fallback jurídico", () => {
    expect(extractPersonData({
      type: "legal",
      documentType: "tipo-futuro",
      legalData: {
        observacao: "ignorar",
        parte_nome: "Carlos Lima",
        parte_cpf: "987.654.321-00",
        parte_rg: "55.444-3",
      },
    })).toEqual({
      nome: "Carlos Lima",
      cpf: "987.654.321-00",
      rg: "55.444-3",
    });
  });

  it("retorna dados vazios para documentos ausentes, desconhecidos ou sem pessoa", () => {
    const empty = { nome: null, cpf: null, rg: null };

    expect(extractPersonData(null)).toEqual(empty);
    expect(extractPersonData({ type: "outro" })).toEqual(empty);
    expect(extractPersonData({ type: "legal", legalData: { parte_nome: "" } })).toEqual(empty);
  });
});

describe("normalização e detectores de busca", () => {
  it("normaliza CPF, RG e nome", () => {
    expect(normalizeCPF("123.456.789-00")).toBe("12345678900");
    expect(normalizeCPF(null)).toBe("");
    expect(normalizeRG("12.345.678-X")).toBe("12345678");
    expect(normalizeRG(undefined)).toBe("");
    expect(normalizeName("  João D'Ávila  ")).toBe("joao d'avila");
    expect(normalizeName("")).toBe("");
  });

  it("reconhece consultas com aparência de CPF", () => {
    expect(looksLikeCPF("123")).toBe(true);
    expect(looksLikeCPF("123.456")).toBe(true);
    expect(looksLikeCPF("12345678900")).toBe(true);
    expect(looksLikeCPF("12")).toBe(false);
    expect(looksLikeCPF("123456789012")).toBe(false);
    expect(looksLikeCPF("abc123")).toBe(false);
  });

  it("reconhece códigos de documento sem confundir entradas inválidas", () => {
    expect(looksLikeCode("CV-003")).toBe(true);
    expect(looksLikeCode("ps-42")).toBe(true);
    expect(looksLikeCode("C-003")).toBe(false);
    expect(looksLikeCode("CV-sem-numero")).toBe(false);
    expect(looksLikeCode(" CV-003")).toBe(false);
  });
});
