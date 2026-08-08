# Etapa 04 — Arquitetura frontend

## Arquitetura-alvo

Organização por domínio, mantendo compartilhados somente elementos realmente genéricos:

```text
src/
  app/                 # bootstrap, providers, router e configuração
  features/
    auth/
    documents/
    resumes/
    legal-documents/
    checkout/
    profile/
    admin/
  shared/
    ui/
    hooks/
    lib/
    utils/
  services/            # adaptadores externos
```

## Sequência

1. checkout;
2. dashboard;
3. templates;
4. editor jurídico;
5. perfil;
6. roteamento e providers.

Cada feature terá `components`, `hooks`, `services`, `schemas`, `tests` e uma API pública por `index.js`. Regras não devem depender de JSX nem de objetos globais do navegador.

## Critérios de aceite

- páginas apenas orquestram seções;
- chamadas externas ficam em services;
- lógica de fluxo fica em hooks/use cases;
- dependências entre features são explícitas;
- nenhum arquivo novo supera 400 linhas sem decisão registrada.

