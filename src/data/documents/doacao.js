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
          hint: "Qual tipo de bem está sendo doado. Para imóveis, será necessário escritura pública no cartório.",
        }),
        field("descricao_bem_doacao", "Descrição do Bem", "textarea", {
          required: true,
          placeholder: "Descreva detalhadamente o bem doado...",
          example:
            "Imóvel residencial localizado na Rua das Flores, 100, Matrícula nº 12.345 do 1º CRI de São Paulo.",
          hint: "Descreva com detalhes o bem sendo doado. Para imóveis: endereço e matrícula. Para veículos: marca, modelo, placa e RENAVAM. Para dinheiro: valor total.",
          whyImportant: "Uma descrição detalhada evita confusão sobre o que está sendo doado e protege ambas as partes.",
        }),
        field("valor_estimado_doacao", "Valor Estimado do Bem", "money", {
          required: false,
          placeholder: "R$ 0,00",
          example: "R$ 300.000,00",
          hint: "Valor de mercado estimado do bem. É necessário para o cálculo do ITCMD, que é o imposto cobrado pelo estado sobre doações (varia de 2% a 8% dependendo do estado).",
          whereFind: "Para imóveis: valor venal no IPTU ou avaliação de mercado. Para veículos: tabela FIPE (fipe.org.br).",
          whyImportant: "O ITCMD (Imposto sobre Transmissão Causa Mortis e Doação) é obrigatório. Sem o valor estimado, pode haver problemas com o fisco estadual.",
          whatHappensIfEmpty: "O contrato será gerado sem o valor do bem. Isso pode dificultar o registro e o pagamento do ITCMD.",
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
            hint: "'Usufruto' significa que o doador continua usando o bem mesmo após doar. 'Vitalício' = usa enquanto viver. 'Por prazo' = usa por um tempo determinado. É muito usado quando pais doam imóvel para filhos mas querem continuar morando lá.",
            whyImportant: "Garante que o doador não ficará sem moradia ou sem o benefício do bem mesmo após a doação.",
          }),
          field("prazo_usufruto", "Prazo do Usufruto (se determinado)", "text", {
            required: false,
            placeholder: "Ex: 10 anos",
            example: "10 anos a partir da data da doação",
            hint: "Só preencha se escolheu 'Por prazo determinado' acima. Informe por quanto tempo o doador manterá o direito de uso.",
            whatHappensIfEmpty: "Se o tipo for 'Vitalício', não há prazo. O usufruto dura até o falecimento do doador.",
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
            hint: "'Reversão' significa que, se acontecer a condição descrita, o bem volta para quem doou. É uma forma de proteger o patrimônio familar.",
            whyImportant: "Garante que o bem doado não vá para terceiros em caso de falecimento do donatário.",
          }),
          field("condicao_reversao_desc", "Descrição da Condição (se outra)", "textarea", {
            required: false,
            placeholder: "Descreva a condição personalizada...",
            hint: "Só preencha se escolheu 'Outra condição' acima. Descreva em detalhes quando o bem deve voltar ao doador.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Doação de imóvel acima de determinado valor exige escritura pública (cartório).",
    "A doação está sujeita ao imposto ITCMD (varia por estado, geralmente 2% a 8% do valor do bem).",
    "Doação com usufruto: você doa, mas continua morando/usando o bem até o fim do prazo ou até falecer.",
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
        text: "Por este instrumento particular de DOAÇÃO, de um lado, como DOADOR(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?any, , residente e domiciliado(a) em {doador_endereco?}, {doador_cidade?}}, e de outro lado, como DONATÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?any, , residente e domiciliado(a) em {donatario_endereco?}, {donatario_cidade?}}, têm entre si justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação pura e simples, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, O valor estimado do bem doado é de {valor_estimado_doacao}.}",
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
        text: "A presente doação é feita de forma livre, irretratável e irrevogável, conforme art. 548 do Código Civil Brasileiro, ressalvadas as hipóteses legais de revogação por ingratidão.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA RESPONSABILIDADE",
        text: "O(A) DONATÁRIO(A) passa a responder por todos os ônus, encargos e despesas do bem a partir da data de assinatura deste instrumento, incluindo impostos, taxas e eventuais manutenções.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, as partes elegem o Foro da Comarca de {cidade_doacao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
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
        text: "Por este instrumento particular de DOAÇÃO COM RESERVA DE USUFRUTO, de um lado, como DOADOR(A) e USUFRUTUÁRIO(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?any, , residente e domiciliado(a) em {doador_endereco?}, {doador_cidade?}}, e de outro lado, como DONATÁRIO(A) e NU-PROPRIETÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?any, , residente e domiciliado(a) em {donatario_endereco?}, {donatario_cidade?}}, têm entre si justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, O valor estimado do bem doado é de {valor_estimado_doacao}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA RESERVA DE USUFRUTO",
        text: "O(A) DOADOR(A) reserva para si o usufruto {tipo_usufruto} do bem acima descrito{?, , pelo prazo de {prazo_usufruto}}, mantendo o direito de usar, gozar e fruir do bem durante o período de usufruto, nos termos dos artigos 1.390 a 1.411 do Código Civil.",
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA ACEITAÇÃO",
        text: "O(A) DONATÁRIO(A) aceita a doação com a reserva de usufruto, declarando estar ciente de que a posse plena do bem lhe será transferida somente após a extinção do usufruto.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA IRRETRATABILIDADE",
        text: "A presente doação é feita de forma livre, irretratável e irrevogável, conforme art. 548 do Código Civil Brasileiro.",
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
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
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
        text: "Por este instrumento particular de DOAÇÃO COM CLÁUSULA DE REVERSÃO, de um lado, como DOADOR(A): {doador_nome}{?, , {doador_nacionalidade}}{?, , {doador_estado_civil}}{?, , {doador_profissao}}{?, , portador(a) do RG n.º {doador_rg} e }inscrito(a) no CPF sob n.º {doador_cpf}{?any, , residente e domiciliado(a) em {doador_endereco?}, {doador_cidade?}}, e de outro lado, como DONATÁRIO(A): {donatario_nome}{?, , {donatario_nacionalidade}}{?, , {donatario_estado_civil}}{?, , {donatario_profissao}}{?, , portador(a) do RG n.º {donatario_rg} e }inscrito(a) no CPF sob n.º {donatario_cpf}{?any, , residente e domiciliado(a) em {donatario_endereco?}, {donatario_cidade?}}, têm entre si justo e contratado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) DOADOR(A) transfere ao(à) DONATÁRIO(A), a título de doação, o seguinte bem: {tipo_bem_doacao} — {descricao_bem_doacao}.",
          "{?, O valor estimado do bem doado é de {valor_estimado_doacao}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DA CLÁUSULA DE REVERSÃO",
        paragraphs: [
          "A presente doação fica sujeita à cláusula de reversão na hipótese de: {condicao_reversao}.",
          "{?, Detalhes da condição: {condicao_reversao_desc}.}",
          "Verificada a condição de reversão, o bem retornará ao patrimônio do(a) DOADOR(A) ou de seus herdeiros legítimos, conforme art. 547 do Código Civil.",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA ACEITAÇÃO",
        text: "O(A) DONATÁRIO(A) aceita a doação com a cláusula de reversão, declarando estar ciente de todas as suas condições.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DA IRRETRATABILIDADE",
        text: "Excetuada a hipótese de reversão prevista neste instrumento, a presente doação é irretratável e irrevogável.",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DA RESPONSABILIDADE",
        text: "O(A) DONATÁRIO(A) passa a responder por todos os ônus, encargos e despesas do bem a partir da data de assinatura deste instrumento.",
      },
      {
        type: "clause",
        number: "6ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {cidade_doacao}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.",
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
