# Status — Kriou Docs

> **Verificado em 2026-08-15 rodando os comandos, não lendo documentos.**
>
> Regra deste arquivo: nada entra aqui sem um comando que comprove. Se você não conseguiu
> verificar, escreva "não verificado" — nunca copie um número de outro documento.
>
> O que ainda falta fazer está em [ROADMAP.md](ROADMAP.md).

---

## Resumo

O produto é funcional, mas **ainda não está pronto para produção**. Além das pendências jurídicas,
faltam promoção controlada, observabilidade e os testes reais previstos no plano de prontidão. O
staging pago foi diferido. O responsável declarou que produção ainda não contém dados reais e
autorizou ali somente duas contas descartáveis + Auth/RLS manuais para a Fase 2; nada disso foi
executado ou verificado externamente neste changeset. Preview continua proibida de usar produção.

---

## Portões de qualidade

| Portão | Estado | Como verificar |
|---|---|---|
| Testes unitários | ✅ **560 passando, 44 arquivos** | `npm test` |
| Lint | ✅ **limpo** | `npm run lint` |
| Build configurado | ✅ aprovado | `cp .env.example .env.local`; `npm run build` |
| Build CI explícito | ✅ aprovado; recusado na Vercel | `npm run build:ci` |
| Fail-closed/JWT/scanner | ✅ 59 testes direcionados + ataques de build recusados | `npm test -- src/config/environment.test.js src/config/environment-check.test.js src/config/secret-scan.test.js` |
| E2E público | ✅ **4 passando**, Playwright/Chromium | `npm run test:e2e:public` |
| CI | ✅ ativo | `.github/workflows/quality.yml` |
| Vulnerabilidades de produção | ✅ **zero** | `npm audit --omit=dev` |
| Secret scan atual | ✅ limpo | `npm run scan:secrets` |

### Sobre a vulnerabilidade que existia

`dompurify <= 3.4.12` tinha falha moderada de XSS
([GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)), herdada do
`jspdf`. **Corrigida em 2026-08-08** (`39bb22f`), subindo para 3.4.13. Como o `jspdf` gera
todos os PDFs do produto, foi verificada com atenção: suíte inteira passando e bundle
inalterado.

---

## Cobertura de testes — leia com atenção

| Número | Valor | Significado |
|---|---|---|
| Cobertura antiga | ~91% | ❌ Media só 4 arquivos escolhidos a dedo |
| Baseline real de linhas em `src` | **30,44%** | ✅ F7.1, medindo todo JS/JSX |
| Cobertura atual de linhas em `src` | **56,77%** | ✅ Após os testes do contrato de ambientes |

Desde 2026-08-10, `vite.config.js` mede `src/**/*.{js,jsx}` e exclui apenas os próprios
arquivos de teste. O antigo portão global de 80% foi removido porque escondia os arquivos
sem cobertura em vez de orientar melhoria real.

