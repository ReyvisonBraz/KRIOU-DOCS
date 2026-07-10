# Etapa 02 — Qualidade estática e padrões

## Escopo

- corrigir as 38 falhas iniciais de lint, priorizando regras de Hooks;
- separar configurações ESLint para browser, Node, Playwright e Deno;
- remover imports, estados e funções mortos;
- adotar formatter e ordem consistente de imports;
- adicionar JSDoc ou TypeScript nas fronteiras de dados;
- impedir novos arquivos monolíticos.

## Lotes

1. Hooks condicionais e efeitos incorretos;
2. dependências de hooks e closures obsoletas;
3. configuração Fast Refresh/contextos;
4. código morto;
5. convenções automáticas.

## Critérios de aceite

- `npm run lint` retorna código zero;
- nenhuma desativação de regra sem justificativa local;
- lint executa também sobre E2E e scripts com globals corretos;
- limite de complexidade/tamanho gera aviso para crescimento futuro.

