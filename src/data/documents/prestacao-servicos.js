import { field, parteQualificacaoText, pessoaFisicaFields } from "./_shared.js";

const contratanteQualificacao = parteQualificacaoText("contratante", "CONTRATANTE");
const contratadoQualificacao = parteQualificacaoText("contratado", "CONTRATADO(A)");

const prestacaoServicos = {
  id: "prestacao-servicos",
  name: "Contrato de Prestação de Serviços",
  description: "Contrato para prestação de serviços autônomos, consultorias e trabalhos temporários",
  icon: "Wrench",
  available: true,
  legislation: "Código Civil (Lei nº 10.406/2002), arts. 593 a 609",
  spec: {
    whenUse: "Para contratar profissionais autônomos, consultores ou prestadores de serviço por tarefa, projeto ou período determinado, sem vínculo empregatício.",
    parties: ["Contratante (quem contrata)", "Contratado (quem presta o serviço)"],
    sections: ["Dados das Partes", "Objeto do Contrato", "Prazo e Vigência", "Remuneração", "Obrigações", "Rescisão", "Assinaturas"],
    requiredDocs: ["Documentos de identidade", "CPF/CNPJ de ambas as partes"],
    tips: [
      "Descreva detalhadamente o serviço a ser prestado para evitar dúvidas futuras",
      "Defina prazos realistas de entrega e pagamento",
      "Especifique quem arca com materiais e despesas",
      "Inclua cláusula de confidencialidade se necessário",
    ],
    commonIssues: [
      "Descrição genérica do objeto que gera interpretações divergentes",
      "Prazo de pagamento mal definido",
      "Confusão entre vínculo empregatício e prestação de serviços autônomos",
      "Falta de previsão para rescisão antecipada",
    ],
  },

  defaultVariant: "autonomo",
  variants: [
    {
      id: "autonomo",
      name: "Profissional Autônomo",
      description: "Para contratação de profissionais liberais e autônomos",
      icon: "briefcase",
      maxParties: { party1: 1, party2: 1 },
    },
    {
      id: "consultoria",
      name: "Consultoria Especializada",
      description: "Para serviços de consultoria técnica ou gerencial",
      icon: "search",
      maxParties: { party1: 1, party2: 1 },
    },
    {
      id: "temporario",
      name: "Trabalho Temporário / Projeto",
      description: "Para serviços por projeto, tarefa ou prazo determinado",
      icon: "clock",
      maxParties: { party1: 1, party2: 1 },
    },
  ],

  commonSections: [
    {
      id: "contratante",
      title: "Quem Está Contratando o Serviço",
      subtitle: "Dados do Contratante (tomador do serviço)",
      icon: "user",
      fields: pessoaFisicaFields("contratante", "Contratante"),
    },
    {
      id: "contratado",
      title: "Quem Vai Prestar o Serviço",
      subtitle: "Dados do Contratado (prestador do serviço)",
      icon: "user",
      fields: [
        ...pessoaFisicaFields("contratado", "Contratado"),
        field("contratado_profissao", "Profissão / Área de Atuação", "text", {
          required: true,
          placeholder: "Ex: Designer Gráfico, Eletricista, Consultor de RH",
          example: "Designer Gráfico",
          hint: "Informe a profissão ou área de especialização do prestador do serviço.",
          whyImportant: "Identifica a área de atuação e ajuda a caracterizar a natureza do serviço contratado.",
        }),
        field("contratado_registro", "Registro Profissional (opcional)", "text", {
          required: false,
          placeholder: "Ex: CREA, CRC, OAB, etc.",
          hint: "Se o profissional possui registro em conselho de classe (CREA, CRC, OAB, etc.), informe o número.",
          whatHappensIfEmpty: "O contrato será gerado sem menção a registro profissional.",
        }),
      ],
    },
    {
      id: "assinaturas_ps",
      title: "Data e Assinaturas",
      subtitle: "Local, data e assinatura de ambas as partes",
      icon: "calendar",
      fields: [
        field("cidade_ps", "Cidade", "text", {
          required: true,
          placeholder: "Cidade, UF",
          example: "São Paulo, SP",
          hint: "Cidade onde o contrato está sendo assinado.",
        }),
        field("data_ps", "Data do Contrato", "date", {
          required: true,
          hint: "Data em que o contrato é assinado.",
        }),
      ],
    },
  ],

  variantSections: {
    autonomo: [
      {
        id: "objeto_autonomo",
        title: "Objeto do Contrato - Serviços Autônomos",
        subtitle: "Descrição dos serviços a serem prestados",
        icon: "file",
        fields: [
          field("objeto_descricao_auto", "Descrição Detalhada dos Serviços", "textarea", {
            required: true,
            placeholder: "Descreva detalhadamente os serviços que serão prestados...",
            example: "Serviços de manutenção elétrica predial, incluindo instalação e reparo de redes, tomadas, interruptores e quadros de energia.",
            hint: "Descreva com o máximo de detalhes possível o que será feito. Isso evita dúvidas e conflitos futuros.",
            whyImportant: "É a cláusula mais importante do contrato. Uma descrição genérica pode gerar interpretações divergentes.",
          }),
          field("prazo_auto", "Prazo de Execução", "text", {
            required: true,
            placeholder: "Ex: 30 dias corridos a partir da assinatura",
            example: "15 dias úteis a contar da assinatura",
            hint: "Informe o prazo estimado para conclusão dos serviços.",
          }),
          field("local_execucao_auto", "Local de Execução", "text", {
            required: false,
            placeholder: "Ex: Residencial - Rua X, 123",
            hint: "Onde os serviços serão prestados. Pode ser endereço fixo, remoto ou 'a definir'.",
            whatHappensIfEmpty: "O contrato indicará que o local de execução será acordado entre as partes.",
          }),
          field("valor_auto", "Valor dos Serviços", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 4.500,00",
            hint: "Valor total acordado pela prestação dos serviços.",
          }),
          field("valor_extenso_auto", "Valor por Extenso", "text", {
            required: true,
            placeholder: "Ex: quatro mil e quinhentos reais",
            example: "quatro mil e quinhentos reais",
            hint: "Escreva o valor por extenso. Isso é obrigatório em contratos para evitar adulterações.",
            whyImportant: "O valor por extenso é a forma mais segura de registrar valores contratuais.",
          }),
          field("forma_pgto_auto", "Forma de Pagamento", "select", {
            required: true,
            options: ["PIX", "Transferência Bancária", "Dinheiro", "Cheque", "Cartão"],
            hint: "Como o contratado será pago.",
          }),
          field("prazo_pgto_auto", "Prazo de Pagamento", "select", {
            required: true,
            options: ["À vista na assinatura", "À vista na conclusão", "50% início + 50% conclusão", "Mensal", "Semanal", "Após 30 dias da conclusão"],
            hint: "Quando o pagamento será efetuado.",
          }),
          field("materiais_auto", "Materiais e Despesas", "select", {
            required: false,
            options: ["Por conta do contratado", "Por conta do contratante", "Rateio entre as partes"],
            hint: "Quem arca com materiais, ferramentas e despesas necessárias para execução do serviço.",
            whatHappensIfEmpty: "O contrato não especificará a responsabilidade por materiais e despesas.",
          }),
        ],
      },
    ],
    consultoria: [
      {
        id: "objeto_consultoria",
        title: "Objeto da Consultoria",
        subtitle: "Escopo do trabalho de consultoria",
        icon: "file",
        fields: [
          field("objeto_descricao_consul", "Descrição da Consultoria", "textarea", {
            required: true,
            placeholder: "Descreva o escopo da consultoria...",
            example: "Consultoria em gestão financeira, incluindo diagnóstico organizacional, análise de fluxo de caixa, elaboração de plano de redução de custos e treinamento da equipe financeira.",
            hint: "Detalhe o escopo completo da consultoria: diagnóstico, entregas, treinamentos, relatórios, etc.",
            whyImportant: "Define os limites e entregas esperados da consultoria.",
          }),
          field("entregaveis_consul", "Produtos / Entregáveis", "textarea", {
            required: false,
            placeholder: "Ex: Relatórios, planilhas, treinamentos, etc.",
            example: "Relatório diagnóstico, plano de ação, 3 treinamentos de 4h cada.",
            hint: "Liste o que será entregue ao final: relatórios, documentos, treinamentos, certificados, etc.",
            whatHappensIfEmpty: "O contrato não especificará entregáveis específicos.",
          }),
          field("prazo_consul", "Duração da Consultoria", "text", {
            required: true,
            placeholder: "Ex: 3 meses, renovável",
            example: "2 meses, com possibilidade de renovação",
            hint: "Informe o período de duração da consultoria.",
          }),
          field("carga_horaria_consul", "Dedicação / Carga Horária", "select", {
            required: false,
            options: ["Dedicação exclusiva", "20h semanais", "10h semanais", "Por demanda / horas avulsas", "A combinar"],
            hint: "Quanto tempo o consultor dedicará ao projeto.",
            whatHappensIfEmpty: "O contrato não especificará carga horária.",
          }),
          field("valor_consul", "Honorários", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 12.000,00",
            hint: "Valor total acordado pelos serviços de consultoria.",
          }),
          field("valor_extenso_consul", "Valor por Extenso", "text", {
            required: true,
            placeholder: "Ex: doze mil reais",
            example: "doze mil reais",
            hint: "Escreva o valor por extenso.",
          }),
          field("forma_pgto_consul", "Forma de Pagamento", "select", {
            required: true,
            options: ["PIX", "Transferência Bancária", "Boleto"],
            hint: "Como o consultor será pago.",
          }),
          field("periodicidade_pgto_consul", "Periodicidade do Pagamento", "select", {
            required: true,
            options: ["À vista", "Mensal", "50% início + 50% conclusão", "Parcelado (especificar no contrato)"],
            hint: "De quanto em quanto tempo o pagamento será feito.",
          }),
        ],
      },
    ],
    temporario: [
      {
        id: "objeto_temporario",
        title: "Objeto do Contrato - Trabalho Temporário",
        subtitle: "Descrição do serviço temporário ou por projeto",
        icon: "file",
        fields: [
          field("objeto_descricao_temp", "Descrição do Serviço / Projeto", "textarea", {
            required: true,
            placeholder: "Descreva o projeto ou serviço temporário...",
            example: "Desenvolvimento de site institucional, incluindo layout responsivo, 5 páginas, formulário de contato e integração com redes sociais.",
            hint: "Descreva o serviço, projeto ou tarefa a ser executada.",
          }),
          field("prazo_temp", "Prazo de Duração", "text", {
            required: true,
            placeholder: "Ex: 60 dias, a partir de 01/06/2026",
            example: "45 dias corridos, com início em 01/06/2026 e término em 15/07/2026",
            hint: "Período de duração do contrato temporário.",
          }),
          field("remuneracao_temp", "Remuneração Total", "money", {
            required: true,
            placeholder: "R$ 0,00",
            example: "R$ 8.000,00",
            hint: "Valor total combinado pelo serviço ou projeto.",
            whyImportant: "Define o valor que o contratado receberá pela execução do serviço.",
          }),
          field("valor_extenso_temp", "Valor por Extenso", "text", {
            required: true,
            placeholder: "Ex: oito mil reais",
            example: "oito mil reais",
            hint: "Escreva o valor por extenso.",
          }),
          field("forma_pgto_temp", "Forma de Pagamento", "select", {
            required: true,
            options: ["PIX", "Transferência Bancária", "Dinheiro", "Cheque"],
            hint: "Como o contratado receberá o pagamento.",
          }),
          field("prazo_pgto_temp", "Condição de Pagamento", "select", {
            required: true,
            options: ["À vista na entrega", "50% início + 50% conclusão", "Parcelado em 2x", "Parcelado em 3x", "Após aprovação do projeto"],
            hint: "Quando o pagamento será efetuado.",
          }),
          field("recursos_temp", "Recursos Fornecidos pelo Contratante", "textarea", {
            required: false,
            placeholder: "Ex: Notebook, software licenciado, acesso ao sistema...",
            hint: "O que o contratante fornecerá para execução do trabalho (equipamentos, licenças, acesso, etc.).",
            whatHappensIfEmpty: "O contrato não especificará recursos fornecidos pelo contratante.",
          }),
          field("propriedade_intelectual", "Propriedade Intelectual", "select", {
            required: false,
            options: ["Pertence ao contratante", "Pertence ao contratado", "Compartilhada entre as partes"],
            hint: "Quem detém os direitos sobre o resultado do trabalho (código, design, relatórios, etc.).",
            whatHappensIfEmpty: "O contrato não incluirá cláusula de propriedade intelectual.",
          }),
        ],
      },
    ],
  },

  documentBody: {
    autonomo: [
      {
        type: "title",
        text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS AUTÔNOMOS",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, as partes qualificadas a seguir:",
      },
      {
        type: "paragraph",
        text: `${contratanteQualificacao}, doravante denominado(a) simplesmente CONTRATANTE; e ${contratadoQualificacao}{?, , portador(a) do registro profissional n.º {contratado_registro}}, doravante denominado(a) simplesmente CONTRATADO(A), celebram o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS AUTÔNOMOS, que se regerá pelas cláusulas e condições seguintes:`,
      },
      {
        type: "clause",
        title: "CLÁUSULA PRIMEIRA — DO OBJETO",
        paragraphs: [
          "O CONTRATADO se obriga a prestar ao CONTRATANTE os serviços de {objeto_descricao_auto}, descritos de forma detalhada no escopo do presente contrato.",
          "O CONTRATADO declara possuir capacidade técnica e profissional para a execução dos serviços contratados, assumindo integral responsabilidade pela qualidade e pontualidade da execução.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEGUNDA — DO PRAZO E LOCAL DE EXECUÇÃO",
        paragraphs: [
          "O prazo para execução dos serviços é de {prazo_auto}, contado a partir da assinatura deste contrato.",
          "{?, Os serviços serão executados no seguinte local: {local_execucao_auto}.}",
          "Qualquer alteração de prazo deverá ser previamente acordada entre as partes e formalizada por aditivo contratual.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA TERCEIRA — DA REMUNERAÇÃO",
        paragraphs: [
          "Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor de {valor_auto} ({valor_extenso_auto}).",
          "O pagamento será efetuado {prazo_pgto_auto}, por meio de {forma_pgto_auto}.",
          "{?, Os materiais e despesas necessários à execução dos serviços ficarão {materiais_auto}.}",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUARTA — DAS OBRIGAÇÕES DAS PARTES",
        paragraphs: [
          "São obrigações do CONTRATADO: (a) executar os serviços com diligência, qualidade e dentro do prazo estipulado; (b) utilizar materiais e técnicas adequadas; (c) responder por eventuais vícios ou defeitos na execução; (d) manter sigilo sobre informações confidenciais do CONTRATANTE às quais tiver acesso.",
          "São obrigações do CONTRATANTE: (a) fornecer as informações e condições necessárias à execução dos serviços; (b) efetuar o pagamento na forma e prazo ajustados; (c) receber os serviços executados e aprová-los ou rejeitá-los fundamentadamente.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUINTA — DA NATUREZA DO VÍNCULO",
        paragraphs: [
          "O presente contrato não cria vínculo empregatício entre as partes, caracterizando-se como prestação de serviços autônomos, nos termos do artigo 593 do Código Civil Brasileiro.",
          "O CONTRATADO exerce sua atividade com autonomia técnica e gerencial, sem subordinação hierárquica, horário fixo ou exclusividade, assumindo integralmente os riscos de sua atividade.",
          "Fica expressamente vedado ao CONTRATADO fazer-se substituir por terceiros na execução dos serviços sem prévia e expressa autorização do CONTRATANTE.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEXTA — DA RESCISÃO",
        paragraphs: [
          "Qualquer das partes poderá rescindir o presente contrato mediante notificação prévia por escrito com antecedência mínima de 15 (quinze) dias.",
          "Em caso de rescisão sem justa causa pelo CONTRATANTE, este pagará ao CONTRATADO os serviços efetivamente prestados até a data da rescisão, proporcionais ao valor total do contrato.",
          "A rescisão por justa causa poderá ser imediata, sem ônus para a parte inocente, nos casos de: (a) descumprimento de obrigação contratual; (b) conduta que inviabilize a continuidade da relação; (c) prática de ato ilícito ou de má-fé.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SÉTIMA — DAS DISPOSIÇÕES GERAIS",
        paragraphs: [
          "As partes elegem o foro da Comarca de {cidade_ps} para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.",
          "Este contrato é firmado em caráter irretratável e irrevogável, obrigando as partes, seus herdeiros e sucessores.",
          "Qualquer alteração neste contrato somente será válida se formalizada por aditivo escrito assinado por ambas as partes.",
        ],
      },
      {
        type: "closing",
        text: "E, por estarem assim justas e contratadas, as partes firmam o presente instrumento particular, em duas vias de igual teor e forma, na presença de 2 (duas) testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_ps}, {data_ps}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Contratante", fieldKey: "contratante_nome" },
          { role: "Contratado(a)", fieldKey: "contratado_nome" },
        ],
      },
      {
        type: "witnesses",
        count: 2,
      },
    ],

    consultoria: [
      {
        type: "title",
        text: "CONTRATO DE CONSULTORIA",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, as partes:",
      },
      {
        type: "paragraph",
        text: `${contratanteQualificacao}, doravante denominado(a) simplesmente CONTRATANTE; e ${contratadoQualificacao}{?, , portador(a) do registro n.º {contratado_registro}}, doravante denominado(a) simplesmente CONSULTOR(A), celebram o presente CONTRATO DE CONSULTORIA, que se regerá pelas seguintes cláusulas:`,
      },
      {
        type: "clause",
        title: "CLÁUSULA PRIMEIRA — DO OBJETO",
        paragraphs: [
          "O CONSULTOR se obriga a prestar ao CONTRATANTE serviços especializados de consultoria em {objeto_descricao_consul}, conforme escopo detalhado neste instrumento.",
          "{?, Como produtos e entregáveis da consultoria, estão previstos: {entregaveis_consul}.}",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEGUNDA — DA DURAÇÃO E CARGA HORÁRIA",
        paragraphs: [
          "A consultoria terá duração de {prazo_consul}, podendo ser prorrogada por acordo entre as partes.",
          "{?, O CONSULTOR dedicará {carga_horaria_consul} à execução dos serviços objeto deste contrato.}",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA TERCEIRA — DOS HONORÁRIOS",
        paragraphs: [
          "Pelos serviços prestados, o CONTRATANTE pagará ao CONSULTOR honorários no valor de {valor_consul} ({valor_extenso_consul}).",
          "O pagamento será feito {periodicidade_pgto_consul}, por meio de {forma_pgto_consul}.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUARTA — DAS OBRIGAÇÕES",
        paragraphs: [
          "O CONSULTOR se obriga a: (a) executar os serviços com elevado padrão de qualidade técnica; (b) apresentar relatórios e entregáveis conforme cronograma; (c) manter absoluto sigilo sobre informações estratégicas do CONTRATANTE; (d) não utilizar as informações para benefício próprio ou de terceiros.",
          "O CONTRATANTE se obriga a: (a) fornecer todas as informações necessárias à execução da consultoria; (b) disponibilizar acesso a pessoas, sistemas e documentos requeridos; (c) efetuar pontualmente os pagamentos ajustados.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUINTA — DA NATUREZA DO VÍNCULO",
        paragraphs: [
          "Este contrato não configura vínculo empregatício, nos termos do artigo 593 do Código Civil, inexistindo entre as partes relação de subordinação, horário fixo ou exclusividade.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEXTA — DA CONFIDENCIALIDADE",
        paragraphs: [
          "O CONSULTOR compromete-se a preservar o sigilo das informações, dados, documentos e estratégias do CONTRATANTE a que tiver acesso em razão deste contrato, não podendo divulgá-los ou utilizá-los para finalidade diversa da execução dos serviços sem autorização prévia e escrita do CONTRATANTE.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SÉTIMA — DA RESCISÃO",
        paragraphs: [
          "Qualquer das partes poderá denunciar o presente contrato mediante notificação prévia de 30 (trinta) dias.",
          "Em caso de rescisão, o CONTRATANTE pagará ao CONSULTOR os serviços efetivamente prestados e comprovados até a data da rescisão.",
        ],
      },
      {
        type: "closing",
        text: "E, por assim estarem de pleno acordo, as partes assinam o presente contrato em duas vias, na presença de 2 (duas) testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_ps}, {data_ps}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Contratante", fieldKey: "contratante_nome" },
          { role: "Consultor(a)", fieldKey: "contratado_nome" },
        ],
      },
    ],

    temporario: [
      {
        type: "title",
        text: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS TEMPORÁRIOS",
      },
      {
        type: "paragraph",
        text: "Pelo presente instrumento particular, as partes:",
      },
      {
        type: "paragraph",
        text: `${contratanteQualificacao}, doravante denominado(a) simplesmente CONTRATANTE; e ${contratadoQualificacao}{?, , portador(a) do registro profissional n.º {contratado_registro}}, doravante denominado(a) simplesmente PRESTADOR(A), celebram o presente CONTRATO DE PRESTAÇÃO DE SERVIÇOS TEMPORÁRIOS POR PROJETO, nos termos das cláusulas seguintes:`,
      },
      {
        type: "clause",
        title: "CLÁUSULA PRIMEIRA — DO OBJETO",
        paragraphs: [
          "O PRESTADOR se obriga a executar o serviço/projeto descrito a seguir: {objeto_descricao_temp}.",
          "O serviço será executado conforme especificações técnicas e requisitos estabelecidos pelo CONTRATANTE, cabendo ao PRESTADOR a responsabilidade técnica pela execução.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEGUNDA — DO PRAZO",
        paragraphs: [
          "O prazo para execução do serviço é de {prazo_temp}.",
          "O contrato vigorará pelo período estritamente necessário à conclusão do serviço, extinguindo-se automaticamente com a entrega e aprovação do resultado final.",
          "{?, O CONTRATANTE fornecerá os seguintes recursos para execução do trabalho: {recursos_temp}.}",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA TERCEIRA — DA REMUNERAÇÃO",
        paragraphs: [
          "O CONTRATANTE pagará ao PRESTADOR o valor de {remuneracao_temp} ({valor_extenso_temp}) pelos serviços prestados.",
          "O pagamento será efetuado {prazo_pgto_temp}, por meio de {forma_pgto_temp}.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUARTA — DA PROPRIEDADE INTELECTUAL",
        paragraphs: [
          "A titularidade da propriedade intelectual produzida na execução dos serviços observará o regime escolhido pelas partes: {propriedade_intelectual}. Eventual cessão ou licença compreenderá somente os direitos e usos expressamente previstos neste contrato, preservados os direitos morais do autor na forma da legislação brasileira.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA QUINTA — DAS OBRIGAÇÕES",
        paragraphs: [
          "O PRESTADOR se obriga a: (a) executar os serviços conforme especificações; (b) entregar os resultados no prazo estipulado; (c) utilizar boas práticas técnicas e profissionais; (d) comunicar imediatamente qualquer dificuldade ou impedimento.",
          "O CONTRATANTE se obriga a: (a) fornecer informações e recursos necessários; (b) aprovar ou rejeitar os resultados em prazo razoável; (c) efetuar os pagamentos conforme acordado.",
        ],
      },
      {
        type: "clause",
        title: "CLÁUSULA SEXTA — DA RESCISÃO",
        paragraphs: [
          "Este contrato extinguir-se-á automaticamente com a conclusão do serviço e entrega do resultado final.",
          "Qualquer das partes poderá rescindir antecipadamente este contrato mediante notificação prévia de 15 (quinze) dias, pagando-se os serviços efetivamente prestados até a data da rescisão.",
        ],
      },
      {
        type: "closing",
        text: "E, por estarem de acordo, assinam o presente em 2 (duas) vias de igual teor, na presença de testemunhas.",
      },
      {
        type: "date",
        text: "{cidade_ps}, {data_ps}",
      },
      {
        type: "signatures",
        parties: [
          { role: "Contratante", fieldKey: "contratante_nome" },
          { role: "Prestador(a) de Serviços", fieldKey: "contratado_nome" },
        ],
      },
    ],
  },

  clientNotes: [
    "Este contrato é específico para serviços sem vínculo empregatício.",
    "O contratado é responsável pelos seus próprios encargos trabalhistas e fiscais.",
    "Para serviços de maior complexidade, recomenda-se a variante de Consultoria.",
  ],
  internalNotes: [
    "Cobrir serviços temporários e projetos com prazo determinado.",
    "Variante de consultoria inclui cláusula de confidencialidade condicional e propriedade intelectual.",
    "Modelo compatível com Lei do Autônomo (Lei 13.467/2017).",
  ],
};

export default prestacaoServicos;
