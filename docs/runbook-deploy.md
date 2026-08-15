# Runbook — ambientes, migrations e deploy

Contrato operacional ativo para local, Preview/homologação e produção.

Última revisão local: 2026-08-15. A validação executável está em
`src/config/environment.js` e a âncora pública de produção em
`src/config/deployment-trust.js`. Alterações de contrato exigem atualizar código, testes e este
runbook na mesma revisão.

## Estado verificado e limites

- Produção foi auditada em 2026-08-08 sob o project-ref público
  `uyptmlezmdzfufzuknfz`; as migrations `001`–`023` estavam aplicadas.
- O checkout atual não contém `.env`, vínculo remoto em `supabase/.temp/` nem Supabase local
  em execução. Isso é estado por máquina, não regressão do banco remoto.
- Inventário público informado pelo responsável: organização Supabase `sptobceudadpankmgwyz`,
  projeto de produção `uyptmlezmdzfufzuknfz`, região `us-east-1`.
- Em 2026-08-15 o responsável declarou que produção ainda não contém dados reais. Este changeset
  não acessou o serviço para confirmar a declaração nem reverificou o inventário.
- O staging pago foi diferido e **não foi criado nem verificado**. Preview autenticada pode ficar
  indisponível enquanto isso e nunca pode reutilizar produção.
- Não foram alterados Vercel/GitHub, lidos secrets, criadas contas ou executados comandos remotos.
  A única autorização atual de produção é para duas contas descartáveis + Auth/RLS manuais na
  Fase 2, conforme o procedimento restrito abaixo.

## Contrato por ambiente

| Ambiente | Frontend | Supabase | Dados | Regra de falha |
|---|---|---|---|---|
| Local | `VITE_APP_ENV=local` | Local (`VITE_SUPABASE_ENV=local`) ou offline explícito | Fixtures sem PII | Sem credenciais, exige `VITE_ALLOW_OFFLINE=true`; URL remota é recusada |
| Preview/homologação | `VITE_APP_ENV=preview` no escopo Vercel Preview | Somente projeto exclusivo (`VITE_SUPABASE_ENV=staging`), hoje indisponível | Nenhum fluxo autenticado até staging existir | Build recusa ausência, offline, `VERCEL_ENV` divergente e o ref canônico de produção |
| Produção | `VITE_APP_ENV=production` no escopo Vercel Production | Projeto `uyptmlezmdzfufzuknfz` (`VITE_SUPABASE_ENV=production`) | Responsável declarou ausência de dados reais; exceção só para Auth/RLS manual da Fase 2 | Build recusa ausência, offline, `VERCEL_ENV` divergente e ref diferente da âncora versionada |

Variáveis públicas obrigatórias em Preview/Produção:

| Variável | Preview/homologação | Produção | Sensibilidade |
|---|---|---|---|
| `VITE_APP_ENV` | `preview` | `production` | Pública |
| `VITE_SUPABASE_ENV` | `staging` | `production` | Pública |
| `VITE_SUPABASE_URL` | URL exclusiva do staging, somente após aprovação/criação; não configurar com produção | URL do projeto de produção | Pública |
| `VITE_SUPABASE_ANON_KEY` | anon/publishable exclusiva do staging, somente após criação | anon/publishable de produção | Pública, mas nunca substituir por secret/service_role |
| `VITE_ALLOW_OFFLINE` | `false` ou ausente | `false` ou ausente | Pública |

O build aceita somente `https://<ref-de-20-caracteres>.supabase.co` na porta padrão, sem userinfo,
path, query ou hash. A trava compara o ref extraído com a constante versionada; não existe âncora
`VITE_*` que a Preview possa adulterar. JWT anon legado segue schemas separados, sem `aud`:

- Supabase CLI/local: exatamente `iss=supabase-demo`, `role=anon` e `exp`; shape confirmado no
  CLI 2.111 da revisão e no 2.109.1 instalado neste worktree. Não exige nem inventa `iat`/`ref`,
  e só é aceito junto a URL local.
