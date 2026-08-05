# Plano de Hardening de Segurança — KRIOU-DOCS

Data-base: 2026-08-03
Escopo: aplicação web, Supabase/Postgres, Edge Functions, autenticação, painel administrativo, pagamentos, observabilidade e operação.

## Objetivo

Reduzir o risco de acesso indevido, elevação de privilégio, fraude financeira,
exposição de dados pessoais e indisponibilidade. Este plano não promete
"segurança absoluta": cada fase deve produzir evidências verificáveis e ser
reavaliada após mudanças relevantes no sistema.

## Princípios obrigatórios

- O frontend nunca é autoridade de autenticação, papel ou pagamento.
- Negar por padrão e conceder somente o privilégio necessário.
- Toda operação administrativa mutável exige autenticação reforçada, motivo e auditoria.
- Segredos e `service_role` nunca entram no bundle, log, documento ou resposta ao cliente.
- Dados pessoais e conteúdo documental não aparecem em listagens ou logs por padrão.
- Mudanças de segurança entram por migration/código versionado e possuem rollback planejado.
- Produção só avança quando os critérios de aceite do marco correspondente forem comprovados.

## Estado inicial confirmado

- [x] RLS habilitada nas tabelas principais.
- [x] Edge Functions administrativas validam usuário e papel no backend.
- [x] `service_role` permanece nas Edge Functions.
- [x] Autoelevação por `profiles.role` bloqueada pela migration `016`.
- [x] `role` e `id` protegidos por privilégios de coluna e trigger defensivo.
- [x] Campos financeiros de documentos protegidos por trigger backend-only.
- [x] `admin_audit_events` criada, sem acesso para `anon`/`authenticated`.
- [x] Operações administrativas críticas entregues gravam auditoria append-only.
- [x] A gestão de papéis e a exceção de download exigem MFA/AAL2.
- [x] Há suíte de testes reais de RLS/Edge Functions contra banco local isolado.

## Prioridade e marcos

### S0 — Bloqueadores de produção

Prazo recomendado: imediato, antes de ampliar o uso do painel.

#### S0.1 — Testes reais de autorização e RLS

- criar usuários determinísticos `user`, `admin` e `owner` em ambiente de teste;
- provar que `user` não consegue alterar `role`, `id` ou campos financeiros;
- provar isolamento entre documentos, perfis e rascunhos de usuários diferentes;
- provar `401` sem token, `403` com papel insuficiente e `200` com papel correto;
- testar tokens expirados, malformados, revogados e de outro projeto;
- executar os casos tanto via PostgREST quanto via Edge Functions.

Aceite: suíte automatizada falha se qualquer usuário comum ler/alterar dados de
outro usuário ou adquirir privilégio administrativo.

#### S0.2 — Autenticação reforçada do administrador

- [x] criar helper backend que valida AAL pela API MFA do Supabase e falha fechado;
- [x] remover bypass de download não pago baseado apenas em `profiles.role`;
- [x] comprovar que admin AAL1 recebe `403 mfa_required` na exceção protegida;
- [x] criar UI isolada para cadastro TOTP, QR secreto, chave manual, confirmação
  e reforço de sessão já cadastrada;
- [x] testar localmente criação e cancelamento do fator sem deixar cadastro órfão;
- [x] permitir segundo autenticador TOTP como fator de recuperação/reserva;
- [x] exigir desafio AAL2 antes de montar a rota e carregar dados do painel;
- [ ] exigir MFA/AAL2 para todas as ações administrativas mutáveis;
- [ ] documentar recuperação assistida e remoção auditada sem permitir a perda
  do último fator administrativo;
- [x] executar cadastro manual com autenticador real na conta administrativa;
- reautenticar antes de mudança de papel, suspensão, exportação ou reprocessamento;
- definir duração máxima da sessão administrativa e comportamento de revogação;
- impedir uso administrativo com provedor/conta não verificada.

Aceite: sessão autenticada apenas por OAuth, sem AAL2, pode consultar somente o
que for explicitamente classificado como baixo risco e não executa mutações.

