# Runbook — ambiente, migrations e deploy

Procedimento para executar a frente [F3](../ROADMAP.md#f3--ambiente-e-banco).

> **Nada aqui foi executado ainda.** Este documento foi escrito a partir da leitura do
> repositório, não de uma execução real. Ao rodar pela primeira vez, corrija o que divergir —
> um runbook que nunca foi seguido é hipótese, não procedimento.

---

## 0. Pré-requisitos — sem isto, nada abaixo funciona

O repositório **não tem** credenciais nem vínculo com o projeto remoto. Confirmado:
não existe `.env`, não existe `supabase/.temp/`, e `supabase/config.toml` não tem `project_id`.

| Item | Onde obter |
|---|---|
| `project-ref` do Supabase | Dashboard → Project Settings → General → Reference ID |
| Credenciais de login | conta com acesso ao projeto |
| `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` | Dashboard → Project Settings → API |

```bash
cp .env.example .env      # e preencher as duas VITE_*
npx supabase login
npx supabase link --project-ref <REF>
```

O `link` cria `supabase/.temp/`, que está no `.gitignore` — é por máquina, não é versionado.

---

## 1. F3.1 — descobrir onde o banco realmente está

**Este passo vem antes de qualquer outro.** Não aplique migration sem saber o estado atual.

```bash
npx supabase migration list --linked
```

E, em paralelo, no SQL Editor do Dashboard:

```sql
select * from supabase_migrations.schema_migrations order by version;
```

### ⚠️ A armadilha: o histórico remoto provavelmente está vazio

Há forte indício de que as migrations foram aplicadas **à mão pelo painel**, não pelo CLI —
`supabase/migrations/add_onboarding_done.sql` diz literalmente *"Execute este SQL no Supabase
SQL Editor"*.

Se for esse o caso, `supabase_migrations.schema_migrations` está vazia. E aí:

> **`supabase db push` tentaria reaplicar da 001 até a 013 contra um banco que já tem tudo.**

O resultado é imprevisível: a `001` usa `IF NOT EXISTS` e sobreviveria, mas a `007` faz
`VALIDATE CONSTRAINT` e a `013` tem `RAISE EXCEPTION`.

**A saída correta é marcar o passado como aplicado, sem executar nada:**

```bash
npx supabase migration repair --status applied 001 002 003 004 005 006 007 008 009 010 011
# se a 013 já estiver aplicada no banco, inclua 013 também
```

Só depois disso a `012` sobe de verdade.

### Divergência esperada

`add_onboarding_done.sql` **não tem prefixo numérico**, então o CLI o ignora — ele não vai
aparecer na lista. A coluna `profiles.onboarding_done` existe no banco por aplicação manual,
mas é invisível para a ferramenta. Registre isso e considere renomear (melhoria `M6`).

**Registre o resultado deste passo em [STATUS.md](../STATUS.md)** antes de seguir.

---

## 2. Antes de aplicar: garantir a saída

```bash
# 1. Confirme se o PITR (point-in-time recovery) está habilitado no projeto.
#    Dashboard → Database → Backups. Depende do plano.

# 2. O rollback da 012 já está escrito:
cat supabase/rollback/012_harden_database_functions_down.sql
```

Se o PITR não estiver disponível, o rollback da `012` ainda cobre o caso — ela não altera
dado nenhum, só permissão e `search_path`.

---

## 3. F3.2 — aplicar a migration 012

```bash
npx supabase db push --dry-run    # confira que só a 012 aparece
npx supabase db push
```

### O que a 012 faz

Duas coisas, nada além:

1. `SET search_path = pg_catalog, public` em 14 funções — fecha o vetor de sequestro de
   `search_path` em função `SECURITY DEFINER`
2. `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` nas mesmas 14 — tira helpers
   internos da superfície RPC

**Não cria, não apaga e não altera nenhum objeto ou dado.** É a migration mais segura possível
para estrear o pipeline.

### Por que os triggers não quebram

O Postgres verifica permissão de execução de função de trigger no `CREATE TRIGGER`, não a cada
disparo. Além disso, nenhuma dessas funções é chamada por RPC pelo cliente — `grep -rn "\.rpc("
src/ supabase/functions/` retorna zero.

**Registre em [STATUS.md](../STATUS.md)** que a 012 foi aplicada, com a data.

---

## 4. F3.3 — validar RLS com duas identidades reais

Existem exatamente 3 policies, cobrindo 4 tabelas:

| Tabela | Regra | Liga por |
|---|---|---|
| `documents` | `FOR ALL USING (auth.uid() = user_id)` | `user_id` |
| `profiles` | `FOR ALL USING (auth.uid() = id)` | ⚠️ **`id`**, não `user_id` |
| `document_drafts` | `FOR ALL USING (auth.uid() = user_id)` | `user_id` |
| `payment_webhook_events` | **nenhuma policy** — RLS ligada nega tudo | — |

> Não existe fixture de segunda identidade. `e2e/auth.setup.js` suporta só um usuário, e as
> variáveis `VITE_TEST_EMAIL`/`VITE_TEST_PASSWORD` que ele usa nem estão no `.env.example`.
> Esta validação é manual: duas contas reais, dois JWTs.

### Roteiro — com JWT do usuário A e do usuário B

1. **`documents`** — A cria um documento. Com o token de B:
   - `GET /rest/v1/documents?select=*` → deve vir `[]`
   - `GET /rest/v1/documents?id=eq.<id_de_A>` → deve vir `[]` (RLS **filtra**, não retorna 403)
   - `PATCH` no documento de A → 0 linhas afetadas
   - `INSERT` com `user_id` = A → deve falhar no `WITH CHECK`, código `42501`
2. **`profiles`** — mesma bateria. Verifique especificamente se B consegue ler `cpf` e `phone` de A.
3. **`document_drafts`** — idem.
4. **`payment_webhook_events`** — **A e B** devem receber `[]`. Se qualquer um enxergar uma
   linha, é vazamento grave: o `payload` contém `${user.id}::${documentId}`.
5. **Aceitação da 012** — `POST /rest/v1/rpc/kriou_normalize_identity_text` com token de A deve
   passar a retornar 404 ou 403. É exatamente o efeito do `REVOKE`.
6. **Regressão dos triggers** — com A autenticado, um `UPDATE` tentando gravar
   `payment_status='approved'` deve estourar `P0001`. Prova que o `REVOKE` não quebrou nada.

Guarde a evidência (saída dos comandos) junto ao registro em `STATUS.md`.

---

## 5. Publicar as Edge Functions

**Não existe automação.** Não há script no `package.json` nem passo no CI — o
`.github/workflows/quality.yml` só roda lint, testes e build.

```bash
npx supabase functions deploy <nome>
npx supabase functions deploy            # todas
```

São **7 funções** (`_shared/` é biblioteca, não é deployável):

| Função | `verify_jwt` | Secrets necessários |
|---|---|---|
| `export-user-data` | padrão | **nenhum** ⭐ |
| `authorize-download` | padrão | nenhum |
| `admin` | padrão | nenhum |
| `create-preference` | padrão | `MP_ACCESS_TOKEN`, `APP_URL` |
| `verify-payment` | **false** | `MP_ACCESS_TOKEN` |
| `mercadopago-webhook` | **false** | `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` |
| `send-email` | padrão | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_URL` |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente pela plataforma —
não configure à mão. Os demais secrets vão em Dashboard → Edge Functions → Secrets.

### ⭐ Comece por `export-user-data`

É o deploy de menor risco de todos: **não precisa de nenhum secret**, só lê dados, e destrava
o botão "Exportar meus dados" que hoje existe na interface e não funciona
([F2.3](../ROADMAP.md#f2--direitos-do-titular)).

```bash
npx supabase functions deploy export-user-data
```

Teste entrando no app, Perfil → Exportar meus dados. Deve baixar um `.json`.

---

## 6. F3.4 — rollback

### Frontend (Vercel)
Funciona hoje, por padrão da plataforma: Deployments → escolher o anterior → *Promote to
Production*. Ou `npx vercel rollback`.

### Edge Functions
**Não há rollback nativo** — `functions deploy` sobrescreve. A reversão é:

```bash
git checkout <sha_anterior> -- supabase/functions/<nome>
npx supabase functions deploy <nome>
```

⚠️ `_shared/` é compartilhado. Reverter uma função pode exigir reverter o helper e, com ele,
republicar as outras que dependem dele.

### Banco
**Não há rollback nativo.** Duas saídas:

1. **Script inverso escrito à mão.** Para a `012` já existe:
   `supabase/rollback/012_harden_database_functions_down.sql`
2. **Restaurar backup** — PITR do Supabase, se o plano incluir.

> `npx supabase db reset` **só afeta o banco local** e é destrutivo. Nunca é rollback de produção.

**Regra a partir daqui:** toda migration nova nasce com o seu `_down.sql` em
`supabase/rollback/`, escrito **antes** de aplicar.

---

## Ordem de execução

1. Obter credenciais, `login`, `link`, criar `.env`
2. **F3.1** — `migration list` + consulta no SQL Editor → registrar em `STATUS.md`
3. Se o histórico estiver vazio: **`migration repair`** (passo 1) — obrigatório
4. Conferir PITR; o rollback da 012 já está escrito
5. **F3.2** — `db push --dry-run`, depois `db push` → registrar
6. **F3.3** — os 6 testes de RLS com duas contas → guardar evidência
7. **Publicar `export-user-data`** e conferir o botão no perfil
8. **F3.4** — validar que o procedimento de rollback acima está correto na prática
