# Status consolidado

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
