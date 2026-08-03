# Painel Admin — Métricas — Handoff 2026-08-03

> Documento de passagem de bastão para continuidade do trabalho com outra IA.
> Plano de referência: `PAINEL-ADMINISTRATIVO-PLANO-2026-07-18.md`

## Estado geral atualizado

O painel administrativo com métricas está **implementado, aplicado no banco e
publicado no Supabase**. As migrations `014`, `015` e `016` estão no remoto; as
funções `admin` e `admin-metrics` estão ativas; a conta proprietária possui papel
administrativo; CORS e carregamento da rota foram corrigidos; e a autoelevação
de `profiles.role` foi bloqueada.

Ainda faltam as fases operacionais posteriores do plano: busca e paginação
server-side, responsividade da tabela, ações auditadas, financeiro detalhado,
reprocessamento e observabilidade completa.

## O que foi feito (4 checkpoints concluídos)

### 1. Backend
- `supabase/functions/admin-metrics/index.ts` — edge function GET protegida:
  autentica (Bearer token) → verifica role `admin` (403 se não) → valida período →
  chama `calculateMetrics`.
- `supabase/functions/_shared/metrics.ts` — cálculo das métricas (usuários,
  documentos, receita aprovada, pagamentos aprovados/pendentes/falhos, séries
  diária/mensal, falhas recentes de webhook, consumo de créditos tolerante a
  tabela inexistente).
- `supabase/functions/_shared/http.ts` — CORS agora inclui **GET** (admin-metrics
  é GET com Authorization header → dispara preflight).
- `supabase/functions/_shared/auth.ts` — já existia (`createAdminClient`,
  `authenticate`); nenhuma mudança.
- `supabase/migrations/014_add_admin_audit_events.sql` — tabela de auditoria
  administrativa, RLS bloqueada para anon/authenticated, `REVOKE ALL`.
- `supabase/config.toml` — `[functions.admin-metrics] verify_jwt = false`
  (mesmo padrão do verify-payment: auth validada internamente, evita falsos 401
  por clock skew).
- `src/services/MetricsService.js` — cliente frontend (`MetricsService.getMetrics(period)`).

### 2. UI (novos componentes em `src/components/admin/`)
- `PeriodFilter.jsx` — seletor de período (7d/30d/90d/1y/all).
- `MetricCard.jsx` — card de indicador.
- `MetricsCards.jsx` — grid de 5 cards (usuários, documentos, pagamentos
  aprovados, pendências, receita).
- `MiniChart.jsx` — gráfico de barras SVG puro (sem lib externa).
- `RecentFailures.jsx` — lista de falhas recentes de webhook.
- `AdminEnvironmentBadge.jsx` — badge de ambiente + saúde.
- `index.js` — barrel export.

### 3. Integração (`src/pages/AdminPage.jsx`)
- Aba "Visão Geral" agora tem: PeriodFilter, MetricsCards, 2 MiniCharts
  (documentos/receita), distribuição por tipo, RecentFailures.
- Estado: `period`, `metrics`, `metricsLoading`; `loadMetrics` via MetricsService.
- Corrigido bug pré-existente: ícone `"BarChart"` não existe → trocado por `"Layout"`.

### 4. Revisão e validação
- **Bug crítico corrigido**: `recentFailures` selecionava coluna `id` na tabela
  `payment_webhook_events`, cuja PK é **`event_key`** (não existe `id`) → daria
  500 no endpoint inteiro. Corrigido: seleciona `event_key` e reexpõe como `id`.
- Lint limpo, build de produção ok, testes 322/322 passando (após fix do
  `test.env: { NODE_ENV: 'test' }` no `vite.config.js` — build de produção do
  React 19 não exporta `act`, quebrava @testing-library/react).

## Checklist operacional concluído

- [x] Supabase CLI instalado e autenticado.
- [x] Projeto `KRIOU-DOCS` vinculado.
- [x] Migrations `014`, `015` e `016` aplicadas.
- [x] Funções `admin` e `admin-metrics` publicadas.
- [x] Rota `/admin` aberta com a conta proprietária.
- [x] Preflight e rejeição sem token validados.

## Versionamento

- Painel e deploy: commit `0fa519c` (`feat: deploy admin metrics dashboard`).
- Proteção de privilégios: commit `86b8abe` (`fix: prevent profile privilege escalation`).

## Fatos técnicos importantes para não re-descobrir

- PK de `payment_webhook_events` é `event_key` (não `id`).
- Status de pagamento: approved = `approved`/`aprovado`; pending =
  `pending`/`in_process`/`in_mediation`/`authorized`; failed =
  `rejected`/`cancelled`/`refunded`/`charged_back`. Ver `src/domain/documents/payment.js`.
- Não existe tabela `credit_transactions` ainda → métrica de créditos retorna zeros
  (comportamento intencional, com `available: false`).
- Convenção de edge function: `_shared/auth.ts` + `_shared/http.ts`; `verify_jwt = false`
  quando auth é interna (padrão verify-payment).
- CSS variables e fontes vêm de `Theme.jsx`/`index.css` (`--navy`, `--surface`,
  `--coral`, `--teal`, `--gold`, etc.).
- Icones: `src/components/Icons.jsx` — `BarChart` não existe; usar `Layout`.
