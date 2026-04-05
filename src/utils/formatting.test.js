/**
 * ============================================
 * KRIOU DOCS - Testes: formatting.js
 * ============================================
 */
import { describe, it, expect } from "vitest";
import { formatCpf, formatPhone, formatCnpj, formatCep, formatCurrency, formatDate } from "./formatting";

// ─── formatCpf ───
describe("formatCpf", () => {
  it("formata CPF completo", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatCpf("529.982.247-25")).toBe("529.982.247-25");
  });

  it("formata parcialmente com 6 dígitos", () => {
    expect(formatCpf("529982")).toBe("529.982");
  });

  it("formata parcialmente com 9 dígitos", () => {
    expect(formatCpf("529982247")).toBe("529.982.247");
  });

  it("limita a 11 dígitos", () => {
    expect(formatCpf("529982247251234")).toBe("529.982.247-25");
  });

  it("retorna string vazia para vazio", () => {
    expect(formatCpf("")).toBe("");
  });
});

// ─── formatPhone ───
describe("formatPhone", () => {
  it("formata celular (11 dígitos)", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
  });

  it("formata fixo (10 dígitos)", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata parcialmente com 4 dígitos", () => {
    expect(formatPhone("1199")).toBe("(11) 99");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
  });

  it("limita a 11 dígitos", () => {
    expect(formatPhone("119999999991234")).toBe("(11) 99999-9999");
  });
});

// ─── formatCnpj ───
describe("formatCnpj", () => {
  it("formata CNPJ completo", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatCnpj("11.222.333/0001-81")).toBe("11.222.333/0001-81");
  });

  it("limita a 14 dígitos", () => {
    expect(formatCnpj("112223330001811234")).toBe("11.222.333/0001-81");
  });
});

// ─── formatCep ───
describe("formatCep", () => {
  it("formata CEP completo", () => {
    expect(formatCep("01310100")).toBe("01310-100");
  });

  it("formata parcialmente com 5 dígitos", () => {
    expect(formatCep("01310")).toBe("01310");
  });

  it("ignora caracteres não numéricos", () => {
    expect(formatCep("01310-100")).toBe("01310-100");
  });
});

// ─── formatCurrency ───
describe("formatCurrency", () => {
  it("formata valor zero", () => {
    expect(formatCurrency(0)).toBe("R$\u00a00,00");
  });

  it("formata valor positivo", () => {
    expect(formatCurrency(9.9)).toMatch(/9,90/);
  });

  it("formata valor grande", () => {
    expect(formatCurrency(1000)).toMatch(/1\.000,00/);
  });
});

// ─── formatDate ───
describe("formatDate", () => {
  it("retorna string vazia para vazio", () => {
    expect(formatDate("")).toBe("");
  });

  it("formata data ISO válida", () => {
    const result = formatDate("2024-03-25");
    expect(result).toMatch(/25\/03\/2024|25\/3\/2024/);
  });
});
