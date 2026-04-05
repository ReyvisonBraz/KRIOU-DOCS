/**
 * ============================================
 * KRIOU DOCS - Testes: validation.js
 * ============================================
 */
import { describe, it, expect } from "vitest";
import { validateCpf, VALIDATION_RULES, validateStep, getStepStatus } from "./validation";

// ─── validateCpf ───
describe("validateCpf", () => {
  it("aceita CPF válido com formatação", () => {
    expect(validateCpf("529.982.247-25")).toBe(true);
  });

  it("aceita CPF válido sem formatação", () => {
    expect(validateCpf("52998224725")).toBe(true);
  });

  it("rejeita CPF com dígito verificador errado", () => {
    expect(validateCpf("529.982.247-26")).toBe(false);
  });

  it("rejeita CPF com menos de 11 dígitos", () => {
    expect(validateCpf("123.456.789")).toBe(false);
  });

  it("rejeita sequências repetidas (000.000.000-00)", () => {
    expect(validateCpf("000.000.000-00")).toBe(false);
  });

  it("rejeita sequências repetidas (111.111.111-11)", () => {
    expect(validateCpf("111.111.111-11")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(validateCpf("")).toBe(false);
  });
});

// ─── VALIDATION_RULES ───
describe("VALIDATION_RULES.email", () => {
  it("aceita e-mail válido", () => {
    expect(VALIDATION_RULES.email("usuario@email.com")).toBe(true);
  });

  it("aceita e-mail com subdomínio", () => {
    expect(VALIDATION_RULES.email("user@mail.company.com.br")).toBe(true);
  });

  it("rejeita e-mail sem @", () => {
    expect(VALIDATION_RULES.email("usuarioemail.com")).toBe(false);
  });

  it("rejeita e-mail sem TLD com 2+ chars", () => {
    expect(VALIDATION_RULES.email("a@b.c")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(VALIDATION_RULES.email("")).toBe(false);
  });
});

describe("VALIDATION_RULES.phone", () => {
  it("aceita celular com 11 dígitos", () => {
    expect(VALIDATION_RULES.phone("(11) 99999-9999")).toBe(true);
  });

  it("aceita fixo com 10 dígitos", () => {
    expect(VALIDATION_RULES.phone("(11) 3333-4444")).toBe(true);
  });

  it("rejeita número com menos de 10 dígitos", () => {
    expect(VALIDATION_RULES.phone("9999-999")).toBe(false);
  });
});

describe("VALIDATION_RULES.required", () => {
  it("válido para string não vazia", () => {
    expect(VALIDATION_RULES.required("João")).toBe(true);
  });

  it("inválido para string vazia", () => {
    expect(VALIDATION_RULES.required("")).toBe(false);
  });

  it("inválido para string apenas com espaços", () => {
    expect(VALIDATION_RULES.required("   ")).toBe(false);
  });

  it("válido para array não vazio", () => {
    expect(VALIDATION_RULES.required(["item"])).toBe(true);
  });

  it("inválido para array vazio", () => {
    expect(VALIDATION_RULES.required([])).toBe(false);
  });
});

// ─── validateStep ───
describe("validateStep — step 0 (dados pessoais)", () => {
  const validData = {
    nome: "João da Silva",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    experiencias: [],
    formacoes: [],
    habilidades: [],
    idiomas: [],
  };

  it("válido com dados corretos", () => {
    const result = validateStep(0, validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("inválido sem nome", () => {
    const result = validateStep(0, { ...validData, nome: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.nome).toBeDefined();
  });

  it("inválido com e-mail malformado", () => {
    const result = validateStep(0, { ...validData, email: "naoemail" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("inválido com nome muito curto", () => {
    const result = validateStep(0, { ...validData, nome: "Jo" });
    expect(result.valid).toBe(false);
    expect(result.errors.nome).toBeDefined();
  });
});

// ─── validateStep — steps opcionais ───
describe("validateStep — steps opcionais (4, 5, 6)", () => {
  const anyData = { habilidades: [], idiomas: [], cursos: "" };

  it("step 4 (habilidades) é sempre válido", () => {
    expect(validateStep(4, anyData).valid).toBe(true);
  });

  it("step 5 (idiomas) é sempre válido", () => {
    expect(validateStep(5, anyData).valid).toBe(true);
  });

  it("step 6 (extras) é sempre válido", () => {
    expect(validateStep(6, anyData).valid).toBe(true);
  });
});

// ─── validateStep — step 2 (experiência) ───
describe("validateStep — step 2 (experiência)", () => {
  it("válido quando lista vazia (experiência opcional)", () => {
    const result = validateStep(2, { experiencias: [{ empresa: "", cargo: "", periodo: "", descricao: "" }] });
    expect(result.valid).toBe(true);
  });

  it("inválido quando empresa preenchida sem cargo", () => {
    const result = validateStep(2, {
      experiencias: [{ empresa: "TechCorp", cargo: "", periodo: "", descricao: "" }],
    });
    expect(result.valid).toBe(false);
  });

  it("válido quando empresa e cargo preenchidos", () => {
    const result = validateStep(2, {
      experiencias: [{ empresa: "TechCorp", cargo: "Dev", periodo: "2020-2022", descricao: "" }],
    });
    expect(result.valid).toBe(true);
  });
});

// ─── validateStep — step 3 (formação) ───
describe("validateStep — step 3 (formação)", () => {
  it("válido quando lista vazia (formação opcional)", () => {
    const result = validateStep(3, { formacoes: [{ instituicao: "", curso: "", periodo: "", status: "Cursando" }] });
    expect(result.valid).toBe(true);
  });

  it("inválido quando instituição preenchida sem curso", () => {
    const result = validateStep(3, {
      formacoes: [{ instituicao: "USP", curso: "", periodo: "", status: "Cursando" }],
    });
    expect(result.valid).toBe(false);
  });
});

// ─── VALIDATION_RULES.minLength / maxLength ───
describe("VALIDATION_RULES.minLength / maxLength", () => {
  it("minLength(3) aceita string com 3+ chars", () => {
    expect(VALIDATION_RULES.minLength(3)("abc")).toBe(true);
  });

  it("minLength(3) rejeita string com 2 chars", () => {
    expect(VALIDATION_RULES.minLength(3)("ab")).toBe(false);
  });

  it("maxLength(5) aceita string com 5 chars", () => {
    expect(VALIDATION_RULES.maxLength(5)("abcde")).toBe(true);
  });

  it("maxLength(5) rejeita string com 6 chars", () => {
    expect(VALIDATION_RULES.maxLength(5)("abcdef")).toBe(false);
  });
});

// ─── getStepStatus ───
describe("getStepStatus", () => {
  const validStep0Data = {
    nome: "João da Silva",
    email: "joao@email.com",
    telefone: "(11) 98765-4321",
    objetivo: "",
    experiencias: [],
    formacoes: [],
    habilidades: [],
    idiomas: [],
  };

  it("retorna isValid=true para step 0 com dados válidos", () => {
    const status = getStepStatus(0, validStep0Data);
    expect(status.isValid).toBe(true);
    expect(status.errors).toEqual({});
  });

  it("retorna isValid=false para step 0 sem nome", () => {
    const status = getStepStatus(0, { ...validStep0Data, nome: "" });
    expect(status.isValid).toBe(false);
    expect(status.errors.nome).toBeDefined();
  });

  it("retorna isValid=true para steps opcionais (4)", () => {
    const status = getStepStatus(4, validStep0Data);
    expect(status.isValid).toBe(true);
  });

  it("retorna isComplete=true quando há dados preenchidos", () => {
    const status = getStepStatus(0, validStep0Data);
    expect(status.isComplete).toBe(true);
  });
});
