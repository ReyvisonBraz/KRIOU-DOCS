/**
 * ============================================
 * KRIOU DOCS - Legal Documents Data
 * ============================================
 * Sistema completo de documentos jurídicos com:
 * - Variantes por tipo de bem/situação
 * - Seções compartilhadas e específicas
 * - Campos com ajuda, exemplos e dicas
 * - Campos opcionais desabilitáveis
 * - Observações separadas (cliente vs interno)
 */

// ─── Helper: Criar campo com padrão ───
const field = (key, label, type, opts = {}) => ({
  key,
  label,
  type,
  required: opts.required ?? false,
  placeholder: opts.placeholder || "",
  example: opts.example || "",
  hint: opts.hint || "",
  whereFind: opts.whereFind || "",
  mask: opts.mask || null,
  options: opts.options || null,
  disableable: opts.disableable ?? !opts.required,
  visibleInVariants: opts.visibleInVariants || null, // null = all
});

// ─── Seções reutilizáveis de partes (Pessoa Física) ───
const pessoaFisicaFields = (prefix, papel) => [
  field(`${prefix}_nome`, `Nome Completo do ${papel}`, "text", {
    required: true,
    placeholder: "Nome completo como no documento",
    example: "Maria da Silva Santos",
    hint: "Use o nome completo, exatamente como aparece no RG ou CNH.",
    whereFind: "RG, CPF, CNH ou Certidão de Nascimento",
  }),
  field(`${prefix}_cpf`, `CPF do ${papel}`, "cpf", {
    required: true,
    placeholder: "000.000.000-00",
    example: "123.456.789-00",
    hint: "Número do CPF com 11 dígitos. Será formatado automaticamente.",
    whereFind: "Cartão do CPF, CNH, ou consulte no site da Receita Federal",
    mask: "cpf",
  }),
  field(`${prefix}_rg`, `RG do ${papel}`, "text", {
    required: false,
    placeholder: "00.000.000-0",
    example: "12.345.678-9 SSP/SP",
    hint: "Número do RG com o órgão expedidor (ex: SSP/SP).",
    whereFind: "Documento de identidade (carteira de identidade)",
    disableable: true,
  }),
  field(`${prefix}_nacionalidade`, `Nacionalidade do ${papel}`, "text", {
    required: false,
    placeholder: "Brasileiro(a)",
    example: "Brasileiro(a)",
    hint: "Sua nacionalidade. Para a maioria será 'Brasileiro(a)'.",
    disableable: true,
  }),
  field(`${prefix}_estado_civil`, `Estado Civil do ${papel}`, "select", {
    required: false,
    options: ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"],
    hint: "Selecione o estado civil atual conforme certidão.",
    whereFind: "Certidão de Nascimento (se solteiro) ou Certidão de Casamento",
    disableable: true,
  }),
  field(`${prefix}_profissao`, `Profissão do ${papel}`, "text", {
    required: false,
    placeholder: "Sua profissão",
    example: "Comerciante",
    hint: "Profissão atual ou a que consta nos documentos.",
    disableable: true,
  }),
  field(`${prefix}_endereco`, `Endereço Completo do ${papel}`, "text", {
    required: false,
    placeholder: "Rua, número, bairro",
    example: "Rua das Flores, 123, Centro",
    hint: "Endereço residencial completo com rua, número e bairro.",
    whereFind: "Comprovante de residência (conta de luz, água, etc.)",
    disableable: true,
  }),
  field(`${prefix}_cidade`, `Cidade / UF do ${papel}`, "text", {
    required: false,
    placeholder: "Cidade, UF",
    example: "São Paulo, SP",
    hint: "Cidade e estado onde reside.",
    disableable: true,
  }),
];

// ============================================
// DOCUMENTOS JURÍDICOS - DEFINIÇÃO COMPLETA
// ============================================

