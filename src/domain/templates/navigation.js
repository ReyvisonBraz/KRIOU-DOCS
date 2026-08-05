const TEMPLATE_TYPES = new Set(["resume", "legal"]);

export const resolveTemplateEntry = (category) => {
  const docType = TEMPLATE_TYPES.has(category) ? category : null;
  return {
    docType,
    openedDirectly: Boolean(docType),
  };
};

export const resolveTemplateBackAction = ({ docType, openedDirectly }) => {
  if (!docType || openedDirectly) return "dashboard";
  return "category-selection";
};

