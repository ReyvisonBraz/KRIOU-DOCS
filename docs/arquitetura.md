# Arquitetura — Kriou Docs

Como o sistema funciona hoje. Descreve o que **existe**, não o que se pretende construir —
para isso veja o [ROADMAP.md](../ROADMAP.md).

Última revisão: 2026-08-08.

---

## Visão geral

```
Navegador (React 19 + Vite)
    │
    ├── Supabase Auth ─────────► Google OAuth
    ├── Supabase Postgres ─────► 4 tabelas, protegidas por RLS
    └── Supabase Edge Functions (Deno) ──► Mercado Pago
                                       └─► provedor de e-mail
```

Não existe servidor próprio. Tudo que precisa de segredo ou autoridade roda como Edge
Function; o resto é cliente.

---

## Frontend

### Roteamento

**Não usa React Router.** O `App.jsx` mantém a página atual em estado e usa
`history.pushState`; as transições passam pelo `NavigationProvider` dentro do `AppContext`.

`LandingPage` e `LoginPage` são *eager* — entram na bundle inicial. Todas as outras são
`React.lazy()`, carregadas sob demanda.

### Árvore de providers

```
ErrorBoundary
└── ThemeProvider          ← tema claro/escuro
    └── AppProvider        ← navegação + estado global
        ├── PageRouter
        └── Toaster        ← notificações (sonner)
```

### Camadas

| Pasta | Papel | Regra |
|---|---|---|
| `pages/` | Telas | Podem usar contexto e serviços |
| `features/` | Fatias completas de funcionalidade (ex.: `checkout/`) | Componentes + hooks juntos, exportados por um `index.js` |
| `components/UI/` | Blocos reutilizáveis | Sem regra de negócio |
| `domain/` | **Regras puras** | ❗ Sem React, sem rede — só entrada e saída. É por isso que é fácil de testar |
| `services/` | Conversa com o Supabase | Único lugar que chama Edge Functions |
| `hooks/` | Comportamento reutilizável | `useAutoSave`, `usePDF`, `useConfirm`, `useUnsavedChanges` |
| `utils/` | Funções auxiliares | Validação, formatação, sanitização, geração de PDF |
| `data/` | Conteúdo | Templates de currículo e os 10 modelos jurídicos |
| `workers/` | Web Worker | `pdfWorker.js` — impede o PDF de travar a interface |

`domain/` é a camada mais bem testada do projeto e o melhor lugar para colocar regra nova.

### Contextos

`AppContext` (navegação e estado global) · `AuthContext` · `ResumeContext` · `LegalContext`.

