import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { DocumentService } from "./DocumentService";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

const createBuilder = (result = { data: null, error: null }) => {
  const builder = {};
  for (const method of ["select", "in", "eq", "order", "insert", "update", "delete", "upsert"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn().mockResolvedValue(result);
  builder.maybeSingle = vi.fn().mockResolvedValue(result);
  builder.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return builder;
};

const databaseRow = {
  id: "doc-1",
  type: "legal",
  title: "Contrato",
  code: "ABC123",
  template: "modelo",
  template_id: "template-1",
  template_name: "Compra e venda",
  status: "finalizado",
  form_data: { nome: "Ana" },
  legal_data: { cidade: "Belém" },
  document_type: "contrato",
  document_type_name: null,
  variant_id: "imovel",
  variant_name: "Imóvel",
  variant: "com-sinal",
  archived: null,
  payment_status: null,
  payment_id: null,
  payment_amount: null,
  paid_at: null,
  paid_identity_snapshot: null,
  sensitive_edit_used: 1,
  sensitive_edit_used_at: null,
  sensitive_edit_summary: null,
  created_at: "2026-08-10T12:00:00.000Z",
  user_id: "user-1",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DocumentService.fetchAll", () => {
  it("filtra pelo usuário, ordena e converte o formato do banco", async () => {
    const builder = createBuilder({ data: [databaseRow], error: null });
    supabase.from.mockReturnValue(builder);

    const result = await DocumentService.fetchAll("user-1");

    expect(supabase.from).toHaveBeenCalledWith("documents");
    expect(builder.in).toHaveBeenCalledWith("status", ["finalizado", "aguardando_pagamento"]);
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([
      expect.objectContaining({
        id: "doc-1",
        templateId: "template-1",
        documentTypeName: "Compra e venda",
        archived: false,
        paymentStatus: "pending",
        sensitiveEditUsed: true,
        userId: "user-1",
      }),
    ]);
  });

  it("propaga erro de consulta e não mascara falha de RLS", async () => {
    const error = new Error("RLS bloqueou");
    supabase.from.mockReturnValue(createBuilder({ data: null, error }));

    await expect(DocumentService.fetchAll("user-1")).rejects.toBe(error);
  });
});

describe("DocumentService.fetchById", () => {
  it("exige o identificador antes de consultar", async () => {
    await expect(DocumentService.fetchById(null, "user-1")).rejects.toThrow("documentId e obrigatorio");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("restringe documento por id e usuário", async () => {
    const builder = createBuilder({ data: databaseRow, error: null });
    supabase.from.mockReturnValue(builder);

    const result = await DocumentService.fetchById("doc-1", "user-1");

    expect(builder.eq).toHaveBeenNthCalledWith(1, "id", "doc-1");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(result).toEqual(expect.objectContaining({ id: "doc-1", formData: { nome: "Ana" } }));
  });
});

describe("DocumentService.insert e update", () => {
  it("recusa inserção sem usuário autenticado", async () => {
    await expect(DocumentService.insert({ type: "legal" }, null)).rejects.toThrow("userId e obrigatorio");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("insere defaults seguros e devolve o id criado", async () => {
    const builder = createBuilder({ data: { id: "doc-2", created_at: databaseRow.created_at }, error: null });
    supabase.from.mockReturnValue(builder);

    const result = await DocumentService.insert({ type: "resume", formData: { nome: "Bia" } }, "user-2");

    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: "user-2",
      type: "resume",
      title: "Sem título",
      status: "finalizado",
      form_data: { nome: "Bia" },
      legal_data: null,
    }));
    expect(result).toEqual(expect.objectContaining({ id: "doc-2", code: null, type: "resume" }));
  });

  it("atualiza somente o documento pertencente ao usuário", async () => {
    const updated = { id: "doc-1", title: "Novo título" };
    const builder = createBuilder({ data: updated, error: null });
    supabase.from.mockReturnValue(builder);

    const result = await DocumentService.update("doc-1", {
      title: "Novo título",
      status: "finalizado",
      paidIdentitySnapshot: { cpf: "***" },
      sensitiveEditUsed: false,
      sensitiveEditUsedAt: "2026-08-10",
      sensitiveEditSummary: "endereço",
    }, "user-1");

    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({
      title: "Novo título",
      status: "finalizado",
      paid_identity_snapshot: { cpf: "***" },
      sensitive_edit_used: false,
      sensitive_edit_used_at: "2026-08-10",
      sensitive_edit_summary: "endereço",
    }));
    expect(builder.eq).toHaveBeenNthCalledWith(1, "id", "doc-1");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(result).toBe(updated);
  });
});

describe("DocumentService mutações de documento", () => {
  it("remove pelo id e propaga falha do banco", async () => {
    const success = createBuilder({ error: null });
    supabase.from.mockReturnValueOnce(success);
    await expect(DocumentService.remove("doc-1")).resolves.toBe(true);
    expect(success.delete).toHaveBeenCalledOnce();
    expect(success.eq).toHaveBeenCalledWith("id", "doc-1");

    const error = new Error("indisponível");
    supabase.from.mockReturnValueOnce(createBuilder({ error }));
    await expect(DocumentService.remove("doc-1")).rejects.toBe(error);
  });

  it("arquiva com defesa por usuário", async () => {
    const builder = createBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await expect(DocumentService.setArchived("doc-1", "user-1", true)).resolves.toBe(true);
    expect(builder.update).toHaveBeenCalledWith({ archived: true });
    expect(builder.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
  });

  it("normaliza o título e rejeita título vazio", async () => {
    const builder = createBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await expect(DocumentService.rename("doc-1", "user-1", "  Contrato final  ")).resolves.toBe(true);
    expect(builder.update).toHaveBeenCalledWith({ title: "Contrato final" });
    await expect(DocumentService.rename("doc-1", "user-1", "   ")).rejects.toThrow("title sao obrigatorios");
  });
});

describe("DocumentService perfil", () => {
  it("trata perfil inexistente como estado válido", async () => {
    supabase.from.mockReturnValue(createBuilder({ data: null, error: { code: "PGRST116" } }));
    await expect(DocumentService.fetchProfile()).resolves.toBeNull();
  });

  it("atualiza o perfil usando a identidade autenticada", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "ana@example.com",
          raw_user_meta_data: { sub: "google-1", avatar_url: "avatar.png" },
        },
      },
    });
    const profile = { id: "user-1", nome: "Ana" };
    const builder = createBuilder({ data: profile, error: null });
    supabase.from.mockReturnValue(builder);

    await expect(DocumentService.updateProfile({
      nome: "Ana",
      sobrenome: "Silva",
      cpf: "123",
      googleData: { email: "google@example.com" },
    })).resolves.toBe(profile);

    expect(builder.upsert).toHaveBeenCalledWith(expect.objectContaining({
      id: "user-1",
      email: "google@example.com",
      avatar_url: "avatar.png",
      google_id: "google-1",
    }), { onConflict: "id" });
  });

  it("avalia perfil e onboarding sem aceitar campos em branco", () => {
    expect(DocumentService.isProfileComplete({ nome: "Ana", sobrenome: "Silva", cpf: "123" })).toBe(true);
    expect(DocumentService.isProfileComplete({ nome: " ", sobrenome: "Silva", cpf: "123" })).toBe(false);
    expect(DocumentService.isOnboardingDone({ onboarding_done: true })).toBe(true);
    expect(DocumentService.isOnboardingDone(null)).toBe(false);
  });
});

