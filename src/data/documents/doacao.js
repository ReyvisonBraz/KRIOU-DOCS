import { field, pessoaFisicaFields } from "./_shared.js";

const doacao = {
  id: "doacao",
  name: "Contrato de Doação",
  description: "Transferência gratuita de bens entre pessoas",
  icon: "Gift",
  available: true,
  legislation: "Código Civil Brasileiro, Arts. 538 a 564",

  defaultVariant: "simples",
  variants: [
    {
      id: "simples",
      name: "Doação Simples",
      description: "Transferência de bem sem condições especiais",
      icon: "🎁",
    },
    {
      id: "usufruto",
      name: "Doação com Usufruto",
      description: "Doa o bem mas mantém o direito de usar enquanto viver",
      icon: "🏠",
    },
    {
      id: "reversao",
      name: "Doação com Reversão",
      description: "Se o donatário falecer, o bem volta ao doador",
      icon: "🔄",
    },
  ],

  commonSections: [
    {
      id: "doador",
      title: "Dados do Doador",
      subtitle: "Quem está doando o bem",
      icon: "user",
      fields: pessoaFisicaFields("doador", "Doador"),
    },
    {
      id: "donatario",
      title: "Dados do Donatário",
      subtitle: "Quem vai receber o bem doado",
      icon: "user",
      fields: pessoaFisicaFields("donatario", "Donatário"),
    },
    {
      id: "bem_doado",
      title: "Descrição do Bem Doado",
      subtitle: "O que está sendo doado",
      icon: "description",
      fields: [
        field("tipo_bem_doacao", "Tipo de Bem", "select", {
          required: true,
          options: ["Imóvel (Casa/Apartamento)", "Terreno", "Veículo", "Dinheiro", "Outro"],
          hint: "Qual tipo de bem está sendo doado.",
        }),
        field("descricao_bem_doacao", "Descrição do Bem", "textarea", {
          required: true,
          placeholder: "Descreva detalhadamente o bem doado...",
          example:
            "Imóvel residencial localizado na Rua das Flores, 100, Matrícula nº 12.345 do 1º CRI de São Paulo.",
          hint: "Descreva com detalhes o bem, incluindo identificação (matrícula, placa, etc.).",
        }),
        field("valor_estimado_doacao", "Valor Estimado do Bem", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 300.000,00",
          hint: "Valor de mercado estimado do bem. Necessário para cálculo do ITCMD (imposto sobre doação).",
          disableable: true,
        }),
      ],
    },
    {
      id: "assinatura_doacao",
      title: "Assinatura",
      subtitle: "Local e data",
      icon: "calendar",
      fields: [
        field("cidade_doacao", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
        }),
        field("data_doacao", "Data de Assinatura", "date", {
          required: true,
        }),
      ],
    },
  ],

  variantSections: {
    simples: [],
    usufruto: [
      {
        id: "clausula_usufruto",
        title: "Cláusula de Usufruto",
        subtitle: "O doador mantém o direito de uso do bem",
        icon: "description",
        fields: [
          field("tipo_usufruto", "Tipo de Usufruto", "select", {
            required: true,
            options: ["Vitalício (até o falecimento do doador)", "Por prazo determinado"],
            hint: "Vitalício: o doador usa o bem enquanto viver. Por prazo: por tempo definido.",
          }),
          field("prazo_usufruto", "Prazo do Usufruto (se determinado)", "text", {
            required: false,
            placeholder: "Ex: 10 anos",
            example: "10 anos a partir da data da doação",
            hint: "Só preencha se escolheu 'Por prazo determinado' acima.",
            disableable: true,
          }),
        ],
      },
    ],
    reversao: [
      {
        id: "clausula_reversao",
        title: "Cláusula de Reversão",
        subtitle: "O bem volta ao doador se o donatário falecer primeiro",
        icon: "description",
        fields: [
          field("condicao_reversao", "Condição de Reversão", "select", {
            required: true,
            options: [
              "Falecimento do donatário antes do doador",
              "Falecimento do donatário sem herdeiros",
              "Outra condição",
            ],
            hint: "Em qual situação o bem retorna ao doador.",
          }),
          field("condicao_reversao_desc", "Descrição da Condição (se outra)", "textarea", {
            required: false,
            placeholder: "Descreva a condição personalizada...",
            hint: "Só preencha se escolheu 'Outra condição' acima.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Doação de imóvel acima de determinado valor exige escritura pública (cartório).",
    "A doação está sujeita ao imposto ITCMD (varia por estado, geralmente 4% a 8%).",
    "Doação com usufruto: você doa, mas continua morando/usando o bem.",
    "Doação pode ser anulada por ingratidão do donatário (art. 557 do Código Civil).",
  ],

  internalNotes: [
    "Verificar isenção de ITCMD conforme legislação estadual",
    "Para imóveis: exigir escritura pública se valor acima do limite legal",
  ],

  documentBody: {
    simples: [
      {
        type: "title",
        text: "CONTRATO DE DOAÇÃO",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de DOAÇÃO, de um lado, como DOADOR(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?, , residente e domiciliado(a) em {doador_endereco}}{?, , {doador_cidade}}, e de outro lado, como DONATÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?, , residente e domiciliado(a) em {donatario_endereco}}{?, , {donatario_cidade}}.",
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação pura e simples, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, Valor estimado do bem: {valor_estimado_doacao}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA ACEITAÇÃO",
        text: "O(A) DONATÁRIO(A) aceita a doação feita pelo(a) DOADOR(A), declarando receber o bem no estado em que se encontra.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA IRRETRATABILIDADE",
        text: "A presente doação é irretratável e irrevogável, conforme art. 548 do Código Civil Brasileiro.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA RESPONSABILIDADE",
        text: "O(A) DONATÁRIO(A) responde pelos ônus e despesas do bem a partir da data de assinatura deste instrumento.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_doacao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_doacao}, {data_doacao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "DOADOR(A)", fieldKey: "doador_nome" },
          { role: "DONATÁRIO(A)", fieldKey: "donatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    usufruto: [
      {
        type: "title",
        text: "CONTRATO DE DOAÇÃO COM RESERVA DE USUFRUTO",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de DOAÇÃO COM RESERVA DE USUFRUTO, de um lado, como DOADOR(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?, , residente e domiciliado(a) em {doador_endereco}}{?, , {doador_cidade}}, e de outro lado, como DONATÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?, , residente e domiciliado(a) em {donatario_endereco}}{?, , {donatario_cidade}}.",
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, Valor estimado do bem: {valor_estimado_doacao}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA RESERVA DE USUFRUTO",
        text: "O(A) DOADOR(A) reserva para si o usufruto {tipo_usufruto} do bem acima descrito{?, , pelo prazo de {prazo_usufruto}}, mantendo o direito de usar, gozar e fruir do bem durante o período de usufruto.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA ACEITAÇÃO",
        text: "O(A) DONATÁRIO(A) aceita a doação com a reserva de usufruto, declarando receber o bem na condição descrita.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA IRRETRATABILIDADE",
        text: "A presente doação é irretratável e irrevogável, conforme art. 548 do Código Civil Brasileiro.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA RESPONSABILIDADE",
        text: "As despesas ordinárias de conservação do bem ficam a cargo do(a) DOADOR(A) usufrutuário(a), enquanto durar o usufruto. As despesas extraordinárias ficam a cargo do(a) DONATÁRIO(A) nu-proprietário(a).",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_doacao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_doacao}, {data_doacao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "DOADOR(A) / Usufrutuário(a)", fieldKey: "doador_nome" },
          { role: "DONATÁRIO(A) / Nu-proprietário(a)", fieldKey: "donatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    reversao: [
      {
        type: "title",
        text: "CONTRATO DE DOAÇÃO COM CLÁUSULA DE REVERSÃO",
      },
      {
        type: "paragraph",
        text: "Por este instrumento particular de DOAÇÃO COM CLÁUSULA DE REVERSÃO, de um lado, como DOADOR(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?, , residente e domiciliado(a) em {doador_endereco}}{?, , {doador_cidade}}, e de outro lado, como DONATÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?, , residente e domiciliado(a) em {donatario_endereco}}{?, , {donatario_cidade}}.",
      },
      {
        type: "paragraph",
        text: "As partes têm entre si, justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, Valor estimado do bem: {valor_estimado_doacao}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA CLÁUSULA DE REVERSÃO",
        paragraphs: [
          "A presente doação fica sujeita à cláusula de reversão na hipótese de: {condicao_reversao}.",
          "{?, Descrição da condição: {condicao_reversao_desc}.}",
          "Verificada a condição de reversão, o bem voltará ao patrimônio do(a) DOADOR(A) ou de seus herdeiros, conforme art. 547 do Código Civil.",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA ACEITAÇÃO",
        text: "O(A) DONATÁRIO(A) aceita a doação com a cláusula de reversão, declarando estar ciente de suas condições.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA IRRETRATABILIDADE",
        text: "Excetuada a hipótese de reversão prevista neste instrumento, a doação é irretratável e irrevogável.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA RESPONSABILIDADE",
        text: "O(A) DONATÁRIO(A) responde pelos ônus e despesas do bem a partir da data de assinatura deste instrumento.",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_doacao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_doacao}, {data_doacao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "DOADOR(A)", fieldKey: "doador_nome" },
          { role: "DONATÁRIO(A)", fieldKey: "donatario_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default doacao;
