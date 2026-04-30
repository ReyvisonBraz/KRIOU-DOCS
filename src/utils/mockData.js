/**
 * ============================================
 * KRIOU DOCS - Mock Data Generator
 * ============================================
 * Gera dados fictícios para pré-visualização dos
 * documentos jurídicos sem precisar preencher
 * o formulário manualmente.
 *
 * Uso exclusivo para fins de demonstração — os
 * dados gerados são totalmente aleatórios e não
 * representam pessoas ou situações reais.
 */

// ─── Banco de nomes e dados fictícios ────────────────────────────────────────

const NOMES_MASCULINOS = [
  "Carlos Eduardo", "João Pedro", "Roberto Augusto", "Fernando Luís",
  "Marcelo Antonio", "Ricardo Silva", "Paulo Henrique", "André Luís",
  "Gustavo Henrique", "Thiago Martins",
];

const NOMES_FEMININOS = [
  "Ana Paula", "Maria Clara", "Juliana Santos", "Fernanda Oliveira",
  "Patrícia Lima", "Camila Souza", "Renata Costa", "Beatriz Alves",
  "Larissa Ferreira", "Gabriela Rodrigues",
];

const SOBRENOMES = [
  "da Silva", "dos Santos", "de Oliveira", "Ferreira", "Rodrigues",
  "Almeida", "Nascimento", "Lima", "Araújo", "Pereira",
];

const CIDADES = [
  "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
  "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA",
  "Fortaleza, CE", "Manaus, AM", "Recife, PE", "Goiânia, GO",
];

const COMARCAS = [
  "São Paulo/SP", "Rio de Janeiro/RJ", "Belo Horizonte/MG",
  "Curitiba/PR", "Porto Alegre/RS", "Salvador/BA",
];

const PROFISSOES = [
  "Comerciante", "Engenheiro(a)", "Professora", "Médico(a)",
  "Advogado(a)", "Contador(a)", "Técnico(a) de TI", "Autônomo(a)",
  "Servidor(a) Público(a)", "Empresário(a)",
];

const BAIRROS = [
  "Centro", "Jardim América", "Vila Nova", "Boa Vista",
  "Santa Cruz", "Jardim das Flores", "São José", "Alto da Boa Vista",
];

const RUAS = [
  "Rua das Flores", "Avenida Brasil", "Rua São João", "Rua Tiradentes",
  "Avenida Paulista", "Rua das Palmeiras", "Rua do Comércio", "Alameda Santos",
];

// ─── Utilitários de aleatoriedade ─────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const mockNome = () => {
  const isFem = Math.random() > 0.5;
  const primeiro = pick(isFem ? NOMES_FEMININOS : NOMES_MASCULINOS);
  return `${primeiro} ${pick(SOBRENOMES)}`;
};

const mockCPF = () => {
  const n = () => rand(100, 999);
  const d = () => rand(10, 99);
  return `${n()}.${n()}.${n()}-${d()}`;
};

const mockRG = () => {
  const n = () => rand(100, 999);
  return `${n()}.${rand(100, 999)}.${rand(100, 999)}-${rand(1, 9)} SSP/${pick(["SP", "RJ", "MG", "PR", "RS"])}`;
};

const mockEndereco = () =>
  `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`;

const mockCidade = () => pick(CIDADES);

