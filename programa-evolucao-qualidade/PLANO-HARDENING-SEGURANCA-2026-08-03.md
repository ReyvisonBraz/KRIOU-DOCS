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
- [ ] Auditoria administrativa ainda não é gravada pelas operações.
- [ ] MFA/AAL2 ainda não é obrigatório para administradores.
- [ ] Não há suíte de testes reais de RLS/Edge Functions contra banco isolado.

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

- exigir MFA/AAL2 para ações administrativas mutáveis;
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

- auditoria contínua de dependências diretas e transitivas;
- lockfile obrigatório e atualizações revisadas;
- CI com SCA, secret scanning e análise estática;
- política para vulnerabilidades críticas/altas e prazo de correção;
- revisão de scripts de instalação/build e pacotes abandonados.

Aceite: CI bloqueia segredo detectado e vulnerabilidade crítica explorável.

#### S2.3 — Logs seguros e alertas

- usar logger com redação de token, CPF, e-mail, payload e segredo;
- correlação por request/evento sem conteúdo pessoal;
- alertar picos de `401`, `403`, `429`, `5xx`, falhas de webhook e auditoria;
- definir retenção, acesso e descarte de logs.

Aceite: incidente pode ser investigado sem expor dados pessoais desnecessários.

### S3 — Governança administrativa e resiliência

#### S3.1 — Modelo de papéis

- migrar papel administrativo para estrutura privada dedicada;
- separar `support`, `finance`, `admin` e `owner`;
- impedir autoalteração e remoção do último `owner`;
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
