# Programa de redução de dívida técnica — KRIOU-DOCS

Data-base: 2026-08-03  
Estado: em execução  
Responsável inicial: proprietário do produto + implementação assistida

## Objetivo e relação com os demais planos

Este documento transforma os achados do
[Plano Mestre de Modernização](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md)
em uma fila única, mensurável e executável. Ele não substitui os planos de
segurança, administração, sincronização ou templates: define a ordem em que a
dívida estrutural será paga para que essas funcionalidades cresçam sem aumentar
o risco e o custo de manutenção.

Não haverá reescrita total nem refatoração apenas estética. Cada mudança deve
reduzir um risco observável, preservar comportamento com testes e caber em uma
entrega reversível.

## Como a dívida será priorizada

Cada item recebe uma nota de 1 a 5 nos critérios abaixo:

- **impacto**: dano potencial a segurança, receita, dados ou operação;
- **probabilidade**: chance de o problema ocorrer no uso real;
- **frequência de mudança**: quanto a área será alterada nos próximos ciclos;
- **alcance**: quantidade de usuários, dados ou features afetadas;
- **evidência**: 1 para suspeita e 5 para falha reproduzida/medida;
- **esforço**: custo relativo de 1 a 5, usado para ordenar itens de risco parecido.

Prioridade de risco = `impacto × probabilidade × frequência × alcance`. A
evidência não cria gravidade, mas determina se o item pode ser executado ou se
primeiro precisa de instrumentação. Segurança, perda de dados e cobrança têm
precedência sobre tamanho de arquivo ou conveniência interna.

## Linha de base atual

| Indicador | Estado verificado | Direção desejada |
|---|---:|---|
| Testes automatizados | 330 aprovados + matriz local de segurança | aumentar por risco, não por volume |
| Cobertura global de linhas | 28,90% na última medição | crescer primeiro nos fluxos críticos |
| Cobertura de funções | 17,97% | nenhum serviço crítico sem testes de erro |
| Cobertura de branches | 20,38% | cobrir autorização, falha e recuperação |
| Maior página | `DashboardPage.jsx`, 1.269 linhas | página apenas orquestra seções testáveis |
| Outros hotspots | `RequirementsModal` 1.252; `TemplatesPage` 1.219; `LegalEditorPage` 1.036 | extração incremental por responsabilidade |
| Contratos de API | majoritariamente implícitos em JavaScript | validação nas fronteiras |
| Observabilidade externa | não ativa | erro pesquisável, sanitizado e correlacionado |
| Auditoria administrativa | base append-only criada na migration 018 | todas as mutações cobertas e testadas |

Tamanho de arquivo é sinal de investigação, não meta isolada. Um arquivo só é
dividido quando houver fronteiras de responsabilidade e benefício de teste,
reuso, revisão ou desempenho.

## Registro priorizado

| ID | Dívida / risco | Prioridade | Dependência | Resultado verificável | Estado |
|---|---|---|---|---|---|
| DT-01 | autorização/RLS sem matriz real automatizada | crítica | Supabase local | testes provam usuário A/B, admin e backend | parcial: usuário/admin/backend comprovados; owner pendente |
| DT-02 | capacidades administrativas ainda baseadas em papel amplo | crítica | DT-01, auditoria | capacidades privadas, negação padrão e MFA nos atos sensíveis | parcial: matriz, gate e UX TOTP prontos; recuperação/gestão pendentes |
| DT-03 | exclusão/sincronização com confirmação e recuperação incompletas | alta | contratos de serviço | UI só remove após confirmação e restaura em falha | planejado |
| DT-04 | erros e logs sem correlação/monitoramento externo | alta | política de PII | falha possui código, referência e evento sanitizado | planejado |
| DT-05 | respostas de serviços e Edge Functions sem schema validado | alta | decisão de schema | payload inválido falha na fronteira, não na UI | planejado |
| DT-06 | cobertura baixa nos fluxos de auth, pagamento, documento e admin | alta | DT-01/05 | matriz de risco coberta; thresholds por módulo crítico | em execução |
| DT-07 | autenticação/CORS/erros repetidos nas Edge Functions | alta | DT-04/05 | shared backend testado, sem cópias divergentes | planejado |
| DT-08 | estado dividido entre Supabase e storages do navegador | alta | inventário de entidades | fonte de verdade e invalidação documentadas/testadas | planejado |
| DT-09 | páginas e modais monolíticos | média-alta | testes de caracterização | seções, hooks e domínio extraídos sem regressão | em execução: overlays/Templates avançaram; Requirements detalhado em R0–R7 |
| DT-10 | estilos, acessibilidade e responsividade inconsistentes | média | tokens/componentes base | componentes comuns e auditoria de teclado/contraste | planejado |
| DT-11 | catálogo de templates codificado junto da apresentação | média-alta | schema/versionamento | registry somente leitura e versões imutáveis | planejado |
| DT-12 | bundles pesados de PDF/editor sem orçamento formal | média | medição de navegação | orçamento por rota e dependências pesadas sob demanda | planejado |
| DT-13 | documentação contém indicadores históricos misturados ao estado atual | média | governança | status atual único; concluídos movidos ao histórico | em execução |
| DT-14 | dependências com alertas e scripts de instalação pendentes de decisão | alta | análise de alcançabilidade | decisão documentada, lockfile controlado e CI verificando | planejado |
| DT-15 | QR do PDF aponta para rota inexistente e não está vinculado a versão backend | crítica | versionamento, privacidade | token opaco, versão imutável e verificador público | planejado em Q0–Q3 |

