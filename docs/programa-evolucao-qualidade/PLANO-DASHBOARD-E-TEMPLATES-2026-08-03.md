# Plano do dashboard administrativo e catálogo de templates — 2026-08-03

## Objetivo

Evoluir o painel de uma tela de métricas para uma central de decisão e operação,
e transformar templates de currículo/documentos jurídicos em um catálogo
versionado, testável, publicável e reversível.

Este é um plano. Não autoriza implementação, migração de dados nem publicação de
templates sem priorização posterior.

## Diagnóstico atual

### Dashboard

- apresenta métricas gerais, gráficos simples, usuários e documentos por usuário;
- não possui fila de trabalho, busca global, paginação, alertas priorizados,
  comparação, metas, ações contextuais ou personalização;
- dados são carregados por múltiplas chamadas e ainda não possuem contrato único
  de atualização/freshness;
- permissões continuam concentradas no papel `admin`.

### Templates

- layouts de currículo estão definidos em `src/data/constants.js`;
- documentos jurídicos são módulos em `src/data/documents/*.js`;
- cada documento combina metadados, variantes, campos, ajuda ao usuário,
  legislação, corpo textual e regras condicionais;
- disponibilidade é um booleano estático (`available`);
- alterações exigem código, revisão, testes e deploy completo;
- documento salvo guarda identificadores e parte do template, mas ainda não há
  uma entidade imutável de versão publicada;
- não existem rascunho editorial, aprovação jurídica, agendamento ou rollback de catálogo.

## Visão do produto administrativo

O painel deve responder rapidamente:

1. O sistema está saudável?
2. Há dinheiro, documentos ou clientes bloqueados?
3. O que exige ação agora e quem é responsável?
4. Qual operação é segura para este papel executar?
5. Qual template está publicado, em revisão ou com problema?
6. Uma mudança afetou quais documentos e pode ser revertida?

## Princípios de desenho

- dashboard mostra decisão e prioridade, não apenas números decorativos;
- cada indicador abre a lista que explica o número;
- nenhuma métrica crítica mistura receita real, cortesia ou estorno;
- conteúdo pessoal fica oculto por padrão;
- ações são oferecidas conforme capacidades retornadas pelo backend;
- template publicado é imutável; correção cria nova versão;
- documentos existentes permanecem vinculados à versão usada na criação;
- rollback troca a versão ativa para novos usos, sem reescrever documentos antigos;
- banco não armazena nem executa HTML, CSS ou JavaScript arbitrário;
- publicação jurídica exige revisão humana e evidência, não aprovação automática.

## Arquitetura de navegação

### 1. Início

- saúde geral e idade dos dados;
- ações rápidas permitidas;
- resumo financeiro separado por origem;
- fila “Exige atenção”;
- atividades recentes;
- atalhos para filtros salvos.

### 2. Operações

- casos de suporte;
- documentos bloqueados ou com falha;
- usuários suspensos/em revisão;
- tarefas atribuídas e prazo/SLA;
- operações incertas aguardando confirmação.

### 3. Usuários

- busca, filtros, paginação e detalhe;
- estado de acesso, sessões, documentos, pagamentos e linha do tempo;
- ações conforme o plano de controles administrativos.

### 4. Documentos

- catálogo de documentos dos clientes por metadados;
- status, pagamento, template/versão, bloqueios e datas;
- acesso ao conteúdo somente por fluxo excepcional.

### 5. Financeiro

- pagamentos reais, cortesias, estornos e divergências em blocos distintos;
- conciliação, webhook, e-mail e liberação;
- valores e contagens por período.

### 6. Templates

- catálogo, versões, revisões, preview, publicação, rollback e uso;
- áreas separadas para currículos e documentos jurídicos.

### 7. Incidentes e eventos

- falhas por severidade, função, etapa e correlation ID;
- atribuição, reconhecimento, resolução e pós-incidente.

### 8. Auditoria

- ações administrativas, acesso a conteúdo e alterações de templates;
- filtros por ator, alvo, resultado e período.

### 9. Configurações

- papéis/capacidades, limites operacionais, integrações, feature flags e ambiente.

## Dashboard inicial recomendado

### Faixa superior

- ambiente (`Produção`, `Homologação`, `Local`);
- estado geral (`Saudável`, `Atenção`, `Crítico`);
- horário/idade da última atualização;
- botão `Atualizar`;
- seletor de período e comparação com período anterior.

### Indicadores principais

