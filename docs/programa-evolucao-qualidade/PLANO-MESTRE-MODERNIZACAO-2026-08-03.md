# Plano Mestre de Modernização e Manutenibilidade — KRIOU-DOCS

Data-base: 2026-08-03
Escopo: arquitetura, organização, clareza, desempenho, testes, erros,
observabilidade, documentação e experiência de desenvolvimento.

## Decisão central

O KRIOU-DOCS **não deve ser reescrito do zero**. O produto já possui domínio
real, pagamentos protegidos no backend, geração de PDF, testes, CI e separações
úteis. A estratégia será de modernização incremental, com contratos e testes
antes de cada extração.

Este plano passa a ser a referência para a dívida estrutural remanescente. Ele
complementa:

- `PAINEL-ADMINISTRATIVO-PLANO-2026-07-18.md` — evolução funcional do admin;
- `PLANO-HARDENING-SEGURANCA-2026-08-03.md` — segurança e operação;
- `historico/programa-qualidade-2026-07/PLANO-MESTRE-QUALIDADE-2026-07-18.md` — histórico das melhorias já feitas.

## Objetivos

- tornar cada área fácil de localizar, entender, testar e modificar;
- reduzir páginas/contextos gigantes sem alterar comportamento;
- detectar bugs no desenvolvimento, CI e produção;
- apresentar mensagens úteis ao usuário e referências úteis ao suporte;
- melhorar carregamento inicial e custo das operações pesadas;
- padronizar frontend, Edge Functions e migrations;
- permitir que outra pessoa compreenda o projeto sem depender do autor original.

## Diagnóstico medido

### Base positiva

- React 19 + Vite com páginas lazy-loaded;
- Supabase isolado em `lib`, serviços e Edge Functions;
- regras importantes já extraídas para `domain/`;
- checkout parcialmente organizado em `features/checkout`;
- 321 testes unitários aprovados;
- CI executa lint, testes, build e E2E público;
- Error Boundary, logger sanitizado e referências de erro já existem;
- migrations versionadas e RLS aplicada;
- build de produção concluído em menos de um segundo na máquina auditada.

### Indicadores atuais

| Indicador | Estado em 03/08/2026 |
|---|---:|
| Código `src` + Edge Functions | aproximadamente 31.428 linhas |
| Arquivos JS | 80 |
| Arquivos JSX | 49 |
| Testes unitários | 321 em 21 arquivos |
| Cobertura real de linhas | 28,90% |
| Cobertura real de funções | 17,97% |
| Cobertura real de branches | 20,38% |
| Build bruto | 3,1 MB |
| Worker de PDF | aproximadamente 987 KB |
| Chunk jsPDF | aproximadamente 400 KB |
| Ocorrências de estilos/classes em UI | mais de 1.600 |
| Vulnerabilidades `npm audit` | 1 alta transitiva, correção disponível |

### Hotspots estruturais

| Arquivo | Linhas aproximadas | Problema principal |
|---|---:|---|
| `DashboardPage.jsx` | 1.269 | UI, ações, filtros e persistência juntos |
| `RequirementsModal.jsx` | 1.252 | formulário/configuração monolíticos |
| `TemplatesPage.jsx` | 1.219 | dados, responsividade e apresentação juntos |
| `Icons.jsx` | 1.054 | catálogo manual central e difícil de manter |
| `LegalEditorPage.jsx` | 1.036 | editor, regras e visualização acoplados |
| `ProfilePage.jsx` | 903 | muitas seções e estilos no mesmo arquivo |
| `legal-helpers.jsx` | 951 | helpers visuais e regras misturados |
| `DocumentService.js` | 521 | muitas operações e mapeamentos em um serviço |
| `AppContext.jsx` | 438 | navegação, bootstrap e composição global próximos |

### Problemas confirmados

1. **Observabilidade incompleta:** o logger existe, mas grande parte do projeto
   ainda usa `console.*`; não há coleta externa ativa nem contexto comum de erro.
