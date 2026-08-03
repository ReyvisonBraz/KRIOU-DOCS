# Registro de decisões arquiteturais

## ADR-001 — Segurança antes de refatoração visual

- **Estado:** aceita.
- **Contexto:** há confirmação de pagamento baseada em query string e fallback que libera o documento.
- **Decisão:** corrigir o limite de confiança financeiro antes de dividir componentes grandes.
- **Consequência:** melhorias visuais ficam congeladas até o portão P0 estar verde.

## ADR-002 — Migração incremental

- **Estado:** aceita.
- **Decisão:** preservar APIs públicas durante extrações e migrar uma página por vez.
- **Consequência:** poderão existir adaptadores temporários, que devem ter tarefa explícita de remoção.

## ADR-003 — Backend é autoridade financeira

- **Estado:** aceita.
- **Decisão:** identidade, preço, propriedade, valor pago e liberação do documento são validados no servidor.
- **Consequência:** parâmetros de URL e dados enviados pelo frontend nunca confirmam pagamento por si mesmos.

## ADR-004 — Node 22 LTS é o ambiente oficial

- **Estado:** aceita em 2026-08-03.
- **Contexto:** o CI já usa Node 22, enquanto ambientes locais podem usar versões
  mais novas e produzir resultados diferentes.
- **Decisão:** desenvolvimento, CI e build oficial usam Node `22.x`, com mínimo
  `22.12.0`, e npm entre as versões 10 e 11.
- **Consequência:** `.nvmrc`, `package.json` e CI devem permanecer alinhados;
  atualização de major exige PR próprio e execução de todos os gates.

## ADR-005 — Mudanças incrementais e gates obrigatórios

- **Estado:** aceita em 2026-08-03.
- **Decisão:** toda mudança passa por lint, TypeScript, testes e build; fluxos
  afetados recebem E2E ou verificação manual registrada.
- **Consequência:** refatorações grandes devem ser divididas por responsabilidade
  e não podem misturar correção funcional, formatação massiva e reorganização sem necessidade.