## Sequência de execução

### TD0 — Guardrails antes de ampliar o admin

- [x] corrigir a falsa promessa de exclusão de conta: a ação atual declara e
  testa que limpa apenas dados locais;
- [x] criar base de auditoria append-only e helper sanitizado, com motivo e IDs
  de operação/requisição;
- [x] criar teste de integração local que use usuários reais e prove políticas
  de perfil, documentos, rascunhos e auditoria;
- [x] provar que `service_role` insere/lê auditoria, mas não altera ou apaga eventos;
- [x] criar matriz de capacidades administrativas com negação por padrão;
- [ ] exigir autenticação reforçada nas capacidades de maior risco;
- [ ] padronizar idempotência, motivo e auditoria obrigatória nas mutações;
  mudança de papel já implementa o padrão transacional de referência.

Aceite: ampliar o painel não permite elevar papel, atravessar contas, apagar
auditoria nem executar duas vezes uma mutação repetida.

### TD1 — Erros, contratos e diagnóstico

- [ ] definir taxonomia `AppError` e envelope estável de resposta;
- [ ] validar input e output nas fronteiras de API;
- [ ] introduzir `request_id` de ponta a ponta e referência curta ao usuário;
- [ ] centralizar CORS, autenticação, resposta e sanitização das Edge Functions;
- [ ] substituir `console.*` por logger estruturado começando em admin,
  pagamento, autenticação e PDF;
- [ ] integrar monitoramento externo com source maps privados e política de PII;
- [ ] alertar somente sobre sintomas acionáveis, com ambiente e release.

Aceite: uma falha crítica pode ser localizada pela referência mostrada ao
usuário, sem token, CPF ou conteúdo do documento nos registros.

### TD2 — Testes proporcionais ao risco

- [ ] publicar matriz fluxo × ator × sucesso × negação × recuperação;
- [ ] cobrir auth/RLS/admin no Supabase local;
- [ ] cobrir webhook/pagamento com repetição, atraso e payload inválido;
- [ ] cobrir salvar, excluir, restaurar e baixar documento;
- [ ] adicionar testes de caracterização antes de cada extração estrutural;
- [ ] medir cobertura global no CI sem impor aumento artificial de uma vez;
- [ ] elevar thresholds por módulo quando o respectivo risco estiver coberto;
- [ ] manter E2E curto para jornadas e integração; regras ficam em testes menores.

Aceite: os fluxos críticos têm caminhos positivo, negado e de falha comprovados;
uma regressão de autorização bloqueia a integração.

### TD3 — Arquitetura por feature, incremental

Ordem: `AdminPage`/backend administrativo, `DashboardPage`, `ProfilePage`,
`TemplatesPage`, `LegalEditorPage`, `RequirementsModal` e `Icons`.

A execução segura de `RequirementsModal` está detalhada no
[plano de decomposição R0–R7](./PLANO-DECOMPOSICAO-REQUIREMENTS-MODAL-2026-08-05.md),
incluindo contratos congelados, impressão, matriz de testes e rollback. Esse
componente não deve ser dividido apenas por tamanho sem seguir aqueles gates.

Para cada área:

- [ ] registrar comportamento e dependências;
- [ ] mover regras puras para domínio;
- [ ] mover IO para serviço/adaptador;
- [ ] mover coordenação de estado/efeitos para hook da feature;
- [ ] deixar páginas responsáveis por composição e navegação;
- [ ] eliminar caminho antigo apenas após testes e comparação funcional;
- [ ] medir dependências, renderizações e bundle antes/depois quando aplicável.