- Hosted/self-hosted compatível: `iss=supabase`, `role=anon`, `iat` e `exp`, com `ref` opcional;
  neste produto só é aceito junto à URL remota canônica `*.supabase.co`.

O relógio admite skew explícito de 300 segundos. O gate recusa `exp` vencido, `iat` futuro quando
presente, `exp <= iat`, mais de dez anos de lifetime e expiração futura impossível para o gerador
CLI atual. Tokens `service_role`, JWTs de usuário (`role=authenticated`), issuer/claims
desconhecidos e `ref` divergente também são recusados. Se a JWT hosted trouxer `ref`, ele deve
coincidir com a URL. Toda chave ainda exige smoke externo para provar que a assinatura é aceita,
que a chave funciona e não foi revogada; JWT sem `ref` e `sb_publishable_*` exigem o smoke também
para comprovar associação ao projeto.

A allowlist pública é: `VITE_APP_ENV`, `VITE_SUPABASE_ENV`, `VITE_ALLOW_OFFLINE`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_PAYMENT_MOCK`,
`VITE_POSTHOG_KEY`, `VITE_SENTRY_DSN` e `VITE_LOG_LEVEL`. Qualquer outro `VITE_*`, mesmo com nome
alternativo, falha antes do bundle.

O workflow de qualidade usa `npm run build:ci`, modo `quality` + marcador server-only explícito.
Esse modo gera apenas artefato local/offline, recusa `VERCEL`/`VERCEL_ENV` e não é habilitado por
`GITHUB_ACTIONS`. Builds comuns/deploy sem contrato continuam falhando.

## Secrets server-side

| Variável | Consumidor | Local | Homologação | Produção |
|---|---|---|---|---|
| `SUPABASE_URL` | Edge Functions | CLI local | Injetada pelo Supabase | Injetada pelo Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | CLI local | Injetada pelo Supabase | Injetada pelo Supabase |
| `MP_ACCESS_TOKEN` | preferência, verificação e webhook | Mock/credencial sandbox protegida | Sandbox | Real, somente após gate financeiro |
| `MP_WEBHOOK_SECRET` | webhook | Mock/sandbox | Sandbox | Real, somente após gate financeiro |
| `APP_URL` | retornos e e-mail | URL local | URL da Preview/homologação | Domínio de produção |
| `RESEND_API_KEY` | e-mail | Mock/conta de teste | Conta/remetente de teste | Conta real aprovada |
| `RESEND_FROM_EMAIL` | e-mail | Remetente de teste | Remetente de teste | Remetente verificado |

Nunca colocar esses valores em Git, artefato, log, variável `VITE_*` ou comando colado em
evidência. O Supabase injeta URL e service role nas Edge Functions; não duplicá-las manualmente.

## Owners e rotação (sem valores)

O sistema de acesso da organização `sptobceudadpankmgwyz` é a fonte de verdade para nomes. Antes de
habilitar staging ou executar a exceção manual de produção, preencher os papéis abaixo lá; este
repositório registra responsabilidades, não identidades nem valores de credenciais.

| Responsabilidade | Owner obrigatório | Backup/revisor |
|---|---|---|
| Projeto Supabase e chaves públicas | owner da organização Supabase | mantenedor de infraestrutura designado |
| Secrets das Edge Functions | mantenedor de backend | owner da organização Supabase |
| Variáveis Vercel por escopo | owner do projeto Vercel | mantenedor de release |
| Mercado Pago | owner financeiro | mantenedor de backend, acesso mínimo |
| Resend/remetente | owner de comunicação/transacional | mantenedor de backend |
| Contas de teste e limpeza | QA/release owner | mantenedor de infraestrutura designado |

Rotação programada e por incidente:

1. Abrir registro de mudança com ambiente, variável, owner, motivo e data; nunca anexar valor.
2. Criar nova credencial no provedor sem revogar a antiga.
3. Atualizar primeiro staging e executar `npm run env:check`, smoke autenticado e fluxo sandbox
   afetado. Se staging não existir, a rotação que dependa desse gate fica bloqueada; a exceção de
   Auth/RLS em produção não autoriza pular esta etapa.
4. Em janela aprovada, atualizar produção e executar smoke mínimo sem PII em logs.
5. Revogar a credencial anterior, confirmar que deixou de funcionar e registrar apenas ID
   não secreto/últimos caracteres fornecidos pelo provedor e datas.
6. Rodar `npm run scan:secrets`. Em suspeita de vazamento, rotacionar imediatamente e acionar
   resposta a incidente; não tentar “limpar” o segredo antes de revogá-lo.

Revisão trimestral de owners e acessos; rotação imediata em desligamento, perda de dispositivo,
exposição ou mudança de escopo. A periodicidade de cada provedor deve respeitar sua política mais
restritiva.

## Contas descartáveis no futuro staging

- O setup Playwright continua exclusivo do staging: usa e-mail/senha reais, nunca mock ou
  produção. Enquanto staging estiver diferido, o fluxo autenticado de Preview fica indisponível e
  o setup pode pular por ausência deliberada de credenciais.
- `E2E_TEST_*` não é passado ao processo Vite. A sessão fica apenas em `e2e/.auth/`, ignorado pelo
  Git; `playwright/.auth/` e nomes comuns de storageState também são ignorados.
- Quando staging existir, usar aliases de domínio controlado e somente dados sintéticos sem PII;
  registrar owner, expiração e identificadores fora do banco de produção. Credenciais ficam no
  secret store do executor, nunca em chat, documento ou evidência.
- Staging pode ser recriado/resetado somente com aprovação explícita, project-ref conferido e
  ausência de evidência que ainda precise ser preservada.

## Exceção de produção para Auth + RLS manual (Fase 2)

Esta seção é um procedimento preparado, **não uma autorização para executá-lo neste changeset**.
Ela não permite usar produção na Preview nem automatizar E2E contra produção.

1. Abrir janela aprovada com operador e revisor identificados por papel. Confirmar explicitamente
   o ref `uyptmlezmdzfufzuknfz` e registrar um ID não secreto da execução.
2. Antes de qualquer escrita, levantar apenas contagens e UUIDs necessários ao baseline. Se houver
   dado real, dado preexistente inesperado, escopo divergente ou dúvida sobre o ambiente,
   **parar sem criar contas nem linhas**, preservar evidência sanitizada e avisar o coordenador.
3. Pelo Auth normal aprovado da aplicação, criar exatamente duas contas descartáveis, uma por
   identidade de teste. Usar aliases controlados e conteúdo sintético marcado, sem PII. Não ler,
   expor ou usar `service_role`; não registrar senha, token, cookie ou e-mail na evidência.
4. Registrar os UUIDs exatos esperados: os dois `auth.users.id`, os respectivos `profiles.id` e
   cada `documents.id`/`document_drafts.id` criado. Registrar também as contagens esperadas antes e
   depois. UUID ausente ou contagem inesperada é condição de parada.
5. Criar o mínimo de documentos/drafts sintéticos para provar: leitura própria; recusa de leitura e
   update cruzados; recusa de `user_id` forjado; isolamento de `profiles`, `documents` e
   `document_drafts`. Não criar evento de pagamento nem tocar provedor ou secret financeiro.
6. **Stop-on-leak:** qualquer linha cruzada, dado inesperado, mismatch de UUID/contagem, erro de
   escopo ou comportamento fora do esperado interrompe novas escritas. Preservar somente evidência
   sanitizada, notificar o coordenador e limitar a ação seguinte à limpeza exata já inventariada.
7. Limpar somente com igualdade nos UUIDs registrados, nunca por prefixo, data, wildcard ou lote
   amplo: remover primeiro documents/drafts exatos; confirmar contagens; remover profiles/usuários
   exatos; por fim remover as duas contas Auth exatas pelo caminho operacional aprovado. Isso é
   limpeza da fixture, não teste do recurso de exclusão de conta.
8. Confirmar ausência de cada UUID e reconciliar as contagens finais. Se aparecer qualquer evento
   de pagamento inesperado, parar e não apagá-lo automaticamente: essa tabela está fora da exceção.

São proibidos nesta exceção: migrations, teste de exclusão de conta, pagamentos, secrets
financeiros, limpeza ampla e qualquer Preview→produção.

## Staging pago diferido

Não criar staging agora. Ele volta a ser pré-requisito antes de migrations, testes do fluxo de
exclusão de conta, pagamentos/sandbox financeiro, secrets financeiros, E2E autenticado automatizado
ou qualquer ampliação da exceção. Quando houver nova decisão explícita sobre custo e owners:

1. Confirmar organização, região, plano/custo, owner de cobrança, owners técnicos e convenção de
   nome; nenhuma escolha deve ser inferida pelo executor.
2. Owner cria projeto Supabase separado e registra somente project-ref/URL públicos no inventário.
3. Configurar Google OAuth, URLs de redirect e secrets sandbox no projeto de staging.
4. Configurar as variáveis públicas no escopo **Preview** da Vercel. Nunca copiar variáveis do
   escopo Production em bloco.
5. Em uma máquina autorizada, vincular explicitamente o projeto de staging:

   ```bash
   npx supabase link --project-ref <REF_HOMOLOGACAO>
   npx supabase migration list --linked
   npx supabase db push --dry-run
   ```

6. Conferir que o dry-run lista somente o esperado; só então, com aprovação, executar
   `npx supabase db push` e repetir `migration list`.
7. Criar conta descartável, autenticar na Preview, salvar um documento fixture e removê-los pela
   política de limpeza do staging.
8. Guardar evidência sanitizada: project-ref público, hashes/versões das migrations, contagens e
   resultado do smoke. Omitir tokens, e-mail, cookies e payloads.

Este runbook não autoriza criar projeto, alterar Vercel/GitHub nem executar comandos externos. A
exceção manual de produção depende de uma tarefa separada da Fase 2 e não amplia nenhum outro
escopo. Cada ação externa depende do coordenador e dos owners acima.

## Produção e rollback

- A exceção de Auth/RLS manual não autoriza deploy, migration, rotação de secret ou rollback.
- Produção recebe apenas promoção explícita de commit aprovado; Preview nunca é promovida com
  configuração de homologação.
- Antes de migration: conferir projeto linkado, backup/PITR, `migration list`, dry-run e rollback.
- Frontend: promover deployment anterior na Vercel.
- Edge Functions: restaurar a versão do commit anterior e republicar; considerar dependências em
  `_shared/`.
- Banco: usar script inverso revisado ou PITR. `npx supabase db reset` é local/destrutivo e nunca
  é rollback de produção.

## Verificação local e evidência

```bash
cp .env.example .env.local
npm run env:check
npm test
npm run lint
npm run build
npm run build:ci
npm run scan:secrets
git diff --check
```

`env:check` usa o mesmo carregamento Vite de `.env`, `.env.local`, `.env.<mode>` e
`.env.<mode>.local`; outro modo pode ser validado com `npm run env:check -- --mode production`.

Os testes cobrem ausência de configuração, troca conjunta de URL+âncora, allowlist, URL canônica,
JWT hosted/local, divergência Vercel e bloqueio do modo CI na Vercel. O scanner omite valores e
lê quatro fontes: conteúdo do index Git, working tree rastreada, arquivos novos não ignorados e
`dist/` gerado. JWTs são decodificadas localmente: somente um shape público `anon` oficial e
temporalmente válido é isento; `service_role`, token de usuário/refresh, JWT expirada/futura ou
desconhecida/malformada falha. O scanner não recebe a URL do deployment, portanto classifica
sensibilidade por schema/tempo, mas não faz o binding de issuer ao ambiente — esse bloqueio é do
`environment.js`. Ele também não valida assinatura, não examina histórico Git nem substitui um
scanner consolidado de governança. Toda chave só fica operacionalmente comprovada depois de
login/smoke real no ambiente externo autorizado.