2. **Cobertura ilusória no comando padrão:** os thresholds cobrem somente quatro
   módulos; a cobertura global real ainda é baixa.
3. **E2E autenticado frágil:** depende de arquivo de sessão/mock e não prova RLS,
   backend real ou papéis distintos. A execução local também não instala o browser
   automaticamente.
4. **Componentes monolíticos:** páginas acima de mil linhas dificultam revisão,
   teste e localização de falhas.
5. **Organização híbrida:** parte do código é por tipo (`pages`, `services`,
   `components`) e parte por feature; não há regra clara para novos arquivos.
6. **Estado distribuído:** contexts, localStorage, sessionStorage e Supabase
   participam do mesmo fluxo sem uma fonte de verdade formal por entidade.
7. **Estilos dispersos:** Tailwind, classes utilitárias, objetos inline e arquivos
   de estilo coexistem, aumentando duplicação e inconsistência.
8. **Contratos fracos:** JavaScript aceita payloads inconsistentes; respostas das
   Edge Functions não têm validação de schema no cliente.
9. **Backend repetitivo:** autenticação, CORS, erro e construção de resposta são
   duplicados entre funções.
10. **Documentação concorrente:** existem múltiplos planos, análises e estruturas
    antigas sem indicação clara de qual documento está vigente.
11. **Higiene do Git:** `dist/` e `coverage/` estão ignorados hoje, mas artefatos
    antigos continuam rastreados pelo Git.
12. **Identidade do pacote provisória:** nome `kriou-teste`, versão `0.0.0` e falta
    de contrato explícito de versões Node/npm.

## Arquitetura-alvo

```text
src/
  app/
    App.jsx
    routes.js
    providers.jsx
    bootstrap/

  features/
    admin/
    auth/
    checkout/
    dashboard/
    documents/
    legal-editor/
    profile/
    templates/

  domain/
    documents/
    payments/
    profiles/
    navigation/

  services/
    api/
    documents/
    payments/
    profiles/

  shared/
    components/
    hooks/
    errors/
    logging/
    storage/
    formatting/
    validation/
    styles/
```

### Regras de dependência

```text
app/features -> domain + services + shared
services     -> domain + shared + integrações externas
domain       -> nenhuma dependência de React/Supabase/DOM
shared       -> não importa features
```

- páginas orquestram; não concentram regras de negócio;
- hooks de feature coordenam estado e efeitos;
- domínio contém funções puras e invariantes;
- serviços traduzem API/banco para contratos do domínio;
- componentes compartilhados não conhecem pagamento ou documento específico;
- nenhuma feature acessa `localStorage` ou Supabase diretamente fora da camada definida.

## Estratégia de execução

Não haverá “big bang”. Cada fase deve:

1. registrar comportamento atual;
2. adicionar teste de caracterização quando necessário;
3. extrair uma responsabilidade pequena;
4. manter compatibilidade temporária;
5. validar lint, testes, build e fluxo afetado;
6. remover o caminho antigo somente depois da comprovação.

## Fases

### M00 — Governança e linha de base confiável

Objetivo: tornar o repositório previsível antes das refatorações.

- [ ] consolidar qual plano está vigente e marcar documentos antigos como históricos;
- [ ] criar `CONTRIBUTING.md` com instalação, comandos e fluxo de mudança;
- [ ] atualizar `README.md` para refletir arquitetura e operação reais;
- [ ] corrigir nome/versão/descrição do pacote;
- [ ] adicionar `.nvmrc` ou campo `engines` para Node/npm;
- [ ] parar de rastrear `dist/` e `coverage/`, preservando artefatos somente no CI;
- [ ] documentar convenções de nomes, imports, pastas e testes;
- [ ] registrar Architectural Decision Records em `docs/adr/`;
- [ ] criar checklist único de Definition of Done.

