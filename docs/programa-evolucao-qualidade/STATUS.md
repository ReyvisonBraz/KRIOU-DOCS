# Status consolidado — 2026-08-03

## Foco atual

Concluir TD0 na branch `feat/admin-security-foundation`: testes reais de
autorização/RLS, capacidades administrativas e bloqueios de segurança. Depois,
iniciar erros/contratos/observabilidade antes das refatorações estruturais amplas.

## Painel administrativo

- migrations `014` a `017` aplicadas no Supabase remoto;
- Edge Functions `admin` e `admin-metrics` publicadas;
- conta proprietária configurada como `admin`;
- rota administrativa corrigida para aguardar o carregamento do perfil;
- CORS/preflight da função `admin` corrigido;
- autoelevação por `profiles.role` bloqueada;
- métricas, gráficos, filtro de período, usuários e falhas recentes implementados;
- causa dupla do non-2xx identificada: verbo HTTP incorreto no cliente e falta
  de privilégios SQL explícitos do backend; correções publicadas no Supabase;
- ainda faltam busca/paginação, responsividade da tabela e conclusão das fases P02–P05;
- entrega integrada e publicada no `main` pelo merge `959ddaa`.

## Modernização

Plano ativo: [PLANO-MESTRE-MODERNIZACAO-2026-08-03.md](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md).

- diagnóstico estrutural concluído;
- cobertura global medida em 28,90% de linhas, 17,97% de funções e 20,38% de branches;
- hotspots acima de mil linhas identificados;
- observabilidade externa, contratos e decomposição continuam pendentes;
- primeiro marco: M00 — governança e higiene do repositório.
- `dist/` e `coverage/` removidos do rastreamento;
- planos consolidados em `docs/programa-evolucao-qualidade/`;
- identidade Git local configurada com e-mail `noreply` verificado do GitHub;
- `.claude/settings.local.json` removido do rastreamento e preservado apenas localmente;
- stash temporário revisado e descartado por conter somente build/lockfile obsoletos;
- varredura inicial de padrões de segredo no estado atual e histórico sem credencial real encontrada;
- ambiente oficial padronizado em Node 22.12+ e npm 10/11 por `.nvmrc`,
  `package.json` e CI;
- pacote identificado como `kriou-docs@0.1.0`;
- README, guia de contribuição, convenções, ADRs e Definition of Done criados/atualizados;
- typecheck adicionado ao CI e ao comando agregado `npm run quality`;
- baseline validada: lint, typecheck, testes, build e E2E público/negativo 16/16 aprovados;
- visitante bloqueado nas oito rotas protegidas; refresh público e `/admin`
  autenticado em produção comprovados;
- auto-save sem usuário corrigido e coberto por regressão de console;
- sessões E2E locais determinísticas de usuário comum/admin implementadas; callback
  OAuth completo continua pendente por depender do provedor externo;
- branch local de trabalho: `chore/modernizacao-m00`.

## Segurança

Plano ativo: [PLANO-HARDENING-SEGURANCA-2026-08-03.md](./PLANO-HARDENING-SEGURANCA-2026-08-03.md).

- vulnerabilidade crítica de autoelevação corrigida;
- testes reais de RLS e auditoria append-only estão ativos;
- migrations `018` a `020` aplicadas no Supabase remoto em 04/08/2026;
- Edge Functions `admin`, `admin-metrics`, `authorize-download` e `admin-access`
  publicadas após as migrations; chamadas sem autenticação continuam bloqueadas;
- cadastro TOTP e elevação AAL2 foram comprovados manualmente na conta proprietária
  real, seguidos de acesso bem-sucedido ao painel protegido no ambiente local;
- a rota `/admin` agora monta o painel e inicia suas consultas somente após AAL2;
  logout, novo login Google, desafio TOTP e liberação do painel foram validados
  manualmente na conta proprietária real;
- cobertura de todas as mutações, recuperação de MFA, rate limiting e teste do
  fluxo OAuth no Preview permanecem pendentes;
- auditoria npm de 04/08 registra 5 pacotes (4 altos, 1 moderado) em quatro
  causas; com `--omit=dev`, restam apenas os 2 pacotes da mesma cadeia Router/RSC,
  não usada pelo SPA atual; remediação detalhada em S2.2;
- scripts de instalação pendentes de revisão: `core-js` e `fsevents`;
- `admin-metrics`: migration `017` e função atualizada já estão no Supabase; o
  cliente GET está validado localmente e aguarda publicação do frontend;
- itens S0/S1 devem ser tratados antes da ampliação pública do painel.

## Sincronização, exclusão e auditoria

Plano ativo: [PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md](./PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md).

- exclusão de documento será confirmada pelo servidor antes de remover o card;
- falha preservará/restaurará o estado e exibirá mensagem acionável;
- painel receberá botão, idade dos dados e refresh por foco;
- polling será opcional e econômico; Realtime foi adiado até existir evidência;
- exclusão real de conta dependerá de backend auditado e política de retenção;
- implementação iniciada por D0; demais fases permanecem planejadas.

