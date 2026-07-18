import { describe, expect, it } from "vitest";
import { getDocumentBody } from "./legalDocuments";

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
});
