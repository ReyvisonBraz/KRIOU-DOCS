import { field, pessoaFisicaFields } from "./_shared.js";

const permuta = {
  id: "permuta",
  name: "Contrato de Permuta",
  description: "Troca de bens entre duas partes (imóvel por imóvel, veículo, etc.)",
  icon: "Repeat",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 533",

  defaultVariant: "geral",
  variants: [
    {
      id: "geral",
      name: "Permuta Geral",
      description: "Troca de bens de qualquer natureza",
      icon: "🔄",
    },
  ],

  commonSections: [
    {
      id: "permutante1",
      title: "Dados do Primeiro Permutante",
      subtitle: "Primeira parte da troca",
      icon: "user",
      fields: pessoaFisicaFields("permutante1", "Permutante"),
    },
    {
      id: "permutante2",
      title: "Dados do Segundo Permutante",
      subtitle: "Segunda parte da troca",
      icon: "user",
      fields: pessoaFisicaFields("permutante2", "Permutante"),
    },
    {
      id: "bens_permuta",
      title: "Bens da Permuta",
      subtitle: "O que cada parte está entregando",
      icon: "description",
      fields: [
        field("bem_permutante1", "Bem do Primeiro Permutante", "textarea", {
          required: true,
          placeholder: "Descreva o bem que o primeiro está entregando...",
          example:
            "Imóvel residencial na Rua X, nº 100, Matrícula 12.345, avaliado em R$ 300.000,00.",
          hint: "Descreva detalhadamente o bem que a primeira parte está entregando na troca. Inclua identificação (matrícula, placa, RENAVAM) e valor estimado.",
          whyImportant: "A descrição detalhada dos bens evita disputas futuras sobre o que foi trocado.",
        }),
        field("bem_permutante2", "Bem do Segundo Permutante", "textarea", {
          required: true,
          placeholder: "Descreva o bem que o segundo está entregando...",
          example:
            "Veículo Volkswagen Gol 2022, placa ABC-1D23, RENAVAM 00123456789, avaliado em R$ 65.000,00.",
          hint: "Descreva detalhadamente o bem que a segunda parte está entregando na troca.",
        }),
        field("torna", "Há Torna (Diferença em Dinheiro)?", "select", {
          required: false,
          options: ["Não", "Sim - Primeiro paga ao Segundo", "Sim - Segundo paga ao Primeiro"],
          hint: "'Torna' é o valor em dinheiro pago para compensar a diferença quando os bens trocados não têm o mesmo valor. Exemplo: se um imóvel vale R$ 300 mil e o outro R$ 250 mil, a torna seria R$ 50 mil pagos por quem ficou com o bem mais caro.",
          whyImportant: "Define quem paga a diferença e quanto, evitando conflitos após a troca.",
          whatHappensIfEmpty: "O contrato considerará que os bens têm valor equivalente, sem diferença a pagar.",
          disableable: true,
        }),
        field("valor_torna", "Valor da Torna", "money", {
          required: false,
          placeholder: "R$ 0,00",
          hint: "Valor da diferença que será paga em dinheiro para compensar o desequilíbrio de valores entre os bens.",
          whatHappensIfEmpty: "O contrato não mencionará valor de torna.",
          disableable: true,
        }),
      ],
    },
    {
      id: "assinatura_permuta",
      title: "Assinatura",
      icon: "calendar",
      fields: [
        field("cidade_permuta", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_permuta", "Data de Assinatura", "date", { required: true }),
      ],
    },
  ],

  variantSections: {
    geral: [],
  },

  clientNotes: [
    "Na permuta, as despesas de transferência são divididas igualmente, salvo acordo diferente.",
    "Se os bens tiverem valores diferentes, a diferença pode ser paga em dinheiro (torna).",
    "Permuta de imóveis exige escritura pública se o valor ultrapassar 30 salários mínimos.",
  ],

  internalNotes: [],

  documentBody: {
    geral: [
      {
        type: "title",
        text: "CONTRATO DE PERMUTA",
      },
      {
        type: "paragraph",
        text: "Entre as partes abaixo qualificadas: de um lado, {permutante1_nome}{?, , {permutante1_nacionalidade}}{?, , {permutante1_estado_civil}}{?, , {permutante1_profissao}}{?, , portador(a) do RG n.º {permutante1_rg} e }inscrito(a) no CPF sob n.º {permutante1_cpf}{?, , residente e domiciliado(a) em {permutante1_endereco}}{?, , {permutante1_cidade}}, doravante denominado(a) PRIMEIRO(A) PERMUTANTE,",
      },
      {
        type: "paragraph",
        text: "e de outro lado, {permutante2_nome}{?, , {permutante2_nacionalidade}}{?, , {permutante2_estado_civil}}{?, , {permutante2_profissao}}{?, , portador(a) do RG n.º {permutante2_rg} e }inscrito(a) no CPF sob n.º {permutante2_cpf}{?, , residente e domiciliado(a) em {permutante2_endereco}}{?, , {permutante2_cidade}}, doravante denominado(a) SEGUNDO(A) PERMUTANTE.",
      },
      {
        type: "paragraph",
        text: "As partes acima identificadas têm entre si justo e acertado o presente contrato de permuta, que será regulado pelas cláusulas e condições a seguir:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O presente contrato tem por finalidade a permuta dos bens abaixo descritos:",
          "PRIMEIRO(A) PERMUTANTE entrega: {bem_permutante1}.",
          "SEGUNDO(A) PERMUTANTE entrega: {bem_permutante2}.",
          "{?, Torna: {torna}, no valor de {valor_torna}.}",
          "§ 1º. Os permutantes declaram que são proprietários legítimos e possuidores a justo título dos bens descritos, encontrando-se estes livres e desembaraçados de qualquer ônus ou gravame.",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA PERMUTA E POSSE",
        paragraphs: [
          "Os permutantes, neste ato, ajustam a troca dos bens, transferindo reciprocamente, a partir de {data_permuta}, a posse e todos os direitos e deveres relacionados aos respectivos bens permutados.",
          "§ 1º. A partir desta data, taxas, encargos fiscais e quaisquer outros tributos incidentes sobre os bens permutados serão de responsabilidade dos seus novos proprietários.",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DAS BENFEITORIAS",
        text: "As benfeitorias eventualmente realizadas por qualquer dos permutantes até a efetiva data da transferência serão incorporadas ao bem, não gerando direito de indenização ou retenção, exceto se expressamente acordado em contrário.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DAS OBRIGAÇÕES DOS PERMUTANTES",
        paragraphs: [
          "Constituem obrigações dos permutantes:",
          "I — Entregar à outra parte o seu respectivo bem livre de qualquer débito;",
          "II — Informar à outra parte sobre fatos, ações ou medidas judiciais que afetem o bem;",
          "III — Fornecer, quando solicitado, os documentos necessários para o registro e transferência.",
        ],
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA SUCESSÃO",
        text: "Ocorrendo morte, insolvência ou falência de qualquer parte, os direitos e obrigações assumidos deverão ser preservados e respeitados pelos respectivos herdeiros, espólio e sucessores.",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DA CESSÃO DE DIREITOS",
        text: "Os permutantes não poderão ceder ou transferir os direitos decorrentes deste contrato sem o consentimento expresso da outra parte.",
      },
      {
        type: "clause",
        number: "7ª",
        title: "DA PENALIDADE",
        text: "O descumprimento de qualquer cláusula ou obrigação deste contrato por qualquer uma das partes acarretará rescisão imediata, sem prejuízo de ressarcimentos e indenizações por perdas e danos à parte inocente.",
      },
      {
        type: "clause",
        number: "8ª",
        title: "DA IRREVOGABILIDADE",
        text: "O presente contrato é celebrado em caráter irrevogável e irretratável, sendo livremente acordado e aceito pelos permutantes, que renunciam expressamente à faculdade de arrependimento prevista no art. 420 do Código Civil.",
      },
      {
        type: "clause",
        number: "9ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o Foro da Comarca de {cidade_permuta}, com renúncia a qualquer outro, por mais privilegiado que seja.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_permuta}, {data_permuta}",
      },
      {
        type: "signatures",
        parties: [
          { role: "PRIMEIRO(A) PERMUTANTE", fieldKey: "permutante1_nome" },
          { role: "SEGUNDO(A) PERMUTANTE", fieldKey: "permutante2_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default permuta;