describe("DocumentService rascunhos e onboarding", () => {
  it("salva rascunho com chave composta e trata entrada inválida", async () => {
    const builder = createBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await expect(DocumentService.saveDraft("user-1", "resume", { nome: "Ana" }, 2)).resolves.toBe(true);
    expect(builder.upsert).toHaveBeenCalledWith({
      user_id: "user-1",
      type: "resume",
      data: { nome: "Ana" },
      current_step: 2,
    }, { onConflict: "user_id,type" });
    await expect(DocumentService.saveDraft(null, "resume", {}, 0)).resolves.toBe(false);
  });

  it("carrega e remove somente o rascunho solicitado", async () => {
    const loadBuilder = createBuilder({ data: { data: { nome: "Ana" }, current_step: 3 }, error: null });
    supabase.from.mockReturnValueOnce(loadBuilder);
    await expect(DocumentService.loadDraft("user-1", "resume")).resolves.toEqual({
      data: { nome: "Ana" },
      currentStep: 3,
    });
    expect(loadBuilder.eq).toHaveBeenNthCalledWith(1, "user_id", "user-1");
    expect(loadBuilder.eq).toHaveBeenNthCalledWith(2, "type", "resume");

    const clearBuilder = createBuilder({ error: null });
    supabase.from.mockReturnValueOnce(clearBuilder);
    await expect(DocumentService.clearDraft("user-1", "resume")).resolves.toBe(true);
    expect(clearBuilder.delete).toHaveBeenCalledOnce();
  });

  it("marca onboarding para o usuário da sessão", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const builder = createBuilder({ error: null });
    supabase.from.mockReturnValue(builder);

    await expect(DocumentService.markOnboardingDone()).resolves.toBe(true);
    expect(builder.update).toHaveBeenCalledWith({ onboarding_done: true });
    expect(builder.eq).toHaveBeenCalledWith("id", "user-1");
  });
});
