import { extractPersonData, looksLikeCode, looksLikeCPF, normalizeCPF, normalizeName, normalizeRG } from "../../utils/documentCode";
import { matchesDocumentPaymentFilter } from "./payment";

function documentTime(doc) {
  const value = doc?.updatedAt || doc?.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

function matchesSearch(doc, rawQuery) {
  const queryLower = rawQuery.toLowerCase();
  const digits = rawQuery.replace(/\D/g, "");
  const searchByCode = looksLikeCode(rawQuery);
  const searchByCPF = looksLikeCPF(rawQuery);
  const searchByRG = !searchByCPF && /^\d+$/.test(digits) && digits.length >= 6;
  const person = extractPersonData(doc);

  if (searchByCode && doc.code?.toLowerCase().includes(queryLower)) return true;
  if (searchByCPF && person.cpf && normalizeCPF(person.cpf).includes(normalizeCPF(rawQuery))) return true;
  if (searchByRG && person.rg && normalizeRG(person.rg).includes(normalizeRG(rawQuery))) return true;
  if (person.nome && normalizeName(person.nome).includes(normalizeName(rawQuery))) return true;

  const templateText = typeof doc.template === "string" ? doc.template : doc.template?.name || "";
  return [doc.title, templateText, doc.templateName, doc.documentTypeName, doc.variantName, doc.code]
    .some((value) => value?.toLowerCase().includes(queryLower));
}

export function selectDashboardDocuments(documents, options = {}) {
  const {
    activeTab = "todos", archiveFilter = "ativos", statusFilter = "todos",
    searchQuery = "", sortBy = "recentes", tabFilterType = {},
  } = options;
  const filterType = tabFilterType[activeTab] || "all";
  let selected = [...(documents || [])];

  if (archiveFilter === "ativos") selected = selected.filter((doc) => !doc.archived);
  if (archiveFilter === "arquivados") selected = selected.filter((doc) => doc.archived);
  selected = selected.filter((doc) => matchesDocumentPaymentFilter(doc, statusFilter));

  if (filterType === "type") selected = selected.filter((doc) => doc.type === activeTab);
  if (filterType === "documentType") selected = selected.filter((doc) => doc.documentType === activeTab);

  const query = searchQuery.trim();
  if (query) selected = selected.filter((doc) => matchesSearch(doc, query));

  return selected.sort((a, b) => {
    if (sortBy === "antigos") return documentTime(a) - documentTime(b);
    if (sortBy === "titulo") return (a.title || "").localeCompare(b.title || "", "pt-BR");
    if (sortBy === "tipo") {
      const aType = a.documentTypeName || a.templateName || a.type || "";
      const bType = b.documentTypeName || b.templateName || b.type || "";
      return aType.localeCompare(bType, "pt-BR");
    }
    return documentTime(b) - documentTime(a);
  });
}
