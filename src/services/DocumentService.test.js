import { beforeEach, describe, expect, it, vi } from "vitest";

const query = {
  delete: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
  not: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
};

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => query),
  },
}));

import { supabase } from "../lib/supabase";
import { DocumentService } from "./DocumentService";

describe("DocumentService.remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.delete.mockReturnValue(query);
    query.update.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.is.mockReturnValue(query);
    query.not.mockReturnValue(query);
    query.select.mockReturnValue(query);
  });

  it("confirma no Supabase a linha removida e restringe pelo usuario", async () => {
    query.select.mockResolvedValueOnce({ data: [{ id: "doc-1" }], error: null });

    await expect(DocumentService.remove("doc-1", "user-1")).resolves.toEqual({ id: "doc-1" });

    expect(supabase.from).toHaveBeenCalledWith("documents");
    expect(query.delete).toHaveBeenCalledOnce();
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "doc-1");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(query.select).toHaveBeenCalledWith("id");
  });

  it("rejeita quando o banco nao remove nenhuma linha", async () => {
    query.select.mockResolvedValueOnce({ data: [], error: null });

    await expect(DocumentService.remove("doc-1", "user-1")).rejects.toThrow(
      "O servidor nao confirmou a exclusao do documento",
    );
  });

  it("rejeita a operacao sem usuario autenticado", async () => {
    await expect(DocumentService.remove("doc-1", null)).rejects.toThrow(
      "documentId e userId sao obrigatorios",
    );
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("move o documento para a lixeira e confirma o retorno", async () => {
    query.single.mockResolvedValue({
      data: { id: "doc-1", deleted_at: "2026-08-05T12:00:00.000Z", deleted_by: "user-1" },
      error: null,
    });

    await expect(DocumentService.moveToTrash("doc-1", "user-1")).resolves.toMatchObject({
      id: "doc-1",
      deletedBy: "user-1",
    });
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ deleted_by: "user-1" }));
    expect(query.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("restaura um documento da lixeira", async () => {
    query.single.mockResolvedValue({ data: { id: "doc-1" }, error: null });

    await expect(DocumentService.restoreFromTrash("doc-1", "user-1")).resolves.toEqual({ id: "doc-1" });
    expect(query.update).toHaveBeenCalledWith({ deleted_at: null, deleted_by: null });
    expect(query.not).toHaveBeenCalledWith("deleted_at", "is", null);
  });
});