export const LEGAL_DOCUMENTS = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. COMPRA E VENDA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "compra-venda",
    name: "Compra e Venda",
    description: "Contrato para compra e venda de bens (imóvel, veículo, terreno)",
    icon: "FileText",
    available: true,
    legislation: "Código Civil Brasileiro (Lei 10.406/2002), Arts. 481 a 532",

    // Variantes disponíveis
    defaultVariant: "imovel",
    variants: [
      {
        id: "imovel",
        name: "Imóvel (Casa / Apartamento)",
        description: "Compra e venda de imóvel residencial ou comercial com sinal",
        icon: "🏠",
      },
      {
        id: "veiculo",
        name: "Veículo (Carro / Moto)",
        description: "Compra e venda de automóvel, motocicleta ou caminhão",
        icon: "🚗",
      },
      {
        id: "terreno",
        name: "Terreno / Lote",
        description: "Compra e venda de terreno, lote ou área rural",
        icon: "🌳",
      },
    ],

    // ─── Seções compartilhadas (todas as variantes) ───
    commonSections: [
      {
        id: "vendedor",
        title: "Dados do Vendedor",
        subtitle: "Quem está vendendo o bem",
        icon: "user",
        fields: pessoaFisicaFields("vendedor", "Vendedor"),
      },
      {
        id: "comprador",
        title: "Dados do Comprador",
        subtitle: "Quem está comprando o bem",
        icon: "user",
        fields: pessoaFisicaFields("comprador", "Comprador"),
      },
      {
        id: "pagamento",
        title: "Valor e Forma de Pagamento",
        subtitle: "Como será feito o pagamento",
        icon: "money",
        fields: [
          field("valor_total", "Valor Total da Venda", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 250.000,00",
            hint: "Valor total combinado entre as partes para a venda.",
          }),
          field("forma_pagamento", "Forma de Pagamento", "select", {
            required: true,
            options: ["À vista", "Parcelado", "Com Sinal + Parcelas", "Financiamento Bancário"],
            hint: "Como o valor será pago. 'Com Sinal' significa um valor adiantado para garantir o negócio.",
          }),
          field("valor_sinal", "Valor do Sinal (Arras)", "money", {
            required: false,
            placeholder: "R$ 0,00",
            example: "R$ 25.000,00",
            hint: "Valor pago como garantia no ato da assinatura. Obrigatório se a forma de pagamento incluir sinal.",
            whereFind: "Combinado entre as partes. Normalmente 10% a 30% do valor total.",
            disableable: true,
          }),
          field("condicoes_pagamento", "Condições de Pagamento", "textarea", {
            required: false,
            placeholder: "Descreva as parcelas, datas e formas...",
            example: "3 parcelas iguais de R$ 75.000,00, sendo a 1ª em 30/05/2026, a 2ª em 30/06/2026 e a 3ª em 30/07/2026, via transferência bancária.",
            hint: "Detalhe aqui datas, valores de cada parcela e meio de pagamento (PIX, transferência, cheque, etc.).",
            disableable: true,
          }),
        ],
      },
      {
        id: "assinatura",
        title: "Assinatura e Foro",
        subtitle: "Local, data e jurisdição do contrato",
        icon: "calendar",
        fields: [
          field("cidade_contrato", "Cidade do Contrato", "text", {
            required: true,
            placeholder: "Cidade onde será assinado",
            example: "São Paulo, SP",
            hint: "Cidade onde o contrato será assinado pelas partes.",
          }),
          field("data_assinatura", "Data de Assinatura", "date", {
            required: true,
            hint: "Data em que o contrato será assinado.",
          }),
          field("foro", "Foro (Comarca)", "text", {
            required: false,
            placeholder: "Comarca para resolução de conflitos",
            example: "Comarca de São Paulo/SP",
            hint: "Local escolhido para resolver problemas judiciais sobre este contrato. Normalmente é a cidade onde o bem está localizado.",
            disableable: true,
          }),
        ],
      },
    ],

    // ─── Seções específicas por variante ───
    variantSections: {
      imovel: [
        {
          id: "descricao_imovel",
          title: "Descrição do Imóvel",
          subtitle: "Detalhes do imóvel sendo vendido",
          icon: "building",
          fields: [
            field("tipo_imovel", "Tipo de Imóvel", "select", {
              required: true,
              options: ["Casa", "Apartamento", "Sobrado", "Kitnet", "Sala Comercial", "Galpão", "Outro"],
              hint: "Selecione o tipo de imóvel que está sendo vendido.",
            }),
            field("endereco_imovel", "Endereço do Imóvel", "text", {
              required: true,
              placeholder: "Rua, número, bairro",
              example: "Rua das Palmeiras, 456, Jardim América",
              hint: "Endereço completo do imóvel que está sendo vendido.",
            }),
            field("cidade_imovel", "Cidade / UF do Imóvel", "text", {
              required: true,
              placeholder: "Cidade, UF",
              example: "São Paulo, SP",
            }),
            field("matricula", "Matrícula do Imóvel", "text", {
              required: true,
              placeholder: "Número da matrícula",
              example: "Matrícula nº 12.345",
              hint: "Número de registro do imóvel no Cartório de Registro de Imóveis. Todo imóvel regular tem uma matrícula.",
              whereFind: "Escritura do imóvel ou solicitar certidão no Cartório de Registro de Imóveis da região.",
            }),
            field("cartorio", "Cartório de Registro", "text", {
              required: false,
              placeholder: "Nome do cartório",
              example: "1º Cartório de Registro de Imóveis de São Paulo",
              hint: "Cartório onde o imóvel está registrado.",
              whereFind: "Na escritura do imóvel ou certidão de matrícula.",
              disableable: true,
            }),
            field("area_total", "Área Total (m²)", "text", {
              required: false,
              placeholder: "Ex: 120,00",
              example: "120,00 m²",
              hint: "Área total do imóvel em metros quadrados.",
              whereFind: "Escritura, IPTU ou matrícula do imóvel.",
              disableable: true,
            }),
            field("descricao_imovel_texto", "Descrição Detalhada", "textarea", {
              required: false,
              placeholder: "Descreva o imóvel: cômodos, benfeitorias, estado...",
              example: "Imóvel composto de 3 quartos, sendo 1 suíte, sala, cozinha, 2 banheiros, garagem para 2 carros, área total de 120m².",
              hint: "Quanto mais detalhado, melhor para a segurança do contrato.",
              disableable: true,
            }),
            field("possui_financiamento", "Possui Financiamento?", "select", {
              required: false,
              options: ["Não", "Sim - Quitado", "Sim - Com saldo devedor"],
              hint: "Informe se o imóvel tem financiamento bancário ativo.",
              disableable: true,
            }),
          ],
        },
      ],
      veiculo: [
        {
          id: "descricao_veiculo",
          title: "Descrição do Veículo",
          subtitle: "Detalhes do veículo sendo vendido",
          icon: "car",
          fields: [
            field("marca_modelo", "Marca / Modelo", "text", {
              required: true,
              placeholder: "Ex: Volkswagen Gol 1.0",
              example: "Volkswagen Gol 1.0 MPI",
              hint: "Marca e modelo completo do veículo.",
              whereFind: "CRLV (documento do veículo) ou nota fiscal.",
            }),
            field("ano_fabricacao", "Ano de Fabricação", "text", {
              required: true,
              placeholder: "Ex: 2020",
              example: "2020",
              hint: "Ano em que o veículo foi fabricado.",
              whereFind: "CRLV (documento do veículo).",
            }),
            field("ano_modelo", "Ano do Modelo", "text", {
              required: true,
              placeholder: "Ex: 2021",
              example: "2021",
              hint: "Ano do modelo do veículo (pode ser diferente do ano de fabricação).",
              whereFind: "CRLV (documento do veículo).",
            }),
            field("cor", "Cor", "text", {
              required: true,
              placeholder: "Ex: Prata",
              example: "Prata",
              hint: "Cor do veículo conforme documento.",
              whereFind: "CRLV (documento do veículo).",
            }),
            field("placa", "Placa", "text", {
              required: true,
              placeholder: "Ex: ABC-1D23",
              example: "ABC-1D23",
              hint: "Placa do veículo no formato Mercosul ou antigo.",
              whereFind: "CRLV ou placa do veículo.",
              mask: "placa",
            }),
            field("chassi", "Número do Chassi", "text", {
              required: true,
              placeholder: "Ex: 9BWZZZ377VT004251",
              example: "9BWZZZ377VT004251",
              hint: "Chassi é o número de identificação único do veículo (17 caracteres).",
              whereFind: "CRLV, etiqueta na porta do motorista ou no painel do carro.",
            }),
            field("renavam", "RENAVAM", "text", {
              required: true,
              placeholder: "Ex: 00123456789",
              example: "00123456789",
              hint: "RENAVAM é o registro nacional do veículo (11 dígitos).",
              whereFind: "CRLV (documento do veículo), na parte superior.",
            }),
            field("combustivel", "Combustível", "select", {
              required: false,
              options: ["Flex (Gasolina/Álcool)", "Gasolina", "Álcool", "Diesel", "Elétrico", "Híbrido"],
              hint: "Tipo de combustível do veículo.",
              disableable: true,
            }),
            field("km_atual", "Quilometragem Atual", "text", {
              required: false,
              placeholder: "Ex: 45.000 km",
              example: "45.000 km",
              hint: "Quilometragem atual do veículo no momento da venda.",
              disableable: true,
            }),
          ],
        },
      ],
      terreno: [
        {
          id: "descricao_terreno",
          title: "Descrição do Terreno",
          subtitle: "Detalhes do terreno ou lote sendo vendido",
          icon: "location",
          fields: [
            field("endereco_terreno", "Localização do Terreno", "text", {
              required: true,
              placeholder: "Endereço ou localização",
              example: "Lote 15, Quadra C, Loteamento Jardim das Acácias",
              hint: "Endereço ou identificação do terreno (lote, quadra, loteamento).",
            }),
            field("cidade_terreno", "Cidade / UF", "text", {
              required: true,
              placeholder: "Cidade, UF",
              example: "Campinas, SP",
            }),
            field("matricula_terreno", "Matrícula do Terreno", "text", {
              required: true,
              placeholder: "Número da matrícula",
              example: "Matrícula nº 54.321",
              hint: "Número de registro do terreno no Cartório de Registro de Imóveis.",
              whereFind: "Escritura do terreno ou certidão no Cartório de Registro de Imóveis.",
            }),
            field("area_terreno", "Área Total (m²)", "text", {
              required: true,
              placeholder: "Ex: 300,00",
              example: "300,00 m²",
              hint: "Área total do terreno em metros quadrados.",
              whereFind: "Escritura, IPTU ou certidão de matrícula.",
            }),
            field("medida_frente", "Medida da Frente (m)", "text", {
              required: false,
              placeholder: "Ex: 12,00",
              example: "12,00 m",
              hint: "Largura do terreno na frente (face da rua).",
              disableable: true,
            }),
            field("medida_fundo", "Medida do Fundo (m)", "text", {
              required: false,
              placeholder: "Ex: 12,00",
              example: "12,00 m",
              hint: "Largura do terreno no fundo.",
              disableable: true,
            }),
            field("medida_direita", "Medida Lateral Direita (m)", "text", {
              required: false,
              placeholder: "Ex: 25,00",
              example: "25,00 m",
              hint: "Comprimento do terreno no lado direito.",
              disableable: true,
            }),
            field("medida_esquerda", "Medida Lateral Esquerda (m)", "text", {
              required: false,
              placeholder: "Ex: 25,00",
              example: "25,00 m",
              hint: "Comprimento do terreno no lado esquerdo.",
              disableable: true,
            }),
            field("confrontantes", "Confrontantes (Vizinhos)", "textarea", {
              required: false,
              placeholder: "Descreva os vizinhos em cada lado...",
              example: "Norte: Lote 14 de João da Silva; Sul: Rua das Acácias; Leste: Lote 16 de Maria Santos; Oeste: Área verde do loteamento.",
              hint: "Quem são os vizinhos em cada lado do terreno. Ajuda a identificar o lote.",
              whereFind: "Matrícula do imóvel no cartório ou planta do loteamento.",
              disableable: true,
            }),
            field("zoneamento", "Zoneamento", "select", {
              required: false,
              options: ["Residencial", "Comercial", "Misto", "Industrial", "Rural", "Não sei"],
              hint: "Tipo de uso permitido pela prefeitura para o terreno.",
              whereFind: "Prefeitura da cidade ou planta do loteamento.",
              disableable: true,
            }),
          ],
        },
      ],
    },

    // ─── Observações para o cliente ───
    clientNotes: [
      "O sinal (arras) funciona como garantia: se o comprador desistir, perde o sinal. Se o vendedor desistir, devolve em dobro.",
      "Guarde uma via assinada do contrato. Cada parte deve ficar com uma via original.",
      "As testemunhas devem ser maiores de 18 anos e não podem ser parentes das partes.",
      "Para imóveis, é recomendável registrar o contrato no Cartório de Registro de Imóveis.",
      "Para veículos, faça a transferência no DETRAN em até 30 dias para evitar multas.",
    ],

    // ─── Notas internas (não exibidas ao cliente) ───
    internalNotes: [
      "Verificar se matrícula está atualizada (menos de 30 dias)",
      "Conferir existência de ônus na matrícula",
      "Para veículos: checar débitos, multas e restrições no DETRAN",
      "Variante com financiamento bancário ainda não implementada",
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. LOCAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. PROCURAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "procuracao",
    name: "Procuração",
    description: "Documento para delegar poderes a outra pessoa em seu nome",
    icon: "Shield",
    available: true,
    legislation: "Código Civil Brasileiro, Arts. 653 a 692",

    defaultVariant: "particular",
    variants: [
      {
        id: "particular",
        name: "Procuração Particular",
        description: "Para atos civis gerais (compra, venda, representação em repartições)",
        icon: "📝",
      },
      {
        id: "ad-judicia",
        name: "Procuração Ad Judicia",
        description: "Para representação em processos judiciais (advogado)",
        icon: "⚖️",
      },
    ],

    commonSections: [
      {
        id: "outorgante",
        title: "Dados do Outorgante (Quem dá os poderes)",
        subtitle: "A pessoa que está autorizando outra a agir em seu nome",
        icon: "user",
        fields: pessoaFisicaFields("outorgante", "Outorgante"),
      },
      {
        id: "outorgado",
        title: "Dados do Outorgado (Quem recebe os poderes)",
        subtitle: "A pessoa que vai agir em nome do outorgante",
        icon: "user",
        fields: pessoaFisicaFields("outorgado", "Outorgado"),
      },
      {
        id: "assinatura_proc",
        title: "Validade e Assinatura",
        subtitle: "Prazo e data da procuração",
        icon: "calendar",
        fields: [
          field("validade", "Prazo de Validade", "select", {
            required: true,
            options: ["30 dias", "90 dias", "6 meses", "1 ano", "Indeterminada"],
            hint: "Por quanto tempo esta procuração será válida. Se não souber, escolha 'Indeterminada'.",
          }),
          field("cidade_proc", "Cidade", "text", {
            required: true,
            placeholder: "Cidade, UF",
            example: "São Paulo, SP",
          }),
          field("data_proc", "Data de Assinatura", "date", {
            required: true,
          }),
        ],
      },
    ],

    variantSections: {
      particular: [
        {
          id: "poderes_particular",
          title: "Poderes Concedidos",
          subtitle: "O que a pessoa autorizada poderá fazer em seu nome",
          icon: "description",
          fields: [
            field("finalidade_proc", "Finalidade da Procuração", "select", {
              required: true,
              options: [
                "Compra e Venda de Imóvel",
                "Compra e Venda de Veículo",
                "Representação em Repartições Públicas",
                "Representação Bancária",
                "Administração de Bens",
                "Poderes Gerais (Ampla)",
                "Outra",
              ],
              hint: "Para que esta procuração será usada. Escolha a mais específica possível.",
            }),
            field("poderes_desc", "Descrição dos Poderes", "textarea", {
              required: true,
              placeholder: "Descreva o que a pessoa poderá fazer...",
              example: "Representar o outorgante junto ao Cartório de Registro de Imóveis para assinar escritura de compra e venda do imóvel localizado na Rua...",
              hint: "Descreva com detalhes o que o outorgado poderá fazer em seu nome. Quanto mais específico, mais seguro.",
            }),
            field("substabelecimento", "Permitir Substabelecimento?", "select", {
              required: false,
              options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
              hint: "Substabelecimento permite que o outorgado passe os poderes para outra pessoa. 'Com reserva' significa que ele continua com os poderes também.",
              disableable: true,
            }),
          ],
        },
      ],
      "ad-judicia": [
        {
          id: "poderes_judicia",
          title: "Poderes Judiciais",
          subtitle: "Poderes para representação em processos na Justiça",
          icon: "description",
          fields: [
            field("oab_numero", "Número da OAB do Advogado", "text", {
              required: true,
              placeholder: "Ex: 123.456/SP",
              example: "123.456/SP",
              hint: "Número de inscrição do advogado na Ordem dos Advogados do Brasil.",
              whereFind: "Pergunte ao seu advogado ou consulte no site da OAB.",
            }),
            field("tipo_processo", "Tipo de Processo", "select", {
              required: false,
              options: ["Cível", "Trabalhista", "Criminal", "Família", "Tributário", "Todos"],
              hint: "Em qual tipo de processo o advogado irá representá-lo.",
              disableable: true,
            }),
            field("poderes_especiais", "Poderes Especiais (Cláusula Ad Judicia)", "textarea", {
              required: true,
              placeholder: "Poderes para o foro em geral...",
              example: "Poderes para o foro em geral, conforme art. 105 do CPC, e os especiais para receber, dar quitação, transigir, desistir, renunciar, reconhecer a procedência do pedido.",
              hint: "Os poderes para atuar em processos judiciais. O texto padrão (exemplo) cobre a maioria dos casos.",
            }),
            field("substabelecimento_jud", "Permitir Substabelecimento?", "select", {
              required: false,
              options: ["Não", "Sim, com reserva de poderes", "Sim, sem reserva de poderes"],
              hint: "Permite que o advogado passe poderes para outro advogado.",
              disableable: true,
            }),
          ],
        },
      ],
    },

    clientNotes: [
      "Procuração particular não precisa ir ao cartório, mas para atos imobiliários é recomendável reconhecer firma.",
      "Você pode revogar (cancelar) a procuração a qualquer momento, bastando notificar o outorgado.",
      "A procuração Ad Judicia (para advogado) é obrigatória para ter representação em processos judiciais.",
    ],

    internalNotes: [
      "Verificar se finalidade exige firma reconhecida em cartório",
      "Para atos imobiliários, exigir procuração pública (lavrada em cartório)",
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. DOAÇÃO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "doacao",
    name: "Contrato de Doação",
    description: "Transferência gratuita de bens entre pessoas",
    icon: "Award",
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
            example: "Imóvel residencial localizado na Rua das Flores, 100, Matrícula nº 12.345 do 1º CRI de São Paulo.",
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. RECIBO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "recibo",
    name: "Recibo",
    description: "Comprovante de pagamento ou recebimento de valores",
    icon: "FileText",
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
            hint: "Nome completo da pessoa ou empresa que recebeu o pagamento.",
          }),
          field("cpf_recebedor", "CPF / CNPJ", "cpf", {
            required: true,
            placeholder: "000.000.000-00",
            example: "123.456.789-00",
            hint: "CPF (pessoa física) ou CNPJ (empresa) de quem recebeu.",
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
          }),
          field("cpf_pagador", "CPF / CNPJ", "cpf", {
            required: true,
            placeholder: "000.000.000-00",
            example: "987.654.321-00",
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
          }),
          field("data_recibo", "Data do Recibo", "date", {
            required: true,
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
              hint: "Valor total que foi recebido.",
            }),
            field("referente_a", "Referente a", "textarea", {
              required: true,
              placeholder: "Descreva o motivo do pagamento...",
              example: "Prestação de serviço de consultoria realizada no mês de março/2026.",
              hint: "Descreva pelo quê o pagamento está sendo feito.",
            }),
            field("forma_pgto_recibo", "Forma de Pagamento", "select", {
              required: false,
              options: ["Dinheiro", "PIX", "Transferência Bancária", "Cheque", "Cartão", "Boleto"],
              hint: "Como o pagamento foi feito.",
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
            }),
            field("mes_referencia", "Mês de Referência", "text", {
              required: true,
              placeholder: "Ex: Março/2026",
              example: "Março/2026",
              hint: "Mês a que se refere o pagamento do aluguel.",
            }),
            field("endereco_imovel_recibo", "Endereço do Imóvel", "text", {
              required: true,
              placeholder: "Endereço completo do imóvel alugado",
              example: "Rua das Palmeiras, 456, Apt 12A, São Paulo/SP",
            }),
            field("forma_pgto_aluguel", "Forma de Pagamento", "select", {
              required: false,
              options: ["Dinheiro", "PIX", "Transferência Bancária", "Cheque", "Boleto"],
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. UNIÃO ESTÁVEL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
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
              hint: "Data em que o casal passou a viver junto como se casados fossem.",
            }),
            field("regime_bens", "Regime de Bens", "select", {
              required: true,
              options: [
                "Comunhão Parcial de Bens (padrão)",
                "Comunhão Universal de Bens",
                "Separação Total de Bens",
              ],
              hint: "Comunhão Parcial: bens adquiridos durante a união são de ambos. Separação: cada um fica com o que é seu.",
            }),
            field("endereco_residencia", "Endereço de Residência do Casal", "text", {
              required: false,
              placeholder: "Endereço onde moram juntos",
              example: "Rua das Palmeiras, 456, São Paulo/SP",
              disableable: true,
            }),
            field("filhos_uniao", "Possuem Filhos em Comum?", "select", {
              required: false,
              options: ["Não", "Sim"],
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
              hint: "Quando a união estável começou.",
            }),
            field("data_fim_uniao", "Data de Fim da Convivência", "date", {
              required: true,
              hint: "Data em que a convivência foi encerrada.",
            }),
            field("motivo_dissolucao", "Motivo", "select", {
              required: false,
              options: ["Consensual (ambos concordam)", "Litigiosa (há discordância)"],
              hint: "Consensual: ambos concordam em encerrar. Litigiosa: há divergências.",
              disableable: true,
            }),
            field("partilha_bens", "Houve Partilha de Bens?", "select", {
              required: false,
              options: ["Não há bens a partilhar", "Sim - Amigável", "Sim - Judicial"],
              hint: "Se possuem bens adquiridos durante a união, é necessário dividir.",
              disableable: true,
            }),
            field("descricao_partilha", "Descrição da Partilha", "textarea", {
              required: false,
              placeholder: "Descreva como os bens serão divididos...",
              example: "O imóvel localizado na Rua X ficará com o companheiro A. O veículo placa XYZ ficará com o companheiro B.",
              hint: "Detalhe quais bens ficam com cada parte.",
              disableable: true,
            }),
            field("pensao_alimenticia", "Haverá Pensão Alimentícia?", "select", {
              required: false,
              options: ["Não", "Sim - Para companheiro(a)", "Sim - Para filhos", "Sim - Para ambos"],
              disableable: true,
            }),
            field("valor_pensao", "Valor da Pensão", "money", {
              required: false,
              placeholder: "R$ 0,00",
              hint: "Valor mensal da pensão, se aplicável.",
              disableable: true,
            }),
          ],
        },
      ],
    },

    clientNotes: [
      "A união estável pode ser registrada em cartório para ter mais segurança jurídica.",
      "O regime de bens pode ser alterado mediante acordo entre as partes.",
      "Na dissolução consensual, ambas as partes devem concordar com os termos.",
    ],

    internalNotes: [
      "Se houver filhos menores, a dissolução deve ser judicial (homologação pelo juiz)",
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. AUTORIZAÇÃO DE VIAGEM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. COMODATO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. PERMUTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "permuta",
    name: "Contrato de Permuta",
    description: "Troca de bens entre duas partes (imóvel por imóvel, veículo, etc.)",
    icon: "RefreshCw",
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
            example: "Imóvel residencial na Rua X, nº 100, Matrícula 12.345, avaliado em R$ 300.000,00.",
            hint: "Descreva detalhadamente o bem, com identificação (matrícula, placa, etc.) e valor estimado.",
          }),
          field("bem_permutante2", "Bem do Segundo Permutante", "textarea", {
            required: true,
            placeholder: "Descreva o bem que o segundo está entregando...",
            example: "Veículo Volkswagen Gol 2022, placa ABC-1D23, RENAVAM 00123456789, avaliado em R$ 65.000,00.",
          }),
          field("torna", "Há Torna (Diferença em Dinheiro)?", "select", {
            required: false,
            options: ["Não", "Sim - Primeiro paga ao Segundo", "Sim - Segundo paga ao Primeiro"],
            hint: "Torna é o valor em dinheiro pago para compensar a diferença de valores dos bens.",
            disableable: true,
          }),
          field("valor_torna", "Valor da Torna", "money", {
            required: false,
            placeholder: "R$ 0,00",
            hint: "Valor da diferença que será paga em dinheiro.",
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
  },
];