Aceite: uma alteração comum pode ser localizada por feature; domínio não importa
React, DOM ou Supabase; componentes não conhecem detalhes de transporte.

### TD4 — Estado, sincronização e desempenho

- [ ] criar matriz entidade → fonte de verdade → cache → invalidação → retenção;
- [ ] versionar e encapsular todas as chaves de storage;
- [ ] definir refresh por foco/evento e polling econômico antes de Realtime;
- [ ] usar atualização otimista somente onde houver rollback seguro;
- [ ] adicionar orçamento de carregamento por rota e alerta de regressão;
- [ ] manter PDF/editor/templates pesados sob lazy loading;
- [ ] medir consultas administrativas e criar paginação/índices por evidência.

Aceite: refresh, múltiplas abas, sessão expirada e falha de rede têm
comportamento previsível; bundle ou consulta não pioram silenciosamente.

### TD5 — UI sustentável e templates

- [ ] definir tokens e componentes essenciais antes de migrar telas;
- [ ] remover estilos inline por área tocada, sem conversão global mecânica;
- [ ] validar teclado, foco, rótulos, contraste e estados de erro/carregamento;
- [ ] separar schema de template, renderer e catálogo;
- [ ] tornar versões publicadas imutáveis e manter referência nos documentos;
- [ ] impedir HTML/JavaScript arbitrário no editor de templates;
- [ ] exigir revisão técnica, editorial e jurídica quando aplicável.

Aceite: telas novas reutilizam primitives acessíveis e templates antigos continuam
reproduzíveis após uma nova versão ser publicada.

### TD6 — Dependências, documentação e operação contínua

- [ ] concluir análise de alcançabilidade dos alertas atuais;
- [ ] revisar scripts de instalação e definir política de atualização;
- [ ] automatizar auditoria de segredos, dependências e migrations no CI;
- [ ] manter um único status vigente e arquivar planos encerrados;
- [ ] adicionar runbooks para auth, pagamento, banco, deploy e rollback;
- [ ] revisar o registro de dívida a cada marco, não apenas em incidentes.

Aceite: cada alerta tem decisão e responsável; documentação reproduz instalação,
diagnóstico, deploy e rollback sem conhecimento tácito.

## Definition of Done para pagamento de dívida

Um item só pode ser marcado como concluído quando:

1. existe evidência anterior e resultado esperado explícito;
2. o comportamento afetado possui teste proporcional ao risco;
3. lint, typecheck, testes e build passam;
4. migrations foram reconstruídas do zero quando o banco foi alterado;
5. logs, mensagens e documentação não expõem dados sensíveis;
6. compatibilidade, rollback e impacto em produção foram considerados;
7. não ficou uma implementação antiga paralela sem prazo de remoção;
8. o status e este registro apontam commit, teste ou medição verificável.

## Limites de trabalho e prevenção de nova dívida

- nenhuma feature administrativa sensível entra sem capacidade, motivo,
  idempotência e auditoria;
- nenhuma exceção é silenciada sem retorno ou telemetria adequada;
- nenhum acesso direto novo a Supabase/storage nasce dentro de componente visual;
- nenhum `any`, payload implícito ou status mágico novo sem justificativa;
- nenhuma refatoração mistura mudança ampla de estrutura e comportamento;
- nenhuma meta de linhas ou cobertura deve incentivar divisão artificial ou teste
  sem valor;
- reservar parte de cada ciclo para dívida ligada à área funcional tocada.

## Próximo marco

Concluir TD0 nesta branch: testes reais de autorização/RLS, capacidades privadas
e bloqueios de segurança. Só então começar novas mutações administrativas. Em
paralelo, preparar TD1 para que os novos fluxos já nasçam observáveis.

Evidência inicial: `npm run test:security:local` cria duas identidades locais e
comprova isolamento de `profiles`, `documents` e `document_drafts`, bloqueio de
autoelevação, invisibilidade da auditoria para o cliente e permissões append-only
do `service_role`. A migration `019` cria papéis/capacidades privados; o RPC é
restrito ao backend e `npm run test:admin-functions:local` comprova 401/403/200
nas Edge Functions, além de negar com `403 mfa_required` a exceção de download
por admin AAL1. Ainda faltam UX MFA, cobertura das mutações, gestão segura de
papéis e teste owner.

## Critério de encerramento deste programa

O programa pode ser arquivado quando todos os itens críticos/altos estiverem
concluídos ou aceitos formalmente com mitigação, as métricas forem atualizadas e
o restante puder ser administrado pelo fluxo normal de produto sem uma frente
extraordinária de modernização.