> Os quatro estão acoplados entre si. Reduzir esse acoplamento está registrado como
> [M-backlog no roadmap](../ROADMAP.md#melhorias-sugeridas).

---

## Tema

Controlado pelo atributo `data-theme` no `<html>`, escrito pelo `ThemeProvider`
(`src/components/Theme.jsx`) e persistido em `localStorage` sob a chave `kriou_theme`.

As cores vivem em `src/index.css`:

```css
:root                     { --surface: #1A1A33; }  /* escuro, padrão */
:root[data-theme="light"] { --surface: #FFFFFF; }
```

Há duas formas de consumo, e **ambas seguem o tema automaticamente**:

| Forma | Exemplo | Uso |
|---|---|---|
| Variável CSS inline | `style={{ color: "var(--text-dim)" }}` | Dominante — ~68% do código |
| Classe Tailwind de token | `className="bg-surface"` | Minoria, concentrada nas telas públicas |

O Tailwind 4 não tem `tailwind.config.js`: a configuração é o bloco `@theme` no próprio
`index.css`. Como ele emite `background-color: var(--color-navy)` em vez de inlinar o valor,
o override `:root[data-theme="light"]` vence por especificidade e as classes trocam sozinhas.

### ⚠️ Regra crítica: documento nunca segue o tema

Cores de **documento** — preview de contrato, templates de currículo, saída em PDF, blocos de
impressão — devem usar **hex fixo**, nunca variável de tema. O papel precisa parecer papel
nos dois modos.

O PDF gerado já está protegido: `UI/RequirementsModal.jsx` usa hex fixos com `@media print`
e `!important`, e `src/data/constants.js` alimenta o gerador com literais.

---

## Backend

### Edge Functions

Todas em Deno, em `supabase/functions/`.

| Função | Papel |
|---|---|
| `create-preference` | Cria a preferência de pagamento no Mercado Pago |
| `verify-payment` | Confirma um pagamento sob demanda |
| `mercadopago-webhook` | Recebe a notificação assíncrona |
| `authorize-download` | Autoriza o download vinculado ao documento exato |
| `send-email` | E-mail transacional de confirmação |
| `admin` | Painel administrativo |
| `_shared` | `auth.ts` e `http.ts` — helpers comuns |

### Padrão de uma Edge Function

`authorize-download/index.ts` é o **molde canônico**. Toda função nova deve seguir:

```ts
serve(async (req) => {
  const preflight = handlePreflight(req);          // 1. CORS
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const supabase = createAdminClient();           // 2. client service_role
    const user = await authenticate(req, supabase); // 3. Bearer → user
    if (!user) return json({ error: "Não autorizado" }, 401);

    // 4. validar entrada explicitamente
    // 5. sempre filtrar por .eq("user_id", user.id)

    return json({ ok: true });
  } catch (error) {                                 // 6. nunca vazar o erro interno
    console.error("[nome] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao ..." }, 500);
  }
});
```

Regras que o padrão carrega:
- **Nunca confiar em `user_id` vindo do corpo da requisição** — sempre o do token
- Todo acesso a recurso filtra por `.eq("user_id", user.id)`
- Papel de administrador é `profiles.role === "admin"`
- Erro ao cliente é genérico; o detalhe vai só para o `console.error`

> ⚠️ **`admin/index.ts` não segue este padrão.** Foi escrito antes dos helpers: não tem CORS,
> reimplementa a autenticação e vaza o erro cru. Não use como referência — a correção é
> [F5.1](../ROADMAP.md#f5--painel-administrativo).

### Chamada a partir do cliente

Sempre via um serviço, nunca direto da página. O wrapper está em
`src/services/PaymentService.js:3-10`:

```js
async function invoke(functionName, body) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw new Error(error.message || `Falha ao executar ${functionName}`);
  if (data?.error) throw new Error(data.error);
  return data;
}
```

---

## Banco de dados

Quatro tabelas, todas com RLS.

### `profiles`
Liga ao usuário por **`id`** (é a própria PK, igual a `auth.users.id`) — não por `user_id`.
Contém `nome`, `sobrenome`, `cpf`, `phone`, `avatar_url`, `onboarding_done`, `role`.

### `documents`
Liga por `user_id`, com `ON DELETE CASCADE`. É a tabela central.

| Grupo de colunas | Conteúdo |
|---|---|
| Identificação | `id`, `user_id`, `type`, `document_type`, `code`, `title` |
| Conteúdo | `form_data` (JSONB, currículo), `legal_data` (JSONB, partes e identidades) |
| Template | `template_id`, `template_name`, `variant_id`, `variant_name` |
| Pagamento | `payment_status`, `payment_id`, `payment_method`, `payment_amount`, `paid_at` |
| Antifraude | `paid_identity_snapshot`, `sensitive_edit_used`, `sensitive_edit_summary` |
| E-mail | `confirmation_email_sent_at`, `confirmation_email_id` |

### `document_drafts`
Rascunhos. Liga por `user_id`, com cascade. Só `data` (JSONB) e `current_step`.

### `payment_webhook_events`
Trilha idempotente do Mercado Pago. **Não tem `user_id` e nenhum cascade a alcança.**
Liga-se ao titular apenas indiretamente, via `payment_id` ou pelo `external_reference`
dentro de `payload`, cujo formato é `${user.id}::${documentId}`.

> Consequência importante para LGPD: apagar a conta do usuário **não** remove esta tabela, e o
> identificador dele continua dentro do `payload`. Tratamento em
> [F2.5](../ROADMAP.md#f2--direitos-do-titular).

### Proteções no banco

| Migration | O que faz |
|---|---|
| `007` | Índice único em `documents(payment_id)` quando não nulo |
| `010` | Congela a identidade no momento do pagamento |
| `011` | **Triggers que rejeitam edição de documento pago** — `kriou_enforce_paid_document_edit_policy` e `kriou_protect_backend_payment_fields` |
| `012` | Endurece funções do banco — ⚠️ **existe no repo, nunca aplicada** |
| `013` | Atribui o papel de administrador |

> Os triggers da `011` bloqueiam qualquer UPDATE que zere `form_data` ou `legal_data` de um
> documento pago. Isso é proposital contra fraude, mas significa que a anonimização por LGPD
> precisa de um caminho de bypass explícito.

---

## Fluxo de pagamento

```
1. Usuário conclui o documento
2. CheckoutPage ──► create-preference ──► Mercado Pago
   └── o preço (R$ 9,90) é fixado no servidor, nunca vem do cliente
3. Usuário paga no Checkout Pro
4. Duas confirmações independentes:
   ├── mercadopago-webhook  (assíncrona, idempotente)
   └── verify-payment       (sob demanda, quando o usuário volta)
5. documents.payment_status = 'approved', identidade congelada
6. Download ──► authorize-download ──► valida dono e pagamento
7. send-email ──► confirmação transacional
```

A dupla confirmação existe porque o webhook pode atrasar ou falhar; o `verify-payment` cobre
o caso do usuário que volta para o app antes da notificação chegar.

---

## Geração de PDF

Roda em Web Worker (`src/workers/pdfWorker.js`) para não travar a interface. Dois geradores:
`utils/pdfGenerator.js` (currículos) e `utils/legalPdfGenerator.js` (jurídicos).

O gerador jurídico é a parte mais testada do sistema — cobre paginação, limite de páginas por
cenário, justificação de parágrafo e proteção dos ornamentos de cláusula, para as 22 variantes.

> O bundle do worker é grande (~973 KB, mais jsPDF ~401 KB). Registrado como melhoria M5.

---

## Testes

| Tipo | Ferramenta | Onde |
|---|---|---|
| Unitário e de integração | Vitest + Testing Library | `src/**/*.test.js(x)` |
| E2E | Playwright | `e2e/` |

A suíte é forte em `domain/`, geradores de PDF e utilitários; fraca em páginas e componentes.
O número de cobertura relatado pela configuração atual é enganoso — ver
[STATUS.md](../STATUS.md) e [F7](../ROADMAP.md#f7--honestidade-técnica).

---

## Dados fora do banco

`localStorage`, limpo por `clearUserData` em `src/utils/storage.js:492`:

- `kriou_user_${userId}_documents`
- `kriou_user_${userId}_draft_resume`
- `kriou_user_${userId}_draft_legal`
- `kriou_user_${userId}_session`
- `kriou_theme` — preferência de tema
- ⚠️ `kriou_onboarding_${userId}_seen` — **não é limpo** por `clearUserData` (melhoria M7)
