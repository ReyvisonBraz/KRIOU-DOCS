import { describe, expect, it } from "vitest";
import { selectDashboardDocuments } from "./dashboard";

const docs = [
  { id: "1", title: "Contrato rural", type: "legal", documentType: "compra-venda", status: "finalizado", paymentStatus: "approved", legalData: { vendedor_nome: "Ana Silva", vendedor_cpf: "123.456.789-00", vendedor_rg: "1234567", comprador_nome: "João da Conceição", comprador_rg: "88.733.711-0 SSP/PR", testemunhas: [{ nome: "Maria Souza", rg: "55.444.333-2" }] }, updatedAt: "2026-07-18" },
  { id: "2", title: "Currículo", type: "resume", status: "rascunho", formData: { nome: "Bruno Lima" }, updatedAt: "2026-07-17" },
  { id: "3", title: "Recibo arquivado", type: "legal", documentType: "recibo", status: "finalizado", paymentStatus: "pending", archived: true, updatedAt: "2026-07-16" },
];

const tabFilterType = { resume: "type", "compra-venda": "documentType" };

describe("selectDashboardDocuments", () => {
  it("mostra somente ativos por padrão e ordena pelo mais recente", () => {
    expect(selectDashboardDocuments(docs).map((doc) => doc.id)).toEqual(["1", "2"]);
  });

  it("filtra arquivos, tipo e situação de pagamento", () => {
    expect(selectDashboardDocuments(docs, { archiveFilter: "arquivados" }).map((doc) => doc.id)).toEqual(["3"]);
    expect(selectDashboardDocuments(docs, { activeTab: "resume", tabFilterType }).map((doc) => doc.id)).toEqual(["2"]);
    expect(selectDashboardDocuments(docs, { statusFilter: "pagos" }).map((doc) => doc.id)).toEqual(["1"]);
  });

  it.each([["Ana Silva", "1"], ["123.456.789-00", "1"], ["1234567", "1"], ["Contrato rural", "1"]])(
    "localiza %s sem perder o documento", (query, id) => expect(selectDashboardDocuments(docs, { searchQuery: query }).map((doc) => doc.id)).toContain(id),
  );

  it.each(["Joao da Conceicao", "887337110", "88.733.711-0", "Maria Souza", "554443332"])(
    "localiza dados de qualquer parte interna usando %s",
    (query) => expect(selectDashboardDocuments(docs, { searchQuery: query }).map((doc) => doc.id)).toContain("1"),
  );

  it("ignora metadados internos do formulario", () => {
    const internalDoc = { ...docs[0], legalData: { ...docs[0].legalData, _controleInterno: "nao-pesquisar-isto" } };
    expect(selectDashboardDocuments([internalDoc], { searchQuery: "nao-pesquisar-isto" })).toEqual([]);
  });

  it("não altera a coleção de entrada ao ordenar", () => {
    const input = [...docs];
    selectDashboardDocuments(input, { sortBy: "antigos", archiveFilter: "todos" });
    expect(input.map((doc) => doc.id)).toEqual(["1", "2", "3"]);
  });
});
