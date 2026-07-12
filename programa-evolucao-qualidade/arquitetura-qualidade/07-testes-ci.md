# Plano de testes e CI

## Estado atual

Testes:

- 130 passando.

Cobertura atual relevante:

- validação;
- sanitização;
- formatação;
- PaymentService;
- assinatura Mercado Pago;
- identidade paga.

## Lacunas

Faltam testes de fluxo:

- checkout;
- edição de documento pago;
- webhook completo;
- dashboard refletindo pagamento;
- e2e de usuário real.

## Pirâmide recomendada

### Unitários

Devem cobrir:

- domínio puro;
- validação;
- sanitização;
- regras comerciais.

### Integração

Devem cobrir:

- services com mocks de Supabase;
- fluxo de checkout com mocks;
- atualização de documentos.

### E2E

Devem cobrir poucos fluxos críticos:

1. Login/setup.
2. Criar documento.
3. Ir ao checkout.
4. Ver tela aguardando pagamento.
5. Simular documento pago.
6. Editar documento pago.

## CI recomendado

Pipeline obrigatório:

```txt
npm ci
npm run lint
npm test -- --run
npm run build
```

Opcional:

```txt
npm run test:e2e
```

## Critério para merge/deploy

Não publicar se:

- lint falhar;
- teste falhar;
- build falhar;
- migration necessária não tiver sido aplicada;
- Edge Function relacionada não tiver sido publicada.

## Checklist para alteração em pagamento

- Teste unitário da regra.
- Teste de Edge Function ou service.
- Migration aplicada.
- Function publicada.
- Build Vercel aprovado.
- Teste manual do fluxo.
