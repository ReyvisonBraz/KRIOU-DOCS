# Roadmap — Kriou Docs

> **Este é o único plano ativo do projeto.** Qualquer documento em `docs/_historico/` é
> registro do que já foi feito, não plano. Se algo aqui divergir de lá, este arquivo vence.
>
> Estado atual verificado: veja [STATUS.md](STATUS.md).
> Última revisão: 2026-08-08.

---

## Onde estamos em uma frase

O produto está **tecnicamente pronto** — 321 testes passando, lint limpo, pagamento e
segurança implementados no servidor. O que impede o lançamento **não é código**: é revisão
jurídica, textos de LGPD e dois direitos do titular que ainda não existem.

---

## As 7 frentes

A coluna **Trilha** é o que mais importa: separa o que depende de nós do que depende de terceiros.

| ID | Frente | Trilha | Estado |
|---|---|---|---|
| [F1](#f1--tema-claroescuro) | Tema claro/escuro | Nós | ✅ **concluída em 2026-08-08** |
| [F2](#f2--direitos-do-titular) | Direitos do titular (exportar + excluir conta) | Nós | 🔴 não iniciado |
| [F3](#f3--ambiente-e-banco) | Ambiente e banco | Nós + infra | 🔴 não iniciado |
| [F4](#f4--jurídico-e-textos-lgpd) | Jurídico e textos LGPD | **Advogado** | 🔴 **acionar já** |
| [F5](#f5--painel-administrativo) | Painel administrativo | Nós | 🟡 parcial |
| [F6](#f6--pagamento-real-ponta-a-ponta) | Pagamento real ponta a ponta | Nós | 🚫 bloqueado |
| [F7](#f7--honestidade-técnica) | Honestidade técnica | Nós | 🔴 não iniciado |

### Dependências

```
F4 (advogado) ──────────────────┐
                                 ├──> F6 (pagamento real) ──> LANÇAMENTO
F2 (direitos) ──> F3 (ambiente) ─┘

F5 e F7 correm em paralelo, sem bloquear ninguém.   F1 ✅ concluída.
```

**F4 é o caminho crítico.** Tem o maior tempo de espera e não depende de escrever código.
Deve ser disparado antes de tudo, para correr em paralelo com as demais.

### Ordem sugerida

1. ~~**F1** — fechar o tema~~ ✅ **concluída em 2026-08-08**
2. **F4** — acionar o advogado (corre sozinho em segundo plano) — **em andamento**
3. ~~**F2.3** — exportação de dados~~ ✅ **concluída, aguardando F3.0/F3.5 para publicar**
4. **F3.0** — obter credenciais e linkar o projeto ← **próximo passo que depende de você**
5. **F5** e **F7** — código puro, seguem em paralelo, sem esperar ninguém
6. **F2.4** — exclusão de conta, quando a F4.5 confirmar o prazo fiscal
7. **F6** — só depois que F2, F3 e F4 estiverem fechadas

> **F4.3/F4.5 — prazos de retenção — são pré-requisito da F2.4.** O prazo dos dados pessoais
> já foi definido (90 dias); falta só confirmar o do registro fiscal (provisório: 5 anos).
>
> **F3.0 é o único item bloqueado por acesso, não por decisão.** Precisa das credenciais do
> Supabase — é o próximo passo que só você consegue destravar. Enquanto isso não vier, F5 e
> F7 rendem mais que esperar.

---

## F1 — Tema claro/escuro

✅ **Concluída em 2026-08-08.** Commits `6cb8f95`, `552e981`, `1046236`, `55ad1e9`, `4edb409`.

| # | Tarefa | Estado |
|---|---|---|
| **F1.1** | Blindar o documento contra o tema | ✅ |
| **F1.2** | Renomear o botão enganoso do perfil | ✅ |
| **F1.3** | Corrigir hovers e gradientes coral fixos | ✅ |
| **F1.4** | Corrigir contrastes quebrados | ✅ |
| **F1.5** | `text-white` e `rgba(255,255,255,…)` sobre superfície | ✅ 41 corrigidos |
| **F1.6** | Eliminar o flash escuro no carregamento | ✅ |
| **F1.7** | Corrigir `var(--bg)` inexistente | ✅ |
| **F1.8** | Deletar a paleta morta | ✅ ~90 linhas |
| **F1.9** | Testes do tema | ✅ 15 testes novos |

### 📌 Convenção estabelecida: `--doc-*` nunca segue o tema

A F1.1 revelou um bug de verdade: o preview do contrato usava `var(--gold)` e `var(--border)`,
que passaram a mudar com `data-theme`. **O documento jurídico trocava de cor junto com a
interface.**

A correção criou uma regra que vale para todo trabalho futuro:

> Tudo que representa o **documento** — preview de contrato, miniatura de template, mockup de
> papel, bloco de impressão, cores de template de currículo — usa `--doc-*` ou hex fixo,
> **nunca** um token de interface.

Tokens criados em `src/index.css`: `--doc-gold`, `--doc-rule`, `--doc-thumb-bg`. São
declarados apenas no `:root` e **deliberadamente não redefinidos** em
`:root[data-theme="light"]`.

Três testes em `src/components/Theme.test.jsx` travam isso: se alguém reintroduzir um token
de interface dentro da folha do contrato, a suíte quebra.

### Outros bugs encontrados durante a execução

Nenhum destes estava mapeado — apareceram ao varrer o código:

| Achado | Impacto |
|---|---|
| `CompleteProfilePage` tinha **texto branco no campo de digitação** | No tema claro o usuário digitava e não via o que escrevia |
| `coral-light` **não existe** em `index.css` | 3 hovers estavam mortos nos **dois** temas, não só no claro |
| Template "Primeiro Emprego" tem destaque **branco** | Botão branco sobre branco e bolinha invisível no card |
| `CheckoutSpinner` usava branco fixo em dois contextos | Sumia quando ficava sobre botão de superfície |
| jsdom desta versão **não expõe `localStorage`** | Nenhum teste podia verificar persistência; resolvido em `src/tests/setup.js` |

### O que ficou de fora, de propósito

A varredura da F1.5 classificou 102 usos de branco. Corrigi os 41 que quebravam; os 56 sobre
destaque sólido (coral, dourado, teal) e os 5 de documento ou marca ficaram como estavam —
estão corretos nos dois temas.

---

## F2 — Direitos do titular

As duas exigências de LGPD que faltam. **É o que destrava o lançamento do lado do código.**

### O que reusar (não inventar)

| Precisa de | Use | Onde |
|---|---|---|
| Molde de Edge Function | `authorize-download/index.ts` | `supabase/functions/authorize-download/index.ts` |
| CORS e resposta JSON | `handlePreflight`, `json` | `supabase/functions/_shared/http.ts` |
| Autenticação e client admin | `authenticate`, `createAdminClient` | `supabase/functions/_shared/auth.ts` |
| Chamada do cliente | wrapper `invoke` | `src/services/PaymentService.js:3-10` |
| Diálogo de confirmação | `ConfirmDialog` | `src/components/UI/feedback.jsx:484` |
| Linha de configuração | `SettingsRow` | `src/pages/ProfilePage.jsx:850` |

> Não use `supabase/functions/admin/index.ts` como molde. Ele é o outlier: foi escrito antes
> dos helpers e não os usa. Veja F5.1.

| # | Tarefa | Pronto quando |
|---|---|---|
| **F2.3** | ✅ **Exportação de dados** — função, serviço, UI e 11 testes | ✅ feito em 2026-08-08 (`18fbe32`) — **falta publicar** |
| **F2.1** | **Decidir o schema de anonimização** (ver bloqueadores) | Decisão registrada em `docs/arquitetura.md` |
| **F2.2** | Migration `014` — viabilizar anonimização e bypass dos triggers | Aplica sem quebrar a `011` |
| **F2.4** | Edge Function `delete-account` | Apaga o pessoal, preserva e anonimiza o fiscal |
| **F2.5** | Redigir o `user_id` de `payment_webhook_events.payload` | `external_reference` anonimizado |
| **F2.6** | UI da exclusão no ProfilePage | "Excluir minha conta" funciona |
| **F2.7** | Confirmação por digitação na exclusão | Exige digitar EXCLUIR |
| **F2.8** | Testes da exclusão | Preserva o que é fiscal, apaga o resto |

> ⚠️ **A F2.3 está pronta no código, mas a Edge Function `export-user-data` nunca foi
> publicada.** O botão no perfil só vai funcionar depois do deploy. Isso faz parte da
> [F3](#f3--ambiente-e-banco), que ainda não começou.
>
> A F2.3 foi antecipada de propósito: é o único item da F2 que **não depende** dos prazos de
> retenção da [F4.3](#f4--jurídico-e-textos-lgpd). Entregar ao titular uma cópia do que é
> dele não exige decisão jurídica nenhuma. Apagar, sim.

### Prazos de retenção — decisão de 2026-08-08

Os dois prazos são **deliberadamente diferentes**, porque respondem a leis opostas: a LGPD
manda apagar, a legislação fiscal manda guardar.

| Categoria | Prazo | Situação |
|---|---|---|
| **Dados pessoais** — perfil, rascunhos, conteúdo dos documentos, identidade das partes | **90 dias** | ✅ Definido pelo responsável |
| **Registro fiscal** — valor, data, `payment_id`, meio de pagamento | **5 anos** | ⚠️ **Provisório — confirmar na [F4.3](#f4--jurídico-e-textos-lgpd)** |

Na prática, ao receber um pedido de exclusão: o documento perde nome, CPF, endereço e todo o
conteúdo preenchido; sobrevive apenas uma linha registrando que houve uma venda de R$ 9,90 em
determinada data, sem ninguém identificável ligado a ela.

> ⚠️ **Por que o prazo fiscal não é 90 dias.** Apagar comprovante de venda após 90 dias tende
> a conflitar com a obrigação de guarda fiscal — a referência usual no Brasil é de 5 anos.
> Isso não é parecer jurídico; é o motivo de o número estar marcado como provisório e ser o
> primeiro item a confirmar com o advogado.

**Implementação:** os dois prazos ficam como **constantes únicas** na Edge Function
`delete-account` (F2.4), para que ajustar seja trocar um número, sem caçar regra espalhada
pelo código.

### ⚠️ Três bloqueadores de schema — resolver em F2.1 antes de escrever código

**1. `documents.user_id` é `NOT NULL`** (`001_initial_schema.sql:43`).
Não dá para desvincular um documento pago do titular. Duas saídas:
- tornar a coluna nullable com `ON DELETE SET NULL`; ou
- criar uma tabela `payment_records` separada — **recomendado**, porque separa o fiscal do
  pessoal de forma limpa e não mexe em constraint existente.

**2. Os triggers da `011_enforce_paid_document_edit_policy.sql`** (linhas 361 e 429)
**rejeitam** qualquer UPDATE que zere `form_data` ou `legal_data` de documento pago.
A anonimização precisa de um caminho de bypass explícito. Leia a migration inteira antes de
assumir que `service_role` passa.

**3. `payment_webhook_events` não tem `user_id`** e nenhum cascade a alcança — mas guarda o
`user_id` dentro de `payload.external_reference` (formato `${user.id}::${documentId}`)
indefinidamente. Uma exclusão "completa" deixa o identificador do titular lá. Daí a F2.5.

### O que exportar e o que apagar

| Tabela | Liga por | Exportar | Excluir |
|---|---|---|---|
| `auth.users` | — | e-mail, criação, provedor | `auth.admin.deleteUser()` |
| `profiles` | `id` | tudo menos `role` | cascade |
| `documents` (não pago) | `user_id` | tudo | cascade |
| `documents` (pago) | `user_id` | tudo | **anonimizar** — preserva `payment_*`, `paid_at`, `confirmation_email_*` |
| `document_drafts` | `user_id` | `data` | cascade |
| `payment_webhook_events` | só via `payment_id` | discutível | **retenção total + redação** |

Fora do Postgres: `localStorage` via `clearUserData` em `src/utils/storage.js:492`.

---

## F3 — Ambiente e banco

📋 **Passo a passo completo: [docs/runbook-deploy.md](docs/runbook-deploy.md)**

| # | Tarefa | Pronto quando |
|---|---|---|
| **F3.0** | Obter credenciais, `supabase login`, `link`, criar `.env` | ⛔ **Bloqueia todo o resto** |
| **F3.1** | Confirmar em que migration o ambiente alvo realmente está | Divergência conhecida e registrada |
| **F3.2** | Aplicar `012_harden_database_functions.sql` | Aplicada e registrada em `STATUS.md` |
| **F3.3** | Validar RLS com **duas identidades reais** | Usuário A não enxerga nada do B |
| **F3.4** | Ensaiar rollback de aplicação e de banco | Procedimento validado na prática |
| **F3.5** | Publicar `export-user-data` | Botão do perfil funciona de verdade |

### ⛔ Nada desta frente é executável na máquina de desenvolvimento hoje

Não existe `.env`, o projeto **não está linkado** (`supabase/.temp/` ausente) e o
`config.toml` não tem `project_id`. F3.0 é obtenção de acesso, não programação.

### ⚠️ A armadilha da F3.1 — leia antes de rodar `db push`

Há forte indício de que as migrations foram aplicadas **à mão pelo painel**:
`add_onboarding_done.sql` diz literalmente *"Execute este SQL no Supabase SQL Editor"*.

Se for o caso, o histórico remoto está vazio e **`supabase db push` tentaria reaplicar da 001
à 013 contra um banco que já tem tudo** — a `007` faz `VALIDATE CONSTRAINT` e a `013` tem
`RAISE EXCEPTION`. É preciso rodar `supabase migration repair --status applied 001 … 011`
antes. Isso não estava documentado em lugar nenhum.

### O que já foi adiantado (2026-08-08, sem precisar de credenciais)

| Item | Onde |
|---|---|
| Rollback da `012`, escrito **antes** de aplicar | `supabase/rollback/012_harden_database_functions_down.sql` |
| Runbook completo dos 8 passos | `docs/runbook-deploy.md` |
| Variáveis de ambiente que faltavam documentar | `.env.example` |

**A `012` é segura:** só altera permissão e `search_path` de 14 funções. Não cria, não apaga
e não toca em dado nenhum. É a melhor migration possível para estrear o pipeline.

**A `F3.5` é o deploy mais barato do projeto:** `export-user-data` não precisa de nenhum
secret e destrava um botão que já está na interface e hoje não funciona.

> **F3.1 vem antes de tudo.** Não empilhe a migration `014` (F2.2) sem saber onde o banco
> realmente está. A `012` existe no repo desde julho e nunca foi aplicada.

---

## F4 — Jurídico e textos LGPD

**Não é código. É o caminho crítico do lançamento.** Acionar antes de tudo.

| # | Tarefa | Depende de |
|---|---|---|
| **F4.1** | Revisão das 22 variantes por profissional qualificado | Advogado |
| **F4.2** | Política de Privacidade e Termos de Uso aprovados | Advogado |
| **F4.3** | Definir controlador, encarregado/canal, bases legais e prazos de retenção | Nós + advogado |
| **F4.5** | ⚠️ **Confirmar o prazo de guarda do registro fiscal** (provisório: 5 anos) | Advogado ou contador |
| **F4.4** | Registrar contratos e DPAs dos operadores | Nós |

Operadores a cobrir em F4.4: Supabase, Mercado Pago, Vercel, provedor de e-mail, GitHub Actions.

> **F4.3 e F4.5 são pré-requisito da F2.4.** Os prazos de retenção definem o que a exclusão de
> conta pode apagar e o que precisa ser anonimizado.
>
> **Parcialmente resolvido:** o prazo dos **dados pessoais** já foi definido em 90 dias
> (ver [F2](#f2--direitos-do-titular)). Falta apenas confirmar o prazo do **registro fiscal**,
> hoje provisionado em 5 anos. Enquanto isso não vier, a F2.4 pode ser escrita, mas não
> executada em produção.

---

## F5 — Painel administrativo

| # | Tarefa | Pronto quando |
|---|---|---|
| **F5.1** | Refatorar `supabase/functions/admin/index.ts` para os helpers `_shared` | Com CORS, sem vazar `err.message` |
| **F5.2** | Tabela `admin_audit_events` com RLS fechada para clientes | Ações administrativas ficam registradas |
| **F5.3** | Paginação, limites e busca server-side | Sem `perPage: 1000` nem contagem em memória |
| **F5.4** | Agregação SQL nas estatísticas | Não puxa todos os documentos para contar |

### Por que F5.1 vem primeiro

`admin/index.ts` é hoje o **outlier de segurança** do backend:

- é a única função **sem CORS** (linhas 30, 40, 76, 105, 125, 132, 139 montam `Response` à mão)
- **não usa os helpers `_shared`** — reimplementa auth com `.replace("Bearer ", "")`,
  que é substring-replace, em vez do `startsWith` mais estrito de `_shared/auth.ts:18`
- **vaza o erro interno cru** ao cliente (linha 139), contra o padrão de todas as outras funções

Além disso, a action `users` (linha 80) faz `select` sem `range` nem `limit`, puxa **todos os
documentos do sistema** só para contar em memória (linha 88), e usa `perPage: 1000` — o
usuário 1001 aparece com `email: null` silenciosamente.

Já está pronto: a action `user-docs` restringe corretamente a metadados, sem `form_data`.

---

## F6 — Pagamento real ponta a ponta

🚫 **Bloqueado.** Só pode iniciar depois de F2, F3 e F4 fechadas. Até lá, apenas testes
automatizados e mocks financeiros — nenhum pagamento real.

| # | Tarefa |
|---|---|
| **F6.1** | Publicar Edge Functions e migrations finais |
| **F6.2** | Confirmar `APP_URL`, credenciais, webhook e assinatura |
| **F6.3** | Criar documento conhecido e registrar o ID |
| **F6.4** | Executar pagamento de teste aprovado |
| **F6.5** | Validar o retorno ao aplicativo |
| **F6.6** | Validar confirmação automática e manual |
| **F6.7** | Baixar e comparar o PDF correto |
| **F6.8** | Repetir após logout/login e em outro dispositivo |
| **F6.9** | Testar pendente, recusado, cancelado, reembolso e chargeback |
| **F6.10** | Confirmar idempotência do webhook |
| **F6.11** | Validar limite de downloads e e-mail transacional |
| **F6.12** | Registrar evidências e plano de rollback |

---

## F7 — Honestidade técnica

| # | Tarefa | Pronto quando |
|---|---|---|
| **F7.1** | Coverage real em `vite.config.js:44-56` | Mede `src` inteiro; número honesto publicado |
| **F7.2** | Definir metas por camada, sem portão global irreal | Metas registradas aqui |
| **F7.3** | Script `test:coverage` no `package.json` | Não existe hoje |
| **F7.4** | Cobrir o que não tem teste, começando por serviços e regras críticas | Gradual, sem meta artificial |

### O problema, com precisão

`vite.config.js` restringe a medição a **4 arquivos escolhidos a dedo**
(`validation.js`, `formatting.js`, `sanitization.js`, `useAutoSave.js`) com portão de 80%.
Isso produz "91,09%" no relatório. A cobertura real de `src` é **~14%**.

**Não recomendamos perseguir 80% global.** Os 321 testes existentes são bons e estão
concentrados onde mais importa: geração de PDF, matriz jurídica das 22 variantes e validação.
O erro não foi ter 14% — foi declarar 91%. F7.1 é sobre publicar o número verdadeiro.
F7.4 é o trabalho de verdade, e é gradual.

---

# Melhorias sugeridas

Fora do caminho de lançamento. Registradas para não se perderem, mas **não competem com F1–F7**.

| ID | Melhoria | Por quê |
|---|---|---|
| **M1** | As 3 `SettingsRow` do ProfilePage são botões decorativos sem `onClick` | Clicar não faz nada — parece quebrado |
| **M2** | Trocar o confirm artesanal do ProfilePage pelo `ConfirmDialog` existente | Remove ~130 linhas duplicadas |
| **M3** | Unificar os tokens de cor, hoje espalhados em 4 lugares | `--text-faint` já tem valores divergentes entre `Theme.jsx` e `index.css` |
| **M4** | Reduzir arquivos gigantes: `DashboardPage` 1269, `RequirementsModal` 1252, `TemplatesPage` 1219 | A extração de domínio não encolheu as telas |
| **M5** | Bundle: worker de PDF ~973 KB, jsPDF ~401 KB | A meta antiga de < 300 KB nunca foi reaferida |
| **M6** | `add_onboarding_done.sql` não tem prefixo numérico | O CLI do Supabase **ignora esse arquivo** — não aparece em `migration list`. A coluna existe no banco por aplicação manual e é invisível para a ferramenta |
| **M7** | `clearUserData` não limpa `kriou_onboarding_${userId}_seen` | Deixa chave órfã no `localStorage` |
| **M8** | Re-exportar `useTheme` de `Theme.jsx` | `import { useTheme } from './Theme'` falharia — pegadinha para código futuro |
| **M9** | `.doc-action-pill` na landing usa `var(--text-dim)` sobre painel de cor fixa escura | Texto escuro sobre painel escuro no tema claro. Encontrado na F1.5, fora do escopo dela |
| **M10** | 3 `SettingsRow` do perfil continuam sem ação, agora ao lado de botões que funcionam | O contraste com o botão de limpar dados, que agora funciona e é honesto, ficou mais evidente |
| **M11** | Não há fixture de segunda identidade para E2E | `e2e/auth.setup.js` só suporta uma conta; `VITE_TEST_EMAIL`/`VITE_TEST_PASSWORD` nem estavam documentadas (corrigido no `.env.example`). A validação de RLS da F3.3 é manual por falta disso |
| **M12** | Nenhuma automação de deploy | Sem script no `package.json`, sem passo no CI. Publicar Edge Function é sempre manual |

---

# Como trabalhamos

- **Uma tarefa por vez**, com o ID sempre visível (`F1.2`, `F2.3`, …)
- Os IDs são **estáveis**: valem em conversa, em commit e neste arquivo
- Commits referenciam o ID: `fix(F1.1): blinda preview do contrato contra o tema`
- Ao retomar depois de uma pausa, começamos dizendo **onde paramos e qual é o próximo número**
- Cada tarefa tem critério de pronto objetivo — se não der para verificar, não está pronta
