# Status — Kriou Docs

> **Verificado em 2026-08-08 rodando os comandos, não lendo documentos.**
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
| Testes unitários | ✅ **347 passando, 23 arquivos** | `npm test` |
| Lint | ✅ **limpo** | `npm run lint` |
| Build | ✅ aprovado | `npm run build` |
| E2E público | ✅ Playwright, Chromium | `npm run test:e2e:public` |
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
| Cobertura **relatada** | ~91% | ❌ **Não confie.** Mede só 4 arquivos escolhidos a dedo |
| Cobertura **real de `src`** | **~14%** | ✅ Este é o número honesto |

`vite.config.js:44-56` restringe a medição a `validation.js`, `formatting.js`,
`sanitization.js` e `useAutoSave.js`, com portão de 80%. O portão passa verde porque mede
apenas arquivos favoráveis.

Isso **não significa que a suíte é ruim.** Os 321 testes são reais e estão concentrados onde
mais importa: geração de PDF, matriz jurídica das 22 variantes e validação de entrada.
O problema é a declaração, não a suíte. Correção planejada em
[F7](ROADMAP.md#f7--honestidade-técnica).

Não existe script `test:coverage` no `package.json` — a medição é feita à mão.

---

## Ambiente e banco

| Item | Estado |
|---|---|
| Última migration no repo | `013_assign_owner_admin.sql` |
| Migration `012_harden_database_functions.sql` | ⚠️ **existe no repo, nunca aplicada no ambiente alvo** |
| RLS validada com duas identidades reais | ❌ nunca feito |
| Rollback ensaiado | ❌ nunca feito |
| Pagamento real executado | ❌ **nunca** — bloqueado de propósito |

> Não sabemos com certeza em que migration o ambiente alvo está. Descobrir isso é
> [F3.1](ROADMAP.md#f3--ambiente-e-banco) e vem antes de qualquer migration nova.

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
   pronto e testado, ⚠️ **função ainda não publicada**. Antecipada por ser o único item da
   F2 que não depende dos prazos de retenção do jurídico.

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
| Painel administrativo | 🟡 fundação apenas |
| Exportação de dados do titular | 🟡 código pronto, **função não publicada** |
| Exclusão de conta | ❌ não existe |

> O botão do perfil que limpa dados **só afeta o navegador atual** — não apaga nada no
> servidor. O rótulo agora diz isso ("Limpar dados deste dispositivo"). A exclusão de conta
> de verdade é a [F2](ROADMAP.md#f2--direitos-do-titular).

---

## Números do código

| Métrica | Valor |
|---|---|
| Arquivos JS/JSX em `src/` | 127 |
| Linhas em `src/` | ~29.500 |
| Arquivos de teste | 23 |
| Edge Functions | 7 + `_shared` (1 nunca publicada) |
| Tabelas no Postgres | 4 (`profiles`, `documents`, `document_drafts`, `payment_webhook_events`) |
| Maiores arquivos | `DashboardPage` 1269 · `RequirementsModal` 1252 · `TemplatesPage` 1219 |

---

## Como reverificar tudo

```bash
npm test                  # deve dar 347 passando
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
