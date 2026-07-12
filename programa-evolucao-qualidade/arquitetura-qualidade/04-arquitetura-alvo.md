# Arquitetura alvo

## Objetivo

Separar camadas para que regra de negócio não fique presa em páginas React.

## Estrutura proposta

```txt
src/
  app/
    App.jsx
    routes.js

  components/
    UI/
    Icons.jsx

  domain/
    paidDocuments/
      identity.js
      policy.js
      messages.js
      index.js
    payments/
      paymentStatus.js
      paymentRules.js
    documents/
      documentTypes.js
      documentStatus.js

  features/
    checkout/
      CheckoutPage.jsx
      PaymentWaitingScreen.jsx
      PaymentSuccessScreen.jsx
      PaymentMethodSelector.jsx
      useCheckoutFlow.js
      usePendingPayment.js
    dashboard/
    editor/
    legal-editor/
    profile/

  services/
    DocumentService.js
    PaymentService.js
    ProfileService.js

  context/
    AuthContext.jsx
    AppNavigationContext.jsx
    ResumeContext.jsx
    LegalContext.jsx

  utils/
    formatting.js
    validation.js
    sanitization.js
```

## Regras

### Pages

Podem:

- renderizar layout;
- orquestrar hooks;
- navegar.

Não devem:

- conter regra comercial pesada;
- montar payload complexo de pagamento;
- decidir política sensível sozinhas.

### Domain

Deve conter:

- funções puras;
- política de negócio;
- mensagens;
- testes.

Não deve depender de React.

### Services

Devem:

- chamar Supabase/Edge Functions;
- mapear dados do banco;
- tratar erros técnicos.

Não devem:

- renderizar mensagens;
- acessar DOM;
- depender de estado React.

### Contexts

Devem:

- prover estado necessário;
- evitar value gigante;
- separar responsabilidades.

Não devem:

- virar repositório de toda regra do app.

## Fluxo ideal de pagamento

```txt
CheckoutPage
  ↓
useCheckoutFlow
  ↓
PaymentService.createPreference
  ↓
Supabase Edge Function
  ↓
Mercado Pago
  ↓
Webhook
  ↓
DocumentService / Supabase
```

## Fluxo ideal de edição paga

```txt
Editor/LegalEditor
  ↓
Checkout/Edit finalization
  ↓
paidDocuments.policy
  ↓
Backend validation
  ↓
DocumentService.update
```

## Meta arquitetural

Ao final da refatoração:

- regras críticas testáveis sem React;
- páginas menores;
- contexts menores;
- backend reforçando política financeira;
- lint verde;
- CI bloqueando regressão.
