const SENSITIVE_KEYWORDS = [
  "nome",
  "name",
  "cpf",
  "rg",
  "cnpj",
  "documento",
  "identidade",
  "locador",
  "locatario",
  "locatário",
  "comprador",
  "vendedor",
  "contratante",
  "contratado",
  "outorgante",
  "outorgado",
  "proprietario",
  "proprietário",
  "inquilino",
  "parte",
  "responsavel",
  "responsável",
];

const NON_IDENTITY_KEYWORDS = [
  "endereco",
  "endereço",
  "logradouro",
  "bairro",
  "cidade",
  "estado",
  "uf",
  "cep",
  "numero",
  "número",
  "telefone",
  "email",
  "e-mail",
  "valor",
  "data",
  "prazo",
  "clausula",
  "cláusula",
  "descricao",
  "descrição",
  "observacao",
  "observação",
];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function normalizeDocument(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function keyHasAny(path: string, keywords: string[]) {
  const normalizedPath = normalizeText(path);
  return keywords.some((keyword) => normalizedPath.includes(normalizeText(keyword)));
}

function getFieldWeight(path: string) {
  const normalizedPath = normalizeText(path);
  if (normalizedPath.includes("cnpj")) return 45;
  if (normalizedPath.includes("cpf")) return 40;
  if (normalizedPath.includes("rg") || normalizedPath.includes("identidade")) return 25;
  if (normalizedPath.includes("documento")) return 30;
  if (normalizedPath.includes("nome") || normalizedPath.includes("name")) return 35;
  return 25;
}

function humanizePath(path: string) {
  const parts = String(path || "").split(".").filter(Boolean);
  const last = parts[parts.length - 1] || "campo";
  return last
    .replace(/\[(\d+)\]/g, " $1")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function shouldCollectField(path: string, value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value !== "string" && typeof value !== "number") return false;
  if (!String(value).trim()) return false;
  if (!keyHasAny(path, SENSITIVE_KEYWORDS)) return false;
  if (keyHasAny(path, NON_IDENTITY_KEYWORDS)) return false;
  return true;
}

function collectIdentityFields(value: unknown, basePath = ""): Array<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectIdentityFields(item, `${basePath}[${index}]`));
  }

  if (isObject(value)) {
    return Object.entries(value).flatMap(([key, child]) => {
      const path = basePath ? `${basePath}.${key}` : key;
      return collectIdentityFields(child, path);
    });
  }

  if (!shouldCollectField(basePath, value)) return [];

  const isDocumentNumber = keyHasAny(basePath, ["cpf", "rg", "cnpj", "documento", "identidade"]);
  const normalized = isDocumentNumber ? normalizeDocument(value) : normalizeText(value);
  if (!normalized) return [];

  return [{
    path: basePath,
    label: humanizePath(basePath),
    value: String(value),
    normalized,
    weight: getFieldWeight(basePath),
  }];
}

export function createPaidIdentitySnapshot(document: {
  type?: string | null;
  document_type?: string | null;
  form_data?: unknown;
  legal_data?: unknown;
}) {
  const source = document.type === "legal" ? document.legal_data : document.form_data;

  return {
    version: 1,
    type: document.type || null,
    documentType: document.document_type || null,
    fields: collectIdentityFields(source),
    createdAt: new Date().toISOString(),
  };
}
