# Status — Kriou Docs

> **Verificado em 2026-08-10 rodando os comandos, não lendo documentos.**
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
| Testes unitários | ✅ **411 passando, 28 arquivos** | `npm test` |
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
| Cobertura atual de linhas em `src` | **36,75%** | ✅ Após a primeira fatia da F7.4 |

Desde 2026-08-10, `vite.config.js` mede `src/**/*.{js,jsx}` e exclui apenas os próprios
arquivos de teste. O antigo portão global de 80% foi removido porque escondia os arquivos
sem cobertura em vez de orientar melhoria real.

Isso **não significa que a suíte é ruim.** Os 411 testes são reais e estão concentrados onde
mais importa: geração de PDF, matriz jurídica das 22 variantes, validação, persistência,
autenticação e armazenamento.
O problema era a declaração, não a suíte. A medição foi corrigida em
[F7.1](ROADMAP.md#f7--honestidade-técnica); a expansão segue gradual na F7.4.

Comando oficial: `npm run test:coverage`.

Primeira fatia da F7.4 verificada em 2026-08-10: `DocumentService` chegou a **72,50%** de
linhas, a camada `src/services` a **80,92%**, `AuthContext` a **100%** e `storage.js` a
**89,14%**. Foram adicionados 40 testes; a F7.4 continua aberta para hooks e contextos.

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
| Arquivos JS/JSX em `src/` | 132 |
| Linhas JS/JSX em `src/` (incluindo testes) | ~31.100 |
| Arquivos de teste | 28 |
| Edge Functions | 7 + `_shared`, todas publicadas |
| Tabelas no Postgres | 4 (`profiles`, `documents`, `document_drafts`, `payment_webhook_events`) |
| Maiores arquivos | `DashboardPage` 1269 · `RequirementsModal` 1252 · `TemplatesPage` 1219 |

---

## Como reverificar tudo

```bash
npm test                  # deve dar 411 passando
npm run test:coverage     # cobertura atual: 36,75% de linhas em src
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