// ─── Helpers para acesso fácil ───

/**
 * Busca documento por ID
 */
export const getDocumentById = (id) =>
  LEGAL_DOCUMENTS.find((doc) => doc.id === id);

/**
 * Retorna todos os documentos disponíveis
 */
export const getAvailableDocuments = () =>
  LEGAL_DOCUMENTS.filter((doc) => doc.available);

/**
 * Retorna todas as seções de um documento para uma variante específica
 */
export const getSectionsForVariant = (docId, variantId) => {
  const doc = getDocumentById(docId);
  if (!doc) return [];

  const variantSections = doc.variantSections?.[variantId] || [];

  // Inserir seções da variante após as seções comuns das partes
  // (antes da seção de pagamento/assinatura)
  const commonSections = [...doc.commonSections];
  const partySections = commonSections.filter(
    (s) => s.id.includes("vendedor") || s.id.includes("comprador") ||
           s.id.includes("locador") || s.id.includes("locatario") ||
           s.id.includes("outorgante") || s.id.includes("outorgado") ||
           s.id.includes("doador") || s.id.includes("donatario") ||
           s.id.includes("recebedor") || s.id.includes("pagador") ||
           s.id.includes("companheiro") || s.id.includes("autorizante") ||
           s.id.includes("menor") || s.id.includes("acompanhante") ||
           s.id.includes("comodante") || s.id.includes("comodatario") ||
           s.id.includes("permutante")
  );
  const otherSections = commonSections.filter(
    (s) => !partySections.includes(s)
  );

  return [...partySections, ...variantSections, ...otherSections];
};

/**
 * Retorna todos os campos (flat) para uma variante específica
 */
export const getAllFieldsForVariant = (docId, variantId) => {
  const sections = getSectionsForVariant(docId, variantId);
  return sections.flatMap((s) => s.fields);
};

/**
 * Retorna os campos obrigatórios para uma variante
 */
export const getRequiredFields = (docId, variantId) => {
  return getAllFieldsForVariant(docId, variantId).filter((f) => f.required);
};

/**
 * Valida os campos preenchidos
 */
export const validateFields = (docId, variantId, formData, disabledFields = {}) => {
  const required = getRequiredFields(docId, variantId);
  const errors = {};

  required.forEach((f) => {
    if (disabledFields[f.key]) return; // campo desabilitado, não valida
    const value = formData[f.key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors[f.key] = `${f.label} é obrigatório`;
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
};
