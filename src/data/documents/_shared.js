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
 *
 * Campos extras para ajuda ao usuário leigo:
 *   - hint:               Explicação curta do campo
 *   - example:            Exemplo de preenchimento
 *   - whereFind:          Onde o usuário encontra essa informação
 *   - whyImportant:       Por que este dado é importante no documento
 *   - whatHappensIfEmpty:  O que acontece se o campo opcional não for preenchido
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
  whyImportant: opts.whyImportant || "",
  whatHappensIfEmpty: opts.whatHappensIfEmpty || "",
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
    hint: "Digite o nome completo, exatamente como aparece no RG ou CNH. Não use apelidos.",
    whereFind: "RG, CPF, CNH ou Certidão de Nascimento",
    whyImportant: "O nome identifica legalmente a pessoa no contrato. Se estiver diferente do documento oficial, o contrato pode ser contestado.",
  }),
  field(`${prefix}_cpf`, `CPF do ${papel}`, "cpf", {
    required: true,
    placeholder: "000.000.000-00",
    example: "123.456.789-00",
    hint: "O CPF tem 11 dígitos e será formatado automaticamente. É o documento mais importante para identificação.",
    whereFind: "Cartão do CPF, CNH, ou consulte gratuitamente no site da Receita Federal (receita.fazenda.gov.br)",
    whyImportant: "O CPF é obrigatório em todo contrato. Ele identifica a pessoa perante a Receita Federal e garante a validade jurídica do documento.",
    mask: "cpf",
  }),
  field(`${prefix}_rg`, `RG do ${papel}`, "text", {
    required: false,
    placeholder: "00.000.000-0 SSP/SP",
    example: "12.345.678-9 SSP/SP",
    hint: "Número do RG seguido do órgão que emitiu (ex: SSP/SP, DETRAN/RJ). Se tiver o novo RG (CIN), pode usar também.",
    whereFind: "Documento de identidade (carteira de identidade). O órgão emissor fica na frente do documento, geralmente 'SSP' seguido do estado.",
    whyImportant: "O RG complementa a identificação pelo CPF e torna o contrato mais seguro juridicamente.",
    whatHappensIfEmpty: "O documento será gerado apenas com o CPF. Não prejudica a validade, mas é menos completo.",
    disableable: true,
  }),
  field(`${prefix}_nacionalidade`, `Nacionalidade do ${papel}`, "text", {
    required: false,
    placeholder: "Brasileiro(a)",
    example: "Brasileiro(a)",
    hint: "Na maioria das vezes será 'Brasileiro(a)'. Se a pessoa for estrangeira, coloque a nacionalidade dela.",
    whyImportant: "A nacionalidade é uma informação de qualificação padrão em contratos brasileiros.",
    whatHappensIfEmpty: "O documento será gerado sem mencionar a nacionalidade. Isso é normal e não afeta a validade.",
    disableable: true,
  }),
  field(`${prefix}_estado_civil`, `Estado Civil do ${papel}`, "select", {
    required: false,
    options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"],
    hint: "Selecione o estado civil atual. Em contratos de imóveis, se for casado(a), o cônjuge pode precisar assinar também.",
    whereFind: "Certidão de Nascimento (se solteiro) ou Certidão de Casamento (se casado/divorciado/viúvo)",
    whyImportant: "Em transações de imóveis e bens de alto valor, o estado civil pode exigir a participação do cônjuge no contrato.",
    whatHappensIfEmpty: "O documento será gerado sem mencionar o estado civil. Em contratos de bens comuns do casal, isso pode ser questionado.",
    disableable: true,
  }),
  field(`${prefix}_profissao`, `Profissão do ${papel}`, "text", {
    required: false,
    placeholder: "Sua profissão",
    example: "Comerciante",
    hint: "Pode ser qualquer atividade: Comerciante, Auxiliar Administrativo, Do Lar, Estudante, Aposentado(a), Autônomo(a), etc.",
    whyImportant: "É uma informação de qualificação pessoal, comum em contratos jurídicos.",
    whatHappensIfEmpty: "O documento será gerado sem mencionar a profissão. Isso é normal e aceito.",
    disableable: true,
  }),
  field(`${prefix}_endereco`, `Endereço Completo do ${papel}`, "text", {
    required: false,
    placeholder: "Rua, número, bairro",
    example: "Rua das Flores, 123, Centro",
    hint: "Endereço residencial com rua, número e bairro. Deve ser o mesmo do comprovante de residência.",
    whereFind: "Comprovante de residência: conta de luz, água, telefone ou correspondência bancária (dos últimos 3 meses)",
    whyImportant: "O endereço permite localizar a pessoa e é necessário em caso de notificações judiciais.",
    whatHappensIfEmpty: "O documento será gerado sem o endereço. Para contratos de alto valor, é recomendável informar.",
    disableable: true,
  }),
  field(`${prefix}_cidade`, `Cidade / UF do ${papel}`, "text", {
    required: false,
    placeholder: "Cidade, UF",
    example: "São Paulo, SP",
    hint: "Cidade e estado onde reside. Use a sigla do estado (SP, RJ, MG, etc.).",
    whatHappensIfEmpty: "O documento será gerado sem mencionar a cidade de residência.",
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
  `${rotulo}: {${prefix}_nome}{?, , {${prefix}_nacionalidade}}{?, , {${prefix}_estado_civil}}{?, , {${prefix}_profissao}}{?, portador(a) do RG n.º {${prefix}_rg} e }inscrito(a) no CPF sob n.º {${prefix}_cpf}{?any, , residente e domiciliado(a) em {${prefix}_endereco?}, {${prefix}_cidade?}}`;
