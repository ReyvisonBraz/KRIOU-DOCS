# Status consolidado

## Linha de base atual — 18/07/2026

| Verificação | Resultado atual |
|---|---|
| Branch | `main`, acompanhando `origin/main` |
| Build | aprovado |
| Unitários | 163/163 aprovados em 17 arquivos |
| Lint | aprovado |
| Cobertura configurada | 91,09% das linhas de somente 4 módulos selecionados |
| Cobertura real de todo `src` JS/JSX | 13,70% statements; 11,19% branches; 9,42% funções; 13,88% linhas |
| Dependências de produção | `ws` alta e `dompurify` moderada; transitivas e com correção disponível |
| Mudanças locais | preservadas e classificadas em Q01, Q02, Q03 e preparação de Q11 |
| Pagamento real | adiado para Q11 por solicitação do usuário |

O plano sequencial vigente está em `PLANO-MESTRE-QUALIDADE-2026-07-18.md`. Q01 está pronto para confirmação; Q02 não deve iniciar antes dessa confirmação.

## Execução sequencial — 18/07/2026

- Q01 concluída e confirmada pela autorização do usuário para execução contínua.
- Q02 concluída: 22 variantes auditadas, campos ignorados corrigidos, opcionais isolados cobertos e área estimada implementada.
- Validação Q02: 232/232 testes, lint e build aprovados.
- Q03 concluída: 76 PDFs de QA, 148 páginas, zero alerta de layout e 44 regressões automatizadas de paginação.
- Q04 concluída: navegação interna segura, seis larguras auditadas, celular em paisagem, zero estouro horizontal e alvos de toque de 44 px.
- Validação consolidada até Q04: 276/276 testes, lint e build aprovados.
- Q05 concluída: regras de navegação e seleção do dashboard extraídas para domínio puro, com 33 regressões novas.
- Q06 concluída: CI com lint, 309 testes, build e E2E público; 4/4 cenários Playwright aprovados.
- Q07 em andamento: dados, Supabase, autorização e segurança não financeira.
- Q07 concluída no código: RLS auditada, migration 012 criada e dependências atualizadas para zero vulnerabilidades; aplicação no banco permanece no checklist operacional.
- Q08 concluída: retorno e download passam a usar o documento exato confirmado pelo backend e autorização por ID.
- Q09 concluída no código: logger estruturado remove PII/segredos e gera referência de erro; integração externa de monitoramento segue como evolução operacional.
- Q10 tecnicamente documentada, mas não pode ser confirmada sem revisão jurídica, fluxo de exportação/exclusão de conta e aplicação/validação da migration 012.
- Q11 permanece bloqueada pela regra de executar pagamento real somente depois da confirmação de Q10.
- Pagamento real continua reservado para Q11.

## Linha de base — 10/07/2026

| Verificação | Resultado inicial |
|---|---|
| Build | aprovado |
| Unitários | 117/117 aprovados |
| Cobertura declarada | 91,09% das linhas de apenas 4 módulos selecionados |
| Lint | reprovado: 38 erros e 5 avisos |
| E2E | 8 cenários existentes; execução não saudável |
| Dependências de produção | 1 vulnerabilidade alta e 1 moderada |
| CI | inexistente |
| Arquivos críticos | telas entre 900 e 1.262 linhas |

## Execução atual

- [x] Auditoria técnica inicial.
- [x] Criação do programa versionado por setores.
- [x] E01-T01 — Implementação: confirmação server-side e retorno idempotente no frontend.
- [x] E01-T02 — Implementação: autenticação, preço server-side e validação de propriedade.
- [x] E01-T03 — Implementação: fallback gratuito removido; mock apenas local e opt-in.
- [x] E01-T01/03 — Homologar com credenciais de teste do Mercado Pago e migrations aplicadas.
- [x] E01-T04 — Implementação: e-mail autenticado, server-side, pago e idempotente.
- [x] E01-T05 — Implementação local: webhook assinado, idempotente e trilha financeira.
- [x] E01-T05 — Aplicar migration 009, publicar função, configurar assinatura e simular notificação.

## Registro de entregas

| Data | ID | Resultado | Validação |
|---|---|---|---|
| 10/07/2026 | GOV-001 | Programa de evolução criado | revisão estrutural |
| 10/07/2026 | E01-T01/03 | Limite de confiança do checkout corrigido no código | 122 testes e build aprovados; homologação Mercado Pago concluída; Deno check pendente |
| 10/07/2026 | E01-T04 | Envio arbitrário substituído por confirmação transacional idempotente | 124 testes, lint direcionado e build aprovados |
| 10/07/2026 | E01-T05 | Aplicação Mercado Pago criada e webhook implementado localmente | aplicação 1625780794377672; 127 testes e build aprovados |
| 10/07/2026 | E01-T05-HML | Banco, Edge Functions e webhook Mercado Pago configurados em teste | migrations 004/007/008/009 aplicadas; 4 funções publicadas; assinatura validada; API MP respondeu 200 |
| 11/07/2026 | E01-T06 | Bloqueio de PDF antes do checkout corrigido e publicado | editor jurídico e preview passam pelo checkout; produção Vercel atualizada; 127 testes e build aprovados |
