/**
 * Helpers compartilhados entre todos os módulos de documentos legais.
 *
 * Este arquivo centraliza:
 * - A factory function `field()` para criar definições de campo
 * - A função `pessoaFisicaFields()` que gera os campos padrão de pessoa física
 *
 * Todos os módulos de documentos importam daqui.
 */

/**
 * Cria uma definição de campo com padrões inteligentes.
 */
export const field = (key, label, type, opts = {}) => ({
  key,
  label,
  type,
  required: opts.required ?? false,
  placeholder: opts.placeholder || "",
  example: opts.example || "",
  hint: opts.hint || "",
  whereFind: opts.whereFind || "",
  mask: opts.mask || null,
  options: opts.options || null,
  disableable: opts.disableable ?? !opts.required,
  visibleInVariants: opts.visibleInVariants || null, // null = todas as variantes
});

/**
 * Gera os campos padrão para uma pessoa física (parte de contrato).
 *
 * @param {string} prefix - Prefixo dos campos (ex: "vendedor", "locador")
 * @param {string} papel  - Nome do papel para labels (ex: "Vendedor", "Locador")
 * @returns {Array} - Array de definições de campo
 */
export const pessoaFisicaFields = (prefix, papel) => [
  field(`${prefix}_nome`, `Nome Completo do ${papel}`, "text", {
    required: true,
    placeholder: "Nome completo como no documento",
    example: "Maria da Silva Santos",
    hint: "Use o nome completo, exatamente como aparece no RG ou CNH.",
    whereFind: "RG, CPF, CNH ou Certidão de Nascimento",
  }),
  field(`${prefix}_cpf`, `CPF do ${papel}`, "cpf", {
    required: true,
    placeholder: "000.000.000-00",
    example: "123.456.789-00",
    hint: "Número do CPF com 11 dígitos. Será formatado automaticamente.",
    whereFind: "Cartão do CPF, CNH, ou consulte no site da Receita Federal",
    mask: "cpf",
  }),
  field(`${prefix}_rg`, `RG do ${papel}`, "text", {
    required: false,
    placeholder: "00.000.000-0",
    example: "12.345.678-9 SSP/SP",
    hint: "Número do RG com o órgão expedidor (ex: SSP/SP).",
    whereFind: "Documento de identidade (carteira de identidade)",
    disableable: true,
  }),
  field(`${prefix}_nacionalidade`, `Nacionalidade do ${papel}`, "text", {
    required: false,
    placeholder: "Brasileiro(a)",
    example: "Brasileiro(a)",
    hint: "Sua nacionalidade. Para a maioria será 'Brasileiro(a)'.",
    disableable: true,
  }),
  field(`${prefix}_estado_civil`, `Estado Civil do ${papel}`, "select", {
    required: false,
    options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"],
    hint: "Selecione o estado civil atual conforme certidão.",
    whereFind: "Certidão de Nascimento (se solteiro) ou Certidão de Casamento",
    disableable: true,
  }),
  field(`${prefix}_profissao`, `Profissão do ${papel}`, "text", {
    required: false,
    placeholder: "Sua profissão",
    example: "Comerciante",
    hint: "Profissão atual ou a que consta nos documentos.",
    disableable: true,
  }),
  field(`${prefix}_endereco`, `Endereço Completo do ${papel}`, "text", {
    required: false,
    placeholder: "Rua, número, bairro",
    example: "Rua das Flores, 123, Centro",
    hint: "Endereço residencial completo com rua, número e bairro.",
    whereFind: "Comprovante de residência (conta de luz, água, etc.)",
    disableable: true,
  }),
  field(`${prefix}_cidade`, `Cidade / UF do ${papel}`, "text", {
    required: false,
    placeholder: "Cidade, UF",
    example: "São Paulo, SP",
    hint: "Cidade e estado onde reside.",
    disableable: true,
  }),
];

/**
 * Gera o parágrafo de qualificação de uma parte (pessoa física) para o corpo do documento.
 * Usa sintaxe {?, ...} para remover condicionalmente campos opcionais sem deixar
 * palavras órfãs no texto.
 *
 * @param {string} prefix - Prefixo dos campos (ex: "vendedor")
 * @param {string} rotulo - Rótulo no documento (ex: "VENDEDOR")
 * @returns {string} - Template do parágrafo com placeholders
 */
export const parteQualificacaoText = (prefix, rotulo) =>
  `${rotulo}: {${prefix}_nome}{?, , {${prefix}_nacionalidade}}{?, , {${prefix}_estado_civil}}{?, , {${prefix}_profissao}}{?, portador(a) do RG n.º {${prefix}_rg} e }inscrito(a) no CPF sob n.º {${prefix}_cpf}{?, , residente e domiciliado(a) em {${prefix}_endereco}}{?, , {${prefix}_cidade}}`;
