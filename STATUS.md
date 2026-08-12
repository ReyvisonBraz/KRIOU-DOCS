# Status — Kriou Docs

> **Verificado em 2026-08-12 rodando os comandos, não lendo documentos.**
>
> Regra deste arquivo: nada entra aqui sem um comando que comprove. Se você não conseguiu
> verificar, escreva "não verificado" — nunca copie um número de outro documento.
>
> O que ainda falta fazer está em [ROADMAP.md](ROADMAP.md).

---

## Resumo

O produto está **tecnicamente pronto**. O que falta para lançar é majoritariamente
**jurídico e operacional**, não código. Ver [F4](ROADMAP.md#f4--jurídico-e-textos-lgpd).

---

## Portões de qualidade

| Portão | Estado | Como verificar |
|---|---|---|
| Testes unitários | ✅ **501 passando, 41 arquivos** | `npm test` |
| Lint | ✅ **limpo** | `npm run lint` |
| Build | ✅ aprovado | `npm run build` |
| E2E público | ✅ **4 passando**, Playwright/Chromium | `npm run test:e2e:public` |
| CI | ✅ ativo | `.github/workflows/quality.yml` |
| Vulnerabilidades de produção | ✅ **zero** | `npm audit --omit=dev` |

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
| Cobertura atual de linhas em `src` | **55,52%** | ✅ Após a sétima fatia da F7.4 |

Desde 2026-08-10, `vite.config.js` mede `src/**/*.{js,jsx}` e exclui apenas os próprios
arquivos de teste. O antigo portão global de 80% foi removido porque escondia os arquivos
sem cobertura em vez de orientar melhoria real.

Isso **não significa que a suíte é ruim.** Os 501 testes são reais e estão concentrados onde
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

---

## Ambiente e banco

**F3.1 executada em 2026-08-08.** Projeto linkado (`uyptmlezmdzfufzuknfz` — KRIOU-DOCS,
`ACTIVE_HEALTHY`). Resultado: `npx supabase migration list`.

| Item | Estado |
|---|---|
| Última migration no repo | `023_enforce_document_trash_integrity.sql` |
| Migration `012_harden_database_functions.sql` | ✅ **já estava aplicada** — o registro anterior estava errado |
| Migrations `014`–`023` | ⚠️ **estavam aplicadas em produção e ausentes do repo** — trazidas em `678ca42` |
| `001`–`012` — conteúdo local bate com o aplicado | ✅ confirmado byte a byte (via `migration fetch`) |
| RLS validada com duas identidades reais | ⛔ **bloqueada** — precisa da chave `service_role`, exposição não autorizada ainda |
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

## Última entrega

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
| Arquivos JS/JSX em `src/` | 145 |
| Linhas JS/JSX em `src/` (incluindo testes) | 33.600 |
| Arquivos de teste | 41 |
| Edge Functions | 7 + `_shared`, todas publicadas |
| Tabelas no Postgres | 4 (`profiles`, `documents`, `document_drafts`, `payment_webhook_events`) |
| Maiores arquivos | `DashboardPage` 1269 · `RequirementsModal` 1252 · `TemplatesPage` 1219 |

---

## Como reverificar tudo

```bash
npm test                  # deve dar 501 passando
npm run test:coverage     # cobertura atual: 55,52% de linhas em src
npm run lint              # deve sair limpo
npm run build             # deve compilar
npm audit --omit=dev      # confira se a moderada foi resolvida
git log --oneline -10     # o que mudou desde a última revisão
```

Se algum número aqui divergir do resultado, **o resultado vence** — atualize este arquivo.

---

## Histórico

A documentação anterior está em `docs/_historico/`. Ela registra como chegamos até aqui, mas
**não é plano ativo** e contém números desatualizados e contradições internas. Não use para
decidir o que fazer; use o [ROADMAP.md](ROADMAP.md).