Aceite: uma pessoa nova instala, testa e localiza uma feature usando somente a documentação vigente.

### M01 — Erros e observabilidade primeiro

Objetivo: enxergar falhas antes de mexer profundamente na estrutura.

- [ ] definir `AppError` com `code`, `category`, `severity`, `retryable`, `cause` e `context` sanitizado;
- [ ] padronizar tradução: erro técnico → mensagem ao usuário → referência de suporte;
- [ ] conectar Error Boundary, serviços e hooks ao logger central;
- [ ] substituir gradualmente `console.*` por logger estruturado;
- [ ] ativar monitoramento externo de exceções em produção;
- [ ] adicionar release, ambiente, rota, função e correlation/request ID;
- [ ] configurar source maps privados para investigação;
- [ ] capturar `unhandledrejection` e erros globais;
- [ ] criar alertas para falhas críticas de auth, pagamento, PDF e Edge Functions;
- [ ] impedir envio de tokens, CPF, conteúdo documental e payloads brutos.

Aceite: erro inesperado gera referência visível ao usuário e evento pesquisável com stack/source map, sem PII.

### M02 — Contratos e fronteiras de dados

Objetivo: reduzir bugs causados por formatos implícitos.

- [ ] documentar entidades `Profile`, `Document`, `Payment`, `Draft` e respostas administrativas;
- [ ] escolher migração incremental para TypeScript ou schemas runtime com JSDoc;
- [ ] validar respostas de Edge Functions na fronteira do serviço;
- [ ] centralizar status e mapeamentos de pagamento/documento;
- [ ] padronizar resultado de serviço (`data`, erro de domínio, erro técnico);
- [ ] eliminar strings mágicas de status, página e storage;
- [ ] gerar tipos do banco Supabase e revisar diferenças de schema;
- [ ] criar adaptadores banco ↔ domínio.

Aceite: payload inválido falha na fronteira com erro identificável; componentes recebem contratos estáveis.

### M03 — Decomposição dos hotspots por feature

Objetivo: reduzir arquivos grandes preservando comportamento.

Ordem recomendada:

1. `DashboardPage`;
2. `AdminPage` e serviços administrativos;
3. `ProfilePage`;
4. `TemplatesPage`;
5. `LegalEditorPage` e helpers;
6. `RequirementsModal`;
7. `Icons` e UI compartilhada.

Para cada hotspot:

- [ ] extrair regras puras para `domain/`;
- [ ] extrair efeitos/orquestração para hooks da feature;
- [ ] dividir seções visuais em componentes pequenos e nomeados;
- [ ] separar estilos/tokens da lógica;
- [ ] adicionar testes antes de remover o código antigo;
- [ ] medir tamanho, dependências e renderizações antes/depois.

Metas orientativas, não mecânicas:

- páginas preferencialmente abaixo de 350 linhas;
- hooks de orquestração abaixo de 250 linhas;
- funções com uma responsabilidade identificável;
- nenhuma regra comercial duplicada entre página e backend.

Aceite: cada feature possui ponto de entrada, domínio, serviço, hooks e componentes localizáveis.

### M04 — Estado, navegação e persistência

Objetivo: declarar a fonte de verdade de cada dado.

- [ ] criar matriz entidade → origem → cache → persistência → invalidação;
- [ ] separar bootstrap, navegação e UI global hoje próximos em `AppContext`;
- [ ] reduzir context values para evitar renderizações amplas;
- [ ] encapsular todas as chaves e versões de storage;
- [ ] definir migração/expiração/limite de dados locais;
- [ ] eliminar duplicidade Supabase × localStorage quando não for necessária;
- [ ] formalizar restauração após refresh/callback/pagamento;
- [ ] avaliar adoção de roteador somente se simplificar casos reais;
- [ ] testar back/forward, URL direta, múltiplas abas e sessão expirada.