#### S0.3 — Auditoria administrativa efetiva

- criar helper único para gravar `admin_audit_events`;
- registrar ator, ação, alvo, motivo, resultado, correlação e metadados mínimos;
- não registrar CPF completo, conteúdo documental, tokens ou payload financeiro bruto;
- garantir que falha de auditoria impeça mutações críticas;
- tornar eventos append-only para operadores comuns.

Aceite: toda mutação administrativa gera um evento pesquisável e não editável.

#### S0.4 — Revisão financeira ofensiva

- testar adulteração de preço, moeda, `external_reference`, usuário e documento;
- testar replay, duplicação, atraso e ordem invertida de webhooks;
- validar assinatura, janela temporal e idempotência do Mercado Pago;
- garantir que somente confirmação server-side libera documento/download;
- testar concorrência entre checkout, webhook e verificação manual.

Aceite: nenhum payload do navegador aprova pagamento, muda valor ou libera
documento; replays não duplicam efeitos.

### S1 — Hardening de perímetro e abuso

Prazo recomendado: antes do deploy público do painel administrativo.

#### S1.1 — CORS e métodos HTTP

- manter lista de origens permitidas por ambiente;
- retirar `Access-Control-Allow-Origin: *` das funções autenticadas em produção;
- rejeitar métodos não utilizados com `405`;
- validar `Origin`/`Host` como defesa adicional, sem substituir autenticação.

Aceite: origens desconhecidas falham no preflight e chamadas válidas continuam funcionando.

#### S1.2 — Rate limiting e proteção contra abuso

- limites por usuário, IP, função e tipo de operação;
- limites mais rígidos para login, exportação, busca global e reprocessamento;
- backoff e bloqueio temporário para padrões anormais;
- métricas e alertas de `429`, sem depender somente de Cloudflare/Supabase.

Aceite: rajadas controladas recebem `429` e não degradam consultas legítimas.

#### S1.3 — Headers e política do navegador

- Content-Security-Policy sem `unsafe-eval` em produção;
- `frame-ancestors`, `X-Content-Type-Options`, Referrer-Policy e Permissions-Policy;
- HSTS no domínio final;
- cookies e callbacks OAuth revisados para HTTPS e redirects permitidos mínimos.

Aceite: scanner de headers não encontra ausência crítica e o app funciona com CSP ativa.

#### S1.4 — XSS, CSRF, IDOR e injeção

- revisar todos os pontos que renderizam texto rico, HTML, PDF e nomes de arquivo;
- testar IDs de documentos/usuários trocados manualmente;
- testar filtros, paginação e parâmetros inesperados nas Edge Functions;
- confirmar que mutações autenticadas não dependem apenas de controles visuais;
- manter consultas parametrizadas e listas permitidas para ordenação/filtros.

Aceite: testes automatizados cobrem IDOR horizontal/vertical e payloads XSS comuns.

### S2 — Segredos, dependências e observabilidade

#### S2.1 — Gestão de segredos

- inventariar chaves Supabase, Mercado Pago, Resend, OAuth e Sentry;
- documentar responsável, escopo, ambiente, criação, última rotação e expiração;
- rotacionar segredos potencialmente expostos e remover cópias históricas indevidas;
- habilitar detecção de segredos em commit/CI;
- separar integralmente teste e produção.

Aceite: nenhum segredo aparece no bundle, Git, logs ou arquivos entregáveis.

#### S2.2 — Dependências e supply chain

Diagnóstico repetido em 04/08/2026 após adicionar somente o driver local
`postgres@3.4.9` (que não participa das cadeias reportadas):

