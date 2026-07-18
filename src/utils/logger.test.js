import { describe, expect, it } from "vitest";
import { sanitizeLogData } from "./logger";

describe("sanitizeLogData", () => {
  it("remove dados pessoais e segredos em qualquer nível", () => {
    expect(sanitizeLogData({
      userId: "user-1",
      email: "pessoa@example.com",
      nested: { cpf: "123", authorization: "Bearer secret", safe: "ok" },
    })).toEqual({
      userId: "user-1",
      email: "[REDACTED]",
      nested: { cpf: "[REDACTED]", authorization: "[REDACTED]", safe: "ok" },
    });
  });

  it("limita textos, listas e referências circulares", () => {
    const value = { long: "a".repeat(600), list: Array.from({ length: 30 }, (_, i) => i) };
    value.self = value;
    const result = sanitizeLogData(value);
    expect(result.long).toHaveLength(501);
    expect(result.list).toHaveLength(20);
    expect(result.self).toBe("[CIRCULAR]");
  });
});
