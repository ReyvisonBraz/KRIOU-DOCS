/**
 * ============================================
 * KRIOU DOCS - Testes: sanitization.js
 * ============================================
 */
import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeFormData } from "./sanitization";

// ─── sanitizeText ───
describe("sanitizeText", () => {
  it("remove tags HTML simples", () => {
    expect(sanitizeText("<b>Texto</b>")).toBe("Texto");
  });

  it("remove tags script, preserva conteúdo textual", () => {
    // stripHtml remove as tags mas preserva o texto interno.
    // Campos de formulário nunca devem ser renderizados como HTML,
    // portanto o texto solto é inofensivo.
    expect(sanitizeText('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it("remove atributos com eventos (onclick)", () => {
    expect(sanitizeText('<span onclick="evil()">texto</span>')).toBe("texto");
  });

  it("remove tags aninhadas", () => {
    expect(sanitizeText("<div><p>conteúdo</p></div>")).toBe("conteúdo");
  });

  it("preserva texto puro", () => {
    expect(sanitizeText("João da Silva")).toBe("João da Silva");
  });

  it("aplica trim em espaços extras", () => {
    expect(sanitizeText("  texto com espaços  ")).toBe("texto com espaços");
  });

  it("retorna string vazia para não-string", () => {
    expect(sanitizeText(null)).toBe("");
    expect(sanitizeText(undefined)).toBe("");
    expect(sanitizeText(123)).toBe("");
  });

  it("preserva caracteres especiais brasileiros", () => {
    expect(sanitizeText("São Paulo, ção, ã, é, ü")).toBe("São Paulo, ção, ã, é, ü");
  });
});

// ─── sanitizeFormData ───
describe("sanitizeFormData", () => {
  it("sanitiza campos string do objeto", () => {
    const result = sanitizeFormData({ nome: "<b>João</b>", email: "joao@email.com" });
    expect(result.nome).toBe("João");
    expect(result.email).toBe("joao@email.com");
  });

  it("preserva campos não-string", () => {
    const result = sanitizeFormData({ ativo: true, count: 42, items: [1, 2] });
    expect(result.ativo).toBe(true);
    expect(result.count).toBe(42);
  });

  it("sanitiza arrays de strings", () => {
    const result = sanitizeFormData({ habilidades: ["<b>JS</b>", "React"] });
    expect(result.habilidades).toEqual(["JS", "React"]);
  });

  it("sanitiza arrays de objetos recursivamente", () => {
    const result = sanitizeFormData({
      experiencias: [{ empresa: "<script>evil</script>XPTO", cargo: "Dev" }],
    });
    expect(result.experiencias[0].empresa).toBe("evilXPTO");
    expect(result.experiencias[0].cargo).toBe("Dev");
  });

  it("sanitiza objetos aninhados", () => {
    const result = sanitizeFormData({
      endereco: { cidade: "<b>São Paulo</b>", uf: "SP" },
    });
    expect(result.endereco.cidade).toBe("São Paulo");
    expect(result.endereco.uf).toBe("SP");
  });

  it("retorna input não-objeto sem alterar", () => {
    expect(sanitizeFormData(null)).toBe(null);
    expect(sanitizeFormData("string")).toBe("string");
  });
});