| Indicador | Conteúdo | Drill-down |
|---|---|---|
| Usuários ativos | total e novos | usuários filtrados |
| Documentos criados | total, finalizados e bloqueados | documentos filtrados |
| Receita confirmada | somente provedor | pagamentos aprovados |
| Cortesias | quantidade e valor equivalente | concessões auditadas |
| Pendências financeiras | valor e idade | fila de conciliação |
| Falhas críticas | abertas e novas | incidentes |
| Templates publicados | ativos e em revisão | catálogo |
| Conversão | iniciado → pago → entregue | funil detalhado |

Cada card deve informar definição, período, fonte, última atualização e estado de
carregamento. Zero real deve ser diferente de erro/indisponibilidade.

### Centro de ação

Fila ordenada por risco e antiguidade:

- pagamento aprovado sem documento liberado;
- pagamento pendente antigo;
- webhook falho;
- e-mail de confirmação falho;
- documento bloqueado aguardando revisão;
- exclusão/anonimização pendente;
- template com teste/revisão vencida;
- operação administrativa incerta;
- incidente sem responsável.

Cada item exibe severidade, tempo aberto, responsável, próximo passo e ação segura.

### Gráficos úteis

- documentos e receita por dia/semana;
- conversão por tipo/template;
- tempo entre criação, pagamento e entrega;
- erros por função e etapa;
- uso de templates e taxa de abandono;
- comparação atual versus período anterior.

Evitar gráficos sem decisão associada. Toda visualização deve permitir abrir os
registros correspondentes.

### Atividade e qualidade

- últimas ações administrativas relevantes;
- últimas publicações/rollbacks de template;
- saúde de Supabase, Mercado Pago, e-mail e deploy;
- latência p50/p95 e taxa de erro;
- dados potencialmente desatualizados claramente sinalizados.

## Personalização e produtividade

- [ ] filtros globais por período, ambiente, tipo e estado;
- [ ] views salvas por operador (`Minha fila`, `Financeiro pendente`, etc.);
- [ ] colunas configuráveis sem expor campos não autorizados;
- [ ] ordenação e paginação server-side;
- [ ] URL compartilhável preservando filtros não sensíveis;
- [ ] ações em lote somente para operações reversíveis de baixo/médio risco;
- [ ] atalhos de teclado acessíveis, sem substituir confirmação crítica;
- [ ] layout responsivo: tabela no desktop, cartões/drawer no celular;
- [ ] skeleton, estado vazio, erro parcial e retry por bloco;
- [ ] preferências do operador separadas de dados do negócio.

## Modelo de dados do catálogo de templates

### Entidades propostas

#### `template_definitions`

- `id` UUID interno;
- `slug` estável (`locacao`, `recibo`, `curriculo-executivo`);
- `kind`: `resume_layout` ou `legal_document`;
- nome, descrição, categoria, tags e idioma;
- owner editorial e owner técnico;
- status geral e versão atualmente publicada;
- datas de criação/atualização.

#### `template_versions`

- ID e `template_id`;
- versão semântica/editorial;
- status de workflow;
- schema validado de campos/variantes/conteúdo/configuração;
- checksum do conteúdo;
- autor, notas da mudança e origem da versão anterior;
- datas de criação, aprovação, publicação e descontinuação;
- imutável após publicação.

#### `template_reviews`

- versão, tipo de revisão (`technical`, `content`, `legal`, `visual`);
- revisor, decisão, checklist, comentário e data;
- evidências/artefatos por referência segura;
- nenhuma autoaprovação pelo próprio autor em mudança crítica.

#### `template_publications`

- versão publicada, ambiente, início/fim, percentual de rollout;
- operador, aprovação, motivo e resultado;
- referência de rollback.

#### `document_template_snapshots`

- vínculo entre documento criado e versão utilizada;
- checksum e snapshot mínimo necessário para reprodução;
- evita que publicação nova altere silenciosamente documento existente.

#### `template_usage_daily`

- métricas agregadas sem conteúdo pessoal: visualizações, inícios, conclusões,
  pagamentos, abandonos e erros por template/versão/dia.

## Workflow de templates

`draft` → `technical_review` → `content_review` → `legal_review` (jurídicos) →
`approved` → `scheduled/published` → `deprecated/retired`

Estados adicionais: `changes_requested`, `rejected`, `rolled_back`.

### Regras

- autor não publica sozinho template jurídico;
- currículo exige revisão técnica, visual e de conteúdo;
- jurídico exige revisão técnica, conteúdo e revisão jurídica responsável;
- publicação em produção exige todos os gates verdes;
- template publicado não é editado; nova versão parte de clone;
- despublicar impede novos usos, mas não quebra documentos existentes;
- rollback é troca auditada do ponteiro ativo;
- exclusão física de versão publicada é proibida.

