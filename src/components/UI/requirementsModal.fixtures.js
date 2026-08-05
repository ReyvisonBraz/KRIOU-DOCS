export const emptyDocument = {
  name: "Documento vazio",
};

export const commonFieldsDocument = {
  name: "Contrato de caracterização",
  commonSections: [
    {
      title: "Partes",
      fields: [
        { label: "Obrigatório 1", required: true },
        { label: "Obrigatório 2", required: true },
        { label: "Opcional 1" },
        { label: "Extra 1", disableable: true },
      ],
    },
    {
      title: "Condições",
      fields: [
        { label: "Obrigatório 3", required: true },
        { label: "Opcional 2" },
      ],
    },
  ],
};

export const variantFieldsDocument = {
  name: "Contrato com variantes",
  commonSections: [
    {
      fields: [
        { label: "Obrigatório 1", required: true },
        { label: "Obrigatório 2", required: true },
        { label: "Opcional 1" },
      ],
    },
  ],
  variantSections: {
    pessoaFisica: [
      {
        fields: [
          { label: "Obrigatório 3", required: true },
          { label: "Opcional 2" },
          { label: "Extra 1", disableable: true },
        ],
      },
    ],
    pessoaJuridica: [
      { title: "Seção sem campos" },
      {
        fields: [
          { label: "Obrigatório 4", required: true },
          { label: "Obrigatório 5", required: true },
          { label: "Opcional 3" },
          { label: "Opcional 4" },
          { label: "Opcional 5" },
          { label: "Extra 2", disableable: true },
          { label: "Obrigatório e extra", required: true, disableable: true },
        ],
      },
    ],
  },
  spec: {
    whenUse: "Use quando as partes precisarem registrar suas obrigações.",
    requiredDocs: ["Documento com foto", "Comprovante de endereço"],
    tips: ["Revise os nomes", "Confira todas as datas"],
  },
};

export const selectedVariant = {
  name: "Pessoa jurídica",
  icon: "🏢",
};

export const ambiguousFlagsDocument = {
  name: "Documento com flags ambíguas",
  commonSections: [
    {
      fields: [
        { label: "Obrigatório e extra", required: true, disableable: true },
      ],
    },
  ],
  variantSections: {},
};

export const missingCollectionsDocument = {
  name: "Documento sem coleções",
  commonSections: [{ title: "Seção sem fields" }],
};

export const longPrintDocument = {
  name: "Documento extenso para paginação",
  commonSections: [
    {
      fields: Array.from({ length: 40 }, (_, index) => ({
        label: `Campo obrigatório extenso ${index + 1} com conteúdo para validar quebra de página`,
        required: true,
      })),
    },
  ],
  variantSections: {},
  spec: {
    whenUse: "Cenário extenso usado exclusivamente para verificar a paginação do checklist.",
    requiredDocs: Array.from({ length: 12 }, (_, index) => `Documento necessário ${index + 1}`),
    tips: Array.from({ length: 12 }, (_, index) => `Dica extensa de impressão ${index + 1}`),
  },
};
