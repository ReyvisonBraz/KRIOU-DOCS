# Convenções de engenharia

## Organização

- `src/app`: composição, rotas, providers e bootstrap;
- `src/features`: código pertencente a uma capacidade do produto;
- `src/domain`: regras puras, sem React, DOM ou Supabase;
- `src/services`: acesso a APIs/banco e tradução de contratos;
- `src/shared`: componentes e utilidades independentes de feature;
- estrutura atual pode migrar incrementalmente; arquivos não devem ser movidos
  apenas por estética.

## Nomes e módulos

- componentes React: `PascalCase.jsx` ou `.tsx`;
- hooks: `useNome.js` ou `.ts`;
- funções, variáveis e arquivos utilitários: `camelCase`;
- constantes globais: `UPPER_SNAKE_CASE`;
- testes ficam próximos do módulo (`*.test.*`) ou em diretório E2E próprio;
- novos módulos TypeScript usam tipos explícitos nas fronteiras, evitando `any`.

## Responsabilidades

- páginas orquestram, mas não concentram regra de negócio;
- domínio não acessa storage, rede ou UI;
- serviços não exibem toast e não manipulam componentes;
- componentes compartilhados não importam features;
- acesso direto ao Supabase fica em serviços ou backend definidos;
- erro técnico é convertido em erro de domínio/mensagem segura na fronteira adequada.

## Imports e dependências

- não criar ciclos entre features;
- `domain` não depende de `services`, `features` ou React;
- preferir exports explícitos e imports do módulo responsável;
- dependência nova exige justificativa, licença compatível, auditoria e impacto de bundle.

## Testes

- correção de bug inclui teste de regressão quando viável;
- regras de domínio usam testes unitários e casos de borda;
- autorização, RLS e pagamentos exigem testes negativos;
- mudança de rota/autenticação requer E2E ou evidência manual;
- snapshots não substituem afirmações sobre comportamento crítico.

## Git e documentação

- um commit deve explicar uma mudança coerente;
- não versionar `dist`, `coverage`, secrets, sessões, relatórios ou configuração pessoal;
- comentários explicam motivo/invariante, não repetem o código;
- mudança permanente de arquitetura gera ADR em
  `docs/programa-evolucao-qualidade/DECISOES.md`;
- planos e status são atualizados junto com o marco, não depois.
