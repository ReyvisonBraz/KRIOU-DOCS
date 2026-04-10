import { field, pessoaFisicaFields } from "./_shared.js";

const compraVenda = {
  id: "compra-venda",
  name: "Compra e Venda",
  description: "Contrato para compra e venda de bens (imóvel, veículo, terreno)",
  icon: "FileText",
  available: true,
  legislation: "Código Civil Brasileiro (Lei 10.406/2002), Arts. 481 a 532",

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
          example:
            "3 parcelas iguais de R$ 75.000,00, sendo a 1ª em 30/05/2026, a 2ª em 30/06/2026 e a 3ª em 30/07/2026, via transferência bancária.",
          hint: "Detalhe aqui datas, valores de cada parcela e meio de pagamento.",
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
          hint: "Local escolhido para resolver problemas judiciais sobre este contrato.",
          disableable: true,
        }),
      ],
    },
  ],

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
            hint: "Número de registro do imóvel no Cartório de Registro de Imóveis.",
            whereFind: "Escritura do imóvel ou solicitar certidão no Cartório de Registro de Imóveis.",
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
            example:
              "Imóvel composto de 3 quartos, sendo 1 suíte, sala, cozinha, 2 banheiros, garagem para 2 carros, área total de 120m².",
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
            example:
              "Norte: Lote 14 de João da Silva; Sul: Rua das Acácias; Leste: Lote 16 de Maria Santos; Oeste: Área verde do loteamento.",
            hint: "Quem são os vizinhos em cada lado do terreno.",
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

  clientNotes: [
    "O sinal (arras) funciona como garantia: se o comprador desistir, perde o sinal. Se o vendedor desistir, devolve em dobro.",
    "Guarde uma via assinada do contrato. Cada parte deve ficar com uma via original.",
    "As testemunhas devem ser maiores de 18 anos e não podem ser parentes das partes.",
    "Para imóveis, é recomendável registrar o contrato no Cartório de Registro de Imóveis.",
    "Para veículos, faça a transferência no DETRAN em até 30 dias para evitar multas.",
  ],

  internalNotes: [
    "Verificar se matrícula está atualizada (menos de 30 dias)",
    "Conferir existência de ônus na matrícula",
    "Para veículos: checar débitos, multas e restrições no DETRAN",
  ],

  documentBody: {
    imovel: [
      {
        type: "title",
        text: "CONTRATO DE PROMESSA DE COMPRA E VENDA DE IMÓVEL",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, de um lado, como VENDEDOR(A): {vendedor_nome}{?, , {vendedor_nacionalidade}}{?, , {vendedor_estado_civil}}{?, , {vendedor_profissao}}{?, , portador(a) do RG n.º {vendedor_rg} e }inscrito(a) no CPF sob n.º {vendedor_cpf}{?, , residente e domiciliado(a) em {vendedor_endereco}}{?, , {vendedor_cidade}}, e de outro lado, como COMPRADOR(A): {comprador_nome}{?, , {comprador_nacionalidade}}{?, , {comprador_estado_civil}}{?, , {comprador_profissao}}{?, , portador(a) do RG n.º {comprador_rg} e }inscrito(a) no CPF sob n.º {comprador_cpf}{?, , residente e domiciliado(a) em {comprador_endereco}}{?, , {comprador_cidade}}, têm entre si, justo e acordado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) VENDEDOR(A) promete vender ao(à) COMPRADOR(A), que promete comprar, o imóvel do tipo {tipo_imovel} situado em {endereco_imovel}, {cidade_imovel}, de matrícula n.º {matricula}{?, , registrado no {cartorio}}.",
          "{?, Área total: {area_total}.}",
          "{?, Descrição: {descricao_imovel_texto}.}",
          "{?, Situação do financiamento: {possui_financiamento}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PREÇO",
        paragraphs: [
          "O preço total da venda é de {valor_total}, a ser pago na forma de {forma_pagamento}.",
          "{?, Sinal (arras) no valor de {valor_sinal}, pago no ato da assinatura deste instrumento.}",
          "{?, Condições: {condicoes_pagamento}.}",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DAS PENALIDADES",
        paragraphs: [
          "Em caso de inadimplemento por parte do(a) COMPRADOR(A), este(a) perderá o valor dado como sinal.",
          "Em caso de desistência por parte do(a) VENDEDOR(A), este(a) devolverá o sinal em dobro ao(à) COMPRADOR(A).",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DAS DECLARAÇÕES",
        paragraphs: [
          "O(A) VENDEDOR(A) declara que o imóvel está livre e desembaraçado de quaisquer ônus, dívidas, hipotecas, penhoras ou quaisquer outros gravames.",
          "O(A) VENDEDOR(A) se compromete a providenciar todas as quitações fiscais do imóvel e a documentação necessária para a transferência definitiva.",
          "As despesas com escritura, registro em cartório e imposto de transmissão (ITBI) serão de responsabilidade do(a) COMPRADOR(A), salvo acordo em contrário.",
        ],
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, as partes elegem o Foro da Comarca de {?, {foro}}{?, {cidade_contrato}}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor, na presença das duas testemunhas abaixo.",
      },
      {
        type: "date",
        text: "{cidade_contrato}, {data_assinatura}",
      },
      {
        type: "signatures",
        parties: [
          { role: "VENDEDOR(A)", fieldKey: "vendedor_nome" },
          { role: "COMPRADOR(A)", fieldKey: "comprador_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    veiculo: [
      {
        type: "title",
        text: "CONTRATO DE COMPRA E VENDA DE VEÍCULO",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, de um lado, como VENDEDOR(A): {vendedor_nome}{?, , {vendedor_nacionalidade}}{?, , {vendedor_estado_civil}}{?, , {vendedor_profissao}}{?, , portador(a) do RG n.º {vendedor_rg} e }inscrito(a) no CPF sob n.º {vendedor_cpf}{?, , residente e domiciliado(a) em {vendedor_endereco}}{?, , {vendedor_cidade}}, e de outro lado, como COMPRADOR(A): {comprador_nome}{?, , {comprador_nacionalidade}}{?, , {comprador_estado_civil}}{?, , {comprador_profissao}}{?, , portador(a) do RG n.º {comprador_rg} e }inscrito(a) no CPF sob n.º {comprador_cpf}{?, , residente e domiciliado(a) em {comprador_endereco}}{?, , {comprador_cidade}}, têm entre si, justo e acordado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) VENDEDOR(A) vende ao(à) COMPRADOR(A) o veículo: {marca_modelo}, ano de fabricação {ano_fabricacao}, modelo {ano_modelo}, cor {cor}, placa {placa}, chassi {chassi}, RENAVAM {renavam}{?, , combustível: {combustivel}}{?, , quilometragem: {km_atual}}.",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PREÇO",
        paragraphs: [
          "O preço total da venda é de {valor_total}, a ser pago na forma de {forma_pagamento}.",
          "{?, Sinal (arras) no valor de {valor_sinal}, pago no ato da assinatura.}",
          "{?, Condições: {condicoes_pagamento}.}",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DA TRANSFERÊNCIA",
        text: "O(A) VENDEDOR(A) declara que o veículo está livre de multas, débitos, alienação fiduciária ou quaisquer ônus que impeçam a transferência. A transferência do documento no DETRAN deve ser realizada pelo(a) COMPRADOR(A) em até 30 (trinta) dias.",
      },
      {
        type: "clause",
        number: "4ª",
        title: "DAS PENALIDADES",
        paragraphs: [
          "Em caso de inadimplemento por parte do(a) COMPRADOR(A), este(a) perderá o valor dado como sinal.",
          "Em caso de desistência por parte do(a) VENDEDOR(A), este(a) devolverá o sinal em dobro ao(à) COMPRADOR(A).",
        ],
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {?, {foro}}{?, {cidade_contrato}}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_contrato}, {data_assinatura}",
      },
      {
        type: "signatures",
        parties: [
          { role: "VENDEDOR(A)", fieldKey: "vendedor_nome" },
          { role: "COMPRADOR(A)", fieldKey: "comprador_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    terreno: [
      {
        type: "title",
        text: "CONTRATO DE COMPRA E VENDA DE TERRENO",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, de um lado, como VENDEDOR(A): {vendedor_nome}{?, , {vendedor_nacionalidade}}{?, , {vendedor_estado_civil}}{?, , {vendedor_profissao}}{?, , portador(a) do RG n.º {vendedor_rg} e }inscrito(a) no CPF sob n.º {vendedor_cpf}{?, , residente e domiciliado(a) em {vendedor_endereco}}{?, , {vendedor_cidade}}, e de outro lado, como COMPRADOR(A): {comprador_nome}{?, , {comprador_nacionalidade}}{?, , {comprador_estado_civil}}{?, , {comprador_profissao}}{?, , portador(a) do RG n.º {comprador_rg} e }inscrito(a) no CPF sob n.º {comprador_cpf}{?, , residente e domiciliado(a) em {comprador_endereco}}{?, , {comprador_cidade}}, têm entre si, justo e acordado o que segue:",
      },
      {
        type: "clause",
        number: "1ª",
        title: "DO OBJETO",
        paragraphs: [
          "O(A) VENDEDOR(A) vende ao(à) COMPRADOR(A) o terreno localizado em {endereco_terreno}, {cidade_terreno}, de matrícula n.º {matricula_terreno}, com área total de {area_terreno}.",
          "{?, Medidas: frente {medida_frente}{?, , fundo {medida_fundo}}{?, , lateral direita {medida_direita}}{?, , lateral esquerda {medida_esquerda}}.}",
          "{?, Confrontantes: {confrontantes}.}",
          "{?, Zoneamento: {zoneamento}.}",
        ],
      },
      {
        type: "clause",
        number: "2ª",
        title: "DO PREÇO",
        paragraphs: [
          "O preço total da venda é de {valor_total}, a ser pago na forma de {forma_pagamento}.",
          "{?, Sinal (arras) no valor de {valor_sinal}, pago no ato da assinatura.}",
          "{?, Condições: {condicoes_pagamento}.}",
        ],
      },
      {
        type: "clause",
        number: "3ª",
        title: "DAS PENALIDADES",
        paragraphs: [
          "Em caso de inadimplemento por parte do(a) COMPRADOR(A), este(a) perderá o valor dado como sinal.",
          "Em caso de desistência por parte do(a) VENDEDOR(A), este(a) devolverá o sinal em dobro ao(à) COMPRADOR(A).",
        ],
      },
      {
        type: "clause",
        number: "4ª",
        title: "DAS DECLARAÇÕES",
        text: "O(A) VENDEDOR(A) declara que o terreno está livre e desembaraçado de ônus, dívidas ou gravames. As despesas com escritura, registro e impostos de transferência serão de responsabilidade do(a) COMPRADOR(A).",
      },
      {
        type: "clause",
        number: "5ª",
        title: "DO FORO",
        text: "Para dirimir quaisquer dúvidas, as partes elegem o Foro da Comarca de {?, {foro}}{?, {cidade_contrato}}.",
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor.",
      },
      {
        type: "date",
        text: "{cidade_contrato}, {data_assinatura}",
      },
      {
        type: "signatures",
        parties: [
          { role: "VENDEDOR(A)", fieldKey: "vendedor_nome" },
          { role: "COMPRADOR(A)", fieldKey: "comprador_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],
  },
};

export default compraVenda;