| Cadeia | Uso no projeto | Risco reportado | Exposição preliminar | Tratamento |
|---|---|---|---|---|
| `eslint -> minimatch -> brace-expansion@1.1.13` | desenvolvimento/CI | DoS por expansão excessiva, dois advisories na mesma dependência | baixa para usuários do produto; ferramenta não processa padrões fornecidos pelo público | atualizar para `brace-expansion >=1.1.17` pela árvore suportada ou override temporário validado |
| `react-router-dom@7.18.1 -> react-router@7.18.1` | runtime direto | bypass de CSRF em **RSC Mode** | aparentemente não alcançável no SPA atual, que usa `BrowserRouter` e não usa ações/RSC do framework; hipótese deve ser comprovada | acompanhar versão corrigida compatível ou downgrade planejado; não usar `--force` sem testes |
| `vite@8.1.5 -> postcss@8.5.19` | desenvolvimento/build | leitura indevida de source map em entrada controlada | não participa do runtime publicado; build recebe somente código do repositório | atualizar pela cadeia oficial do Vite/PostCSS e validar build/source maps |
| `jsdom@29.0.1 -> undici@7.28.0` | testes | múltiplos advisories de parsing/cache/cookies | não participa do runtime publicado; usado pelo ambiente de testes | atualizar jsdom/undici pela árvore suportada e repetir a suíte |

Observações da auditoria:

- a auditoria completa registra 5 pacotes afetados: 4 altos e 1 moderado,
  agrupados em quatro causas (`brace-expansion`, Router/RSC, `undici` e `postcss`);
- `npm audit --omit=dev` reduz o resultado a 2 altos, `react-router` e
  `react-router-dom`, ambos referentes à mesma causa de RSC Mode;
- `npm audit fix --dry-run` propôs `brace-expansion@1.1.18`, mas a própria saída
  continuou reportando a cadeia do Router e apresentou recomendações inconsistentes
  entre atualização patch e downgrade; o resultado precisa ser confirmado com nova auditoria;
- `npm install` identificou scripts ainda não aprovados em `core-js` e duas
  instalações de `fsevents`; isso não prova comprometimento, mas exige revisão e
  política explícita antes de liberar scripts;
- o lockfile é obrigatório e qualquer correção deve ser feita em branch isolada,
  nunca por `npm audit fix --force` diretamente no `main`.

Plano de remediação:

- [ ] abrir uma branch específica de dependências a partir do `main` validado;
- [ ] registrar `npm audit --json`, `npm ls` e `npm explain` como evidência inicial;
- [ ] corrigir `brace-expansion` pela atualização da cadeia ESLint/minimatch; se
  isso não estiver disponível, testar `overrides` para `1.1.18` e documentar por
  que a API permanece compatível;
- [x] comprovar por busca de código que o projeto não usa RSC Mode,
  loaders/actions server-side ou endpoints de ação do React Router; em 03/08/2026
  foram encontrados somente `BrowserRouter`, `Routes`, `Route`, `Navigate`,
  `useNavigate` e `useLocation`;
- [ ] adicionar teste/checagem automática que impeça ativação acidental de RSC
  Mode ou actions vulneráveis enquanto a dependência permanecer afetada;
- [ ] consultar advisory e release oficial do React Router antes de selecionar a
  versão; preferir versão corrigida suportada em vez de downgrade silencioso;
- [ ] se a correção exigir downgrade/major, criar matriz de regressão para
  `BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useLocation`,
  lazy loading, OAuth callback, refresh e rota administrativa;
- [ ] executar `npm ci`, lint, `tsc --noEmit`, 321+ testes, build e E2E em instalação limpa;
- [ ] repetir `npm audit --omit=dev` para separar risco de runtime e
  `npm audit` completo para risco de desenvolvimento/CI;
- [ ] revisar scripts de instalação pendentes (`core-js`, `fsevents`) por origem,
  conteúdo, necessidade e plataforma antes de aprová-los;
- [ ] adicionar Renovate ou Dependabot com PRs pequenos, agrupamento controlado e
  execução obrigatória dos testes;
- [ ] adicionar SCA no CI com política provisória: crítica explorável bloqueia
  imediatamente; alta direta explorável bloqueia; alta não alcançável exige
  justificativa, responsável e prazo;
- [ ] gerar inventário/SBOM por release e definir retenção da evidência;
- [ ] revisar pacotes abandonados, duplicados e desnecessários trimestralmente.

Critérios de aceite:

