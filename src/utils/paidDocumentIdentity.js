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

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function normalizeDocument(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function humanizePath(path) {
  const last = String(path || "").split(".").filter(Boolean).at(-1) || "campo";
  return last
    .replace(/\[(\d+)\]/g, " $1")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function keyHasAny(path, keywords) {
  const normalizedPath = normalizeText(path);
  return keywords.some((keyword) => normalizedPath.includes(normalizeText(keyword)));
}

function getFieldWeight(path) {
  const normalizedPath = normalizeText(path);
  if (normalizedPath.includes("cnpj")) return 45;
  if (normalizedPath.includes("cpf")) return 40;
  if (normalizedPath.includes("rg") || normalizedPath.includes("identidade")) return 25;
  if (normalizedPath.includes("documento")) return 30;
  if (normalizedPath.includes("nome") || normalizedPath.includes("name")) return 35;
  return 25;
}

function shouldCollectField(path, value) {
  if (value === null || value === undefined) return false;
  if (typeof value !== "string" && typeof value !== "number") return false;
  if (!String(value).trim()) return false;
  if (!keyHasAny(path, SENSITIVE_KEYWORDS)) return false;
  if (keyHasAny(path, NON_IDENTITY_KEYWORDS)) return false;
  return true;
}

function collectIdentityFields(value, basePath = "") {
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

export function createPaidIdentitySnapshot({ type, documentType, formData, legalData }) {
  const source = type === "legal" ? legalData : formData;
  const fields = collectIdentityFields(source);

  return {
    version: 1,
    type: type || null,
    documentType: documentType || null,
    fields,
    createdAt: new Date().toISOString(),
  };
}

export function comparePaidIdentity(snapshot, nextIdentity) {
  if (!snapshot || !nextIdentity) {
    return { level: "normal", score: 0, changes: [] };
  }

  if (
    snapshot.type &&
    nextIdentity.type &&
    snapshot.type !== nextIdentity.type
  ) {
    return {
      level: "critical",
      score: 100,
      changes: [{ label: "Tipo de documento", before: snapshot.type, after: nextIdentity.type }],
    };
  }

  if (
    snapshot.documentType &&
    nextIdentity.documentType &&
    snapshot.documentType !== nextIdentity.documentType
  ) {
    return {
      level: "critical",
      score: 100,
      changes: [{ label: "Modelo jurídico", before: snapshot.documentType, after: nextIdentity.documentType }],
    };
  }

  const previousByPath = new Map((snapshot.fields || []).map((field) => [field.path, field]));
  const nextByPath = new Map((nextIdentity.fields || []).map((field) => [field.path, field]));
  const paths = new Set([...previousByPath.keys(), ...nextByPath.keys()]);
  const changes = [];
  let score = 0;

  paths.forEach((path) => {
    const previous = previousByPath.get(path);
    const next = nextByPath.get(path);
    const previousValue = previous?.normalized || "";
    const nextValue = next?.normalized || "";

    if (previousValue === nextValue) return;

    const weight = Math.max(previous?.weight || 0, next?.weight || 0, getFieldWeight(path));
    score += weight;
    changes.push({
      path,
      label: next?.label || previous?.label || humanizePath(path),
      before: previous?.value || "",
      after: next?.value || "",
      weight,
    });
  });

  if (changes.length > 1) score += Math.min(20, (changes.length - 1) * 5);

  return {
    level: score > 0 ? "sensitive" : "normal",
    score,
    changes,
  };
}

export function summarizeIdentityChanges(changes, max = 4) {
  const labels = [...new Set((changes || []).map((change) => change.label).filter(Boolean))];
  if (!labels.length) return "dados principais";
  const visible = labels.slice(0, max).join(", ");
  return labels.length > max ? `${visible} e outros campos` : visible;
}
