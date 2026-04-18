import { field } from "./_shared.js";

const recibo = {
  id: "recibo",
  name: "Recibo",
  description: "Comprovante de pagamento ou recebimento de valores",
  icon: "FileCheck",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 319 a 322",

  defaultVariant: "pagamento",
  variants: [
    {
      id: "pagamento",
      name: "Recibo de Pagamento",
      description: "Comprovante geral de pagamento ou recebimento",
      icon: "💰",
    },
    {
      id: "aluguel",
      name: "Recibo de Aluguel",
      description: "Comprovante de pagamento de aluguel mensal",
      icon: "🏠",
    },
  ],

  commonSections: [
    {
      id: "recebedor",
      title: "Quem Recebeu o Pagamento",
      subtitle: "Dados de quem recebeu o dinheiro",
      icon: "user",
      fields: [
        field("nome_recebedor", "Nome Completo", "text", {
          required: true,
          placeholder: "Nome de quem recebeu",
          example: "Maria da Silva Santos",
          hint: "Nome completo da pessoa ou razão social da empresa que recebeu o pagamento.",
          whyImportant: "Identifica quem recebeu o dinheiro. Deve coincidir com o nome no CPF ou CNPJ informado.",
        }),
        field("cpf_recebedor", "CPF / CNPJ", "cpf", {
          required: true,
          placeholder: "000.000.000-00",
          example: "123.456.789-00",
          hint: "CPF (se pessoa física, 11 dígitos) ou CNPJ (se empresa, 14 dígitos) de quem recebeu o pagamento.",
          whereFind: "CPF: documento de identidade, CNH ou site da Receita Federal. CNPJ: nota fiscal, contrato social ou site da Receita Federal.",
        }),
      ],
    },
    {
      id: "pagador",
      title: "Quem Pagou",
      subtitle: "Dados de quem fez o pagamento",
      icon: "user",
      fields: [
        field("nome_pagador", "Nome Completo", "text", {
          required: true,
          placeholder: "Nome de quem pagou",
          example: "João Pereira Lima",
          hint: "Nome completo da pessoa ou empresa que efetuou o pagamento.",
        }),
        field("cpf_pagador", "CPF / CNPJ", "cpf", {
          required: true,
          placeholder: "000.000.000-00",
          example: "987.654.321-00",
          hint: "CPF ou CNPJ de quem fez o pagamento.",
        }),
      ],
    },
    {
      id: "assinatura_recibo",
      title: "Data e Assinatura",
      icon: "calendar",
      fields: [
        field("cidade_recibo", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
          hint: "Cidade onde o recibo está sendo emitido.",
        }),
        field("data_recibo", "Data do Recibo", "date", {
          required: true,
          hint: "Data em que o pagamento foi feito ou o recibo está sendo emitido.",
        }),
      ],
    },
  ],

  variantSections: {
    pagamento: [
      {
        id: "dados_pagamento",
        title: "Dados do Pagamento",
        subtitle: "Valor e motivo do pagamento",
        icon: "money",
        fields: [
          field("valor_recibo", "Valor Recebido", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 3.500,00",
            hint: "Valor total que foi recebido. Informe o valor exato computado.",
            whyImportant: "É a prova do valor pago. Deve coincidir com o que foi efetivamente recebido.",
          }),
          field("referente_a", "Referente a", "textarea", {
            required: true,
            placeholder: "Descreva o motivo do pagamento...",
            example: "Prestação de serviço de consultoria realizada no mês de março/2026.",
            hint: "Descreva pelo que está sendo pago: serviço prestado, produto vendido, dívida quitada, etc. Seja específico para evitar dúvidas futuras.",
            whyImportant: "Sem uma descrição clara do motivo, o recibo perde valor como comprovante. Detalhe o serviço, produto ou obrigação que gerou o pagamento.",
          }),
          field("forma_pgto_recibo", "Forma de Pagamento", "select", {
            required: false,
            options: ["Dinheiro", "PIX", "Transferência Bancária", "Cheque", "Cartão", "Boleto"],
            hint: "Como o pagamento foi feito. Ajuda a comprovar a transação em caso de dúvida.",
            whatHappensIfEmpty: "O recibo será gerado sem especificar como o pagamento foi feito.",
            disableable: true,
          }),
        ],
      },
    ],
    aluguel: [
      {
        id: "dados_aluguel",
        title: "Dados do Pagamento de Aluguel",
        subtitle: "Mês de referência e endereço do imóvel",
        icon: "money",
        fields: [
          field("valor_aluguel_recibo", "Valor do Aluguel", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 1.500,00",
            hint: "Valor do aluguel pago neste mês.",
          }),
          field("mes_referencia", "Mês de Referência", "text", {
            required: true,
            placeholder: "Ex: Março/2026",
            example: "Março/2026",
            hint: "Mês e ano a que se refere o pagamento do aluguel. Ex: Janeiro/2026, Fevereiro/2026, etc.",
            whyImportant: "Identifica qual mês está sendo pago. Sem essa informação, não é possível comprovar a quitação de um mês específico.",
          }),
          field("endereco_imovel_recibo", "Endereço do Imóvel", "text", {
            required: true,
            placeholder: "Endereço completo do imóvel alugado",
            example: "Rua das Palmeiras, 456, Apt 12A, São Paulo/SP",
            hint: "Endereço completo do imóvel alugado, para identificar a qual imóvel o recibo se refere.",
          }),
          field("forma_pgto_aluguel", "Forma de Pagamento", "select", {
            required: false,
            options: ["Dinheiro", "PIX", "Transferência Bancária", "Cheque", "Boleto"],
            hint: "Como o aluguel foi pago.",
            whatHappensIfEmpty: "O recibo será gerado sem especificar a forma de pagamento.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "O recibo é seu comprovante de pagamento. Guarde-o por pelo menos 5 anos.",
    "Para valores altos, é recomendável que o recibo seja assinado na presença de testemunhas.",
  ],

  internalNotes: [],

  documentBody: {
    pagamento: [
      {
        type: "title",
        text: "RECIBO DE PAGAMENTO",
      },
      {
        type: "paragraph",
        text: "Eu, {nome_recebedor}, inscrito(a) no CPF/CNPJ sob n.º {cpf_recebedor}, declaro para os devidos fins que RECEBI de {nome_pagador}, inscrito(a) no CPF/CNPJ sob n.º {cpf_pagador}, a quantia de {valor_recibo} ({valor_recibo}),",
      },
      {
        type: "paragraph",
        text: "referente a: {referente_a}.",
      },
      {
        type: "paragraph",
        text: "{?, Forma de pagamento: {forma_pgto_recibo}.}",
      },
      {
        type: "paragraph",
        text: "Para maior clareza e na falta de outro documento, firmo o presente recibo para que produza seus devidos efeitos legais.",
      },
      {
        type: "date",
        text: "{cidade_recibo}, {data_recibo}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Assinatura do Recebedor", fieldKey: "nome_recebedor" },
        ],
      },
    ],

    aluguel: [
      {
        type: "title",
        text: "RECIBO DE ALUGUEL",
      },
      {
        type: "paragraph",
        text: "Eu, {nome_recebedor}, inscrito(a) no CPF/CNPJ sob n.º {cpf_recebedor}, na qualidade de LOCADOR(A), declaro que RECEBI de {nome_pagador}, inscrito(a) no CPF/CNPJ sob n.º {cpf_pagador}, na qualidade de LOCATÁRIO(A), a quantia de {valor_aluguel_recibo},",
      },
      {
        type: "paragraph",
        text: "referente ao aluguel do imóvel situado em {endereco_imovel_recibo}, correspondente ao mês de {mes_referencia}.",
      },
      {
        type: "paragraph",
        text: "{?, Forma de pagamento: {forma_pgto_aluguel}.}",
      },
      {
        type: "paragraph",
        text: "Para maior clareza, firmo o presente recibo dando plena e total quitação do valor acima descrito.",
      },
      {
        type: "date",
        text: "{cidade_recibo}, {data_recibo}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Locador(a) / Recebedor(a)", fieldKey: "nome_recebedor" },
        ],
      },
    ],
  },
};

export default recibo;
