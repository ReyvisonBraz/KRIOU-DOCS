/**
 * ============================================
 * KRIOU DOCS - Testes de Integração: Login validation
 * ============================================
 * Testa os fluxos de validação usados no LoginPage:
 * CPF, e-mail, senha e telefone.
 */
import { describe, it, expect } from "vitest";
import { validateCpf, VALIDATION_RULES } from "./validation";
import { formatCpf, formatPhone } from "./formatting";

// ─── Fluxo CPF ───
describe("Fluxo de login com CPF", () => {
  it("CPF válido formata e valida corretamente", () => {
    const raw = "52998224725";
    const formatted = formatCpf(raw);
    expect(formatted).toBe("529.982.247-25");
    expect(validateCpf(formatted)).toBe(true);
  });

  it("CPF inválido (dígito errado) é rejeitado", () => {
    expect(validateCpf("529.982.247-26")).toBe(false);
  });

  it("CPF com todos dígitos iguais é rejeitado", () => {
    ["00000000000", "11111111111", "99999999999"].forEach((cpf) => {
      expect(validateCpf(cpf)).toBe(false);
    });
  });

  it("CPF com menos de 11 dígitos é rejeitado", () => {
    expect(validateCpf("123.456.789")).toBe(false);
    expect(validateCpf("1234567890")).toBe(false);
  });

  it("CPF vazio é rejeitado", () => {
    expect(validateCpf("")).toBe(false);
  });

  it("formatCpf aplica máscara progressivamente", () => {
    expect(formatCpf("529")).toBe("529");
    expect(formatCpf("529982")).toBe("529.982");
    expect(formatCpf("529982247")).toBe("529.982.247");
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });
});

// ─── Fluxo E-mail ───
describe("Fluxo de login com e-mail", () => {
  it("e-mail válido passa na validação", () => {
    const emails = [
      "joao@email.com",
      "user.name+tag@example.co.uk",
      "test123@sub.domain.org",
    ];
    emails.forEach((email) => {
      expect(VALIDATION_RULES.email(email)).toBe(true);
    });
  });

  it("e-mail sem @ é rejeitado", () => {
    expect(VALIDATION_RULES.email("joaoemail.com")).toBe(false);
  });

  it("e-mail sem domínio é rejeitado", () => {
    expect(VALIDATION_RULES.email("joao@")).toBe(false);
  });

  it("e-mail sem TLD é rejeitado", () => {
    expect(VALIDATION_RULES.email("joao@email")).toBe(false);
  });

  it("e-mail vazio é rejeitado", () => {
    expect(VALIDATION_RULES.email("")).toBe(false);
  });

  it("e-mail com espaços é rejeitado", () => {
    expect(VALIDATION_RULES.email("joao @email.com")).toBe(false);
  });
});

// ─── Fluxo Telefone ───
describe("Fluxo de login com telefone (WhatsApp)", () => {
  it("número com 11 dígitos (celular) é válido", () => {
    expect(VALIDATION_RULES.phone("(11) 98765-4321")).toBe(true);
    expect(VALIDATION_RULES.phone("11987654321")).toBe(true);
  });

  it("número com 10 dígitos (fixo) é válido", () => {
    expect(VALIDATION_RULES.phone("(11) 3456-7890")).toBe(true);
  });

  it("número com menos de 10 dígitos é inválido", () => {
    expect(VALIDATION_RULES.phone("123456789")).toBe(false);
  });

  it("formatPhone aplica máscara corretamente", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890");
  });
});

// ─── Fluxo Required ───
describe("Validação de campo obrigatório", () => {
  it("string não vazia é válida", () => {
    expect(VALIDATION_RULES.required("João")).toBe(true);
  });

  it("string vazia é inválida", () => {
    expect(VALIDATION_RULES.required("")).toBe(false);
    expect(VALIDATION_RULES.required("   ")).toBe(false);
  });

  it("null e undefined são inválidos", () => {
    expect(VALIDATION_RULES.required(null)).toBe(false);
    expect(VALIDATION_RULES.required(undefined)).toBe(false);
  });

  it("array não vazio é válido", () => {
    expect(VALIDATION_RULES.required(["skill"])).toBe(true);
  });

  it("array vazio é inválido", () => {
    expect(VALIDATION_RULES.required([])).toBe(false);
  });
});
