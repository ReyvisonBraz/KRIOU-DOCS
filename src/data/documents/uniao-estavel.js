import { field, pessoaFisicaFields } from "./_shared.js";

const uniaoEstavel = {
  id: "uniao-estavel",
  name: "União Estável",
  description: "Declaração ou dissolução de união estável entre companheiros",
  icon: "Heart",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 1.723 a 1.727",

  defaultVariant: "declaracao",
  variants: [
    {
      id: "declaracao",
      name: "Declaração de União Estável",
      description: "Formalizar a convivência como casal",
      icon: "💍",
    },
    {
      id: "dissolucao",
      name: "Dissolução de União Estável",
      description: "Encerrar formalmente a união estável",
      icon: "📋",
    },
  ],

  commonSections: [
    {
      id: "companheiro1",
      title: "Dados do Primeiro Companheiro(a)",
      subtitle: "Primeiro membro do casal",
      icon: "user",
      fields: pessoaFisicaFields("companheiro1", "Companheiro(a)"),
    },
    {
      id: "companheiro2",
      title: "Dados do Segundo Companheiro(a)",
      subtitle: "Segundo membro do casal",
      icon: "user",
      fields: pessoaFisicaFields("companheiro2", "Companheiro(a)"),
    },
    {
      id: "assinatura_uniao",
      title: "Assinatura",
      icon: "calendar",
      fields: [
        field("cidade_uniao", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_uniao", "Data de Assinatura", "date", { required: true }),
      ],
    },
  ],

  variantSections: {
    declaracao: [
      {
        id: "dados_uniao",
        title: "Dados da União",
        subtitle: "Informações sobre a convivência",
        icon: "description",
        fields: [
          field("data_inicio_uniao", "Data de Início da Convivência", "date", {
            required: true,
            hint: "Data em que o casal começou a viver junto como se casados fossem. Não precisa ser exata — pode ser uma data aproximada.",
            whyImportant: "Define o início da união estável para fins de direitos patrimoniais e previdenciários.",
          }),
          field("regime_bens", "Regime de Bens", "select", {
            required: true,
            options: [
              "Comunhão Parcial de Bens",
              "Comunhão Universal de Bens",
              "Separação Total de Bens",
            ],
            hint: "Define como os bens do casal serão tratados:\n• Comunhão Parcial (mais comum): o que cada um tinha antes fica separado; o que comprarem juntos durante a união pertence aos dois.\n• Comunhão Universal: tudo é de ambos, inclusive o que tinham antes.\n• Separação Total: cada um é dono do que é seu, mesmo durante a união.",
            whyImportant: "O regime de bens determina como o patrimônio será dividido em caso de separação ou falecimento. É uma das decisões mais importantes do contrato.",
          }),
          field("endereco_residencia", "Endereço de Residência do Casal", "text", {
            required: false,
            placeholder: "Endereço onde moram juntos",
            example: "Rua das Palmeiras, 456, São Paulo/SP",
            hint: "Endereço onde o casal reside em conjunto. Ajuda a comprovar a convivência.",
            whatHappensIfEmpty: "O contrato será gerado sem o endereço de residência conjunta.",
            disableable: true,
          }),
          field("filhos_uniao", "Possuem Filhos em Comum?", "select", {
            required: false,
            options: ["Não", "Sim"],
            hint: "Se o casal possui filhos biológicos ou adotivos em comum.",
            whatHappensIfEmpty: "O contrato não mencionará filhos.",
            disableable: true,
          }),
        ],
      },
    ],
    dissolucao: [
      {
        id: "dados_dissolucao",
        title: "Dados da Dissolução",
        subtitle: "Informações sobre o fim da união",
        icon: "description",
        fields: [
          field("data_inicio_uniao_diss", "Data de Início da União", "date", {
            required: true,
            hint: "Quando a união estável começou. Use a data aproximada em que passaram a conviver.",
          }),
          field("data_fim_uniao", "Data de Fim da Convivência", "date", {
            required: true,
            hint: "Data em que a convivência foi encerrada, ou seja, quando pararam de viver juntos.",
          }),
          field("motivo_dissolucao", "Motivo", "select", {
            required: false,
            options: ["Consensual (ambos concordam)", "Litigiosa (há discordância)"],
            hint: "'Consensual' = ambos concordam em terminar. 'Litigiosa' = há desacordos que podem precisar de um juiz para resolver. Se for litigiosa com filhos menores, será necessário um advogado.",
            whatHappensIfEmpty: "O contrato não especificará o motivo da dissolução.",
            disableable: true,
          }),
          field("partilha_bens", "Houve Partilha de Bens?", "select", {
            required: false,
            options: ["Não há bens a partilhar", "Sim - Amigável", "Sim - Judicial"],
            hint: "'Partilha' é a divisão dos bens adquiridos durante a união. 'Amigável' = ambos concordam com a divisão. 'Judicial' = um juiz decide como dividir.",
            whatHappensIfEmpty: "O contrato não detalhará a partilha de bens.",
            disableable: true,
          }),
          field("descricao_partilha", "Descrição da Partilha", "textarea", {
            required: false,
            placeholder: "Descreva como os bens serão divididos...",
            example:
              "O imóvel localizado na Rua X ficará com o companheiro A. O veículo placa XYZ ficará com o companheiro B.",
            hint: "Detalhe quais bens ficam com cada parte: imóveis, veículos, contas bancárias, eletrodomésticos, etc.",
            whyImportant: "Sem uma descrição clara da partilha, podem surgir conflitos futuros sobre a propriedade dos bens.",
            whatHappensIfEmpty: "O contrato será gerado sem detalhes de partilha.",
            disableable: true,
          }),
          field("pensao_alimenticia", "Haverá Pensão Alimentícia?", "select", {
            required: false,
            options: ["Não", "Sim - Para companheiro(a)", "Sim - Para filhos", "Sim - Para ambos"],
            hint: "'Pensão alimentícia' é um valor mensal que uma parte paga à outra (ou aos filhos) para garantir a subsistência. Pode ser acordada ou definida por juiz.",
            whatHappensIfEmpty: "O contrato declarará que ambas as partes renunciam à pensão alimentícia entre si.",
            disableable: true,
          }),
          field("valor_pensao", "Valor da Pensão", "money", {
            required: false,
            placeholder: "R$ 0,00",
            hint: "Valor mensal da pensão alimentícia combinada entre as partes.",
            whatHappensIfEmpty: "O contrato não mencionará valor de pensão.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "A união estável pode ser registrada em cartório para ter mais segurança jurídica.",
    "O regime de bens pode ser alterado mediante acordo entre as partes e escritura pública.",
    "Na dissolução consensual, ambas as partes devem concordar com todos os termos.",
  ],

  internalNotes: [
    "Se houver filhos menores, a dissolução deve ser judicial (homologação pelo juiz)",
  ],

  documentBody: {
    declaracao: [
      {
        type: "title",
        text: "CONTRATO DE UNIÃO ESTÁVEL",
      },
      {
        type: "paragraph",
        text: "Este instrumento particular de união estável tem de um lado {companheiro1_nome}{?, , {companheiro1_nacionalidade}}{?, , {companheiro1_estado_civil}}{?, , {companheiro1_profissao}}{?, , portador(a) do RG n.º {companheiro1_rg} e }inscrito(a) no CPF sob n.º {companheiro1_cpf}{?any, , residente e domiciliado(a) em {companheiro1_endereco?}, {companheiro1_cidade?}}, doravante denominado(a) PRIMEIRO(A) CONVIVENTE,",
      },
      {
        type: "paragraph",
        text: "e de outro lado {companheiro2_nome}{?, , {companheiro2_nacionalidade}}{?, , {companheiro2_estado_civil}}{?, , {companheiro2_profissao}}{?, , portador(a) do RG n.º {companheiro2_rg} e }inscrito(a) no CPF sob n.º {companheiro2_cpf}{?any, , residente e domiciliado(a) em {companheiro2_endereco?}, {companheiro2_cidade?}}, doravante denominado(a) SEGUNDO(A) CONVIVENTE.",
      },
      {
        type: "paragraph",
        text: "Em conjunto denominados partes, ambos signatários, maiores e capazes, firmam entre si o presente contrato de união estável que será regulado pelas cláusulas e condições a seguir estabelecidas.",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO TERMO",
        text: "As partes declaram para todos os fins legais e a quem possa interessar, que mantêm um relacionamento estável, público, contínuo, duradouro e com o objetivo de constituição de família desde {data_inicio_uniao}{?, , com residência em {endereco_residencia}}, caracterizando, portanto, união estável, prevista nos artigos 1.723 a 1.727 do Código Civil e na Lei n.º 9.278/96.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PRAZO",
        text: "A duração do presente contrato é de prazo indeterminado, e durante sua vigência deverá ser observado entre as partes o completo respeito e fidelidade, um para com outro, bem como a observância de todos os afazeres e cuidados exigidos para uma sólida e perfeita convivência.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DO REGIME DE BENS",
        paragraphs: [
          "Esta relação será regida pelo regime de {regime_bens}, de modo que os bens adquiridos pelas partes durante a vigência da união serão tratados conforme as disposições legais do referido regime.",
          "§ 1º. Não haverá comunhão patrimonial entre as partes quanto aos bens e direitos adquiridos a título gratuito e os sub-rogados em seu lugar.",
          "§ 2º. Todos os bens e direitos particulares de cada parte, adquiridos antes deste instrumento, não se comunicarão com os bens adquiridos na vigência da presente união.",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DOS DEVERES",
        paragraphs: [
          "As partes, reciprocamente, concordam e se obrigam a ter a união que aqui se estipula respaldada na lealdade, fidelidade, respeito, assistência e, ainda, na guarda, sustento e educação dos filhos.",
          "{?, § 1º. As partes declaram que possuem filhos em comum: {filhos_uniao}.}",
          "§ 2º. As partes indicam mutuamente, um em relação ao outro, como a pessoa de confiança para manter-se no hospital como acompanhante, ao seu lado, em caso de impossibilidade de manifestar a própria vontade.",
        ],
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA AUSÊNCIA DE IMPEDIMENTOS",
        text: "Ao assinarem o presente instrumento, as partes afirmam não possuírem quaisquer dos impedimentos previstos no Direito brasileiro para a constituição de união estável, nos termos do art. 1.723 do Código Civil.",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA EXTINÇÃO DO CONTRATO",
        paragraphs: [
          "As partes, de comum acordo, estabelecem que quando um deles, ou ambos, não mais desejar a permanência da união, impõe-se a obrigação de distratar amigavelmente o presente contrato, preferencialmente pela via extrajudicial.",
          "§ 1º. A união também será considerada extinta com o falecimento de uma das partes ou pela vontade de qualquer uma das partes.",
        ],
      },
      {
        type: "clause",
        number: "7ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios oriundos do presente contrato, as partes elegem o Foro da Comarca de {cidade_uniao}, com renúncia a qualquer outro, por mais privilegiado que seja.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_uniao}, {data_uniao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "PRIMEIRO(A) CONVIVENTE", fieldKey: "companheiro1_nome" },
          { role: "SEGUNDO(A) CONVIVENTE", fieldKey: "companheiro2_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    dissolucao: [
      {
        type: "title",
        text: "DECLARAÇÃO DE DISSOLUÇÃO DE UNIÃO ESTÁVEL",
      },
      {
        type: "paragraph",
        text: "Este instrumento particular de dissolução de União Estável tem de um lado {companheiro1_nome}{?, , {companheiro1_nacionalidade}}{?, , {companheiro1_estado_civil}}{?, , {companheiro1_profissao}}{?, , portador(a) do RG n.º {companheiro1_rg} e }inscrito(a) no CPF sob n.º {companheiro1_cpf}{?any, , residente e domiciliado(a) em {companheiro1_endereco?}, {companheiro1_cidade?}}, doravante denominado(a) PRIMEIRA PARTE,",
      },
      {
        type: "paragraph",
        text: "e de outro lado {companheiro2_nome}{?, , {companheiro2_nacionalidade}}{?, , {companheiro2_estado_civil}}{?, , {companheiro2_profissao}}{?, , portador(a) do RG n.º {companheiro2_rg} e }inscrito(a) no CPF sob n.º {companheiro2_cpf}{?any, , residente e domiciliado(a) em {companheiro2_endereco?}, {companheiro2_cidade?}}, doravante denominado(a) SEGUNDA PARTE.",
      },
      {
        type: "paragraph",
        text: "Em conjunto denominados partes, ambos signatários, maiores e capazes, acordam livremente entre si a presente declaração de dissolução de união estável.",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DA UNIÃO ESTÁVEL",
        text: "As partes declaram para todos os fins legais que mantiveram uma relação de convivência pública e contínua desde {data_inicio_uniao_diss}, caracterizada como união estável nos termos dos artigos 1.723 a 1.727 do Código Civil, e decidiram, de livre e espontânea vontade, encerrar a convivência na data de {data_fim_uniao}{?, , sendo a dissolução de natureza {motivo_dissolucao}}.",
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA AUSÊNCIA DE IMPEDIMENTOS",
        text: "As partes declaram que não existem interesses de incapazes que dependam de intervenção judicial, nem qualquer outro litígio que impeça a presente dissolução extrajudicial.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA PARTILHA DE BENS",
        paragraphs: [
          "{?, Situação da partilha: {partilha_bens}.}",
          "{?, Descrição da partilha acordada entre as partes: {descricao_partilha}.}",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DOS ALIMENTOS",
        paragraphs: [
          "{?, As partes acordam pensão alimentícia: {pensao_alimenticia}{?, , no valor mensal de {valor_pensao}}.}",
          "As partes que não pleiteiam pensão alimentícia declaram ter plenas condições de prover a própria subsistência, renunciando expressamente ao direito de pleitear alimentos uma da outra.",
        ],
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas oriundas da presente declaração, as partes elegem o Foro da Comarca de {cidade_uniao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e acordadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_uniao}, {data_uniao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "PRIMEIRA PARTE", fieldKey: "companheiro1_nome" },
          { role: "SEGUNDA PARTE", fieldKey: "companheiro2_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default uniaoEstavel;
