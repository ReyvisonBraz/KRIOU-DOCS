# Planos e evolução — KRIOU-DOCS

Esta é a entrada única para planejamento técnico do projeto.

## Planos ativos

| Ordem | Plano | Objetivo | Estado |
|---:|---|---|---|
| 1 | [Painel administrativo](./PAINEL-ADMINISTRATIVO-PLANO-2026-07-18.md) | concluir a operação administrativa iniciada | em execução |
| 2 | [Modernização e manutenibilidade](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md) | reorganizar arquitetura, erros, testes, performance e manutenção | planejado |
| 3 | [Hardening de segurança](./PLANO-HARDENING-SEGURANCA-2026-08-03.md) | elevar segurança, auditoria e prontidão operacional | planejado; S0/S1 pode avançar em paralelo |
| 4 | [Sincronização, exclusão e auditoria](./PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md) | garantir exclusões confirmadas, atualização econômica do admin e trilha backend | planejado; executar D0 antes das demais fases |

O acompanhamento resumido fica em [STATUS.md](./STATUS.md). Decisões
arquiteturais permanentes ficam em [DECISOES.md](./DECISOES.md).

## Ordem de trabalho atual

1. M00 concluído; preservar seus gates como baseline obrigatória;
2. tratar a auditoria de dependências descrita em S2.2, sem correção automática forçada;
3. executar D0 antes de novas telas de exclusão, corrigindo linguagem e contratos;
4. concluir as funcionalidades remanescentes do painel administrativo;
5. iniciar M01 (erros e observabilidade);
6. executar segurança S0/S1 em paralelo conforme risco e dependências;
7. avançar D1/D2/D4/D5 quando esta frente for priorizada; D3 Realtime permanece condicional.

## Documentos de apoio

- [Handoff do painel admin](./PAINEL-ADMIN-STATUS-2026-08-03.md)
- [Histórico de planos](./historico/README.md)

## Regra de organização

- somente planos vigentes permanecem nesta pasta principal;
- plano concluído ou substituído vai para `historico/`;
- nenhum plano histórico é apagado;
- novos planos precisam declarar objetivo, estado, relação com os planos ativos e critério de encerramento;
- `STATUS.md` deve ser atualizado ao concluir um marco relevante.
