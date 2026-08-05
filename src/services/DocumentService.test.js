import { beforeEach, describe, expect, it, vi } from "vitest";

const query = {
  delete: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
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
    query.eq.mockReturnValue(query);
  });

  it("confirma no Supabase a linha removida e restringe pelo usuario", async () => {
    query.select.mockResolvedValue({ data: [{ id: "doc-1" }], error: null });

    await expect(DocumentService.remove("doc-1", "user-1")).resolves.toEqual({ id: "doc-1" });

    expect(supabase.from).toHaveBeenCalledWith("documents");
    expect(query.delete).toHaveBeenCalledOnce();
    expect(query.eq).toHaveBeenNthCalledWith(1, "id", "doc-1");
    expect(query.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
    expect(query.select).toHaveBeenCalledWith("id");
  });

  it("rejeita quando o banco nao remove nenhuma linha", async () => {
    query.select.mockResolvedValue({ data: [], error: null });

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
});
