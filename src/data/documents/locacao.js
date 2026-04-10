import { field, pessoaFisicaFields } from "./_shared.js";

const locacao = {
  id: "locacao",
  name: "Contrato de Locação",
  description: "Contrato de aluguel para imóveis residenciais ou comerciais",
  icon: "Home",
  available: true,
  legislation: "Lei 8.245/91 (Lei do Inquilinato) e Código Civil",

  defaultVariant: "residencial",
  variants: [
    {
      id: "residencial",
      name: "Residencial",
      description: "Aluguel de casa, apartamento ou kitnet para moradia",
      icon: "🏠",
    },
    {
      id: "comercial",
      name: "Comercial",
      description: "Aluguel de sala, loja ou galpão para comércio",
      icon: "🏢",
    },
  ],

  commonSections: [
    {
      id: "locador",
      title: "Dados do Locador (Proprietário)",
      subtitle: "Quem é o dono do imóvel",
      icon: "user",
      fields: pessoaFisicaFields("locador", "Locador"),
    },
    {
      id: "locatario",
      title: "Dados do Locatário (Inquilino)",
      subtitle: "Quem vai morar ou usar o imóvel",
      icon: "user",
      fields: pessoaFisicaFields("locatario", "Locatário"),
    },
    {
      id: "valores",
      title: "Valores e Prazos",
      subtitle: "Aluguel, caução e duração do contrato",
      icon: "money",
      fields: [
        field("valor_aluguel", "Valor do Aluguel Mensal", "money", {
          required: true,
          placeholder: "R$ 0,00",
          example: "R$ 1.500,00",
          hint: "Valor mensal do aluguel combinado entre as partes.",
        }),
        field("dia_vencimento", "Dia de Vencimento", "select", {
          required: true,
          options: ["1", "5", "10", "15", "20", "25", "30"],
          hint: "Dia do mês em que o aluguel deve ser pago.",
        }),
        field("prazo_inicio", "Data de Início do Contrato", "date", {
          required: true,
          hint: "Data em que o contrato começa a valer e o inquilino pode usar o imóvel.",
        }),
        field("prazo_fim", "Data de Término do Contrato", "date", {
          required: true,
          hint: "Data de encerramento do contrato. O comum é 12, 24 ou 30 meses.",
        }),
        field("valor_caucao", "Valor da Caução", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 4.500,00 (3x o aluguel)",
          hint: "Caução é um valor dado como garantia. Normalmente equivale a 3 meses de aluguel. Será devolvida ao final do contrato se não houver danos.",
          disableable: true,
        }),
        field("indice_reajuste", "Índice de Reajuste", "select", {
          required: false,
          options: ["IGP-M (FGV)", "IPCA (IBGE)", "INPC (IBGE)", "Outro"],
          hint: "Índice usado para corrigir o valor do aluguel anualmente. O mais comum é o IGP-M.",
          disableable: true,
        }),
        field("valor_iptu", "Valor do IPTU", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 200,00/mês",
          hint: "Imposto do imóvel. Pode ser pago pelo locador ou locatário conforme combinado.",
          disableable: true,
        }),
      ],
    },
    {
      id: "assinatura_locacao",
      title: "Assinatura e Foro",
      subtitle: "Local, data e jurisdição",
      icon: "calendar",
      fields: [
        field("cidade_contrato_loc", "Cidade do Contrato", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_assinatura_loc", "Data de Assinatura", "date", {
          required: true,
        }),
      ],
    },
  ],

  variantSections: {
    residencial: [
      {
        id: "imovel_residencial",
        title: "Dados do Imóvel",
        subtitle: "Informações do imóvel para moradia",
        icon: "building",
        fields: [
          field("tipo_imovel_loc", "Tipo de Imóvel", "select", {
            required: true,
            options: ["Apartamento", "Casa", "Sobrado", "Kitnet", "Studio", "Outro"],
            hint: "Selecione o tipo de imóvel que será alugado.",
          }),
          field("endereco_imovel_loc", "Endereço do Imóvel", "text", {
            required: true,
            placeholder: "Rua, número, bairro, complemento",
            example: "Rua das Palmeiras, 456, Apt 12A, Jardim América",
            hint: "Endereço completo do imóvel, incluindo número do apartamento se aplicável.",
          }),
          field("cidade_imovel_loc", "Cidade / UF", "text", {
            required: true,
            placeholder: "Cidade, UF",
            example: "São Paulo, SP",
          }),
          field("mobiliado", "Imóvel Mobiliado?", "select", {
            required: false,
            options: ["Não", "Sim - Totalmente", "Sim - Parcialmente"],
            hint: "Se o imóvel tem móveis inclusos no aluguel.",
            disableable: true,
          }),
        ],
      },
    ],
    comercial: [
      {
        id: "imovel_comercial",
        title: "Dados do Imóvel Comercial",
        subtitle: "Informações do ponto comercial",
        icon: "building",
        fields: [
          field("tipo_imovel_com", "Tipo de Imóvel", "select", {
            required: true,
            options: ["Sala Comercial", "Loja", "Galpão", "Escritório", "Outro"],
            hint: "Selecione o tipo de imóvel comercial.",
          }),
          field("endereco_imovel_com", "Endereço do Imóvel", "text", {
            required: true,
            placeholder: "Rua, número, sala/loja",
            example: "Av. Paulista, 1000, Sala 302",
          }),
          field("cidade_imovel_com", "Cidade / UF", "text", {
            required: true,
            placeholder: "Cidade, UF",
            example: "São Paulo, SP",
          }),
          field("finalidade_com", "Finalidade / Ramo de Atividade", "text", {
            required: false,
            placeholder: "Ex: Escritório de advocacia",
            example: "Escritório de advocacia",
            hint: "Qual será o uso do imóvel pelo locatário.",
            disableable: true,
          }),
          field("area_imovel_com", "Área (m²)", "text", {
            required: false,
            placeholder: "Ex: 60,00",
            example: "60,00 m²",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "O contrato de aluguel deve ter no mínimo 30 meses para garantir direito à renovação automática.",
    "A caução será devolvida ao final do contrato se não houver danos ao imóvel.",
    "Fotografe o imóvel no início da locação para documentar o estado atual.",
    "O reajuste do aluguel só pode ocorrer uma vez por ano, conforme índice combinado.",
  ],

  internalNotes: [
    "Verificar se imóvel residencial atende Lei do Inquilinato (Lei 8.245/91)",
    "Para comercial, atentar para direito de renovação (art. 51 da Lei 8.245/91)",
  ],

  documentBody: {
    residencial: [
      {
        type: "title",
        text: "CONTRATO DE LOCAÇÃO RESIDENCIAL",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de contrato de locação, de um lado, como LOCADOR(A): {locador_nome}{?, , {locador_nacionalidade}}{?, , {locador_estado_civil}}{?, , {locador_profissao}}{?, , portador(a) do RG n.º {locador_rg} e }inscrito(a) no CPF sob n.º {locador_cpf}{?, , residente e domiciliado(a) em {locador_endereco}}{?, , {locador_cidade}}, e de outro lado, como LOCATÁRIO(A): {locatario_nome}{?, , {locatario_nacionalidade}}{?, , {locatario_estado_civil}}{?, , {locatario_profissao}}{?, , portador(a) do RG n.º {locatario_rg} e }inscrito(a) no CPF sob n.º {locatario_cpf}{?, , residente e domiciliado(a) em {locatario_endereco}}{?, , {locatario_cidade}}.",
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) LOCADOR(A) cede ao(à) LOCATÁRIO(A), em locação, o imóvel do tipo {tipo_imovel_loc} situado em {endereco_imovel_loc}, {cidade_imovel_loc}{?, , imóvel {mobiliado}}.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PRAZO",
        text: "O prazo desta locação tem início em {prazo_inicio} e término em {prazo_fim}.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DO ALUGUEL",
        paragraphs: [
          "O aluguel mensal é de {valor_aluguel}, pagável até o dia {dia_vencimento} de cada mês.",
          "{?, Parágrafo único. O aluguel será reajustado anualmente pelo índice {indice_reajuste}.}",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA GARANTIA",
        text: "{?, Caução no valor de {valor_caucao}, a ser depositado em conta poupança e devolvido ao término do contrato, se não houver débitos.}",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DAS DESPESAS",
        paragraphs: [
          "O(A) LOCATÁRIO(A) obriga-se a pagar as contas de consumo próprio (água, energia elétrica, gás) durante a vigência do contrato.",
          "{?, O IPTU no valor de {valor_iptu} ficará a cargo do(a) LOCATÁRIO(A), conforme acordado entre as partes.}",
        ],
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA VEDAÇÃO DE SUBLOCAÇÃO",
        text: "É vedada a sublocação, cessão ou transferência do imóvel sem autorização prévia e por escrito do(a) LOCADOR(A).",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DAS BENFEITORIAS",
        text: "O(A) LOCATÁRIO(A) não poderá fazer benfeitorias no imóvel sem autorização prévia e por escrito do(a) LOCADOR(A). As benfeitorias necessárias serão indenizáveis; as úteis dependerão de acordo; as voluptuárias não serão indenizadas.",
      },
      {
        type: "clause",
        number: "8ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_contrato_loc}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_contrato_loc}, {data_assinatura_loc}",
      },
      {
        type: "signatures",
        parties: [
          { role: "LOCADOR(A)", fieldKey: "locador_nome" },
          { role: "LOCATÁRIO(A)", fieldKey: "locatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    comercial: [
      {
        type: "title",
        text: "CONTRATO DE LOCAÇÃO COMERCIAL",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de contrato de locação, de um lado, como LOCADOR(A): {locador_nome}{?, , {locador_nacionalidade}}{?, , {locador_estado_civil}}{?, , {locador_profissao}}{?, , portador(a) do RG n.º {locador_rg} e }inscrito(a) no CPF sob n.º {locador_cpf}{?, , residente e domiciliado(a) em {locador_endereco}}{?, , {locador_cidade}}, e de outro lado, como LOCATÁRIO(A): {locatario_nome}{?, , {locatario_nacionalidade}}{?, , {locatario_estado_civil}}{?, , {locatario_profissao}}{?, , portador(a) do RG n.º {locatario_rg} e }inscrito(a) no CPF sob n.º {locatario_cpf}{?, , residente e domiciliado(a) em {locatario_endereco}}{?, , {locatario_cidade}}.",
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) LOCADOR(A) cede ao(à) LOCATÁRIO(A), em locação, o imóvel comercial do tipo {tipo_imovel_com} situado em {endereco_imovel_com}, {cidade_imovel_com}{?, , com área de {area_imovel_com}}.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PRAZO",
        text: "O prazo desta locação tem início em {prazo_inicio} e término em {prazo_fim}.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DO ALUGUEL",
        paragraphs: [
          "O aluguel mensal é de {valor_aluguel}, pagável até o dia {dia_vencimento} de cada mês.",
          "{?, Parágrafo único. O aluguel será reajustado anualmente pelo índice {indice_reajuste}.}",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA GARANTIA",
        text: "{?, Caução no valor de {valor_caucao}, a ser depositado e devolvido ao término do contrato, se não houver débitos.}",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA DESTINAÇÃO",
        text: "O imóvel será utilizado exclusivamente para a atividade de: {?, {finalidade_com}}. A mudança de atividade comercial dependerá de autorização prévia do(a) LOCADOR(A).",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA VEDAÇÃO DE CESSÃO",
        text: "É vedada a cessão, sublocação ou transferência do ponto comercial sem autorização prévia e por escrito do(a) LOCADOR(A), sob pena de rescisão contratual.",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_contrato_loc}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_contrato_loc}, {data_assinatura_loc}",
      },
      {
        type: "signatures",
        parties: [
          { role: "LOCADOR(A)", fieldKey: "locador_nome" },
          { role: "LOCATÁRIO(A)", fieldKey: "locatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default locacao;
