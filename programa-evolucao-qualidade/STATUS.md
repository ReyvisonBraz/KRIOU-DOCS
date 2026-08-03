# Status consolidado — 2026-08-03

## Foco atual

Concluir o painel administrativo antes de iniciar a modernização estrutural e o
hardening amplo de segurança.

## Painel administrativo

- migrations `014`, `015` e `016` aplicadas no Supabase remoto;
- Edge Functions `admin` e `admin-metrics` publicadas;
- conta proprietária configurada como `admin`;
- rota administrativa corrigida para aguardar o carregamento do perfil;
- CORS/preflight da função `admin` corrigido;
- autoelevação por `profiles.role` bloqueada;
- métricas, gráficos, filtro de período, usuários e falhas recentes implementados;
- lint, 321 testes e build aprovados;
- ainda faltam busca/paginação, responsividade da tabela e conclusão das fases P02–P05;
- commit da entrega atual ainda pendente.

## Modernização

Plano ativo: [PLANO-MESTRE-MODERNIZACAO-2026-08-03.md](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md).

- diagnóstico estrutural concluído;
- cobertura global medida em 28,90% de linhas, 17,97% de funções e 20,38% de branches;
- hotspots acima de mil linhas identificados;
- observabilidade externa, contratos e decomposição continuam pendentes;
- primeiro marco: M00 — governança e higiene do repositório.

## Segurança

Plano ativo: [PLANO-HARDENING-SEGURANCA-2026-08-03.md](./PLANO-HARDENING-SEGURANCA-2026-08-03.md).

- vulnerabilidade crítica de autoelevação corrigida;
- testes reais de RLS, auditoria efetiva, MFA/AAL2 e rate limiting permanecem pendentes;
- itens S0/S1 devem ser tratados antes da ampliação pública do painel.

## Planos históricos

Planos concluídos ou substituídos foram preservados em [historico/](./historico/README.md).
