# Etapa 03 — Testes e integração contínua

## Pirâmide proposta

- unitários: regras puras, validação, mapeamento e estados;
- integração: services, contexts, Supabase e funções Edge;
- componentes: interação, acessibilidade e estados de erro;
- E2E: login, criação, retomada, pagamento, download e administração.

## Tarefas

- ampliar coverage para todo `src`, com metas graduais;
- criar fixtures e factories sem dados pessoais reais;
- tornar autenticação E2E automática e isolada;
- testar migrations e políticas RLS;
- criar workflow CI: install imutável, lint, test, build, E2E e audit;
- publicar relatórios como artefatos, sem versionar `coverage/` ou `dist/`.

## Metas

- 80% de linhas em regras e serviços críticos;
- 100% dos estados financeiros relevantes;
- zero teste flaky em três execuções consecutivas;
- PR não pode integrar com portão vermelho.

