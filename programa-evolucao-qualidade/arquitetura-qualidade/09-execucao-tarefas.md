# Execução 1 a 1 — arquitetura e qualidade

Este arquivo transforma o plano em tarefas executáveis. Cada tarefa deve ser pequena, validável e segura para produção.

## Status geral

- Início: 2026-07-12
- Fase atual: Fase 1 — Qualidade estática obrigatória
- Objetivo imediato: fazer `npm run lint` passar sem reduzir qualidade.

## Regras de execução

1. Fazer uma tarefa por vez.
2. Validar com comando objetivo.
3. Não esconder erro real com disable genérico.
4. Não misturar refatoração grande com correção pequena.
5. Commitar apenas quando a etapa estiver validada.

## Fase 1 — Zerar lint

### AQ-001 — Ajustar escopo do ESLint

Objetivo: impedir que arquivos gerados ou ambientes externos gerem ruído falso.

Arquivos:

- `eslint.config.js`

Passos:

1. Ignorar `coverage/`.
2. Manter `dist/` ignorado.
3. Adicionar override específico para `e2e/**/*.js` com globais Node/Playwright quando necessário.

Critério de aceite:

- `coverage/` não aparece mais no lint.
- `e2e` não acusa `process` como indefinido.

Comando:

```powershell
npm run lint
```

Status: concluída.

### AQ-002 — Corrigir hooks condicionais

Objetivo: resolver violações reais de regras de Hooks.

Arquivos:

- `src/components/UI/feedback.jsx`
- `src/components/UI/resume-helpers.jsx`

Critério de aceite:

- Sem erro `react-hooks/rules-of-hooks`.

Status: concluída.

### AQ-003 — Remover variáveis e imports mortos

Objetivo: remover código morto que reduz clareza.

Arquivos iniciais:

- `src/pages/AdminPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/data/documents/compra-venda.js`
- `src/data/documents/prestacao-servicos.js`
- `src/utils/logger.js`
- `src/utils/pdfGenerator.js`
- `e2e/auth.setup.js`

Status: concluída.

### AQ-004 — Corrigir Fast Refresh de contexts/helpers

Objetivo: separar exports de componentes e helpers/contextos ou ajustar estrutura sem mascarar problema.

Arquivos:

- `src/components/Icons.jsx`
- `src/components/Theme.jsx`
- `src/context/AppContext.jsx`
- `src/context/AuthContext.jsx`
- `src/context/LegalContext.jsx`
- `src/context/ResumeContext.jsx`

Status: concluída.

### AQ-005 — Corrigir effects problemáticos

Objetivo: evitar effects frágeis ou com dependências instáveis.

Arquivos:

- `src/pages/AdminPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/TemplatesPage.jsx`

Status: concluída.

## Fase 2 — Domínio de documento pago

### AQ-101 — Mover identidade paga para domínio

Objetivo: sair de `utils` e estruturar como regra de negócio.

Destino:

```txt
src/domain/paidDocuments/
```

Status: concluída.

### AQ-102 — Criar política pura de edição paga

Objetivo: encapsular decisão:

- permitido;
- exige confirmação;
- exige novo documento.

Status: concluída.

### AQ-103 — Backend validar edição paga

Objetivo: garantir regra comercial fora do frontend.

Status: pendente.

## Fase 3 — Checkout

### AQ-201 - Extrair tela de aguardando pagamento

Status: concluida.

Resultado: criada `src/features/checkout/PaymentWaitingScreen.jsx` e `CheckoutPage` passou a delegar a renderizacao da tela de pagamento em andamento.

### AQ-202 — Extrair tela de sucesso

Status: pendente.

### AQ-203 — Extrair hook `useCheckoutFlow`

Status: pendente.

## Fase 4 — Testes críticos

### AQ-301 — Testar fluxo de edição paga

Status: pendente.

### AQ-302 — Testar bloqueio da segunda edição sensível

Status: pendente.

### AQ-303 — Testar webhook/snapshot

Status: pendente.

## Histórico de execução

| Data | Tarefa | Resultado |
|---|---|---|
| 2026-07-12 | AQ-001 | Concluída: `coverage` ignorado, ambiente e2e ajustado e import morto removido. |
| 2026-07-12 | AQ-002 | Concluída: hooks condicionais em `ConfirmDialog` e `QuickSuggestion` corrigidos. |
| 2026-07-12 | AQ-003 | Concluída: remoção de imports/variáveis mortos e cleanup de warnings. |
| 2026-07-12 | AQ-004 | Concluída: exports públicos reduzidos e hooks permitidos explicitamente no Fast Refresh. |
| 2026-07-12 | AQ-005 | Concluída: dependências/effects ajustados em Admin, Dashboard, Templates e useAutoSave. |
| 2026-07-12 | AQ-101 | Concluída: identidade paga movida para `src/domain/paidDocuments`. |
| 2026-07-12 | AQ-102 | Concluída: política pura de edição paga criada e testada. |
| 2026-07-12 | AQ-201 | Concluida: tela de aguardando pagamento extraida para `src/features/checkout/PaymentWaitingScreen.jsx`. |
