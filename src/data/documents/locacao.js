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
          hint: "Valor mensal do aluguel combinado. Não inclua condomínio ou IPTU — esses são informados separadamente.",
          whyImportant: "Define quanto o inquilino pagará por mês pelo uso do imóvel.",
        }),
        field("dia_vencimento", "Dia de Vencimento", "select", {
          required: true,
          options: ["1", "5", "10", "15", "20", "25", "30"],
          hint: "Dia do mês em que o aluguel deve ser pago. Os mais comuns são dia 5, 10 ou 15.",
        }),
        field("prazo_inicio", "Data de Início do Contrato", "date", {
          required: true,
          hint: "Data em que o contrato começa a valer. A partir desta data o inquilino pode usar o imóvel e começa a pagar aluguel.",
        }),
        field("prazo_fim", "Data de Término do Contrato", "date", {
          required: true,
          hint: "Data de encerramento do contrato. O mais comum é 12 meses (1 ano), 24 meses (2 anos) ou 30 meses (2 anos e meio). Contratos com 30+ meses dão direito à renovação automática.",
          whyImportant: "Contratos com prazo inferior a 30 meses não garantem ao inquilino o direito de renovação automática.",
        }),
        field("valor_caucao", "Valor da Caução", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 4.500,00 (3x o aluguel)",
          hint: "Caução é um valor dado como garantia, como um 'depósito de segurança'. Normalmente equivale a 3 meses de aluguel. Será devolvida ao final do contrato se não houver danos ao imóvel nem dívidas.",
          whereFind: "Combinado entre as partes. A lei permite no máximo 3 meses de aluguel como caução.",
          whyImportant: "Protege o proprietário contra danos ao imóvel ou inadimplência. É a garantia mais comum em contratos de aluguel.",
          whatHappensIfEmpty: "O contrato será gerado sem cláusula de caução. O proprietário pode exigir outra forma de garantia.",
          disableable: true,
        }),
        field("indice_reajuste", "Índice de Reajuste", "select", {
          required: false,
          options: ["IGP-M (FGV)", "IPCA (IBGE)", "INPC (IBGE)", "Outro"],
          hint: "'Índice de reajuste' é a referência usada para atualizar o aluguel a cada ano. O IGP-M (da FGV) e o IPCA (do IBGE) são os mais usados. Eles medem a inflação e evitam que o aluguel perca valor.",
          whyImportant: "Sem um índice definido, o reajuste pode gerar conflito entre as partes. O IGP-M é o padrão do mercado imobiliário.",
          whatHappensIfEmpty: "O contrato será gerado sem previsão de reajuste anual do aluguel.",
          disableable: true,
        }),
        field("valor_iptu", "Valor do IPTU", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 200,00/mês",
          hint: "IPTU é o imposto municipal sobre o imóvel. Pode ser pago pelo proprietário ou pelo inquilino, conforme combinado. Informe o valor mensal da parcela.",
          whereFind: "No carnê de IPTU enviado pela prefeitura ou consulte no site da prefeitura da cidade.",
          whatHappensIfEmpty: "O contrato não mencionará o IPTU. Por padrão, a Lei do Inquilinato atribui o IPTU ao proprietário, salvo acordo.",
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
          hint: "Cidade onde o contrato será assinado. Use o formato: Cidade, UF.",
        }),
        field("data_assinatura_loc", "Data de Assinatura", "date", {
          required: true,
          hint: "Data em que ambas as partes assinarão o contrato.",
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
            hint: "Endereço completo do imóvel, incluindo número e complemento (número do apartamento, bloco, etc.).",
          }),
          field("cidade_imovel_loc", "Cidade / UF", "text", {
            required: true,
            placeholder: "Cidade, UF",
            example: "São Paulo, SP",
          }),
          field("mobiliado", "Imóvel Mobiliado?", "select", {
            required: false,
            options: ["Não", "Sim - Totalmente", "Sim - Parcialmente"],
            hint: "Se o imóvel já tem móveis inclusos no aluguel (geladeira, fogão, cama, sofá, etc.). Se sim, é recomendável fazer um inventário fotografado.",
            whatHappensIfEmpty: "O contrato será gerado sem menção a mobília.",
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
            hint: "Selecione o tipo de imóvel comercial que será alugado.",
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
            hint: "Qual será o uso do imóvel pelo inquilino: loja, escritório, consultório, etc. Mudar a atividade sem autorização pode rescindir o contrato.",
            whatHappensIfEmpty: "O contrato não especificará a atividade. O uso ficará a critério do locatário.",
            disableable: true,
          }),
          field("area_imovel_com", "Área (m²)", "text", {
            required: false,
            placeholder: "Ex: 60,00",
            example: "60,00 m²",
            hint: "Área total do imóvel comercial em metros quadrados.",
            whatHappensIfEmpty: "O contrato não mencionará a metragem do imóvel.",
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
        text: "Por este instrumento particular de contrato de locação, de um lado, como LOCADOR(A): {locador_nome}{?, , {locador_nacionalidade}}{?, , {locador_estado_civil}}{?, , {locador_profissao}}{?, , portador(a) do RG n.º {locador_rg} e }inscrito(a) no CPF sob n.º {locador_cpf}{?, , residente e domiciliado(a) em {locador_endereco}}{?, , {locador_cidade}}, e de outro lado, como LOCATÁRIO(A): {locatario_nome}{?, , {locatario_nacionalidade}}{?, , {locatario_estado_civil}}{?, , {locatario_profissao}}{?, , portador(a) do RG n.º {locatario_rg} e }inscrito(a) no CPF sob n.º {locatario_cpf}{?, , residente e domiciliado(a) em {locatario_endereco}}{?, , {locatario_cidade}}, têm entre si justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) LOCADOR(A) cede ao(à) LOCATÁRIO(A), para fins exclusivos de moradia, o imóvel do tipo {tipo_imovel_loc} situado em {endereco_imovel_loc}, {cidade_imovel_loc}{?, , imóvel entregue {mobiliado}}.",
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
          "O aluguel mensal é de {valor_aluguel}, pagável até o dia {dia_vencimento} de cada mês, mediante recibo emitido pelo(a) LOCADOR(A) ou depósito em conta bancária de sua titularidade.",
          "{?, Parágrafo único. O aluguel será reajustado anualmente, na data de aniversário do contrato, pelo índice {indice_reajuste}, ou outro índice que venha a substituí-lo oficialmente.}",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA GARANTIA",
        text: "{?, A título de garantia locatícia, o(a) LOCATÁRIO(A) deposita neste ato a quantia de {valor_caucao} a título de caução, que será restituída ao término do contrato, após a vistoria do imóvel, desde que não haja débitos pendentes ou danos ao imóvel.}",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DAS DESPESAS",
        paragraphs: [
          "O(A) LOCATÁRIO(A) obriga-se a pagar pontualmente as contas de consumo próprio (água, energia elétrica, gás e condomínio, se houver) durante a vigência do contrato.",
          "{?, O IPTU, no valor mensal aproximado de {valor_iptu}, ficará a cargo do(a) LOCATÁRIO(A), conforme acordado entre as partes.}",
        ],
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA VEDAÇÃO DE SUBLOCAÇÃO",
        text: "É vedada a sublocação, cessão ou transferência total ou parcial do imóvel sem autorização prévia e por escrito do(a) LOCADOR(A), sob pena de rescisão imediata do contrato.",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DAS BENFEITORIAS",
        text: "O(A) LOCATÁRIO(A) não poderá realizar benfeitorias no imóvel sem autorização prévia e por escrito do(a) LOCADOR(A). As benfeitorias necessárias serão indenizáveis; as úteis dependerão de acordo prévio; as voluptuárias não serão indenizadas, podendo ser retiradas desde que não prejudiquem o imóvel.",
      },
      {
        type: "clause",
        number: "8ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o Foro da Comarca de {cidade_contrato_loc}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
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
        text: "Por este instrumento particular de contrato de locação, de um lado, como LOCADOR(A): {locador_nome}{?, , {locador_nacionalidade}}{?, , {locador_estado_civil}}{?, , {locador_profissao}}{?, , portador(a) do RG n.º {locador_rg} e }inscrito(a) no CPF sob n.º {locador_cpf}{?, , residente e domiciliado(a) em {locador_endereco}}{?, , {locador_cidade}}, e de outro lado, como LOCATÁRIO(A): {locatario_nome}{?, , {locatario_nacionalidade}}{?, , {locatario_estado_civil}}{?, , {locatario_profissao}}{?, , portador(a) do RG n.º {locatario_rg} e }inscrito(a) no CPF sob n.º {locatario_cpf}{?, , residente e domiciliado(a) em {locatario_endereco}}{?, , {locatario_cidade}}, têm entre si justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) LOCADOR(A) cede ao(à) LOCATÁRIO(A), em locação para uso comercial, o imóvel do tipo {tipo_imovel_com} situado em {endereco_imovel_com}, {cidade_imovel_com}{?, , com área aproximada de {area_imovel_com}}.",
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
          "{?, Parágrafo único. O aluguel será reajustado anualmente pelo índice {indice_reajuste}, ou por outro índice que venha a substituí-lo oficialmente.}",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA GARANTIA",
        text: "{?, A título de garantia locatícia, o(a) LOCATÁRIO(A) deposita neste ato a quantia de {valor_caucao} a título de caução, a ser restituída ao término do contrato, após a vistoria do imóvel, desde que não existam débitos pendentes.}",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA DESTINAÇÃO",
        text: "O imóvel será utilizado exclusivamente para atividade comercial{?, de {finalidade_com}}. A mudança de atividade comercial dependerá de autorização prévia e por escrito do(a) LOCADOR(A).",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA VEDAÇÃO DE CESSÃO",
        text: "É vedada a cessão, sublocação ou transferência do ponto comercial sem autorização prévia e por escrito do(a) LOCADOR(A), sob pena de rescisão contratual imediata.",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios, as partes elegem o Foro da Comarca de {cidade_contrato_loc}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
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
