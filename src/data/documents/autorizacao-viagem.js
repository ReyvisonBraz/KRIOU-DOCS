import { field, pessoaFisicaFields } from "./_shared.js";

const autorizacaoViagem = {
  id: "autorizacao-viagem",
  name: "Autorização de Viagem",
  description: "Autorização para menor de idade viajar desacompanhado de um dos pais",
  icon: "MapPin",
  available: true,
  legislation: "Estatuto da Criança e do Adolescente (Lei 8.069/90), Art. 83 e 84",

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
          hint: "Relação com o menor que vai viajar.",
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
          hint: "Nome completo como na certidão de nascimento.",
          whereFind: "Certidão de Nascimento ou RG do menor.",
        }),
        field("data_nascimento_menor", "Data de Nascimento", "date", {
          required: true,
          hint: "Data de nascimento do menor.",
        }),
        field("rg_menor", "RG do Menor", "text", {
          required: false,
          placeholder: "Número do RG",
          hint: "Se o menor já possui RG.",
          disableable: true,
        }),
        field("cpf_menor", "CPF do Menor", "cpf", {
          required: false,
          placeholder: "000.000.000-00",
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
          hint: "Se o menor viajará acompanhado de outra pessoa, informe os dados dela.",
          disableable: true,
        }),
        field("cpf_acompanhante", "CPF do Acompanhante", "cpf", {
          required: false,
          placeholder: "000.000.000-00",
          disableable: true,
        }),
        field("parentesco_acompanhante", "Parentesco do Acompanhante", "text", {
          required: false,
          placeholder: "Ex: Avó, Tio, Professor",
          example: "Avó materna",
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
            hint: "Para onde o menor vai viajar.",
          }),
          field("data_ida_nac", "Data de Ida", "date", { required: true }),
          field("data_volta_nac", "Data de Volta", "date", { required: true }),
          field("motivo_viagem_nac", "Motivo da Viagem", "text", {
            required: false,
            placeholder: "Ex: Férias, visitar parentes",
            example: "Férias escolares com os avós",
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
          }),
          field("cidade_destino_int", "Cidade de Destino", "text", {
            required: false,
            placeholder: "Cidade no exterior",
            example: "Lisboa",
            disableable: true,
          }),
          field("data_ida_int", "Data de Ida", "date", { required: true }),
          field("data_volta_int", "Data de Volta", "date", { required: true }),
          field("passaporte_menor", "Número do Passaporte do Menor", "text", {
            required: true,
            placeholder: "Ex: FX123456",
            example: "FX123456",
            hint: "Número do passaporte válido do menor.",
            whereFind: "Passaporte emitido pela Polícia Federal.",
          }),
          field("motivo_viagem_int", "Motivo da Viagem", "text", {
            required: false,
            placeholder: "Ex: Intercâmbio, férias com parente",
            example: "Intercâmbio estudantil",
            disableable: true,
          }),
        ],
      },
    ],
  },

  clientNotes: [
    "Para viagens nacionais, menores de 16 anos precisam de autorização dos pais se viajarem sem eles.",
    "Para viagens internacionais, a autorização DEVE ter firma reconhecida em cartório.",
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
        text: "Eu, {autorizante_nome}{?, , {autorizante_nacionalidade}}{?, , {autorizante_estado_civil}}{?, , {autorizante_profissao}}{?, , portador(a) do RG n.º {autorizante_rg} e }inscrito(a) no CPF sob n.º {autorizante_cpf}{?, , residente e domiciliado(a) em {autorizante_endereco}}{?, , {autorizante_cidade}}, na qualidade de {parentesco} do(a) menor abaixo identificado(a),",
      },
      {
        type: "paragraph",
        text: "IDENTIFICAÇÃO DO(A) MENOR: {nome_menor}, nascido(a) em {data_nascimento_menor}{?, , portador(a) do RG n.º {rg_menor}}{?, , CPF: {cpf_menor}},",
      },
      {
        type: "paragraph",
        text: "AUTORIZO a viagem do(a) menor {nome_menor} ao(s) local(is): {destino_nacional}, no período de {data_ida_nac} a {data_volta_nac}{?, , motivo: {motivo_viagem_nac}}.",
      },
      {
        type: "paragraph",
        text: "{?, O(A) menor viajará acompanhado(a) de: {nome_acompanhante}{?, ({parentesco_acompanhante})}{?, , CPF: {cpf_acompanhante}}.}",
      },
      {
        type: "paragraph",
        text: "Declaro, sob as penas da lei, que as informações prestadas são verdadeiras e que a autorização é outorgada de livre e espontânea vontade.",
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
        text: "(Resolução CNJ nº 131, de 28 de junho de 2011)",
      },
      {
        type: "paragraph",
        text: "Eu, {autorizante_nome}{?, , {autorizante_nacionalidade}}{?, , {autorizante_estado_civil}}{?, , {autorizante_profissao}}{?, , portador(a) do RG n.º {autorizante_rg} e }inscrito(a) no CPF sob n.º {autorizante_cpf}{?, , residente e domiciliado(a) em {autorizante_endereco}}{?, , {autorizante_cidade}}, na qualidade de {parentesco} do(a) menor abaixo identificado(a),",
      },
      {
        type: "paragraph",
        text: "IDENTIFICAÇÃO DO(A) MENOR: {nome_menor}, nascido(a) em {data_nascimento_menor}, portador(a) do Passaporte n.º {passaporte_menor}{?, , CPF: {cpf_menor}},",
      },
      {
        type: "paragraph",
        text: "AUTORIZO a viagem do(a) menor {nome_menor} ao(s) país(es): {pais_destino}{?, , cidade: {cidade_destino_int}}, no período de {data_ida_int} a {data_volta_int}{?, , motivo: {motivo_viagem_int}}.",
      },
      {
        type: "paragraph",
        text: "{?, O(A) menor viajará acompanhado(a) de: {nome_acompanhante}{?, ({parentesco_acompanhante})}{?, , CPF: {cpf_acompanhante}}.}",
      },
      {
        type: "paragraph",
        text: "Declaro, sob as penas da lei, que as informações prestadas são verdadeiras e que a autorização é outorgada de livre e espontânea vontade, sem qualquer coação.",
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
