import { field, pessoaFisicaFields } from "./_shared.js";

const procuracao = {
  id: "procuracao",
  name: "Procuração",
  description: "Documento para delegar poderes a outra pessoa em seu nome",
  icon: "Shield",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 653 a 692",
  spec: {
    whenUse: "Quando uma pessoa precisa que outra atue em seu nome em actos jurídicos ou administrativos",
    parties: ["Outorgante (quem dá poderes)", "Outorgado (quem recebe poderes)"],
    sections: ["Dados do Outorgante", "Dados do Outorgado", "Poderes Concedidos", "Validade", "Assinaturas"],
    requiredDocs: ["Documentos de identidade", "CPF", "Comprovante de residência"],
    tips: ["Especifique bem os poderes concedidos", "Defina prazo de validade", "Cartório pode ser necessário para alguns casos"],
    commonIssues: ["Poderes muito amplos ou genéricos", "Falta de prazo definido", "Procuração sem reconhecimento de firma"],
  },

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
          hint: "Por quanto tempo esta procuração será válida. Após o prazo, ela perde o efeito automaticamente. Se não souber, escolha 'Indeterminada' — você pode revogar a qualquer momento.",
          whyImportant: "Define até quando o procurador pode agir em seu nome. Prazos menores são mais seguros.",
        }),
        field("cidade_proc", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
          hint: "Cidade onde a procuração está sendo emitida.",
        }),
        field("data_proc", "Data de Assinatura", "date", {
          required: true,
          hint: "Data em que a procuração será assinada.",
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
            hint: "Para que esta procuração será usada. Quanto mais específica a finalidade, mais seguro para você. 'Poderes Gerais' dá amplos poderes ao procurador — use com cuidado.",
            whyImportant: "Uma procuração muito ampla pode ser usada para atos que você não desejava. Prefira finalidades específicas.",
          }),
          field("poderes_desc", "Descrição dos Poderes", "textarea", {
            required: true,
            placeholder: "Descreva o que a pessoa poderá fazer...",
            example:
              "Representar o outorgante junto ao Cartório de Registro de Imóveis para assinar escritura de compra e venda do imóvel localizado na Rua...",
            hint: "Descreva com detalhes o que o procurador poderá fazer em seu nome. Inclua detalhes específicos como endereço do imóvel, nome do banco, número do processo, etc.",
            whyImportant: "Poderes vagos podem gerar insegurança jurídica. Quanto mais detalhado, mais protegido você estará.",
          }),
          field("substabelecimento", "Permitir Substabelecimento?", "select", {
            required: false,
            options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
            hint: "'Substabelecimento' significa que o procurador pode passar os poderes dele para outra pessoa. 'Com reserva' = ele continua tendo os poderes também. 'Sem reserva' = ele perde os poderes e passa tudo para o outro.",
            whyImportant: "Se permitir substabelecimento, seu procurador pode designar outra pessoa que você nem conhece para agir em seu nome.",
            whatHappensIfEmpty: "O contrato será gerado sem menção a substabelecimento, ou seja, o procurador não poderá transferir os poderes.",
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
            hint: "Número de inscrição do advogado na OAB (Ordem dos Advogados do Brasil). Formato: número/estado (ex: 123.456/SP).",
            whereFind: "Pergunte ao seu advogado ou consulte no site da OAB do seu estado (ex: oabsp.org.br para São Paulo).",
            whyImportant: "É obrigatório para que o advogado possa representá-lo em qualquer processo judicial.",
          }),
          field("tipo_processo", "Tipo de Processo", "select", {
            required: false,
            options: ["Cível", "Trabalhista", "Criminal", "Família", "Tributário", "Todos"],
            hint: "'Cível' = problemas de dinheiro, contratos, danos. 'Trabalhista' = questões de emprego. 'Criminal' = crimes. 'Família' = divórcio, guarda, pensão. 'Tributário' = impostos.",
            whatHappensIfEmpty: "A procuração será ampla, valendo para qualquer tipo de processo.",
            disableable: true,
          }),
          field("poderes_especiais", "Poderes Especiais (Cláusula Ad Judicia)", "textarea", {
            required: true,
            placeholder: "Poderes para o foro em geral...",
            example:
              "Poderes para o foro em geral, conforme art. 105 do CPC, e os especiais para receber, dar quitação, transigir, desistir, renunciar, reconhecer a procedência do pedido.",
            hint: "Os 'poderes especiais' permitem que o advogado faça ações importantes como: aceitar acordos, desistir do processo, receber dinheiro em seu nome. O texto de exemplo cobre a maioria das situações.",
            whyImportant: "Sem poderes especiais, o advogado não pode fazer acordo, receber valores ou desistir do processo em seu nome.",
          }),
          field("substabelecimento_jud", "Permitir Substabelecimento?", "select", {
            required: false,
            options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
            hint: "Permite que o advogado passe os poderes para outro advogado (colega de escritório, por exemplo). 'Com reserva' = ambos podem atuar. 'Sem reserva' = só o novo advogado atua.",
            whatHappensIfEmpty: "A procuração será gerada sem permissão de substabelecimento.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Procuração particular não precisa ir ao cartório, mas para atos imobiliários é recomendável reconhecer firma.",
    "Você pode revogar (cancelar) a procuração a qualquer momento, bastando notificar o outorgado por escrito.",
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
        text: "Por este instrumento particular de procuração, eu {outorgante_nome}{?, , {outorgante_nacionalidade}}{?, , {outorgante_estado_civil}}{?, , {outorgante_profissao}}{?, , portador(a) do RG n.º {outorgante_rg} e }inscrito(a) no CPF/MF sob n.º {outorgante_cpf}{?any, , residente e domiciliado(a) em {outorgante_endereco?}, {outorgante_cidade?}},",
      },
      {
        type: "paragraph",
        text: "nomeio e constituo meu(minha) bastante procurador(a) o(a) Sr.(a) {outorgado_nome}{?, , {outorgado_nacionalidade}}{?, , {outorgado_estado_civil}}{?, , {outorgado_profissao}}{?, , portador(a) do RG n.º {outorgado_rg} e }inscrito(a) no CPF/MF sob n.º {outorgado_cpf}{?any, , residente e domiciliado(a) em {outorgado_endereco?}, {outorgado_cidade?}},",
      },
      {
        type: "paragraph",
        text: "a quem confiro poderes para, em meu nome e por minha conta: {poderes_desc}.",
      },
      {
        type: "paragraph",
        text: "{?, Substabelecimento: {substabelecimento}.}",
      },
      {
        type: "paragraph",
        text: "Esta procuração é válida pelo prazo de {validade}, a contar da data de sua assinatura.",
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
        text: "PROCURAÇÃO AD JUDICIA ET EXTRA",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de procuração, eu {outorgante_nome}{?, , {outorgante_nacionalidade}}{?, , {outorgante_estado_civil}}{?, , {outorgante_profissao}}{?, , portador(a) do RG n.º {outorgante_rg} e }inscrito(a) no CPF/MF sob n.º {outorgante_cpf}{?any, , residente e domiciliado(a) em {outorgante_endereco?}, {outorgante_cidade?}},",
      },
      {
        type: "paragraph",
        text: "nomeio e constituo meu(minha) advogado(a) e bastante Procurador(a) o(a) Dr.(a) {outorgado_nome}, inscrito(a) na OAB sob n.º {oab_numero}{?, , CPF n.º {outorgado_cpf}}{?any, , com escritório em {outorgado_endereco?}, {outorgado_cidade?}},",
      },
      {
        type: "paragraph",
        text: "a quem confiro amplos poderes para o foro em geral, com os poderes especiais de:",
      },
      {
        type: "clause",
        number: "I",
        title: "",
        text: "Representar-me em qualquer juízo ou tribunal, em qualquer instância, nas ações e procedimentos de qualquer natureza, incluindo ações cíveis, trabalhistas, criminais, tributárias e previdenciárias;",
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
        text: "Poderes especiais conferidos: {poderes_especiais}.",
      },
      {
        type: "paragraph",
        text: "{?, Substabelecimento: {substabelecimento_jud}.}",
      },
      {
        type: "paragraph",
        text: "Esta procuração é válida pelo prazo de {validade}, a contar da data de sua assinatura.",
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
