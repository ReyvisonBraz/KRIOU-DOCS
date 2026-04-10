import { field, pessoaFisicaFields } from "./_shared.js";

// Parágrafo de abertura reutilizado nas duas variantes
// Usa {?, portador(a) do RG n.º {chave} e } para remover TODA a frase do RG quando ausente
const abrirParteComodato = (prefixo, rotulo) =>
  `{${prefixo}_nome}{?, , {${prefixo}_nacionalidade}}{?, , {${prefixo}_estado_civil}}{?, , {${prefixo}_profissao}}{?, , portador(a) do RG n.º {${prefixo}_rg} e }inscrito(a) no CPF sob n.º {${prefixo}_cpf}{?, , residente e domiciliado(a) em {${prefixo}_endereco}}{?, , {${prefixo}_cidade}}`;

const comodato = {
  id: "comodato",
  name: "Contrato de Comodato",
  description: "Empréstimo gratuito de bem (imóvel, veículo, equipamento)",
  icon: "FileText",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 579 a 585",

  defaultVariant: "imovel",
  variants: [
    {
      id: "imovel",
      name: "Imóvel",
      description: "Empréstimo gratuito de imóvel para uso temporário",
      icon: "🏠",
    },
    {
      id: "rural",
      name: "Rural / Parceria",
      description: "Empréstimo de propriedade rural com parceria agrícola",
      icon: "🌾",
    },
  ],

  commonSections: [
    {
      id: "comodante",
      title: "Dados do Comodante (Quem empresta)",
      subtitle: "Proprietário do bem que será emprestado",
      icon: "user",
      fields: pessoaFisicaFields("comodante", "Comodante"),
    },
    {
      id: "comodatario",
      title: "Dados do Comodatário (Quem recebe)",
      subtitle: "Quem vai usar o bem emprestado",
      icon: "user",
      fields: pessoaFisicaFields("comodatario", "Comodatário"),
    },
    {
      id: "prazo_comodato",
      title: "Prazo e Condições",
      icon: "calendar",
      fields: [
        field("prazo_inicio_com", "Data de Início", "date", { required: true }),
        field("prazo_fim_com", "Data de Término", "date", { required: true }),
        field("cidade_comodato", "Cidade do Contrato", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_assinatura_com", "Data de Assinatura", "date", { required: true }),
      ],
    },
  ],

  variantSections: {
    imovel: [
      {
        id: "bem_comodato_imovel",
        title: "Dados do Imóvel Emprestado",
        icon: "building",
        fields: [
          field("endereco_comodato", "Endereço do Imóvel", "text", {
            required: true,
            placeholder: "Endereço completo",
            example: "Rua das Flores, 100, Centro, São Paulo/SP",
          }),
          field("finalidade_comodato", "Finalidade de Uso", "select", {
            required: true,
            options: ["Moradia", "Comércio", "Depósito", "Outro"],
            hint: "Para que o imóvel será utilizado.",
          }),
        ],
      },
    ],
    rural: [
      {
        id: "bem_comodato_rural",
        title: "Dados da Propriedade Rural",
        icon: "location",
        fields: [
          field("localizacao_rural", "Localização da Propriedade", "text", {
            required: true,
            placeholder: "Endereço ou localização rural",
            example: "Fazenda Boa Vista, Zona Rural, Campinas/SP",
          }),
          field("area_rural", "Área (hectares)", "text", {
            required: true,
            placeholder: "Ex: 10 hectares",
            example: "10 hectares",
          }),
          field("tipo_atividade_rural", "Tipo de Atividade", "select", {
            required: true,
            options: ["Agricultura", "Pecuária", "Mista", "Outra"],
          }),
          field("percentual_parceria", "Percentual da Parceria", "text", {
            required: false,
            placeholder: "Ex: 50% para cada parte",
            example: "50% para o proprietário, 50% para o parceiro",
            hint: "Como será dividida a produção entre as partes.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Comodato é empréstimo GRATUITO. Se houver pagamento, torna-se locação.",
    "O comodatário deve devolver o bem nas mesmas condições em que recebeu.",
    "O proprietário pode pedir o bem de volta a qualquer momento em caso de necessidade urgente.",
  ],

  internalNotes: [
    "Para parceria rural: atentar para não configurar vínculo empregatício",
  ],

  documentBody: {
    imovel: [
      {
        type: "title",
        text: "CONTRATO DE COMODATO DE IMÓVEL",
      },
      {
        type: "paragraph",
        text: `Por este instrumento particular, de um lado, como COMODANTE: ${abrirParteComodato("comodante", "")}, e de outro lado, como COMODATÁRIO(A): ${abrirParteComodato("comodatario", "")}, têm entre si como justo e acordado o que segue, que se obrigam a cumprir por si e seus sucessores:`,
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) COMODANTE, na qualidade de legítimo(a) proprietário(a) do imóvel situado em {endereco_comodato}, cede e transfere referido bem ao(à) COMODATÁRIO(A), gratuitamente, a título de comodato, para fins de {finalidade_comodato}.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PRAZO",
        text: "O prazo de vigência deste contrato será com início em {prazo_inicio_com} e término em {prazo_fim_com}, data em que o(a) COMODATÁRIO(A) deverá restituir o imóvel acima especificado nas mesmas condições em que ora o recebe, independentemente de qualquer notificação.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA CONSERVAÇÃO",
        text: "O(A) COMODATÁRIO(A) se obriga a zelar pela conservação do imóvel que lhe é cedido em comodato, responsabilizando-se por todos os custos com a manutenção do mesmo. Os danos advindos do mau uso ou negligência na sua conservação serão suportados pelo(a) COMODATÁRIO(A), que arcará com todas as despesas para a devida recuperação do bem.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA VEDAÇÃO DE CESSÃO",
        text: "É vedado ao(à) COMODATÁRIO(A) sub-comodatar ou locar o bem objeto deste instrumento a terceiros, bem como ceder ou transferir o presente contrato sem prévia autorização, por escrito, do(a) COMODANTE.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA RESPONSABILIDADE",
        text: "O(A) COMODATÁRIO(A), durante a vigência deste instrumento, responsabilizar-se-á perante terceiros por danos decorrentes de eventuais acidentes que envolvam as instalações, edificações, muros e outras benfeitorias agregadas ao imóvel, independentemente de ter ou não contratado seguro para tal fim.",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA TURBAÇÃO E ESBULHO",
        text: "Em caso de turbação ou esbulho da posse do bem por atos de terceiros, o(a) COMODATÁRIO(A) deverá tomar as providências cabíveis a fim de cessar tais atos, bem como comunicar imediatamente tais fatos ao(à) COMODANTE.",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DA RESCISÃO",
        text: "O presente instrumento será considerado rescindido de pleno direito em caso de infração, por parte do(a) COMODATÁRIO(A), de qualquer cláusula acordada, assegurado ao(à) COMODANTE o direito de rescindir, unilateralmente, o contrato, mediante simples comunicação, independentemente de aviso judicial ou extrajudicial.",
      },
      {
        type: "clause",
        number: "8ª",
        title: "DA TOLERÂNCIA",
        text: "Qualquer tolerância ou concessão das partes quanto ao cumprimento do disposto neste contrato constituir-se-á ato de mera liberalidade, não podendo ser considerado novação.",
      },
      {
        type: "clause",
        number: "9ª",
        title: "DO FORO",
        text: "As partes elegem o Foro da Comarca de {cidade_comodato} para dirimir eventuais litígios decorrentes deste contrato.",
      },
      {
        type: "closing",
        text: "E assim, por estarem justas e contratadas, as partes assinam o presente em 2 (duas) vias de igual teor, juntamente com as duas testemunhas abaixo.",
      },
      {
        type: "date",
        text: "{cidade_comodato}, {data_assinatura_com}",
      },
      {
        type: "signatures",
        parties: [
          { role: "COMODANTE", fieldKey: "comodante_nome" },
          { role: "COMODATÁRIO(A)", fieldKey: "comodatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    rural: [
      {
        type: "title",
        text: "CONTRATO DE COMODATO RURAL — PARCERIA AGRÍCOLA",
      },
      {
        type: "paragraph",
        text: `Por este instrumento particular, de um lado, como COMODANTE: ${abrirParteComodato("comodante", "")}, proprietário(a) do imóvel rural abaixo descrito, e de outro lado, como COMODATÁRIO(A): ${abrirParteComodato("comodatario", "")}.`,
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        text: "O(A) COMODANTE cede ao(à) COMODATÁRIO(A), gratuitamente, a título de comodato rural, a propriedade localizada em {localizacao_rural}, com área total de {area_rural}.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA DESTINAÇÃO",
        text: "O imóvel será utilizado exclusivamente para fins de {tipo_atividade_rural}.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DO PRAZO",
        text: "O prazo deste contrato terá início em {prazo_inicio_com} e término em {prazo_fim_com}.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA PARCERIA",
        text: "As partes acordam a seguinte divisão de produção: {percentual_parceria}. A partilha será feita após a colheita.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DAS OBRIGAÇÕES DO COMODATÁRIO",
        paragraphs: [
          "I — Cultivar o imóvel com zelo e diligência;",
          "II — Não submeter o imóvel a uso diverso do pactuado;",
          "III — Respeitar as normas ambientais vigentes;",
          "IV — Pagar as despesas de cultivo e produção;",
          "V — Restituir o imóvel em plenas condições de uso ao término do contrato.",
        ],
      },
      {
        type: "clause",
        number: "6ª",
        title: "DAS OBRIGAÇÕES DO COMODANTE",
        paragraphs: [
          "I — Entregar o imóvel em condições de uso;",
          "II — Não interferir nas atividades de cultivo;",
          "III — Respeitar o prazo pactuado.",
        ],
      },
      {
        type: "clause",
        number: "7ª",
        title: "DAS BENFEITORIAS",
        text: "As benfeitorias necessárias realizadas pelo(a) COMODATÁRIO(A) serão indenizadas. As benfeitorias úteis dependem de autorização prévia por escrito do(a) COMODANTE. As voluptuárias não serão indenizadas.",
      },
      {
        type: "clause",
        number: "8ª",
        title: "DA RESCISÃO",
        paragraphs: [
          "O contrato poderá ser rescindido:",
          "I — Por inadimplemento de qualquer das partes;",
          "II — Por acordo mútuo;",
          "III — Por motivo de força maior.",
        ],
      },
      {
        type: "clause",
        number: "9ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_comodato}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_comodato}, {data_assinatura_com}",
      },
      {
        type: "signatures",
        parties: [
          { role: "COMODANTE (Proprietário)", fieldKey: "comodante_nome" },
          { role: "COMODATÁRIO (Parceiro)", fieldKey: "comodatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default comodato;