Aceite: cada estado tem proprietário único e comportamento previsível após refresh, logout e troca de usuário.

### M05 — Design system e consistência visual

Objetivo: reduzir estilos duplicados e facilitar alterações de interface.

- [ ] escolher estratégia principal: classes utilitárias + tokens ou módulos por feature;
- [ ] manter estilos inline somente quando realmente dinâmicos;
- [ ] consolidar cores, tipografia, espaçamento, radius, sombra e breakpoints;
- [ ] organizar componentes base por contrato e documentação;
- [ ] criar variantes para botão, card, tabela, feedback, formulário e modal;
- [ ] reduzir `UI.jsx`/barrels ambíguos e imports inconsistentes;
- [ ] criar catálogo visual leve ou testes de componentes representativos;
- [ ] manter acessibilidade, foco e alvos de toque como critérios obrigatórios.

Aceite: mudança de token não exige editar dezenas de objetos inline e componentes equivalentes têm API uniforme.

### M06 — Pirâmide de testes confiável

Objetivo: detectar regressões onde elas realmente acontecem.

- [ ] manter testes de domínio rápidos;
- [ ] elevar cobertura global progressivamente, sem perseguir percentual vazio;
- [ ] remover configuração que mede somente quatro arquivos como indicador principal;
- [ ] criar testes de serviço para erros, timeouts e respostas inválidas;
- [ ] testar componentes críticos com interação do usuário;
- [ ] executar testes reais de RLS/Edge Functions em Supabase isolado;
- [ ] substituir E2E autenticado fictício por contas determinísticas de teste;
- [ ] incluir papéis `user` e `admin` e casos negativos;
- [ ] tornar instalação do browser Playwright explícita no setup local;
- [ ] separar smoke rápido de suíte E2E completa;
- [ ] adicionar testes de acessibilidade e regressão de PDF onde agregarem valor.

Metas progressivas sugeridas:

- marco 1: 35% linhas / 25% branches globais;
- marco 2: 50% linhas / 40% branches;
- módulos críticos: 80%+ com casos comportamentais relevantes.

Aceite: CI falha por regressão de domínio, contrato, RLS ou jornada crítica, não apenas por lint/build.

### M07 — Performance e experiência percebida

Objetivo: carregar e responder rápido em aparelhos reais.

- [ ] definir budgets de JS, CSS, imagens, LCP, INP e CLS;
- [ ] carregar jsPDF, html2canvas e worker somente nas rotas que usam PDF;
- [ ] investigar o worker de aproximadamente 987 KB;
- [ ] remover assets/código mortos e dependências não usadas;
- [ ] otimizar imagem hero e formatos responsivos;
- [ ] medir renderizações dos contexts e listas grandes;
- [ ] paginar/virtualizar listas administrativas quando necessário;
- [ ] evitar consultas repetidas e payloads excessivos;
- [ ] executar Lighthouse/medição em mobile e rede limitada;
- [ ] acompanhar bundle no CI com limite de regressão.

Aceite: budgets definidos passam em CI e fluxos principais permanecem responsivos em mobile intermediário.

### M08 — Padronização do backend e Edge Functions

Objetivo: tornar erros, auth e deploy previsíveis.

- [ ] criar wrapper comum de CORS, método, autenticação, autorização e resposta;
- [ ] adotar códigos de erro estáveis e correlation ID;
- [ ] validar query/body com schemas;
- [ ] padronizar timeout e chamadas a provedores externos;
- [ ] eliminar duplicação entre funções administrativas/financeiras;
- [ ] criar testes locais/integrados das funções;
- [ ] registrar logs estruturados e métricas por função;
- [ ] revisar paginação, limites e índices das consultas;
- [ ] documentar deploy, secrets e rollback de função/migration.

Aceite: toda função segue o mesmo contrato operacional e um erro pode ser rastreado ponta a ponta.

### M09 — Dependências, CI e experiência de desenvolvimento

