import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { DocumentAccessService } from "./DocumentAccessService";

vi.mock("../lib/supabase", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("DocumentAccessService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("solicita autorização de download pelo ID do documento", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { authorized: true, documentId: "doc-1", expiresAt: "2026-07-13T00:00:00.000Z" },
      error: null,
    });

    await expect(DocumentAccessService.authorizeDownload("doc-1")).resolves.toMatchObject({
      authorized: true,
      documentId: "doc-1",
    });

    expect(supabase.functions.invoke).toHaveBeenCalledWith("authorize-download", {
      body: { documentId: "doc-1" },
    });
  });

  it("rejeita autorização para outro documento", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { authorized: true, documentId: "doc-2" },
      error: null,
    });

    await expect(DocumentAccessService.authorizeDownload("doc-1")).rejects.toThrow("Download não autorizado");
  });

  it("propaga erro de domínio retornado pelo backend", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { error: "PDF liberado somente após pagamento aprovado" },
      error: null,
    });

    await expect(DocumentAccessService.authorizeDownload("doc-1")).rejects.toThrow(
      "PDF liberado somente após pagamento aprovado",
    );
  });
});
