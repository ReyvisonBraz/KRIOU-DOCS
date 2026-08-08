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
| Testes unitários | ✅ **321 passando, 21 arquivos** | `npm test` |
| Lint | ✅ **limpo** | `npm run lint` |
| Build | ✅ aprovado | `npm run build` |
| E2E público | ✅ Playwright, Chromium | `npm run test:e2e:public` |
| CI | ✅ ativo | `.github/workflows/quality.yml` |
| Vulnerabilidades de produção | ⚠️ **1 moderada** | `npm audit --omit=dev` |

### ⚠️ A vulnerabilidade

`dompurify <= 3.4.12` — moderada. Remoção de hook `IN_PLACE` deixa subárvore destacada
executável, permitindo XSS ([GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7)).
Corrigível com `npm audit fix`.

Isto **regrediu**: em 18/07/2026 o registro era de zero vulnerabilidades de produção.
Reapareceu depois disso e não estava documentado em lugar nenhum.

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

## Trabalho em andamento

**Tema claro/escuro**, não commitado, no working tree. A infraestrutura está pronta
(provider, contexto, toggle, variáveis CSS, Tailwind). Falta a varredura de cores fixas.

Inclui um bug conhecido: o preview do contrato muda de cor junto com a interface
([F1.1](ROADMAP.md#f1--tema-claroescuro)).

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
| Painel administrativo | 🟡 fundação apenas |
| Exportação de dados do titular | ❌ não existe |
| Exclusão de conta | ❌ não existe |

> O botão "Apagar meus dados" no perfil **só limpa o `localStorage`** — não apaga nada no
> servidor. O rótulo é enganoso. Correção em [F1.2](ROADMAP.md#f1--tema-claroescuro).

---

## Números do código

| Métrica | Valor |
|---|---|
| Arquivos JS/JSX em `src/` | 123 |
| Linhas em `src/` | ~29.500 |
| Arquivos de teste | 21 |
| Edge Functions | 7 |
| Tabelas no Postgres | 4 (`profiles`, `documents`, `document_drafts`, `payment_webhook_events`) |
| Maiores arquivos | `DashboardPage` 1269 · `RequirementsModal` 1252 · `TemplatesPage` 1219 |

---

## Como reverificar tudo

```bash
npm test                  # deve dar 321 passando
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
