# Plano de evolução técnica — Kriou Docs

Data-base: 2026-07-12

Este plano organiza a melhoria estrutural do projeto Kriou Docs com foco em qualidade, previsibilidade e manutenção. O objetivo não é adicionar funcionalidades novas primeiro; é estabilizar a base para que novas features não aumentem dívida técnica.

## Estado atual resumido

- Git: `main` alinhada com `origin/main`.
- Testes unitários: 130 passando.
- Build: passando.
- Deploy Vercel: funcional.
- Supabase: migrations e Edge Functions principais publicadas.
- Lint completo: falhando com 30 erros e 4 avisos.

## Nota crítica atual

| Área | Nota | Leitura |
|---|---:|---|
| Produto | 7.5 | Já tem valor real e fluxo de pagamento/documento útil. |
| Código | 6.5 | Funciona, mas ainda tem arquivos grandes e regras espalhadas. |
| Arquitetura | 6.5 | Estrutura aceitável para MVP, fraca para escala. |
| Pagamentos/segurança | 7.0 | Boa evolução, mas domínio deve ser validado mais no backend. |
| Testes | 6.5 | Há bons testes unitários, falta fluxo crítico/e2e. |
| Operação | 6.0 | Deploy funciona, mas falta checklist e CI rígida. |

Nota geral: 7/10.

## Princípios de evolução

1. Não quebrar produção para refatorar.
2. Cada etapa precisa ter critério de aceite.
3. Regras comerciais críticas devem migrar para módulos de domínio e, quando necessário, backend.
4. O frontend orienta; o backend garante.
5. Build, testes e lint devem virar bloqueadores de deploy.
6. Alterações grandes devem ser fatiadas em entregas pequenas.

## Ordem recomendada

1. Zerar lint completo.
2. Separar domínio de pagamento/documento pago.
3. Quebrar `CheckoutPage`.
4. Fortalecer testes críticos.
5. Organizar contexts e estado global.
6. Criar checklist operacional e CI.

## Arquivos deste plano

- `01-diagnostico.md`: avaliação crítica do estado atual.
- `02-roadmap-fases.md`: ordem de execução por fases.
- `03-backlog-tecnico.md`: backlog detalhado com prioridade.
- `04-arquitetura-alvo.md`: proposta de estrutura futura.
- `05-plano-lint-qualidade.md`: plano para zerar ESLint.
- `06-pagamentos-dominio.md`: plano para pagamento/documento pago.
- `07-testes-ci.md`: plano de testes e CI.
- `08-checklists.md`: checklists de aceite e produção.
