export function getRequirementsByLevel(doc, level) {
  const sections = doc.commonSections || [];
  const variantSections = doc.variantSections || {};
  const allVariantSections = Object.values(variantSections).flat();

  const allFields = [
    ...sections.flatMap((section) => section.fields || []),
    ...allVariantSections.flatMap((section) => section.fields || []),
  ];

  const obrigatorios = allFields
    .filter((field) => field.required)
    .map((field) => `${field.label}`);

  const opcionais = allFields
    .filter((field) => !field.required && !field.disableable)
    .map((field) => `${field.label}`);

  const extras = allFields
    .filter((field) => field.disableable)
    .map((field) => `${field.label}`);

  switch (level) {
    case "minimo":
      return {
        obrigatorios: obrigatorios.slice(0, Math.ceil(obrigatorios.length * 0.5)),
        opcionais: [],
        extras: [],
        count: Math.ceil(obrigatorios.length * 0.5),
      };
    case "essencial":
      return {
        obrigatorios,
        opcionais: opcionais.slice(0, Math.ceil(opcionais.length * 0.6)),
        extras: [],
        count: obrigatorios.length + Math.ceil(opcionais.length * 0.6),
      };
    case "completo":
      return {
        obrigatorios,
        opcionais,
        extras,
        count: obrigatorios.length + opcionais.length + extras.length,
      };
    default:
      return { obrigatorios, opcionais: [], extras: [], count: obrigatorios.length };
  }
}
