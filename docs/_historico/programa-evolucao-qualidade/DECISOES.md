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

