import { describe, expect, it } from "vitest";
import { resolveTemplateBackAction, resolveTemplateEntry } from "./navigation";

describe("template navigation", () => {
  it.each(["resume", "legal"])(
    "marca %s como entrada direta quando veio do dashboard",
    (category) => {
      expect(resolveTemplateEntry(category)).toEqual({
        docType: category,
        openedDirectly: true,
      });
    }
  );

  it("ignora uma categoria desconhecida", () => {
    expect(resolveTemplateEntry("invalid")).toEqual({
      docType: null,
      openedDirectly: false,
    });
  });

  it("volta ao dashboard quando a categoria foi aberta diretamente", () => {
    expect(resolveTemplateBackAction({ docType: "legal", openedDirectly: true }))
      .toBe("dashboard");
  });

  it("volta à escolha quando o tipo foi escolhido dentro da página", () => {
    expect(resolveTemplateBackAction({ docType: "legal", openedDirectly: false }))
      .toBe("category-selection");
  });
});

