# Planos e evolução — KRIOU-DOCS

Esta é a entrada única para planejamento técnico do projeto.

## Planos ativos

| Ordem | Plano | Objetivo | Estado |
|---:|---|---|---|
| 1 | [Painel administrativo](./PAINEL-ADMINISTRATIVO-PLANO-2026-07-18.md) | concluir a operação administrativa iniciada | em execução |
| 2 | [Modernização e manutenibilidade](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md) | reorganizar arquitetura, erros, testes, performance e manutenção | planejado |
| 3 | [Hardening de segurança](./PLANO-HARDENING-SEGURANCA-2026-08-03.md) | elevar segurança, auditoria e prontidão operacional | planejado; S0/S1 pode avançar em paralelo |
| 4 | [Sincronização, exclusão e auditoria](./PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md) | garantir exclusões confirmadas, atualização econômica do admin e trilha backend | planejado; executar D0 antes das demais fases |
| 5 | [Controles administrativos](./PLANO-CONTROLES-ADMINISTRATIVOS-2026-08-03.md) | ampliar operação de usuários, documentos, pagamentos e acesso excepcional | planejado; A0 bloqueia todas as mutações novas |
| 6 | [Dashboard e templates](./PLANO-DASHBOARD-E-TEMPLATES-2026-08-03.md) | criar centro operacional e catálogo versionado de documentos | planejado; iniciar por B0/B1 e T0/T1 |
| 7 | [Dívida técnica](./PLANO-DIVIDA-TECNICA-2026-08-03.md) | manter inventário priorizado e executar a modernização por risco | em execução; TD0 é o marco atual |
| 8 | [Autenticidade e QR de documentos](./PLANO-AUTENTICIDADE-QR-DOCUMENTOS-2026-08-03.md) | vincular QR público a versões imutáveis e recuperação autenticada | planejado; Q0–Q3 bloqueiam promessa de autenticidade |
| 9 | [Auditoria visual, responsividade e PWA](./PLANO-AUDITORIA-VISUAL-PWA-2026-08-04.md) | elevar acabamento, acessibilidade, performance mobile e instalação | em execução; V0 iniciado antes da reformulação do admin |
| 10 | [Decomposição segura do RequirementsModal](./PLANO-DECOMPOSICAO-REQUIREMENTS-MODAL-2026-08-05.md) | separar domínio, tela e impressão sem alterar regras ou contratos | planejado; iniciar por baseline e caracterização R0 |

O acompanhamento resumido fica em [STATUS.md](./STATUS.md). Decisões
arquiteturais permanentes ficam em [DECISOES.md](./DECISOES.md).

## Ordem de trabalho atual

1. M00 concluído; preservar seus gates como baseline obrigatória;
2. concluir TD0: testes reais de autorização/RLS, capacidades e bloqueios;
3. tratar a auditoria de dependências descrita em S2.2, sem correção automática forçada;
4. concluir D0/D1 de exclusão e sincronização antes de ampliar ações destrutivas;
5. iniciar TD1/M01 (erros, contratos e observabilidade);
6. ampliar controles administrativos somente sobre esses guardrails;
7. avançar decomposição estrutural por feature, começando pelas áreas tocadas;
8. iniciar dashboard por B0/B1 e templates por T0/T1; editor/publicação somente após os gates.
9. após a fundação MFA, executar Q0/Q1 do QR; publicar verificador e PDF vinculado somente juntos.
10. executar V0/V1 da auditoria visual antes da reformulação ampla do admin e
    tratar a instalação PWA somente com política segura de cache e atualização.
11. decompor `RequirementsModal` pelas fases R0–R7 antes de redesenhar seus
    requisitos ou alterar regras jurídicas e de impressão.

## Documentos de apoio

- [Handoff do painel admin](./PAINEL-ADMIN-STATUS-2026-08-03.md)
- [Histórico de planos](./historico/README.md)

## Regra de organização

- somente planos vigentes permanecem nesta pasta principal;
- plano concluído ou substituído vai para `historico/`;
- nenhum plano histórico é apagado;
- novos planos precisam declarar objetivo, estado, relação com os planos ativos e critério de encerramento;
- `STATUS.md` deve ser atualizado ao concluir um marco relevante.
