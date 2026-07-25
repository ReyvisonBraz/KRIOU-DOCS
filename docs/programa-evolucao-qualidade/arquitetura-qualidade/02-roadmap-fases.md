# Roadmap por fases

## Fase 1 — Qualidade estática obrigatória

Objetivo: `npm run lint`, `npm test -- --run` e `npm run build` precisam passar.

Tarefas:

1. Excluir `coverage/` do ESLint.
2. Ajustar ambiente ESLint para Playwright/e2e.
3. Corrigir hooks condicionais.
4. Resolver variáveis não usadas.
5. Separar exports que quebram Fast Refresh.
6. Corrigir effects com dependências incompletas.

Critério de aceite:

- `npm run lint` passa.
- `npm test -- --run` passa.
- `npm run build` passa.

## Fase 2 — Domínio de documentos pagos

Objetivo: centralizar regra comercial do plano avulso.

Estrutura sugerida:

```txt
src/domain/paidDocuments/
  identity.js
  policy.js
  messages.js
  index.js
```

Tarefas:

1. Mover `paidDocumentIdentity.js` para domínio.
2. Criar `paidDocumentPolicy.js`.
3. Criar mensagens padronizadas.
4. Criar testes de política.
5. Preparar endpoint/função backend para validar edição sensível.

Critério de aceite:

- Checkout não contém regra detalhada de identidade.
- Política tem testes unitários.
- Mensagens comerciais ficam fora da página.

## Fase 3 — Refatorar CheckoutPage

Objetivo: reduzir responsabilidade da página.

Estrutura sugerida:

```txt
src/features/checkout/
  CheckoutPage.jsx
  PaymentMethodSelector.jsx
  PaymentWaitingScreen.jsx
  PaymentSuccessScreen.jsx
  useCheckoutFlow.js
  usePendingPayment.js
```

Tarefas:

1. Extrair tela de sucesso.
2. Extrair tela de aguardando pagamento.
3. Extrair seleção de método.
4. Extrair fluxo de criação de preferência.
5. Extrair fluxo de edição paga.

Critério de aceite:

- `CheckoutPage.jsx` vira orquestrador.
- Fluxos testáveis em hooks/serviços.
- Nenhuma regressão no pagamento.

## Fase 4 — Testes críticos

Objetivo: cobrir fluxo de negócio.

Testes mínimos:

1. Documento novo abre checkout.
2. Documento pago editado em campo normal não abre checkout.
3. Primeira edição sensível mostra modal.
4. Confirmar correção sensível atualiza documento.
5. Segunda edição sensível bloqueia.
6. Troca de tipo jurídico bloqueia.
7. Webhook aprovado salva snapshot.

Critério de aceite:

- Testes unitários e integração relevantes criados.
- Pelo menos 1 teste e2e de fluxo principal.

## Fase 5 — Contextos e estado global

Objetivo: reduzir acoplamento.

Tarefas:

1. Separar providers por domínio.
2. Evitar value gigante no `AppContext`.
3. Criar hooks seletivos.
4. Isolar estado de checkout.
5. Isolar estado de editor jurídico.

Critério de aceite:

- Contextos menores.
- Menos renderização em cascata.
- Menos imports cruzados.

## Fase 6 — Operação e CI

Objetivo: deploy previsível.

Tarefas:

1. Criar pipeline com lint/test/build.
2. Checklist de envs.
3. Checklist Supabase.
4. Checklist Mercado Pago.
5. Teste de webhook documentado.

Critério de aceite:

- Nenhum deploy passa sem lint/test/build.
- Checklist de produção mantido no repositório.
