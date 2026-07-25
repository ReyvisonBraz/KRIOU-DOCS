# Programa de Evolução de Qualidade — Kriou Docs

> Fonte operacional do projeto a partir de 10/07/2026.

Este programa substitui `plano-evolucao/` como plano ativo. O plano anterior permanece no repositório apenas como histórico, pois parte de seu diagnóstico já foi superada.

## Objetivo

Elevar o Kriou Docs de MVP funcional para produto comercial seguro, testável, observável e sustentável, sem interromper os fluxos atuais.

## Regra de execução

Cada tarefa segue este ciclo:

1. confirmar o problema com evidência;
2. definir contrato e critério de aceite;
3. fazer a menor mudança segura;
4. criar ou atualizar testes;
5. executar lint, testes e build;
6. registrar resultado e dívida remanescente;
7. somente então avançar a próxima tarefa.

## Ordem obrigatória

| Etapa | Setor | Prioridade | Estado |
|---|---|---:|---|
| 00 | Governança e linha de base | P0 | Em andamento |
| 01 | Segurança, pagamentos e autorização | P0 | Em andamento |
| 02 | Qualidade estática e padrões | P0 | Planejada |
| 03 | Testes e integração contínua | P0 | Planejada |
| 04 | Arquitetura frontend | P1 | Planejada |
| 05 | Dados, Supabase e serviços | P1 | Planejada |
| 06 | Componentes e design system | P1 | Planejada |
| 07 | Performance e PDFs | P1 | Planejada |
| 08 | UX, acessibilidade e responsividade | P1 | Planejada |
| 09 | Observabilidade e operação | P1 | Planejada |
| 10 | LGPD, conteúdo jurídico e produção | P1 | Planejada |

## Portões de qualidade globais

- nenhum erro de lint;
- testes unitários e de integração 100% verdes;
- E2E crítico reproduzível e verde;
- build de produção verde;
- zero vulnerabilidade alta ou crítica conhecida em produção;
- nenhuma confirmação financeira baseada apenas em dados do navegador;
- toda mudança de banco reversível e versionada;
- documentação e checklist atualizados na mesma entrega.

## Estrutura

Cada pasta possui escopo, tarefas, critérios de aceite, validação e ordem interna. O acompanhamento consolidado fica em [STATUS.md](./STATUS.md) e as decisões arquiteturais em [DECISOES.md](./DECISOES.md).

