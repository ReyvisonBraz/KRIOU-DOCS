import { describe, expect, it } from "vitest";
import { getContrastRatio, getContrastingTextColor } from "./colorContrast";

describe("colorContrast", () => {
  it.each(["#14FFEC", "#00D2D3", "#3498DB", "#F7C948", "#25D366"])(
    "usa texto escuro sobre a cor clara %s",
    (background) => {
      const foreground = getContrastingTextColor(background);
      expect(foreground).toBe("#0B1220");
      expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it("preserva texto branco sobre o coral institucional", () => {
    expect(getContrastingTextColor("#C93659")).toBe("#FFFFFF");
    expect(getContrastRatio("#FFFFFF", "#C93659")).toBeGreaterThanOrEqual(4.5);
  });

  it("aceita hexadecimal abreviado e falha de forma segura", () => {
    expect(getContrastingTextColor("#fff")).toBe("#0B1220");
    expect(getContrastingTextColor("invalid")).toBe("#FFFFFF");
  });
});

