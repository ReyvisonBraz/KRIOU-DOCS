# Planos e evolução — KRIOU-DOCS

Esta é a entrada única para planejamento técnico do projeto.

## Planos ativos

| Ordem | Plano | Objetivo | Estado |
|---:|---|---|---|
| 1 | [Painel administrativo](./PAINEL-ADMINISTRATIVO-PLANO-2026-07-18.md) | concluir a operação administrativa iniciada | em execução |
| 2 | [Modernização e manutenibilidade](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md) | reorganizar arquitetura, erros, testes, performance e manutenção | planejado |
| 3 | [Hardening de segurança](./PLANO-HARDENING-SEGURANCA-2026-08-03.md) | elevar segurança, auditoria e prontidão operacional | planejado; S0/S1 pode avançar em paralelo |

O acompanhamento resumido fica em [STATUS.md](./STATUS.md). Decisões
arquiteturais permanentes ficam em [DECISOES.md](./DECISOES.md).

## Ordem de trabalho atual

1. executar M00: identidade Git, higiene de arquivos locais/stash e baseline do Router/TypeScript;
2. tratar a auditoria de dependências descrita em S2.2, sem correção automática forçada;
3. concluir as funcionalidades remanescentes do painel administrativo;
4. iniciar M01 (erros e observabilidade);
5. executar segurança S0/S1 em paralelo conforme risco e dependências.

## Documentos de apoio

- [Handoff do painel admin](./PAINEL-ADMIN-STATUS-2026-08-03.md)
- [Histórico de planos](./historico/README.md)

## Regra de organização

- somente planos vigentes permanecem nesta pasta principal;
- plano concluído ou substituído vai para `historico/`;
- nenhum plano histórico é apagado;
- novos planos precisam declarar objetivo, estado, relação com os planos ativos e critério de encerramento;
- `STATUS.md` deve ser atualizado ao concluir um marco relevante.
