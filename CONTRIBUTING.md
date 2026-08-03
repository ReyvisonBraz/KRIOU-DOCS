# Contribuindo com o KRIOU-DOCS

Este guia define o fluxo mínimo para instalar, alterar e validar o projeto sem
depender de conhecimento informal.

## Ambiente

- Node.js `22.x` (mínimo `22.12.0`);
- npm `10.x` ou `11.x`;
- Git com nome e e-mail verificado configurados;
- Supabase CLI somente para migrations, funções e testes de backend.

Com `nvm`:

```bash
nvm install
nvm use
npm ci
npx playwright install chromium
```

Copie `.env.example` para `.env.local` e preencha apenas valores do ambiente de
desenvolvimento. Nunca coloque `service_role`, tokens privados ou credenciais de
produção em variáveis `VITE_*`.

## Comandos principais

```bash
npm run dev
npm run quality
npm run test:watch
npm run test:e2e:public
```

`npm run quality` executa lint, verificação TypeScript, testes unitários e build.
E2E deve ser executado quando a mudança afetar navegação, autenticação, checkout,
administração ou comportamento visível no navegador.

## Fluxo de mudança

1. Atualize o `main` e crie uma branch com escopo único (`feat/`, `fix/`,
   `chore/`, `docs/` ou `security/`).
2. Confirme `git status` e não misture alterações anteriores do usuário.
3. Registre comportamento existente com teste antes de uma refatoração arriscada.
4. Faça alterações pequenas, mantendo contratos compatíveis quando possível.
5. Execute `npm run quality` e os testes específicos do fluxo afetado.
6. Revise o diff, segredos, dados pessoais, migrations e arquivos gerados.
7. Faça commits coerentes no imperativo, sem credenciais ou artefatos de build.
8. Integre somente após cumprir a [Definition of Done](./docs/DEFINITION-OF-DONE.md).

## Banco, migrations e Edge Functions

- nunca edite uma migration já aplicada; crie a próxima migration numerada;
- grants, policies e triggers precisam de teste negativo de autorização;
- mudanças destrutivas exigem estratégia de rollback e confirmação explícita;
- Edge Functions autenticadas não confiam em papel, usuário, preço ou pagamento enviados pelo frontend;
- segredos pertencem ao gerenciador do ambiente, nunca ao Git.

## Revisão e segurança

Siga as [convenções](./docs/CONVENTIONS.md) e os planos ativos em
[docs/programa-evolucao-qualidade](./docs/programa-evolucao-qualidade/README.md).
Vulnerabilidade não corrigida precisa de análise de alcançabilidade, responsável,
prazo e mitigação registrada.
