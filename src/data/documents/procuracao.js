import { field, pessoaFisicaFields } from "./_shared.js";

const procuracao = {
  id: "procuracao",
  name: "Procuração",
  description: "Documento para delegar poderes a outra pessoa em seu nome",
  icon: "Shield",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 653 a 692",

  defaultVariant: "particular",
  variants: [
    {
      id: "particular",
      name: "Procuração Particular",
      description: "Para atos civis gerais (compra, venda, representação em repartições)",
      icon: "📝",
    },
    {
      id: "ad-judicia",
      name: "Procuração Ad Judicia",
      description: "Para representação em processos judiciais (advogado)",
      icon: "⚖️",
    },
  ],

  commonSections: [
    {
      id: "outorgante",
      title: "Dados do Outorgante (Quem dá os poderes)",
      subtitle: "A pessoa que está autorizando outra a agir em seu nome",
      icon: "user",
      fields: pessoaFisicaFields("outorgante", "Outorgante"),
    },
    {
      id: "outorgado",
      title: "Dados do Outorgado (Quem recebe os poderes)",
      subtitle: "A pessoa que vai agir em nome do outorgante",
      icon: "user",
      fields: pessoaFisicaFields("outorgado", "Outorgado"),
    },
    {
      id: "assinatura_proc",
      title: "Validade e Assinatura",
      subtitle: "Prazo e data da procuração",
      icon: "calendar",
      fields: [
        field("validade", "Prazo de Validade", "select", {
          required: true,
          options: ["30 dias", "90 dias", "6 meses", "1 ano", "Indeterminada"],
          hint: "Por quanto tempo esta procuração será válida. Se não souber, escolha 'Indeterminada'.",
        }),
        field("cidade_proc", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_proc", "Data de Assinatura", "date", {
          required: true,
        }),
      ],
    },
  ],

  variantSections: {
    particular: [
      {
        id: "poderes_particular",
        title: "Poderes Concedidos",
        subtitle: "O que a pessoa autorizada poderá fazer em seu nome",
        icon: "description",
        fields: [
          field("finalidade_proc", "Finalidade da Procuração", "select", {
            required: true,
            options: [
              "Compra e Venda de Imóvel",
              "Compra e Venda de Veículo",
              "Representação em Repartições Públicas",
              "Representação Bancária",
              "Administração de Bens",
              "Poderes Gerais (Ampla)",
              "Outra",
            ],
            hint: "Para que esta procuração será usada. Escolha a mais específica possível.",
          }),
          field("poderes_desc", "Descrição dos Poderes", "textarea", {
            required: true,
            placeholder: "Descreva o que a pessoa poderá fazer...",
            example:
              "Representar o outorgante junto ao Cartório de Registro de Imóveis para assinar escritura de compra e venda do imóvel localizado na Rua...",
            hint: "Descreva com detalhes o que o outorgado poderá fazer em seu nome. Quanto mais específico, mais seguro.",
          }),
          field("substabelecimento", "Permitir Substabelecimento?", "select", {
            required: false,
            options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
            hint: "Substabelecimento permite que o outorgado passe os poderes para outra pessoa.",
            disableable: true,
          }),
        ],
      },
    ],
    "ad-judicia": [
      {
        id: "poderes_judicia",
        title: "Poderes Judiciais",
        subtitle: "Poderes para representação em processos na Justiça",
        icon: "description",
        fields: [
          field("oab_numero", "Número da OAB do Advogado", "text", {
            required: true,
            placeholder: "Ex: 123.456/SP",
            example: "123.456/SP",
            hint: "Número de inscrição do advogado na Ordem dos Advogados do Brasil.",
            whereFind: "Pergunte ao seu advogado ou consulte no site da OAB.",
          }),
          field("tipo_processo", "Tipo de Processo", "select", {
            required: false,
            options: ["Cível", "Trabalhista", "Criminal", "Família", "Tributário", "Todos"],
            hint: "Em qual tipo de processo o advogado irá representá-lo.",
            disableable: true,
          }),
          field("poderes_especiais", "Poderes Especiais (Cláusula Ad Judicia)", "textarea", {
            required: true,
            placeholder: "Poderes para o foro em geral...",
            example:
              "Poderes para o foro em geral, conforme art. 105 do CPC, e os especiais para receber, dar quitação, transigir, desistir, renunciar, reconhecer a procedência do pedido.",
            hint: "Os poderes para atuar em processos judiciais. O texto padrão (exemplo) cobre a maioria dos casos.",
          }),
          field("substabelecimento_jud", "Permitir Substabelecimento?", "select", {
            required: false,
            options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
            hint: "Permite que o advogado passe poderes para outro advogado.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Procuração particular não precisa ir ao cartório, mas para atos imobiliários é recomendável reconhecer firma.",
    "Você pode revogar (cancelar) a procuração a qualquer momento, bastando notificar o outorgado.",
    "A procuração Ad Judicia (para advogado) é obrigatória para ter representação em processos judiciais.",
  ],

  internalNotes: [
    "Verificar se finalidade exige firma reconhecida em cartório",
    "Para atos imobiliários, exigir procuração pública (lavrada em cartório)",
  ],

  documentBody: {
    particular: [
      {
        type: "title",
        text: "PROCURAÇÃO PARTICULAR",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de procuração, eu {outorgante_nome}{?, , {outorgante_nacionalidade}}{?, , {outorgante_estado_civil}}{?, , {outorgante_profissao}}{?, , portador(a) do RG n.º {outorgante_rg} e }inscrito(a) no CPF/MF sob n.º {outorgante_cpf}{?, , residente e domiciliado(a) em {outorgante_endereco}}{?, , {outorgante_cidade}},",
      },
      {
        type: "paragraph",
        text: "nomeio e constituo meu(minha) bastante procurador(a) o(a) Sr.(a) {outorgado_nome}{?, , {outorgado_nacionalidade}}{?, , {outorgado_estado_civil}}{?, , {outorgado_profissao}}{?, , portador(a) do RG n.º {outorgado_rg} e }inscrito(a) no CPF/MF sob n.º {outorgado_cpf}{?, , residente e domiciliado(a) em {outorgado_endereco}}{?, , {outorgado_cidade}},",
      },
      {
        type: "paragraph",
        text: "a quem confiro os mais amplos, gerais e ilimitados poderes para: {poderes_desc}.",
      },
      {
        type: "paragraph",
        text: "{?, O substabelecimento é: {substabelecimento}.}",
      },
      {
        type: "paragraph",
        text: "Esta procuração é válida por: {validade}.",
      },
      {
        type: "paragraph",
        text: "(NÃO É NECESSÁRIA AUTENTICAÇÃO EM CARTÓRIO para procuração particular)",
      },
      {
        type: "date",
        text: "{cidade_proc}, {data_proc}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Outorgante", fieldKey: "outorgante_nome" },
        ],
      },
    ],

    "ad-judicia": [
      {
        type: "title",
        text: "PROCURAÇÃO AD JUDICIA",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de procuração, eu {outorgante_nome}{?, , {outorgante_nacionalidade}}{?, , {outorgante_estado_civil}}{?, , {outorgante_profissao}}{?, , portador(a) do RG n.º {outorgante_rg} e }inscrito(a) no CPF/MF sob n.º {outorgante_cpf}{?, , residente e domiciliado(a) em {outorgante_endereco}}{?, , {outorgante_cidade}},",
      },
      {
        type: "paragraph",
        text: "nomeio e constituo meu(minha) advogado(a) e bastante Procurador(a) o(a) Sr.(a) {outorgado_nome}, inscrito(a) na OAB sob n.º {oab_numero}{?, , CPF n.º {outorgado_cpf}}{?, , residente e domiciliado(a) em {outorgado_endereco}}{?, , {outorgado_cidade}},",
      },
      {
        type: "paragraph",
        text: "a quem confiro os mais amplos e gerais poderes para:",
      },
      {
        type: "clause",
        number: "I",
        title: "",
        text: "Representar-me em qualquer juízo ou tribunal, em qualquer instância, nas ações e procedimentos de qualquer natureza, incluindo ações cíveis, trabalhistas, criminais, tributárias, previdenciárias;",
      },
      {
        type: "clause",
        number: "II",
        title: "",
        text: "Propor e defender ações, intervir em Juízo como assistente, opoente ou chamamento ao processo;",
      },
      {
        type: "clause",
        number: "III",
        title: "",
        text: "Receber citação inicial, intimação, notificação, e quaisquer outros atos processuais;",
      },
      {
        type: "clause",
        number: "IV",
        title: "",
        text: "Reconhecer a procedência ou improcedência de pedidos, transigir, desistir, acordar, renunciar ao direito em que se funda a ação;",
      },
      {
        type: "clause",
        number: "V",
        title: "",
        text: "Receber valores, dar quitação, endossar cheques, realizar saques;",
      },
      {
        type: "clause",
        number: "VI",
        title: "",
        text: "Assinar petições, contratos, termos de ajustamento de conduta;",
      },
      {
        type: "clause",
        number: "VII",
        title: "",
        text: "Praticar todos os demais atos que se fizerem necessários ao bom e fiel cumprimento do presente mandato.",
      },
      {
        type: "paragraph",
        text: "Poderes especiais: {poderes_especiais}.",
      },
      {
        type: "paragraph",
        text: "{?, Substabelecimento: {substabelecimento_jud}.}",
      },
      {
        type: "paragraph",
        text: "Esta procuração é válida por: {validade}.",
      },
      {
        type: "date",
        text: "{cidade_proc}, {data_proc}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Outorgante", fieldKey: "outorgante_nome" },
        ],
      },
    ],
  },
};

export default procuracao;