## Editor de templates de currículo

### Permitido pelo painel

- nome, descrição, categoria, tags e indicação de público;
- paleta dentro de tokens permitidos;
- fontes de catálogo aprovado;
- ordem e visibilidade de seções suportadas;
- espaçamentos, tamanhos e opções predefinidas;
- imagem de capa/thumbnail validada;
- status, agendamento e disponibilidade.

### Não permitido

- HTML/CSS/JavaScript livre;
- URL externa arbitrária;
- fonte/script remoto não aprovado;
- configuração fora dos limites de legibilidade/paginação.

Layouts estruturais novos continuam sendo componentes versionados em código. O
painel configura apenas propriedades declarativas com schema e allowlist.

## Editor de documentos jurídicos

### Áreas editáveis

- metadados, categoria, descrição e indicação de uso;
- legislação/referências e data da última revisão;
- variantes;
- seções e campos do formulário;
- obrigatoriedade, ajuda, exemplos, dependências e opções;
- blocos de texto e cláusulas condicionais;
- notas ao cliente e notas internas;
- disponibilidade e rollout.

### Proteções do editor

- editor estruturado por blocos, não texto/código executável;
- placeholders selecionados do catálogo de campos;
- validação de placeholder inexistente, duplicado ou obrigatório não utilizado;
- dependências sem ciclos;
- prévia com dados sintéticos, nunca dados reais de cliente;
- diff semântico entre versões;
- detector de mudança crítica: partes, preço/valor, objeto, prazo, foro,
  responsabilidade, garantia, rescisão e assinatura;
- mudança crítica exige revisão jurídica renovada;
- referências legislativas possuem fonte, data de consulta e responsável;
- aviso explícito de que o sistema não substitui orientação jurídica individual.

## Preview e laboratório de qualidade

Para cada versão:

- [ ] preview desktop/mobile do formulário;
- [ ] PDF com dados mínimos, típicos, extensos e caracteres especiais;
- [ ] casos com opcionais ausentes/desabilitados;
- [ ] todas as variantes;
- [ ] múltiplas partes e assinaturas;
- [ ] paginação de 1, 2 e 3+ páginas;
- [ ] teste de texto órfão, placeholder e marcador interno;
- [ ] acessibilidade do formulário;
- [ ] comparação visual com versão anterior;
- [ ] snapshot textual normalizado do conteúdo;
- [ ] teste de migração/compatibilidade com documento antigo;
- [ ] desempenho de renderização e tamanho do PDF.

Falha crítica bloqueia publicação. Diferença visual aprovada precisa ficar
registrada como evidência da versão.

## Publicação segura

### Ambientes

1. rascunho local/editorial;
2. preview isolado;
3. homologação com dados sintéticos;
4. produção gradual;
5. produção total.

### Estratégia

- feature flag por template/versão;
- publicação programada;
- canário opcional para pequena parcela de novos documentos;
- monitorar erro, abandono, geração e suporte;
- abortar/rollback automático em limite crítico definido;
- nunca migrar documentos antigos automaticamente;
- cache com versionamento/checksum e invalidação explícita.

## Gestão do catálogo no painel

### Lista

- busca, tipo, categoria, status, responsável e última revisão;
- versão publicada e quantidade de rascunhos;
- uso, conversão, erros e data da última publicação;
- alertas de revisão vencida ou legislação desatualizada.

### Detalhe

- preview e ficha;
- versões e diff;
- workflow/revisores;
- testes/evidências;
- uso e qualidade;
- histórico de publicação/rollback;
- ações permitidas pelo papel.

### Ações

- criar a partir de template vazio aprovado ou clone;
- salvar rascunho;
- solicitar revisão;
- aprovar/rejeitar com motivo;
- publicar/agendar;
- pausar novos usos;
- descontinuar;
- rollback;
- duplicar para novo template.

## Permissões propostas

| Capacidade | `template_editor` | `legal_reviewer` | `admin` | `owner` |
|---|:---:|:---:|:---:|:---:|
| Criar/editar rascunho | sim | comentar | sim | sim |
| Aprovar revisão técnica/visual | não próprio | não | sim | sim |
| Aprovar conteúdo jurídico | não | sim | não por padrão | sim com atribuição |
| Publicar currículo | solicitar | não | sim | sim |
| Publicar jurídico | solicitar | aprovar conteúdo | após aprovação | sim |
| Rollback | não | solicitar | sim | sim |
| Excluir rascunho nunca publicado | próprio | não | sim | sim |
| Excluir versão publicada | não | não | não | não |

