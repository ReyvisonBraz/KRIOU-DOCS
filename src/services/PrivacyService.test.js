/**
 * @vitest-environment jsdom
 */
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { PrivacyService, buildExportFilename, downloadJson } from "./PrivacyService";

vi.mock("../lib/supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

const respostaExemplo = {
  formato: 1,
  gerado_em: "2026-08-08T12:00:00.000Z",
  conta: { id: "user-1", email: "maria@exemplo.com" },
  perfil: { nome: "Maria", cpf: "123.456.789-09" },
  documentos: [{ id: "doc-1" }, { id: "doc-2" }],
  rascunhos: [],
  resumo: { total_de_documentos: 2, documentos_pagos: 1, total_de_rascunhos: 0 },
};

describe("buildExportFilename", () => {
  it("usa a data informada, com mês e dia sempre em dois dígitos", () => {
    expect(buildExportFilename(new Date(2026, 7, 8))).toBe(
      "kriou-docs-meus-dados-2026-08-08.json",
    );
  });

  it("não abrevia meses de dois dígitos", () => {
    expect(buildExportFilename(new Date(2026, 11, 25))).toBe(
      "kriou-docs-meus-dados-2026-12-25.json",
    );
  });
});

describe("downloadJson", () => {
  let criarUrl;
  let revogarUrl;
  let cliques;

  beforeEach(() => {
    cliques = 0;
    criarUrl = vi.fn(() => "blob:teste");
    revogarUrl = vi.fn();
    globalThis.URL.createObjectURL = criarUrl;
    globalThis.URL.revokeObjectURL = revogarUrl;
    // jsdom não implementa navegação; o clique no link seria um no-op ruidoso.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      cliques += 1;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("entrega o arquivo com o nome pedido e libera o blob", () => {
    downloadJson({ a: 1 }, "meus-dados.json");

    expect(criarUrl).toHaveBeenCalledOnce();
    expect(cliques).toBe(1);
    // Sem revoke o blob fica retido em memória enquanto a aba estiver aberta.
    expect(revogarUrl).toHaveBeenCalledWith("blob:teste");
  });

  it("não deixa o link temporário no documento", () => {
    downloadJson({ a: 1 }, "meus-dados.json");
    expect(document.querySelectorAll("a[download]")).toHaveLength(0);
  });

  it("serializa como JSON legível, não minificado", () => {
    let conteudo;
    globalThis.URL.createObjectURL = vi.fn((blob) => {
      conteudo = blob;
      return "blob:teste";
    });

    downloadJson({ nome: "Maria" }, "x.json");

    expect(conteudo.type).toBe("application/json");
    expect(conteudo.size).toBeGreaterThan(JSON.stringify({ nome: "Maria" }).length);
  });
});

describe("PrivacyService.exportMyData", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chama a Edge Function sem enviar identificador do cliente", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: respostaExemplo, error: null });

    await PrivacyService.exportMyData();

    // O user_id vem do token no servidor. Se o cliente pudesse informá-lo,
    // qualquer pessoa exportaria os dados de outra.
    expect(supabase.functions.invoke).toHaveBeenCalledWith("export-user-data", { body: {} });
  });

  it("devolve o conteúdo exportado", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: respostaExemplo, error: null });
    await expect(PrivacyService.exportMyData()).resolves.toEqual(respostaExemplo);
  });

  it("propaga falha de transporte", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "rede indisponível" },
    });
    await expect(PrivacyService.exportMyData()).rejects.toThrow("rede indisponível");
  });

  it("propaga erro devolvido pela função", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { error: "Não autorizado" },
      error: null,
    });
    await expect(PrivacyService.exportMyData()).rejects.toThrow("Não autorizado");
  });
});

describe("PrivacyService.downloadMyData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:teste");
    globalThis.URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("busca os dados e entrega o arquivo", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: respostaExemplo, error: null });

    const dados = await PrivacyService.downloadMyData();

    expect(dados).toEqual(respostaExemplo);
    expect(globalThis.URL.createObjectURL).toHaveBeenCalledOnce();
  });

  it("não gera arquivo quando a exportação falha", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Não autorizado" },
    });

    await expect(PrivacyService.downloadMyData()).rejects.toThrow("Não autorizado");
    expect(globalThis.URL.createObjectURL).not.toHaveBeenCalled();
  });
});