const mockMoney = (min, max) => {
  const valor = rand(min, max) * 100;
  return `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
};

const mockDate = (offsetMonths = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toISOString().split("T")[0]; // yyyy-mm-dd
};

const mockPlaca = () => {
  const letters = () => String.fromCharCode(rand(65, 90));
  const digit = () => rand(0, 9);
  return `${letters()}${letters()}${letters()}-${digit()}${letters()}${digit()}${digit()}`;
};

// ─── Dados de pessoa física completos ────────────────────────────────────────

const mockPessoaFisica = (prefix) => ({
  [`${prefix}_nome`]: mockNome(),
  [`${prefix}_cpf`]: mockCPF(),
  [`${prefix}_rg`]: mockRG(),
  [`${prefix}_nacionalidade`]: "Brasileiro(a)",
  [`${prefix}_estado_civil`]: pick(["Solteiro(a)", "Casado(a)", "Divorciado(a)", "União Estável"]),
  [`${prefix}_profissao`]: pick(PROFISSOES),
  [`${prefix}_endereco`]: mockEndereco(),
  [`${prefix}_cidade`]: mockCidade(),
});

// ─── Geradores por documento ──────────────────────────────────────────────────

const GENERATORS = {

  "compra-venda": (variantId) => {
    const base = {
      ...mockPessoaFisica("vendedor"),
      ...mockPessoaFisica("comprador"),
      valor_total: mockMoney(800, 5000) + "00",
      forma_pagamento: pick(["À vista", "Com Sinal + Parcelas", "Financiamento Bancário"]),
      valor_sinal: mockMoney(80, 500) + "00",
      condicoes_pagamento: "Pagamento à vista, via transferência bancária, no ato da assinatura do contrato.",
      cidade_contrato: mockCidade(),
      data_assinatura: mockDate(),
      foro: `Comarca de ${pick(COMARCAS)}`,
    };

    if (variantId === "imovel") {
      return {
        ...base,
        tipo_imovel: pick(["Casa", "Apartamento", "Sobrado"]),
        endereco_imovel: `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`,
        cidade_imovel: mockCidade(),
        matricula_imovel: `${rand(10000, 99999)} — ${rand(1, 5)}º Cartório de Registro de Imóveis`,
        area_imovel: `${rand(50, 400)} m²`,
        descricao_imovel: "Imóvel residencial em bom estado de conservação, com documentação regularizada.",
      };
    }
    if (variantId === "veiculo") {
      return {
        ...base,
        marca_modelo: pick(["Volkswagen Gol", "Fiat Uno", "Chevrolet Onix", "Toyota Corolla", "Honda Civic"]),
        ano_fabricacao: String(rand(2010, 2023)),
        ano_modelo: String(rand(2011, 2024)),
        cor: pick(["Prata", "Branco", "Preto", "Cinza", "Vermelho"]),
        placa: mockPlaca(),
        chassi: `9BW${rand(100000000, 999999999)}AB${rand(10000, 99999)}`,
        renavam: String(rand(10000000000, 99999999999)),
        combustivel: pick(["Flex (Gasolina e Etanol)", "Gasolina", "Etanol"]),
        km_atual: `${rand(5, 180)}.${rand(0, 9)}00 km`,
      };
    }
    if (variantId === "terreno") {
      return {
        ...base,
        endereco_terreno: `${pick(RUAS)}, Quadra ${rand(1, 50)}, Lote ${rand(1, 30)}`,
        cidade_terreno: mockCidade(),
        matricula_terreno: `${rand(10000, 99999)} — ${rand(1, 3)}º Cartório de Registro de Imóveis`,
        area_terreno: `${rand(200, 5000)} m²`,
        descricao_terreno: "Terreno plano, sem edificações, com matrícula registrada e documentação regular.",
      };
    }
    return base;
  },

  "locacao": (variantId) => {
    const inicio = mockDate(0);
    const fim = mockDate(12);
    const base = {
      ...mockPessoaFisica("locador"),
      ...mockPessoaFisica("locatario"),
      valor_aluguel: mockMoney(10, 50) + "00",
      dia_vencimento: pick(["5", "10", "15"]),
      prazo_inicio: inicio,
      prazo_fim: fim,
      valor_caucao: mockMoney(30, 150) + "00",
      indice_reajuste: "IGP-M (FGV)",
      valor_iptu: mockMoney(1, 5) + "00",
      cidade_contrato_loc: mockCidade(),
      data_assinatura_loc: mockDate(),
    };

    if (variantId === "residencial") {
      return {
        ...base,
        tipo_imovel_loc: pick(["Apartamento", "Casa", "Kitnet"]),
        endereco_imovel_loc: `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`,
        cidade_imovel_loc: mockCidade(),
        area_imovel_loc: `${rand(35, 200)} m²`,
        numero_quartos: String(rand(1, 4)),
      };
    }
    if (variantId === "comercial") {
      return {
        ...base,
        tipo_imovel_com: pick(["Sala Comercial", "Loja", "Galpão"]),
        endereco_imovel_com: `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`,
        cidade_imovel_com: mockCidade(),
        area_imovel_com: `${rand(50, 500)} m²`,
        finalidade_comercial: pick(["Escritório", "Comércio varejista", "Prestação de serviços"]),
      };
    }
    return base;
  },

  "procuracao": (variantId) => {
    const base = {
      ...mockPessoaFisica("outorgante"),
      ...mockPessoaFisica("outorgado"),
      cidade_procuracao: mockCidade(),
      data_procuracao: mockDate(),
    };

    if (variantId === "particular") {
      return {
        ...base,
        poderes_procuracao: "Representar o outorgante em negociações, assinar contratos, receber e dar quitação de valores, e praticar todos os demais atos necessários ao fiel cumprimento do presente mandato.",
        substabelecimento: pick(["Com substabelecimento", "Sem substabelecimento"]),
        prazo_procuracao: pick(["1 ano", "2 anos", "Prazo indeterminado"]),
        finalidade_procuracao: "Administração de bens e representação em negócios em geral.",
      };
    }
    if (variantId === "ad-judicia") {
      return {
        ...base,
        poderes_procuracao: "Representar o outorgante em qualquer processo judicial, praticar todos os atos processuais, receber citações, interpor recursos e transigir quando necessário.",
        substabelecimento: "Com substabelecimento",
        prazo_procuracao: "Prazo indeterminado",
        finalidade_procuracao: "Representação judicial em todos os graus de jurisdição.",
      };
    }
    return base;
  },

  "doacao": (variantId) => {
    const base = {
      ...mockPessoaFisica("doador"),
      ...mockPessoaFisica("donatario"),
      tipo_bem_doacao: pick(["Imóvel (Casa/Apartamento)", "Veículo", "Dinheiro"]),
      descricao_bem_doacao: "Imóvel residencial localizado na " + pick(RUAS) + ", nº " + rand(1, 999) + ", " + pick(BAIRROS) + ", com matrícula nº " + rand(10000, 99999) + " no cartório competente.",
      valor_estimado_doacao: mockMoney(500, 5000) + "00",
      cidade_doacao: mockCidade(),
      data_doacao: mockDate(),
    };

    if (variantId === "usufruto") {
      return {
        ...base,
        tipo_usufruto: "Vitalício (até o falecimento do doador)",
        prazo_usufruto: "",
      };
    }
    if (variantId === "reversao") {
      return {
        ...base,
        condicao_reversao: "Falecimento do donatário antes do doador",
        condicao_reversao_desc: "",
      };
    }
    return base;
  },

  "recibo": (variantId) => {
    const base = {
      nome_recebedor: mockNome(),
      cpf_recebedor: mockCPF(),
      nome_pagador: mockNome(),
      cpf_pagador: mockCPF(),
      cidade_recibo: mockCidade(),
      data_recibo: mockDate(),
    };

    if (variantId === "pagamento") {
      return {
        ...base,
        valor_recibo: mockMoney(5, 200) + "00",
        descricao_pagamento: pick([
          "Prestação de serviços de consultoria",
          "Venda de produto eletrônico",
          "Honorários profissionais referentes ao mês vigente",
          "Pagamento de dívida pessoal",
        ]),
        forma_pgto_recibo: pick(["PIX", "Transferência bancária", "Dinheiro em espécie", "Boleto bancário"]),
      };
    }
    if (variantId === "aluguel") {
      const mes = new Date();
      return {
        ...base,
        valor_aluguel_recibo: mockMoney(8, 40) + "00",
        endereco_imovel_recibo: `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`,
        mes_referencia_recibo: mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        ...mockPessoaFisica("locador_recibo"),
        ...mockPessoaFisica("locatario_recibo"),
      };
    }
    return base;
  },

  "uniao-estavel": (variantId) => {
    const base = {
      ...mockPessoaFisica("companheiro1"),
      ...mockPessoaFisica("companheiro2"),
      cidade_uniao: mockCidade(),
      data_uniao: mockDate(),
    };

    if (variantId === "declaracao") {
      return {
        ...base,
        data_inicio_uniao: mockDate(-rand(12, 60)),
        regime_bens: pick(["Comunhão Parcial de Bens", "Separação Total de Bens"]),
        endereco_residencia: `${pick(RUAS)}, ${rand(1, 999)}, ${pick(BAIRROS)}`,
        filhos_uniao: pick(["Não", "Sim"]),
      };
    }
    if (variantId === "dissolucao") {
      return {
        ...base,
        data_inicio_uniao_diss: mockDate(-rand(24, 96)),
        data_fim_uniao: mockDate(-rand(1, 6)),
        motivo_dissolucao: "Consensual (ambos concordam)",
        partilha_bens: pick(["Não há bens a partilhar", "Sim - Amigável"]),
        descricao_partilha: "Os bens adquiridos durante a união serão divididos de forma igualitária entre as partes, conforme acordo mútuo.",
        pensao_alimenticia: "Não",
        valor_pensao: "",
      };
    }
    return base;
  },

  "autorizacao-viagem": (variantId) => {
    const base = {
      ...mockPessoaFisica("autorizante"),
      parentesco: pick(["Pai", "Mãe", "Responsável Legal"]),
      nome_menor: mockNome(),
      data_nascimento_menor: mockDate(-rand(60, 180)),
      rg_menor: mockRG().split(" ")[0],
      cpf_menor: mockCPF(),
      nome_acompanhante: mockNome(),
      cpf_acompanhante: mockCPF(),
      parentesco_acompanhante: pick(["Avó materna", "Tio paterno", "Responsável da escola", "Avô"]),
      cidade_autorizacao: mockCidade(),
      data_autorizacao: mockDate(),
    };

    if (variantId === "nacional") {
      return {
        ...base,
        destino_nacional: pick(["São Paulo, SP", "Rio de Janeiro, RJ", "Florianópolis, SC", "Natal, RN"]),
        data_ida_nacional: mockDate(1),
        data_volta_nacional: mockDate(2),
        motivo_viagem_nacional: pick(["Viagem de férias", "Visita a familiares", "Excursão escolar"]),
      };
    }
    if (variantId === "internacional") {
      return {
        ...base,
        pais_destino: pick(["Argentina", "Portugal", "Estados Unidos", "Espanha", "Itália"]),
        data_ida_internacional: mockDate(1),
        data_volta_internacional: mockDate(3),
        motivo_viagem_internacional: pick(["Intercâmbio escolar", "Viagem de férias", "Tratamento de saúde"]),
      };
    }
    return base;
  },

  "permuta": () => ({
    ...mockPessoaFisica("permutante1"),
    ...mockPessoaFisica("permutante2"),
    bem_permutante1: `Imóvel residencial na ${pick(RUAS)}, nº ${rand(1, 999)}, Matrícula ${rand(10000, 99999)}, avaliado em ${mockMoney(200, 600)}00.`,
    bem_permutante2: `Veículo ${pick(["Volkswagen Gol", "Fiat Uno", "Honda Civic"])} ${rand(2015, 2023)}, placa ${mockPlaca()}, RENAVAM ${rand(10000000000, 99999999999)}, avaliado em ${mockMoney(30, 120)}00.`,
    torna: pick(["Não", "Sim - Primeiro paga ao Segundo"]),
    valor_torna: mockMoney(5, 50) + "00",
    cidade_permuta: mockCidade(),
    data_permuta: mockDate(),
  }),

  "comodato": (variantId) => {
    const base = {
      ...mockPessoaFisica("comodante"),
      ...mockPessoaFisica("comodatario"),
      cidade_comodato: mockCidade(),
      data_comodato: mockDate(),
    };

    if (variantId === "imovel" || variantId === "residencial") {
      return {
        ...base,
        tipo_bem_comodato: "Imóvel (Casa/Apartamento)",
        descricao_bem_comodato: `Imóvel residencial localizado na ${pick(RUAS)}, nº ${rand(1, 999)}, ${pick(BAIRROS)}, com matrícula nº ${rand(10000, 99999)}.`,
        prazo_comodato: pick(["6 meses", "12 meses", "24 meses", "Prazo indeterminado"]),
        data_devolucao_comodato: mockDate(12),
        finalidade_comodato: "Moradia própria do comodatário, sem fins comerciais.",
      };
    }
    return {
      ...base,
      tipo_bem_comodato: pick(["Veículo", "Equipamento", "Outro"]),
      descricao_bem_comodato: `${pick(["Veículo Fiat Uno", "Notebook Dell", "Equipamento de ar condicionado"])} em bom estado de conservação.`,
      prazo_comodato: pick(["3 meses", "6 meses", "12 meses"]),
      data_devolucao_comodato: mockDate(6),
      finalidade_comodato: "Uso pessoal/profissional do comodatário, conforme acordado.",
    };
  },
};

// ─── Gerador genérico por tipo de campo ──────────────────────────────────────
// Usado como fallback quando o documento não tem gerador específico para o campo.

const FIELD_TYPE_FALLBACKS = {
  text:     () => "Dado de demonstração",
  textarea: () => "Texto de demonstração para visualização do documento. Este campo foi preenchido automaticamente.",
  cpf:      () => mockCPF(),
  date:     () => mockDate(),
  money:    () => mockMoney(10, 100) + "00",
  select:   (field) => field.options?.[0] || "Opção 1",
  number:   () => String(rand(1, 100)),
};

/**
 * Gera um objeto de formData com valores fictícios para todos os campos
 * de uma variante específica de um documento.
 *
 * @param {string} docId      - ID do documento (ex: "compra-venda")
 * @param {string} variantId  - ID da variante (ex: "imovel")
 * @param {Array}  sections   - Seções retornadas por getSectionsForVariant()
 * @returns {Object} formData preenchido com dados fictícios
 */
export const generateMockFormData = (docId, variantId, sections) => {
  // 1. Gera dados específicos do documento (maior fidelidade)
  const specificData = GENERATORS[docId]?.(variantId) || {};

  // 2. Para campos que o gerador específico não cobriu, usa fallback por tipo
  const allFields = sections.flatMap((s) => s.fields);
  const fallbackData = {};
  allFields.forEach((fieldDef) => {
    if (specificData[fieldDef.key] === undefined) {
      const gen = FIELD_TYPE_FALLBACKS[fieldDef.type] || FIELD_TYPE_FALLBACKS.text;
      fallbackData[fieldDef.key] = gen(fieldDef);
    }
  });

  return { ...fallbackData, ...specificData };
};