- `npm audit --omit=dev` sem vulnerabilidade alta/critical explorável em runtime;
- auditoria completa sem alta/critical não tratada, ou exceção temporária contendo
  advisory, análise de alcançabilidade, responsável, prazo e compensação;
- instalação limpa reproduzível pelo lockfile e todos os gates aprovados;
- scripts de instalação explicitamente aprovados ou bloqueados após revisão;
- CI bloqueia segredo detectado e vulnerabilidade crítica explorável.

#### S2.3 — Logs seguros e alertas

- usar logger com redação de token, CPF, e-mail, payload e segredo;
- correlação por request/evento sem conteúdo pessoal;
- alertar picos de `401`, `403`, `429`, `5xx`, falhas de webhook e auditoria;
- definir retenção, acesso e descarte de logs.

Aceite: incidente pode ser investigado sem expor dados pessoais desnecessários.

### S3 — Governança administrativa e resiliência

#### S3.1 — Modelo de papéis

- [x] migrar papel administrativo para estrutura privada dedicada;
- [x] separar `support`, `finance`, `admin` e `owner`;
- [x] impedir autoalteração; alterações de `owner` permanecem totalmente
  bloqueadas enquanto o fluxo de segunda aprovação não existir;
- [x] exigir owner + AAL2 + motivo + idempotência para gerir os demais papéis;
- [x] gravar alteração e auditoria na mesma transação;
- [ ] implementar segunda aprovação para promover/revogar owner sem risco de
  remover o último proprietário;
- exigir dupla confirmação para promoção/revogação privilegiada;
- criar processo de acesso emergencial auditado.

Aceite: cada papel acessa somente suas capacidades e nenhuma conta gerencia o próprio papel.

#### S3.2 — Privacidade e minimização

- classificar dados pessoais e financeiros;
- mascarar CPF/e-mail em listagens;
- limitar exportações, justificar finalidade e auditar download;
- definir retenção e exclusão conforme necessidade jurídica/operacional;
- revisar conteúdo enviado a serviços externos.

Aceite: painel retorna apenas os campos necessários para cada ação/papel.

#### S3.3 — Backup, recuperação e incidentes

- confirmar backups, retenção e restauração do Supabase;
- executar teste periódico de restore em ambiente isolado;
- runbook para vazamento, fraude, conta admin comprometida e indisponibilidade;
- contatos, severidade, comunicação, preservação de evidências e pós-incidente;
- metas de RPO/RTO documentadas.

Aceite: restauração e revogação de acesso são testadas, cronometradas e documentadas.

## Estratégia de testes

Cada marco deve combinar:

1. testes unitários de validação e domínio;
2. testes de integração contra Supabase isolado;
3. testes E2E com papéis diferentes;
4. testes negativos e de abuso;
5. revisão manual das migrations, grants, policies e funções;
6. verificação pós-deploy com rollback conhecido.

Casos mínimos permanentes:

- `user -> role=admin` deve falhar;
- `user A -> documento do user B` deve falhar;
- `user -> payment_status=approved` deve falhar;
- token ausente/inválido/revogado deve falhar;
- admin sem AAL2 não executa mutação crítica;
- webhook repetido mantém um único efeito;
- falha de auditoria bloqueia mutação crítica;
- respostas e logs não contêm token, CPF completo ou `service_role`.

## Ordem recomendada de execução

1. S0.1 — testes reais de RLS/autorização;
2. S0.3 — auditoria efetiva;
3. S0.2 — MFA/AAL2;
4. S0.4 — revisão financeira ofensiva;
5. S1.1 e S1.2 — CORS, métodos e rate limiting;
6. S1.3 e S1.4 — navegador e testes de aplicação;
7. S2 — segredos, dependências e observabilidade;
8. S3 — papéis, privacidade e resiliência.

## Regra de conclusão

Um item só recebe `[x]` quando houver evidência anexável: teste automatizado,
resultado de verificação, migration aplicada, configuração revisada ou exercício
operacional documentado. Ausência de incidente não é evidência de segurança.