Papéis de template devem ficar em estrutura privada e podem ser capacidades
adicionais aos papéis operacionais, evitando tornar todo editor um admin geral.

## Migração da arquitetura atual

### T0 — Contrato e inventário

- [ ] Tipar formalmente schema de currículo e documento jurídico.
- [ ] Inventariar todos os templates, variantes, campos e dependências atuais.
- [ ] Gerar checksum e fixtures de referência.
- [ ] Documentar comportamento que deve permanecer compatível.

### T1 — Registry somente leitura

- [ ] Criar tabelas e importar metadados/versão inicial dos arquivos atuais.
- [ ] Manter corpo/renderer em código; painel apenas observa catálogo e saúde.
- [ ] Vincular novos documentos a `template_version_id`.
- [ ] Provar que resultado atual não muda.

### T2 — Configuração declarativa de currículos

- [ ] Mover apenas opções seguras para JSON validado.
- [ ] Manter componentes estruturais em código.
- [ ] Implementar preview, revisão e publicação.

### T3 — Documentos jurídicos em modo híbrido

- [ ] Migrar metadados, campos e blocos para schema declarativo versionado.
- [ ] Manter motor de interpolação/limpeza testado em código.
- [ ] Migrar um template piloto de baixo risco antes dos demais.
- [ ] Comparar PDF/texto antigo e novo com fixtures.

### T4 — Workflow completo

- [ ] Revisões, aprovação, agendamento, canário e rollback.
- [ ] Métricas por versão e alertas.
- [ ] Desativar edição direta em arquivos somente após equivalência comprovada.

## Fases do dashboard

### B0 — Contratos e observabilidade

- [ ] Definir métricas, fontes, fórmulas, timezone e freshness.
- [ ] Endpoint/BFF administrativo paginado e com respostas parciais.
- [ ] Instrumentar latência, erro, cache e correlation ID.

### B1 — Estrutura e centro de ação

- [ ] Nova navegação, faixa de saúde, cards com drill-down e fila priorizada.
- [ ] Atualização manual, por foco e estados parciais.
- [ ] Responsividade e acessibilidade.

### B2 — Operações completas

- [ ] Views salvas, atribuição, SLA, notas e linha do tempo.
- [ ] Integrar controles administrativos seguros.

### B3 — Templates

- [ ] Catálogo somente leitura e métricas.
- [ ] Depois, editor/workflow conforme T0–T4.

### B4 — Personalização e inteligência operacional

- [ ] Comparações, anomalias, tendências e recomendações explicáveis.
- [ ] Nenhuma automação crítica age sem aprovação humana.

## Testes obrigatórios

- fórmula de cada KPI com dataset conhecido;
- cards e gráficos abrem exatamente os registros que os compõem;
- zero, erro, parcial, offline e dado antigo;
- autorização por papel/capacidade;
- template inválido nunca chega a `published`;
- versão publicada é imutável;
- rollback preserva documentos existentes;
- PDF/texto de regressão por template e variante;
- placeholders, condicionais e dependências;
- conteúdo sintético sem PII nos previews;
- concorrência de edição e conflito de versão;
- auditoria de criação, revisão, publicação e rollback;
- performance de lista, preview e geração.

## Recomendações prioritárias

### Próxima entrega do dashboard

1. navegação definitiva;
2. centro “Exige atenção”;
3. cards com drill-down e comparação;
4. botão/idade dos dados e erros parciais;
5. busca global paginada;
6. catálogo de templates somente leitura.

### Próxima entrega de templates

1. inventário e schema formal;
2. versionamento imutável;
3. vínculo `documento → versão`;
4. preview/fixtures e gates;
5. workflow de revisão;
6. somente depois editor e publicação pelo painel.

## O que evitar

- editor jurídico livre em produção como primeira entrega;
- alterar template publicado no lugar;
- atualizar documentos antigos com conteúdo novo silenciosamente;
- armazenar componentes React ou código executável no banco;
- publicar sem preview e revisão independente;
- misturar saúde, receita, cortesia e falha no mesmo indicador;
- criar um dashboard único gigantesco sem drill-down e filas.

## Critério de conclusão

Dashboard: operador identifica e resolve filas prioritárias sem consultar banco ou
logs manualmente, com métricas explicáveis e autorização auditada.

Templates: toda versão publicada é reproduzível, revisada, testada, vinculada aos
documentos criados e reversível para novos usos sem modificar o histórico.
