# Kriou Docs

Plataforma para criação de documentos profissionais por preenchimento guiado: **currículos**
(wizard de 7 etapas, 5 templates) e **documentos jurídicos** (10 famílias, 22 variantes —
compra e venda, locação, procuração, doação, recibo, união estável, autorização de viagem,
comodato, permuta e prestação de serviços).

O usuário entra com Google, preenche o formulário com salvamento automático, visualiza o
resultado, paga **R$ 9,90 por documento** via Mercado Pago e baixa o PDF ou recebe por e-mail.

📍 **Estado atual:** [STATUS.md](STATUS.md) · 🗺️ **O que falta:** [ROADMAP.md](ROADMAP.md)

---

## Começando

```bash
npm install
cp .env.example .env.local
npm run env:check
npm run dev
```

Copie `.env.example` para `.env.local`. O padrão habilita offline local explicitamente; para Auth
e persistência, inicie o Supabase local e preencha sua URL e chave anon/publishable. Staging pago
foi diferido: Preview autenticado permanece indisponível e nunca aponta para produção. Consulte o
[runbook](docs/runbook-deploy.md) antes de qualquer uso de ambiente remoto.

Inventário público informado pelo responsável em 2026-08-15: organização Supabase
`sptobceudadpankmgwyz`, produção `uyptmlezmdzfufzuknfz`, região `us-east-1`, ainda sem dados reais
declarados. A exceção atual permite somente duas contas descartáveis e Auth+RLS manual em produção
na Fase 2, com limpeza por UUIDs exatos e parada imediata em vazamento. Não autoriza migrations,
teste de exclusão, pagamentos, leitura/alteração de secrets financeiros nem Preview→produção.

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19, Tailwind CSS 4 |
| Build | Vite 8 |
| Estado | React Context (`AppContext`, `AuthContext`, `LegalContext`, `ResumeContext`) |
| Roteamento | Router próprio via contexto, sem biblioteca |
| Backend | Supabase — Postgres com RLS, Auth, Edge Functions em Deno |
| Pagamento | Mercado Pago Checkout Pro |
| PDF | jsPDF dentro de um Web Worker |
| Testes | Vitest, Testing Library, Playwright |
| Deploy | Vercel |

O projeto é **JavaScript puro com JSX** — não usa TypeScript, Redux/Zustand nem React Router.

---

## Estrutura

```
src/
├── components/       # UI compartilhada
│   ├── UI/           # primitives, form, feedback, layout, document, helpers
│   ├── Theme.jsx     # provider de tema (claro/escuro)
│   ├── Icons.jsx     # biblioteca de ícones SVG
│   └── ErrorBoundary.jsx
├── context/          # AppContext, AuthContext, LegalContext, ResumeContext
├── domain/           # regras puras (documents, paidDocuments) — sem React
├── features/         # fatias de funcionalidade (checkout)
├── services/         # DocumentService, PaymentService, DocumentAccessService
├── pages/            # telas
├── hooks/            # useAutoSave, useConfirm, usePDF, useUnsavedChanges
├── utils/            # validation, formatting, sanitization, geradores de PDF
├── data/             # constantes e os 10 templates de documento jurídico
└── workers/          # pdfWorker.js

supabase/
├── functions/        # 7 Edge Functions + _shared
│   ├── _shared/      # auth.ts, http.ts — helpers usados por todas
│   ├── create-preference, verify-payment, mercadopago-webhook
│   ├── authorize-download, send-email, export-user-data, admin
└── migrations/       # migrations numeradas 001–023 + legado não numerado

docs/
├── arquitetura.md    # como o sistema funciona
└── _historico/       # planejamento antigo — não é plano ativo
```

---

## Comandos

```bash
npm run dev              # servidor de desenvolvimento
npm run env:check        # valida o contrato sem imprimir credenciais
npm run build            # build; falha se o ambiente não estiver configurado
npm run build:ci         # compilação offline explícita do quality gate
npm run lint             # eslint
npm run scan:secrets     # index + worktree + novos + dist (valores omitidos)

npm test                 # testes unitários (560, devem passar todos)
npm run test:watch       # modo watch
npm run test:e2e         # Playwright completo (precisa de sessão)
npm run test:e2e:setup   # login real somente no futuro staging (indisponível hoje)
npm run test:e2e:public  # apenas cenários públicos, sem login
```

---

## Segurança

- **Preço fixado no servidor** — o valor nunca vem do cliente
- **RLS no Postgres** — o usuário só alcança as próprias linhas
- **Download autorizado pelo backend**, vinculado ao documento exato
- **Documento pago é protegido por trigger** contra edição de dados de identidade
- **Webhook idempotente** — `payment_webhook_events` impede processamento duplicado
- Validação de CPF por Mod11, sanitização de entrada contra XSS, rate limiting no cliente

> ⚠️ Nenhum pagamento real foi executado até hoje. Isso é deliberado — ver
> [F6 no roadmap](ROADMAP.md#f6--pagamento-real-ponta-a-ponta).

---

## Receitas rápidas

**Gerar PDF**
```javascript
import { usePDF } from "./hooks/usePDF";

const { generatePDF, isGenerating } = usePDF();
await generatePDF({ type: "GENERATE_RESUME", formData, template });
```

**Validar e formatar**
```javascript
import { validateCpf } from "./utils/validation";
import { formatCpf, formatCurrency } from "./utils/formatting";

validateCpf("123.456.789-09");  // true — Mod11, rejeita 000.000.000-00
formatCpf("12345678909");        // "123.456.789-09"
formatCurrency(9.90);            // "R$ 9,90"
```

**Adicionar um template de currículo**
Adicione a `RESUME_TEMPLATES` em `src/data/constants.js`. O preview e o gerador de PDF
aplicam automaticamente.

**Adicionar uma tela**
Crie em `src/pages/`, registre na rota lazy do `App.jsx` e adicione a chave da página em
`src/context/AppContext.jsx`.

---

## Tema

O tema claro/escuro é controlado pelo atributo `data-theme` no `<html>`, aplicado pelo
`ThemeProvider` em `src/components/Theme.jsx`. As cores são variáveis CSS definidas em
`src/index.css` — **é ali que se muda a paleta**, não no JSX.

```css
:root                     { --surface: #1A1A33; }  /* escuro, padrão */
:root[data-theme="light"] { --surface: #FFFFFF; }
```

Componentes consomem via `var(--surface)` ou pelas classes Tailwind equivalentes
(`bg-surface`), que seguem as mesmas variáveis.

> ⚠️ Cores de **documento** (preview de contrato, templates de currículo, PDF) devem usar
> hex fixo, nunca as variáveis de tema — o papel precisa parecer papel nos dois temas.

---

## Licença

MIT — 2026 Kriou Docs
