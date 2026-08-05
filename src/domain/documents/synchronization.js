function draftTimestamp(draft) {
  const value = draft?.updatedAt || draft?.savedAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
}

export function selectLatestDraft(localDraft, cloudDraft) {
  const normalizedCloud = cloudDraft?.data
    ? { ...cloudDraft.data, savedAt: cloudDraft.updatedAt || cloudDraft.data.savedAt }
    : null;
  if (!localDraft) return normalizedCloud;
  if (!normalizedCloud) return localDraft;
  return draftTimestamp(normalizedCloud) >= draftTimestamp(localDraft) ? normalizedCloud : localDraft;
}

function virtualDraft(type, draft, userId) {
  if (!draft || Object.keys(draft).length <= 2) return null;
  const savedAt = draft.savedAt || new Date().toISOString();

  if (type === "resume") {
    return {
      id: `draft-resume-${userId}`,
      title: draft.nome || "Currículo (Rascunho)",
      type: "resume",
      status: "rascunho",
      draft: { formData: draft, selectedTemplate: null, currentStep: draft.currentStep || 0 },
      _draftOrigin: "autoSave",
      createdAt: savedAt,
      updatedAt: savedAt,
      date: new Date(savedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      userId,
    };
  }

  return {
    id: `draft-legal-${userId}`,
    title: "Documento Jurídico (Rascunho)",
    type: "legal",
    status: "rascunho",
    draft: { legalFormData: draft, documentType: null, selectedVariant: null, disabledFields: {}, legalStep: draft.currentStep || 1 },
    _draftOrigin: "autoSave",
    createdAt: savedAt,
    updatedAt: savedAt,
    date: new Date(savedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    userId,
  };
}

export function reconcileDocuments({ serverDocuments = [], localDocuments = [], resumeDraft, legalDraft, userId }) {
  const byId = new Map();
  serverDocuments.forEach((document) => byId.set(document.id, document));
  localDocuments
    .filter((document) => document?.status === "rascunho")
    .forEach((document) => byId.set(document.id, document));

  const documents = [...byId.values()];
  const hasResume = documents.some((document) => document.status === "rascunho" && document.type === "resume");
  const hasLegal = documents.some((document) => document.status === "rascunho" && document.type !== "resume");

  if (!hasResume) {
    const card = virtualDraft("resume", resumeDraft, userId);
    if (card) documents.push(card);
  }
  if (!hasLegal) {
    const card = virtualDraft("legal", legalDraft, userId);
    if (card) documents.push(card);
  }

  return documents;
}