Evidência D0 na branch `feat/admin-security-foundation`: limpeza local extraída
para feature/componentes próprios, linguagem corrigida e testes de alcance,
cancelamento, falha e confirmação adicionados. Conta e dados do servidor não são
mais apresentados como excluídos por essa ação.

## Dívida técnica

Plano ativo: [PLANO-DIVIDA-TECNICA-2026-08-03.md](./PLANO-DIVIDA-TECNICA-2026-08-03.md).

- inventário único criado com prioridade por risco, dependências e aceite mensurável;
- reescrita total rejeitada em favor de mudanças incrementais e reversíveis;
- TD0 concentra autorização/RLS, auditoria append-only, capacidades e MFA;
- primeira dívida paga: a limpeza local não promete mais excluir conta/dados do servidor;
- migration `018` e helper compartilhado criam a base append-only de auditoria;
- `npm run test:security:local` comprova RLS entre duas contas reais em perfis,
  documentos e rascunhos, bloqueia autoelevação e valida auditoria append-only;
- migration `019` cria `support`, `finance`, `admin` e `owner` em schema privado,
  sem acesso direto pelo cliente ou `service_role`;
- `admin` e `admin-metrics` autorizam por capacidade; integração local comprova
  respostas 401/403/200 para visitante, usuário comum e administrador;
- admin AAL1 não usa mais bypass de download não pago: recebe `403 mfa_required`;
- perfil possui UI de cadastro TOTP, QR secreto, chave manual, confirmação e
  reforço de sessão, isolada em `features/account`;
- teste local comprova criação/cancelamento do fator e testes de componente
  cobrem cadastro, AAL2 e sessão AAL1 com fator existente;
- próximo item executável: conectar a gestão segura de papéis à interface,
  implementar recuperação segura e desenhar a segunda aprovação para owner;
- migration `020` e Edge Function `admin-access` implementam gestão transacional
  de `support`, `finance` e `admin` exclusivamente por owner em AAL2;
- motivo, `operation_id`, idempotência e auditoria são obrigatórios; admin comum,
  owner AAL1, autoalteração e promoção a owner são rejeitados;
- alterações de owner permanecem bloqueadas até existir segunda aprovação e
  proteção formal do último proprietário.

## Controles administrativos

Plano ativo: [PLANO-CONTROLES-ADMINISTRATIVOS-2026-08-03.md](./PLANO-CONTROLES-ADMINISTRATIVOS-2026-08-03.md).

- capacidades propostas para usuários, documentos, pagamentos e operação;
- `Marcar como pago` rejeitado: conciliação usa o provedor e exceção vira
  `Liberar como cortesia`, separada da receita;
- download/visualização de conteúdo de cliente será excepcional, temporário,
  motivado, protegido por MFA e auditado;
- edição administrativa será proposta versionada, sem impersonação e sem apagar original;
- primeira entrega recomendada limita-se a busca/detalhe, arquivamento, suspensão,
  bloqueios, atualização e auditoria;
- implementação ainda não iniciada; A0 é bloqueador obrigatório.

## Dashboard e templates

Plano ativo: [PLANO-DASHBOARD-E-TEMPLATES-2026-08-03.md](./PLANO-DASHBOARD-E-TEMPLATES-2026-08-03.md).

- dashboard será orientado a saúde, filas, drill-down, SLA e ações, não apenas KPIs;
- catálogo separará layouts de currículo e conteúdo jurídico;
- templates publicados serão imutáveis e documentos guardarão a versão utilizada;
- rollback afetará somente novos usos, preservando documentos existentes;
- editor usará schema declarativo validado, nunca HTML/JS arbitrário;
- jurídico exigirá revisão técnica, de conteúdo e jurídica antes da publicação;
- migração será híbrida e gradual, começando por inventário/registry somente leitura;
- implementação ainda não iniciada.

## Autenticidade e QR de documentos

Plano ativo: [PLANO-AUTENTICIDADE-QR-DOCUMENTOS-2026-08-03.md](./PLANO-AUTENTICIDADE-QR-DOCUMENTOS-2026-08-03.md).

- QR de MFA e QR público do documento formalmente separados;
- causa do QR sem tela confirmada: URL fixa para domínio/rota inexistentes;
- código atual é gerado no cliente e não possui vínculo verificável no backend;
- solução planejada com versão imutável, token opaco, hash, revogação e página pública;
- tela pública mostrará metadados mínimos e nomes mascarados por padrão;
- titular poderá entrar com Google, preservar o destino e resolver somente documento próprio;
- scanner no painel será responsivo/PWA, com fallback manual e download ainda
  submetido à autorização backend;
- Q0–Q3 precisam ser concluídos juntos antes de chamar o QR de autenticador.

## Planos históricos

Planos concluídos ou substituídos foram preservados em [historico/](./historico/README.md).
