# Status consolidado — 2026-08-03

## Foco atual

Executar M00 (governança e baseline) e tratar riscos de dependências antes de
prosseguir com refatorações estruturais amplas, mantendo o hardening S0 em paralelo.

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
- testes reais de RLS, auditoria efetiva, MFA/AAL2 e rate limiting permanecem pendentes;
- auditoria npm registra 3 alertas altos agrupados em 2 causas: uma transitiva de
  desenvolvimento (`brace-expansion`) e uma cadeia direta do Router relacionada a
  RSC Mode; remediação e prova de alcançabilidade detalhadas em S2.2;
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
- implementação ainda não iniciada.

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

## Planos históricos

Planos concluídos ou substituídos foram preservados em [historico/](./historico/README.md).
