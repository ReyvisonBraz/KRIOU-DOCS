// Testa a lógica das ações do painel administrativo (supabase/functions/_shared/admin.ts)
// sem depender de Deno — o mesmo truque usado para mercadopago.ts.
import { describe, it, expect, vi } from "vitest";
import {
  normalizePageParams,
  getStats,
  countDocumentsByType,
  getUsers,
  getUserDocs,
} from "../../supabase/functions/_shared/admin.ts";

// Query builder falso: cada método de encadeamento (select/order/range/eq/or/in)
// é um vi.fn() que devolve o próprio objeto, e o objeto é "thenable" — resolve
// para o resultado configurado quando aguardado com `await`.
function builder(result) {
  const chain = {};
  for (const method of ["select", "order", "range", "eq", "or", "in"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return chain;
}

function createSupabaseMock() {
  return {
    from: vi.fn(),
    auth: { admin: { getUserById: vi.fn() } },
  };
}

describe("normalizePageParams", () => {
  it("usa página 1 e tamanho 20 quando os parâmetros estão ausentes", () => {
    expect(normalizePageParams({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("cai no padrão quando os valores não são números válidos", () => {
    expect(normalizePageParams({ page: "abc", pageSize: "xyz" })).toEqual({ page: 1, pageSize: 20 });
  });

  it("cai no padrão quando os valores são zero ou negativos", () => {
    expect(normalizePageParams({ page: -5, pageSize: 0 })).toEqual({ page: 1, pageSize: 20 });
  });

  it("limita pageSize ao máximo de 50", () => {
    expect(normalizePageParams({ pageSize: 999 })).toEqual({ page: 1, pageSize: 50 });
  });

  it("aceita page e pageSize válidos sem alterar", () => {
    expect(normalizePageParams({ page: 3, pageSize: 10 })).toEqual({ page: 3, pageSize: 10 });
  });
});

describe("getStats", () => {
  it("soma as contagens básicas e agrega documentos por tipo", async () => {
    const supabase = createSupabaseMock();
    supabase.from
      .mockImplementationOnce(() => builder({ count: 5 })) // profiles
      .mockImplementationOnce(() => builder({ count: 12 })) // documents
      .mockImplementationOnce(() => builder({ count: 3 })) // finalizados
      .mockImplementationOnce(() => builder({
        data: [
          { type: "curriculo", document_type: null },
          { type: "curriculo", document_type: null },
          { type: "juridico", document_type: "locacao" },
        ],
        error: null,
      }));

    const result = await getStats(supabase);

    expect(result).toEqual({
      totalUsers: 5,
      totalDocs: 12,
      finalizedDocs: 3,
      docsByType: { curriculo: 2, locacao: 1 },
    });
  });

  it("propaga erro de countDocumentsByType", async () => {
    const supabase = createSupabaseMock();
    supabase.from
      .mockImplementationOnce(() => builder({ count: 1 }))
      .mockImplementationOnce(() => builder({ count: 1 }))
      .mockImplementationOnce(() => builder({ count: 1 }))
      .mockImplementationOnce(() => builder({ data: null, error: new Error("falha de rede") }));

    await expect(getStats(supabase)).rejects.toThrow("falha de rede");
  });
});

describe("countDocumentsByType", () => {
  it("pagina até esgotar as linhas, sem truncar no limite de 1000 do PostgREST", async () => {
    const supabase = createSupabaseMock();
    const primeiroLote = Array.from({ length: 1000 }, () => ({ type: "curriculo", document_type: null }));
    const segundoLote = [{ type: "juridico", document_type: "locacao" }];

    supabase.from
      .mockImplementationOnce(() => builder({ data: primeiroLote, error: null }))
      .mockImplementationOnce(() => builder({ data: segundoLote, error: null }));

    const result = await countDocumentsByType(supabase);

    expect(result).toEqual({ curriculo: 1000, locacao: 1 });
    expect(supabase.from).toHaveBeenCalledTimes(2);
  });

  it("para na primeira página quando ela já vem incompleta", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementationOnce(() => builder({
      data: [{ type: "curriculo", document_type: null }],
      error: null,
    }));

    await countDocumentsByType(supabase);

    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});

describe("getUsers", () => {
  it("pagina, busca e-mail e conta documentos só da página atual", async () => {
    const supabase = createSupabaseMock();
    const pageProfiles = [
      { id: "u1", nome: "Maria", sobrenome: "Silva", role: "user", created_at: "2026-01-01" },
      { id: "u2", nome: "João", sobrenome: "Souza", role: "admin", created_at: "2026-01-02" },
    ];
    const profilesChain = builder({ data: pageProfiles, count: 42, error: null });
    const docCountsChain = builder({
      data: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "u2" }],
      error: null,
    });
    supabase.from
      .mockImplementationOnce(() => profilesChain)
      .mockImplementationOnce(() => docCountsChain);

    supabase.auth.admin.getUserById
      .mockImplementationOnce(async () => ({ data: { user: { email: "maria@x.com" } }, error: null }))
      .mockImplementationOnce(async () => ({ data: { user: { email: "joao@x.com" } }, error: null }));

    const result = await getUsers(supabase, { page: 2, pageSize: 2 });

    expect(result).toEqual({
      total: 42,
      page: 2,
      pageSize: 2,
      users: [
        { id: "u1", nome: "Maria", sobrenome: "Silva", role: "user", created_at: "2026-01-01", email: "maria@x.com", docCount: 2 },
        { id: "u2", nome: "João", sobrenome: "Souza", role: "admin", created_at: "2026-01-02", email: "joao@x.com", docCount: 1 },
      ],
    });

    // Página 2 de tamanho 2 -> linhas 2 e 3 (índice 0-based)
    expect(profilesChain.range).toHaveBeenCalledWith(2, 3);
    // E-mail buscado só dos 2 usuários da página, nunca de toda a base.
    expect(supabase.auth.admin.getUserById).toHaveBeenCalledTimes(2);
    // Contagem de documentos restrita aos ids da página atual.
    expect(docCountsChain.in).toHaveBeenCalledWith("user_id", ["u1", "u2"]);
  });

  it("aplica busca por nome/sobrenome via ilike", async () => {
    const supabase = createSupabaseMock();
    const profilesChain = builder({ data: [], count: 0, error: null });
    supabase.from.mockImplementationOnce(() => profilesChain);

    await getUsers(supabase, { search: "  Maria  " });

    expect(profilesChain.or).toHaveBeenCalledWith("nome.ilike.%Maria%,sobrenome.ilike.%Maria%");
  });

  it("escapa curingas do PostgREST no termo de busca", async () => {
    const supabase = createSupabaseMock();
    const profilesChain = builder({ data: [], count: 0, error: null });
    supabase.from.mockImplementationOnce(() => profilesChain);

    await getUsers(supabase, { search: "50%_off" });

    expect(profilesChain.or).toHaveBeenCalledWith("nome.ilike.%50\\%\\_off%,sobrenome.ilike.%50\\%\\_off%");
  });

  it("não consulta documentos quando a página não tem usuários", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementationOnce(() => builder({ data: [], count: 0, error: null }));

    const result = await getUsers(supabase, {});

    expect(result.users).toEqual([]);
    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(supabase.auth.admin.getUserById).not.toHaveBeenCalled();
  });

  it("propaga erro da consulta de perfis", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementationOnce(() => builder({ data: null, count: null, error: new Error("timeout") }));

    await expect(getUsers(supabase, {})).rejects.toThrow("timeout");
  });

  it("trata e-mail ausente como null em vez de quebrar", async () => {
    const supabase = createSupabaseMock();
    supabase.from
      .mockImplementationOnce(() => builder({
        data: [{ id: "u1", nome: "Maria", sobrenome: "Silva", role: "user", created_at: "2026-01-01" }],
        count: 1,
        error: null,
      }))
      .mockImplementationOnce(() => builder({ data: [], error: null }));
    supabase.auth.admin.getUserById.mockImplementationOnce(async () => ({
      data: null,
      error: new Error("usuário não encontrado em auth.users"),
    }));

    const result = await getUsers(supabase, {});

    expect(result.users[0].email).toBeNull();
  });
});

describe("getUserDocs", () => {
  it("filtra pelo usuário e não seleciona form_data nem legal_data", async () => {
    const supabase = createSupabaseMock();
    const chain = builder({ data: [{ id: "d1" }], error: null });
    supabase.from.mockImplementationOnce(() => chain);

    const docs = await getUserDocs(supabase, "u1");

    expect(docs).toEqual([{ id: "d1" }]);
    expect(chain.eq).toHaveBeenCalledWith("user_id", "u1");
    const selectedColumns = chain.select.mock.calls[0][0];
    expect(selectedColumns).not.toMatch(/form_data|legal_data/);
  });

  it("propaga erro da consulta", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementationOnce(() => builder({ data: null, error: new Error("falhou") }));

    await expect(getUserDocs(supabase, "u1")).rejects.toThrow("falhou");
  });
});
