import { describe, expect, it } from "vitest";
import { reconcileDocuments, selectLatestDraft } from "./synchronization";

describe("document synchronization", () => {
  it("prefere o rascunho mais recente entre navegador e nuvem", () => {
    const local = { nome: "Local", savedAt: "2026-08-05T10:00:00.000Z" };
    const cloud = { data: { nome: "Nuvem" }, updatedAt: "2026-08-05T11:00:00.000Z" };
    expect(selectLatestDraft(local, cloud).nome).toBe("Nuvem");
  });

  it("mantem o servidor como fonte oficial e inclui apenas rascunhos locais", () => {
    const result = reconcileDocuments({
      serverDocuments: [{ id: "doc-1", title: "Servidor", status: "finalizado" }],
      localDocuments: [
        { id: "doc-1", title: "Cache antigo", status: "finalizado" },
        { id: "draft-local", title: "Rascunho", type: "resume", status: "rascunho" },
      ],
      userId: "user-1",
    });

    expect(result.find((doc) => doc.id === "doc-1").title).toBe("Servidor");
    expect(result.filter((doc) => doc.id === "doc-1")).toHaveLength(1);
    expect(result.map((doc) => doc.id)).toContain("draft-local");
  });

  it("reconstroi um card sincronizado somente quando nao existe card equivalente", () => {
    const result = reconcileDocuments({
      serverDocuments: [],
      localDocuments: [],
      resumeDraft: { nome: "Ana", savedAt: "2026-08-05T11:00:00.000Z", campo: "valor" },
      userId: "user-1",
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "draft-resume-user-1", status: "rascunho" });
  });
});
