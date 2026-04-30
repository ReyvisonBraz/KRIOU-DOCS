import { field, pessoaFisicaFields } from "./_shared.js";

const autorizacaoViagem = {
  id: "autorizacao-viagem",
  name: "Autorização de Viagem",
  description: "Autorização para menor de idade viajar desacompanhado de um dos pais",
  icon: "Plane",
  available: true,
  legislation: "Estatuto da Criança e do Adolescente (Lei 8.069/90), Art. 83 e 84",
  spec: {
    whenUse: "Quando menor viaja sozinho, com outro familiar ou para o exterior",
    parties: ["Responsável legal", "Menor", "Acompanhante (se houver)"],
    sections: ["Dados do Responsável", "Dados do Menor", "Dados do Acompanhante", "Informações da Viagem", "Assinaturas"],
    requiredDocs: ["Documentos do menor", "Documentos do responsável", "Se viagem internacional: tradução juramentada"],
    tips: ["Viagem internacional pode necesitar firma notarizada", "Passaporte deve ser do menor", "Verifique exigências do país de destino"],
    commonIssues: ["Falta de firma reconhecer", "Documentos desatualizados", "Autorização incompleta"],
  },

  defaultVariant: "nacional",
  variants: [
    {
      id: "nacional",
      name: "Viagem Nacional",
      description: "Viagem dentro do Brasil",
      icon: "🇧🇷",
    },
    {
      id: "internacional",
      name: "Viagem Internacional",
      description: "Viagem para fora do Brasil",
      icon: "✈️",
    },
  ],

  commonSections: [
    {
      id: "autorizante",
      title: "Dados do Pai/Mãe que Autoriza",
      subtitle: "Quem está autorizando a viagem",
      icon: "user",
      fields: [
        ...pessoaFisicaFields("autorizante", "Autorizante"),
        field("parentesco", "Grau de Parentesco", "select", {
          required: true,
          options: ["Pai", "Mãe", "Responsável Legal"],
          hint: "Sua relação com o menor. 'Responsável Legal' se você tem a guarda judicial da criança/adolescente.",
          whyImportant: "Apenas pais ou responsáveis legais podem autorizar a viagem de menores.",
        }),
      ],
    },
    {
      id: "menor",
      title: "Dados do Menor",
      subtitle: "A criança ou adolescente que vai viajar",
      icon: "user",
      fields: [
        field("nome_menor", "Nome Completo do Menor", "text", {
          required: true,
          placeholder: "Nome completo da criança/adolescente",
          example: "Pedro da Silva Santos",
          hint: "Nome completo como consta na Certidão de Nascimento ou RG.",
          whereFind: "Certidão de Nascimento ou RG do menor.",
        }),
        field("data_nascimento_menor", "Data de Nascimento", "date", {
          required: true,
          hint: "Data de nascimento do menor. Importante para verificar se a autorização é necessária (menores de 16 anos para viagens nacionais).",
        }),
        field("rg_menor", "RG do Menor", "text", {
          required: false,
          placeholder: "Número do RG",
          hint: "Se o menor já possui RG. Não é obrigatório para crianças pequenas que ainda não tiraram identidade.",
          whatHappensIfEmpty: "A autorização será emitida sem o RG do menor. A Certidão de Nascimento serve como identificação.",
          disableable: true,
        }),
        field("cpf_menor", "CPF do Menor", "cpf", {
          required: false,
          placeholder: "000.000.000-00",
          hint: "CPF do menor, se possuir. Pode ser obtido gratuitamente no site da Receita Federal.",
          whatHappensIfEmpty: "A autorização será emitida sem o CPF do menor.",
          disableable: true,
        }),
      ],
    },
    {
      id: "acompanhante",
      title: "Dados do Acompanhante",
      subtitle: "Quem vai acompanhar o menor na viagem (se houver)",
      icon: "user",
      fields: [
        field("nome_acompanhante", "Nome do Acompanhante", "text", {
          required: false,
          placeholder: "Nome de quem vai acompanhar o menor",
          example: "Ana Maria Santos",
          hint: "Se o menor viajará com outra pessoa (avó, tio, professor, etc.), informe o nome completo. Se viajará sozinho, deixe em branco.",
          whatHappensIfEmpty: "A autorização será emitida sem acompanhante específico, autorizando o menor a viajar sozinho ou com qualquer parente.",
          disableable: true,
        }),
        field("cpf_acompanhante", "CPF do Acompanhante", "cpf", {
          required: false,
          placeholder: "000.000.000-00",
          hint: "CPF da pessoa que acompanhará o menor.",
          whatHappensIfEmpty: "A autorização identificará o acompanhante apenas pelo nome.",
          disableable: true,
        }),
        field("parentesco_acompanhante", "Parentesco do Acompanhante", "text", {
          required: false,
          placeholder: "Ex: Avó, Tio, Professor",
          example: "Avó materna",
          hint: "Relação do acompanhante com o menor: avó, tio, primo, professor, amigo da família, etc.",
          disableable: true,
        }),
      ],
    },
    {
      id: "assinatura_autorizacao",
      title: "Assinatura",
      subtitle: "Local e data da autorização",
      icon: "calendar",
      fields: [
        field("cidade_autorizacao", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
          hint: "Cidade onde a autorização está sendo assinada.",
        }),
        field("data_autorizacao", "Data de Assinatura", "date", {
          required: true,
        }),
      ],
    },
  ],

  variantSections: {
    nacional: [
      {
        id: "viagem_nacional",
        title: "Dados da Viagem Nacional",
        subtitle: "Destino e período da viagem",
        icon: "location",
        fields: [
          field("destino_nacional", "Cidade de Destino", "text", {
            required: true,
            placeholder: "Cidade, UF",
            example: "Salvador, BA",
            hint: "Para onde o menor vai viajar. Se forem vários destinos, liste todos.",
          }),
          field("data_ida_nac", "Data de Ida", "date", {
            required: true,
            hint: "Data da ida/partida da viagem.",
          }),
          field("data_volta_nac", "Data de Volta", "date", {
            required: true,
            hint: "Data prevista de retorno. Se não souber a data exata, use uma data aproximada.",
          }),
          field("motivo_viagem_nac", "Motivo da Viagem", "text", {
            required: false,
            placeholder: "Ex: Férias, visitar parentes",
            example: "Férias escolares com os avós",
            hint: "Motivo da viagem: férias, visita a parentes, excursão escolar, competição esportiva, etc.",
            whatHappensIfEmpty: "A autorização será emitida sem especificar o motivo da viagem.",
            disableable: true,
          }),
        ],
      },
    ],
    internacional: [
      {
        id: "viagem_internacional",
        title: "Dados da Viagem Internacional",
        subtitle: "Destino e documentos necessários",
        icon: "location",
        fields: [
          field("pais_destino", "País de Destino", "text", {
            required: true,
            placeholder: "Nome do país",
            example: "Portugal",
            hint: "País para onde o menor viajará. Se forem vários países, liste todos.",
          }),
          field("cidade_destino_int", "Cidade de Destino", "text", {
            required: false,
            placeholder: "Cidade no exterior",
            example: "Lisboa",
            hint: "Cidade de destino no exterior, se souber.",
            whatHappensIfEmpty: "A autorização mencionará apenas o país de destino.",
            disableable: true,
          }),
          field("data_ida_int", "Data de Ida", "date", { required: true }),
          field("data_volta_int", "Data de Volta", "date", { required: true }),
          field("passaporte_menor", "Número do Passaporte do Menor", "text", {
            required: true,
            placeholder: "Ex: FX123456",
            example: "FX123456",
            hint: "Número do passaporte válido do menor. O passaporte deve estar dentro da validade na data da viagem.",
            whereFind: "Passaporte emitido pela Polícia Federal. Se ainda não tem, agende no site pf.gov.br e vá ao posto da PF com a certidão de nascimento e fotos.",
            whyImportant: "O passaporte é obrigatório para viagens internacionais. Sem ele, o menor não pode embarcar.",
          }),
          field("motivo_viagem_int", "Motivo da Viagem", "text", {
            required: false,
            placeholder: "Ex: Intercâmbio, férias com parente",
            example: "Intercâmbio estudantil",
            hint: "Motivo da viagem ao exterior: intercâmbio, férias, visita a parentes, tratamento médico, etc.",
            whatHappensIfEmpty: "A autorização será emitida sem especificar o motivo.",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Para viagens nacionais, menores de 16 anos precisam de autorização dos pais se viajarem sem eles.",
    "Para viagens internacionais, a autorização DEVE ter firma reconhecida em cartório (obrigatório).",
    "Leve sempre a certidão de nascimento original do menor junto com a autorização.",
  ],

  internalNotes: [
    "Viagem internacional: obrigatório reconhecimento de firma e apostilamento se for para país do Protocolo de Haia",
  ],

  documentBody: {
    nacional: [
      {
        type: "title",
        text: "AUTORIZAÇÃO DE VIAGEM NACIONAL DE MENOR",
      },
      {
        type: "paragraph",
        text: "Eu, {autorizante_nome}{?, , {autorizante_nacionalidade}}{?, , {autorizante_estado_civil}}{?, , {autorizante_profissao}}{?, , portador(a) do RG n.º {autorizante_rg} e }inscrito(a) no CPF sob n.º {autorizante_cpf}{?any, , residente e domiciliado(a) em {autorizante_endereco?}, {autorizante_cidade?}}, na qualidade de {parentesco} do(a) menor abaixo identificado(a),",
      },
      {
        type: "paragraph",
        text: "IDENTIFICAÇÃO DO(A) MENOR: {nome_menor}, nascido(a) em {data_nascimento_menor}{?, , portador(a) do RG n.º {rg_menor}}{?, , inscrito(a) no CPF sob n.º {cpf_menor}},",
      },
      {
        type: "paragraph",
        text: "AUTORIZO expressamente a viagem do(a) menor {nome_menor} com destino a {destino_nacional}, no período de {data_ida_nac} a {data_volta_nac}{?, , com o seguinte motivo: {motivo_viagem_nac}}.",
      },
      {
        type: "paragraph",
        text: "{?, O(A) menor viajará acompanhado(a) de {nome_acompanhante}{?, ({parentesco_acompanhante})}{?, , inscrito(a) no CPF sob n.º {cpf_acompanhante}}.}",
      },
      {
        type: "paragraph",
        text: "Declaro, sob as penas da lei, que as informações acima prestadas são verdadeiras e que a presente autorização é concedida de livre e espontânea vontade, sem qualquer coação.",
      },
      {
        type: "date",
        text: "{cidade_autorizacao}, {data_autorizacao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Responsável Legal", fieldKey: "autorizante_nome" },
        ],
      },
    ],

    internacional: [
      {
        type: "title",
        text: "AUTORIZAÇÃO DE VIAGEM INTERNACIONAL DE MENOR",
      },
      {
        type: "paragraph",
        text: "(Conforme Resolução CNJ nº 131/2011 e Estatuto da Criança e do Adolescente)",
      },
      {
        type: "paragraph",
        text: "Eu, {autorizante_nome}{?, , {autorizante_nacionalidade}}{?, , {autorizante_estado_civil}}{?, , {autorizante_profissao}}{?, , portador(a) do RG n.º {autorizante_rg} e }inscrito(a) no CPF sob n.º {autorizante_cpf}{?any, , residente e domiciliado(a) em {autorizante_endereco?}, {autorizante_cidade?}}, na qualidade de {parentesco} do(a) menor abaixo identificado(a),",
      },
      {
        type: "paragraph",
        text: "IDENTIFICAÇÃO DO(A) MENOR: {nome_menor}, nascido(a) em {data_nascimento_menor}, portador(a) do Passaporte n.º {passaporte_menor}{?, , inscrito(a) no CPF sob n.º {cpf_menor}},",
      },
      {
        type: "paragraph",
        text: "AUTORIZO expressamente a viagem do(a) menor {nome_menor} ao exterior, com destino a {pais_destino}{?, , cidade de {cidade_destino_int}}, no período de {data_ida_int} a {data_volta_int}{?, , motivo: {motivo_viagem_int}}.",
      },
      {
        type: "paragraph",
        text: "{?, O(A) menor viajará acompanhado(a) de {nome_acompanhante}{?, ({parentesco_acompanhante})}{?, , inscrito(a) no CPF sob n.º {cpf_acompanhante}}.}",
      },
      {
        type: "paragraph",
        text: "Declaro, sob as penas da lei, que as informações acima prestadas são verdadeiras e que a presente autorização é concedida de livre e espontânea vontade, sem qualquer tipo de coação ou vício de consentimento.",
      },
      {
        type: "paragraph",
        text: "OBSERVAÇÃO IMPORTANTE: Esta autorização deve obrigatoriamente ter a firma reconhecida em cartório para ter validade em viagens internacionais.",
      },
      {
        type: "date",
        text: "{cidade_autorizacao}, {data_autorizacao}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Responsável Legal", fieldKey: "autorizante_nome" },
        ],
      },
    ],
  },
};

export default autorizacaoViagem;
