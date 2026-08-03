# KRIOU-DOCS

Aplicação web para criar, editar, pagar, gerar e administrar documentos
profissionais e jurídicos. O frontend usa React/Vite; autenticação, banco,
políticas de acesso e funções de backend usam Supabase.

## Estado do projeto

O produto está funcional e passa por modernização incremental. O painel
administrativo e as proteções contra autoelevação de privilégio já foram
implantados. As prioridades e pendências estão no
[status consolidado](./docs/programa-evolucao-qualidade/STATUS.md).

## Requisitos

- Node.js `22.x` (mínimo `22.12.0`);
- npm `10.x` ou `11.x`;
- navegador Chromium para os testes E2E;
- Supabase CLI para trabalho com banco e Edge Functions.

Com `nvm`, a versão oficial fica em `.nvmrc`:

```bash
nvm install
nvm use
node --version
npm --version
```

## Instalação local

```bash
npm ci
npx playwright install chromium
cp .env.example .env.local
npm run dev
```

Preencha em `.env.local` somente as variáveis públicas descritas no exemplo. A
chave `service_role`, tokens de pagamento e outros segredos pertencem ao backend
ou ao gerenciador de secrets e nunca podem usar o prefixo `VITE_`.

## Verificações

```bash
npm run quality          # lint + tipos + testes + build
npm run test:watch       # testes durante desenvolvimento
npm run test:e2e:public  # fluxo público no Chromium
npm run test:e2e         # suíte E2E completa, quando o ambiente estiver preparado
```

O CI executa instalação reproduzível pelo lockfile, lint, TypeScript, 321+ testes
unitários, build e E2E público.

## Estrutura atual

```text
src/
  components/   componentes reutilizáveis e componentes do admin
  context/      autenticação, dados e composição de estado
  domain/       regras puras de navegação, documentos e pagamentos
  features/     capacidades já migradas para organização por feature
  hooks/        hooks compartilhados
  pages/        páginas e orquestração de rotas
  services/     acesso a Supabase/Edge Functions e contratos externos
  utils/        formatação, validação, PDF, storage e logging
  workers/      processamento pesado de PDF

supabase/
  functions/    Edge Functions e helpers compartilhados
  migrations/   evolução versionada do banco, RLS, grants e triggers

e2e/            testes Playwright
docs/           conhecimento, modelos e planejamento técnico
```

A arquitetura-alvo e a estratégia de migração estão no
[Plano Mestre de Modernização](./docs/programa-evolucao-qualidade/PLANO-MESTRE-MODERNIZACAO-2026-08-03.md).

## Regras importantes

- frontend nunca é autoridade de papel administrativo ou pagamento;
- migrations aplicadas não são editadas; mudanças usam uma nova migration;
- `dist`, `coverage`, sessões, secrets e configurações pessoais não entram no Git;
- mudança de rota, autenticação, checkout ou admin exige teste do fluxo afetado;
- refatorações preservam comportamento e avançam em incrementos pequenos.

## Rotas principais

- `/` e `/login`: acesso público;
- `/auth/callback`: retorno da autenticação;
- `/dashboard`, `/templates`, `/editor`, `/preview`: criação de documentos;
- `/checkout`: pagamento e liberação;
- `/profile`: perfil do usuário;
- `/admin`: painel protegido por validação de papel no backend.

A hospedagem precisa reescrever rotas desconhecidas para `index.html`; a
configuração do Vercel está em `vercel.json`.

## Colaboração

Antes de alterar o projeto, leia:

- [Guia de contribuição](./CONTRIBUTING.md)
- [Convenções de engenharia](./docs/CONVENTIONS.md)
- [Definition of Done](./docs/DEFINITION-OF-DONE.md)
- [Planos ativos](./docs/programa-evolucao-qualidade/README.md)
- [Decisões arquiteturais](./docs/programa-evolucao-qualidade/DECISOES.md)

O projeto é privado. Nenhuma licença pública de reutilização é concedida enquanto
não houver um arquivo `LICENSE` aprovado pelo proprietário.