Objetivo: tornar manutenção recorrente barata e segura.

- [ ] corrigir `brace-expansion` transitivo com atualização testada;
- [ ] criar rotina de atualização sem `npm audit fix --force` automático;
- [ ] adicionar checagem de segurança/segredos no CI;
- [ ] adicionar `git diff --check` e cobertura global progressiva ao CI;
- [ ] cachear etapas sem esconder problemas;
- [ ] padronizar formatter e ordenação de imports somente após decidir convenções;
- [ ] criar scripts `check`, `test:unit`, `test:integration`, `test:e2e:smoke`;
- [ ] adicionar hooks locais opcionais, mantendo CI como autoridade;
- [ ] registrar tempos dos jobs e manter feedback rápido.

Aceite: um único comando local reproduz os portões do CI e dependências críticas têm processo de atualização.

### M10 — Operação e ciclo contínuo

Objetivo: impedir o retorno da dívida estrutural.

- [ ] dashboard de saúde para frontend, Edge Functions e integrações;
- [ ] SLOs básicos de disponibilidade, erro e latência;
- [ ] runbooks para auth, pagamento, PDF, e-mail e banco;
- [ ] rotina de triagem de bugs por severidade e referência;
- [ ] retrospectiva pós-incidente e testes de regressão obrigatórios;
- [ ] revisão trimestral de hotspots, dependências, cobertura e bundle;
- [ ] registro explícito de dívida aceita, responsável e data de revisão.

Aceite: falhas de produção possuem alerta, responsável, diagnóstico reproduzível e ação documentada.

## Ordem recomendada

1. concluir e versionar o painel administrativo atual;
2. M00 — governança e higiene;
3. M01 — erros e observabilidade;
4. M02 — contratos de dados;
5. M06 — ampliar testes nos fluxos que serão refatorados;
6. M03 — decompor hotspots, um por vez;
7. M04 — estado/navegação/persistência;
8. M05 — design system;
9. M07 — performance medida;
10. M08 — backend padronizado;
11. M09/M10 — manutenção contínua e operação;
12. executar o plano de segurança em paralelo conforme seus bloqueadores S0/S1.

## Portões obrigatórios por mudança

- lint sem erros;
- testes relevantes e suíte completa verdes;
- build verde;
- `git diff --check` verde;
- teste de regressão novo para bug corrigido;
- nenhuma piora não justificada de bundle/performance;
- erro novo integrado ao padrão de observabilidade;
- documentação/ADR atualizados quando houver decisão estrutural;
- QA funcional/visual proporcional ao risco;
- migrations e Edge Functions verificadas no ambiente correto.

## Métricas de acompanhamento

Registrar por marco:

- arquivos acima de 500 e 1.000 linhas;
- cobertura global e cobertura dos módulos críticos;
- tempo de lint/test/build/CI;
- tamanho do bundle inicial e chunks pesados;
- quantidade de `console.*` fora do logger;
- erros não tratados e erros por release;
- taxa de falha das Edge Functions;
- bugs reabertos e regressões;
- tempo médio entre alerta, diagnóstico e correção;
- documentação vigente versus documentos históricos.

## O que não fazer

- reescrever tudo de uma vez;
- migrar para TypeScript, roteador ou biblioteca de estado sem problema medido;
- dividir arquivos apenas para cumprir limite de linhas;
- perseguir cobertura alta com testes sem valor;
- otimizar sem medir;
- esconder erros para “limpar o console”;
- atualizar dependências maiores em lote;
- misturar refatoração estrutural, feature nova e migration crítica no mesmo commit.

## Primeiro checkpoint executável

Antes de iniciar refatorações:

1. concluir o painel admin e registrar seu estado;
2. limpar/versionar o worktree por entregas coerentes;
3. executar M00;
4. implementar M01 em uma fatia vertical: `AdminPage` + Edge Functions admin;
5. usar essa fatia como padrão para as demais features.
