# Plano para zerar lint e qualidade estática

## Estado atual

`npm run lint` falha com:

- 30 erros;
- 4 avisos.

## Etapa 1 — Configuração

### Ignorar arquivos gerados

Adicionar ao ESLint ignore:

```txt
coverage/
dist/
node_modules/
```

### Configurar e2e

Arquivos Playwright usam Node e Playwright globals.

Corrigir:

- remover import não usado de `expect`;
- liberar `process` no ambiente e2e;
- ou configurar override no ESLint.

## Etapa 2 — Hooks

Corrigir:

- `src/components/UI/feedback.jsx`
- `src/components/UI/resume-helpers.jsx`

Problema:

```txt
React Hook chamado condicionalmente.
```

Regra:

- hooks sempre antes de qualquer `return`.

## Etapa 3 — Fast Refresh

Arquivos com erro:

- `Icons.jsx`
- `Theme.jsx`
- `AppContext.jsx`
- `AuthContext.jsx`
- `LegalContext.jsx`
- `ResumeContext.jsx`

Opções:

1. Separar contextos/hooks/helpers em arquivos próprios.
2. Ou ajustar regra ESLint temporariamente.

Recomendação: separar gradualmente, começando por contextos.

## Etapa 4 — Variáveis mortas

Remover ou usar:

- `loading` em AdminPage;
- `isGenerating` em DashboardPage;
- `filename` em DashboardPage;
- imports não usados nos documentos legais;
- variáveis mortas no logger/pdfGenerator.

## Etapa 5 — Effects

Corrigir:

- dependências ausentes em `AdminPage`;
- `allDocs` instável em `DashboardPage`;
- `setState` síncrono em `TemplatesPage`.

## Critério final

Comandos obrigatórios:

```powershell
npm run lint
npm test -- --run
npm run build
```

Todos precisam passar.