Isso **não significa que a suíte é ruim.** Os 560 testes são reais e estão concentrados onde
mais importa: geração de PDF, matriz jurídica das 22 variantes, validação, persistência,
autenticação e armazenamento.
O problema era a declaração, não a suíte. A medição foi corrigida em
[F7.1](ROADMAP.md#f7--honestidade-técnica); a expansão segue gradual na F7.4.

Comando oficial: `npm run test:coverage`.

Primeira fatia da F7.4 verificada em 2026-08-10: `DocumentService` chegou a **72,50%** de
linhas, a camada `src/services` a **80,92%**, `AuthContext` a **100%** e `storage.js` a
**89,14%**. Foram adicionados 40 testes; a F7.4 continua aberta para hooks e contextos.

Segunda fatia: mais 16 testes levaram `usePDF`, `useConfirm` e `useUnsavedChanges` a **100%**
de linhas e `AppContext` a **96,35%**. A cobertura global atual é **40,89%**; `src/hooks`
subiu para **50,58%** e `src/context` para **62,58%**.

Terceira fatia: mais 14 testes levaram `ResumeContext` e `LegalContext` a **100%** de linhas
e a camada `src/context` a **98,20%**.

Quarta fatia, verificada em 2026-08-11: a busca no repositório comprovou que `AdminPage.jsx`
era o único consumidor de `hooks/index.js`, usando apenas `useDebounce`; os outros sete hooks e o
export default não tinham consumidores. O módulo legado e o código morto foram removidos,
`useDebounce` foi extraído para arquivo próprio e recebeu 3 testes de atraso, cancelamento e
cleanup. `useDebounce.js` chegou a **100%** de linhas e funções, e a camada `src/hooks` a
**97,87%** de linhas. A cobertura global atual, sobre a superfície menor de produção, é **44,25%
de linhas, 43,08% de statements, 31,12% de branches e 29,83% de funções**. A pendência específica
do módulo está encerrada; a F7.4 segue aberta para novas áreas críticas.

Quinta fatia, verificada em 2026-08-11: mais 22 testes cobriram a geração real de currículo,
o protocolo do worker e as regras de código e identificação de documentos. `pdfGenerator.js`,
`pdfWorker.js` e `documentCode.js` chegaram a **100% de linhas**; os branches medidos foram
**92,22%**, **100%** e **88,70%**, respectivamente. A cobertura global atual passou para
**49,97% de linhas, 48,64% de statements, 34,55% de branches e 31,90% de funções**.

Sexta fatia, verificada em 2026-08-11: mais 20 testes de componente cobriram
`AuthCallbackPage` e o pós-login imediato, levando o alvo a **100% de linhas e 93,67% de
branches**. O timeout de 15 segundos agora é um watchdog independente de `getSession`; o listener
permanece ativo durante `fetchProfile`, e `SIGNED_OUT` invalida resolução ou rejeição posterior
sem navegar ou atualizar a tela de novo. O suporte a callback durante o próprio registro é
hardening defensivo além do contrato assíncrono do SDK atual, com unsubscribe idempotente. O
fallback de falha em `fetchProfile` permanece documentado como fail-open para o dashboard de uma
sessão ainda autenticada. A cobertura global atual passou para **52,05% de linhas, 50,59% de
statements, 36,12% de branches e 32,85% de funções**.

Sétima fatia, verificada em 2026-08-12: mais 15 testes cobriram o preenchimento de
perfil pós-OAuth e o onboarding. `CompleteProfilePage` chegou a **98,98% de linhas e 92,07% de
branches**; `WelcomePage`, a **100% de linhas e 97,22% de branches**; e os branches relevantes de
`DocumentService.isProfileComplete`, a **100%**. CPF agora é realmente opcional para completude,
mas validado quando informado; o perfil retornado é sincronizado antes da navegação; submit, skip e
conclusão são single-flight; CPF inválido não é persistido ao pular; e falha de `localStorage` ou
ausência de `userId` não impede o dashboard. O botão "Sair" usa o wrapper de `useApp`, que limpa o
perfil e a página persistida e navega para landing; metadados Google usam `user_metadata`; respostas
tardias após unmount/logout não alteram estado; e a revisão interna do perfil, vinculada ao
`userId`, impede tanto a sobrescrita de um save novo quanto a publicação tardia do perfil,
documentos e drafts de outra identidade após troca de conta ou `SIGNED_OUT`; o primeiro render já
mascara dados cujo owner diverge, providers remontam por `userId`, fallbacks e navegação respeitam a
execução atual e usuários sem draft recebem os estados iniciais canônicos completos. Saves cuja
publicação é rejeitada não confirmam sucesso nem navegam a nova sessão. Labels, inputs e erros estão associados por
contratos acessíveis. O onboarding ativo continua local, sem integração com
`profiles.onboarding_done`. A cobertura global passou para **55,52% de linhas, 54,13% de
statements, 39,81% de branches e 37,35% de funções**.

Em 2026-08-14, PR1.1 adicionou 59 testes direcionados do contrato de ambientes, carregamento real
de `.env.local` e scanner semântico. A cobertura global passou a **56,77% de linhas, 55,27% de
statements, 42,08% de branches e 38,22% de funções**; `src/config/environment.js` ficou com
**94,50% de linhas** e **94,54% de branches**.

---

## Ambiente e banco

### PR1.1 — contrato local pronto em 2026-08-15

| Item | Estado |
|---|---|
| Contrato `local` / `preview` / `production` | ✅ executável no build e no cliente |
| Preview exige Supabase `staging` | ✅ coberto por teste local; fluxo autenticado indisponível enquanto staging estiver diferido |
| Preview recusa project-ref canônico de produção | ✅ âncora pública versionada fora do ambiente |
| Produção exige o project-ref canônico | ✅ coberto por teste e build sintético |
| `VITE_*` desconhecida/sensível | ✅ allowlist; nomes alternativos recusados |
| URL/JWT anon | ✅ schemas hosted/CLI, tempo e binding issuer↔URL validados; tokens privilegiados recusados |
| Modo offline | ✅ permitido somente no local com opt-in explícito |
| Inventário público de produção | ℹ️ informado pelo responsável: org `sptobceudadpankmgwyz`, ref `uyptmlezmdzfufzuknfz`, região `us-east-1`; não reverificado externamente |
| Dados reais em produção | ℹ️ o responsável declarou que ainda não existem; não verificado por este changeset |
| Projeto Supabase de staging | ⏸️ **não criado/não verificado** — custo pago diferido; será pré-requisito antes das áreas destrutivas/financeiras |
| Variáveis Vercel por escopo | ⛔ **não configuradas/não verificadas** — nenhuma alteração externa autorizada |
| Auth/RLS manual em produção | 🟡 autorizado somente para duas contas descartáveis na Fase 2; não executado |
| Migrations, exclusão de conta e pagamentos | ⛔ fora da exceção; exigem staging antes de execução |

O inventário sem valores, a rotação, as contas descartáveis e a limpeza estão em
[`docs/runbook-deploy.md`](docs/runbook-deploy.md). O project-ref de produção continua sendo um
identificador público; chaves, tokens, e-mails de teste e cookies não são evidência publicável.
Nenhuma chave permite comprovar offline assinatura aceita, funcionamento ou revogação. JWT anon
hosted sem `ref` e chave publishable também não comprovam associação ao projeto: todo ambiente
continua exigindo login/smoke externo autorizado. A exceção atual permite apenas o smoke manual de
Auth/RLS da Fase 2 em produção, sem Preview, migrations ou áreas financeiras. O scanner não recebe
a URL do deployment; ele valida schema/tempo, enquanto o binding de issuer é feito pelo
build/cliente.

**F3.1 executada em 2026-08-08.** Projeto linkado (`uyptmlezmdzfufzuknfz` — KRIOU-DOCS,
`ACTIVE_HEALTHY`). Resultado: `npx supabase migration list`.

| Item | Estado |
|---|---|
| Última migration no repo | `023_enforce_document_trash_integrity.sql` |
| Migration `012_harden_database_functions.sql` | ✅ **já estava aplicada** — o registro anterior estava errado |
| Migrations `014`–`023` | ⚠️ **estavam aplicadas em produção e ausentes do repo** — trazidas em `678ca42` |
| `001`–`012` — conteúdo local bate com o aplicado | ✅ confirmado byte a byte (via `migration fetch`) |
| RLS validada com duas identidades reais | 🟡 autorizada em produção somente com duas contas descartáveis na Fase 2; ainda não executada |
| Rollback ensaiado | ✅ **feito em 2026-08-08, banco local** — aplicar → reverter → reaplicar, ciclo completo confirmado |
| Pagamento real executado | ❌ **nunca** — bloqueado de propósito |

### ⚠️ O achado mais importante: infraestrutura de admin completa, nunca conectada ao código

As migrations `014`–`023`, recuperadas do banco, mostram um sistema pronto que a aplicação
**não usa**:

- **A falha de segurança que permitia um usuário comum se autopromover a admin (`UPDATE
  profiles SET role = 'admin'`) já está corrigida** desde a `016` — trigger + permissão por
  coluna. O `ROADMAP.md` chegou a registrar isso como risco aberto; estava desatualizado.
- Tabela `admin_audit_events`, com auditoria append-only — o que a `F5.2` pedia já existe.
- Sistema de papéis (`support`/`finance`/`admin`/`owner`) com capacidades granulares, num
  schema `private` inacessível ao cliente, mudança de papel transacional e protegida contra
  autopromoção mesmo pelo dono da conta.
- Uma **lixeira reversível de documentos** (`deleted_at`/`deleted_by`), área nova que não
  estava em nenhum plano.

**Nada disso tem código de aplicação usando.** `grep` em `src/` e `supabase/functions/`
confirma: zero chamadas. É trabalho pronto e abandonado — decisão sobre o que fazer com ele
registrada em [F5](ROADMAP.md#f5--painel-administrativo).

---

## Changeset local em validação

**2026-08-15 — PR1.1 local pronto; Fase 2 não executada:** contrato fail-closed de ambientes,
`.env.example`, scanner de index/worktree/untracked/bundle, política de contas
descartáveis/limpeza, setup E2E real protegido, inventário de owners/rotação e correção da
documentação ativa. O staging pago foi diferido; Preview autenticada permanece indisponível e
jamais usa produção. O procedimento manual restrito de produção está documentado, mas contas e
testes RLS permanecem pendentes da Fase 2.

## Última entrega aprovada

**2026-08-08 — três blocos de trabalho:**

1. **[F1 — tema claro/escuro](ROADMAP.md#f1--tema-claroescuro), concluída.** Alternância
   completa, persistida, sem flash no carregamento, com 15 testes novos. No caminho foram
   corrigidos cinco bugs não mapeados — o mais grave era o campo de digitação do cadastro,
   que tinha texto branco sobre fundo claro: no tema claro o usuário digitava e não via o
   que escrevia. Ficou estabelecida a convenção **`--doc-*` nunca segue o tema**, protegida
   por testes.

2. **Vulnerabilidade de produção corrigida.** `dompurify` XSS, moderada. Zerada.

3. **[F2.3 — exportação de dados do titular](ROADMAP.md#f2--direitos-do-titular).** Código
   pronto, testado e publicado em 2026-08-08. Antecipada por ser o único item da F2 que não
   depende dos prazos de retenção do jurídico.

---

## O que o código tem hoje

| Área | Estado |
|---|---|
| Autenticação Google OAuth | ✅ |
| Currículos — wizard e 5 templates | ✅ |
| Documentos jurídicos — 22 variantes | ✅ (revisão jurídica pendente) |
| Geração de PDF em Web Worker | ✅ |
| Pagamento Mercado Pago, preço fixado no servidor | ✅ código pronto, nunca executado real |
| Download autorizado pelo backend | ✅ |
| E-mail transacional | ✅ |
| Tema claro/escuro | ✅ |
| Painel administrativo | ✅ versão simples corrigida — sistema de papéis rico dormente |
| Exportação de dados do titular | ✅ publicada em 2026-08-08 |
| Exclusão de conta | ❌ não existe |

> O botão do perfil que limpa dados **só afeta o navegador atual** — não apaga nada no
> servidor. O rótulo agora diz isso ("Limpar dados deste dispositivo"). A exclusão de conta
> de verdade é a [F2](ROADMAP.md#f2--direitos-do-titular).

---

## Números do código

| Métrica | Valor |
|---|---|
| Arquivos JS/JSX em `src/` | 151 |
| Linhas JS/JSX em `src/` (incluindo testes) | 34.680 |
| Arquivos de teste | 44 |
| Edge Functions | 7 + `_shared`, todas publicadas |
| Tabelas no Postgres | 5 públicas + 2 privadas de autorização |
| Maiores arquivos | `DashboardPage` 1269 · `RequirementsModal` 1252 · `TemplatesPage` 1225 |

---

## Como reverificar tudo

```bash
npm test                  # deve dar 560 passando
npm run test:coverage     # cobertura atual: 56,77% de linhas em src
npm run lint              # deve sair limpo
npm run env:check         # lê .env.local conforme o Vite
npm run build
npm run build:ci
npm run scan:secrets
npm audit --omit=dev      # confira se a moderada foi resolvida
git log --oneline -10     # o que mudou desde a última revisão
```

Se algum número aqui divergir do resultado, **o resultado vence** — atualize este arquivo.

---

## Histórico

A documentação anterior está em `docs/_historico/`. Ela registra como chegamos até aqui, mas
**não é plano ativo** e contém números desatualizados e contradições internas. Não use para
decidir o que fazer; use o [ROADMAP.md](ROADMAP.md).
