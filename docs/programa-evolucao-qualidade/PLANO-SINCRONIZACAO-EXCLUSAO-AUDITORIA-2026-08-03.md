# Plano de sincronização, exclusão e auditoria — 2026-08-03

## Objetivo

Tornar exclusões e atualizações previsíveis, rápidas e comprováveis, sem depender
de sincronização em tempo real nesta primeira versão. O sistema deve diferenciar
claramente estado local, confirmação do servidor e atualização do painel admin.

Este documento é planejamento. Nenhuma mudança funcional desta frente deve ser
implementada antes de sua priorização explícita.

## Decisões

- O banco continua sendo a fonte de verdade.
- Documento só desaparece definitivamente da tela após confirmação do servidor.
- Durante a requisição, o card permanece visível, bloqueado e com estado
  `Excluindo...`; cliques repetidos não geram novas operações.
- Falha restaura integralmente a interface e mostra mensagem acionável.
- O painel começa com atualização manual e por eventos do navegador, sem
  assinatura Realtime permanente.
- Polling automático, se habilitado, será exclusivo do admin, pausado em aba
  oculta e configurável. Realtime só entra após medir necessidade e consumo.
- Auditoria registra quem, quando, qual ação, resultado e identificadores
  técnicos; nunca conteúdo documental, token, CPF ou payload bruto.
- “Excluir meus dados” não pode prometer exclusão do servidor enquanto realizar
  apenas limpeza local.

## Metas operacionais iniciais

São objetivos de produto, não garantias absolutas de rede:

| Operação | Meta inicial |
|---|---:|
| Feedback visual após confirmar | até 100 ms |
| Exclusão normal confirmada | p95 até 2 s |
| Aviso de operação lenta | após 3 s |
| Timeout controlado | 10 s |
| Atualização manual do admin | p95 até 3 s |
| Estado máximo desatualizado sem Realtime | até novo refresh/foco; polling opcional de 60 s |

Antes de otimizar servidor ou infraestrutura, instrumentar duração no cliente,
Edge Function e banco para separar latência de rede, cold start e consulta SQL.

## Fase D0 — Correção de linguagem e contrato

Prioridade: crítica.

- [x] Renomear temporariamente “Excluir meus dados” para “Limpar dados deste
  dispositivo e sair”, descrevendo exatamente seu efeito atual.
- [x] Separar os conceitos `limpar dispositivo`, `excluir documento` e
  `excluir conta e dados do servidor`.
- [ ] Definir contrato de resposta comum: `success`, `operationId`, `deletedId`,
  `completedAt` e erro público com código estável.
- [ ] Definir estados de UI: `idle`, `confirming`, `deleting`, `success`, `error`.
- [ ] Padronizar mensagens sem revelar detalhes internos:
  - sucesso: “Documento excluído com segurança.”;
  - lentidão: “A exclusão está demorando mais que o normal. Aguarde.”;
  - falha: “Não foi possível excluir. O documento continua disponível. Tente novamente.”;
  - estado incerto: “Não foi possível confirmar o resultado. Atualize a lista antes de repetir.”

Aceite: nenhuma mensagem promete exclusão que não tenha sido confirmada pelo backend.

## Fase D1 — Exclusão confiável de documento

Prioridade: alta.

### Fluxo esperado

1. cliente solicita confirmação irreversível;
2. card entra em `deleting`, permanece na lista e bloqueia ações;
3. backend valida sessão, propriedade, ID e política de retenção;
4. banco executa o `DELETE` com filtro por `id` e `user_id`;
5. operação exige retorno da linha/ID excluído; zero linhas é falha ou resultado
   idempotente explicitamente diferenciado;
6. auditoria registra sucesso ou falha usando `operationId`;
7. somente após sucesso o frontend remove o card e o cache local;
8. em falha, o card volta ao estado anterior e uma mensagem orienta o usuário.

### Tarefas

- [ ] Alterar `DocumentService.remove` para receber `documentId` e `userId`.
- [ ] Exigir `.select('id').single()` ou RPC equivalente para provar a exclusão.
- [ ] Avaliar Edge Function/RPC transacional para exclusão + auditoria atômicas.
- [ ] Impedir operação duplicada com trava local e `operationId` idempotente.
- [ ] Não remover antecipadamente `userDocuments` nem `localStorage`.
- [ ] Em sucesso, invalidar/refazer a consulta de documentos em segundo plano.
- [ ] Em resposta incerta por timeout, consultar o documento antes de repetir.
- [ ] Preservar RLS e testar tentativa de excluir documento de outro usuário.
- [ ] Testar sucesso, 401, 403, inexistente, timeout, offline, resposta 500 e
  clique duplo.
- [ ] Medir duração e registrar apenas código, operação, ambiente e correlation ID.

Aceite: falha nunca faz um documento existente parecer definitivamente excluído;
sucesso é comprovado no banco e sobrevive a reload.

## Fase D2 — Atualização do painel administrativo

Prioridade: alta.

### Estratégia inicial sem Realtime

- [ ] Criar botão `Atualizar` que recarrega métricas, estatísticas e usuários em
  uma única ação coordenada.
- [ ] Mostrar `Atualizado há X segundos` e o horário da última tentativa.
- [ ] Desabilitar o botão durante execução, sem apagar os dados antigos.
- [ ] Atualizar ao abrir `/admin`, trocar período, voltar o foco para a aba e
  recuperar conexão após ficar offline.
- [ ] Evitar requisições duplicadas com deduplicação/cancelamento.
- [ ] Se uma fonte falhar, preservar as demais e indicar qual bloco está antigo.
- [ ] Adicionar `Cache-Control: no-store` onde dados administrativos não podem
  ser reutilizados indevidamente.
- [ ] Avaliar polling de 60 segundos somente quando `/admin` estiver visível;
  pausar em `document.hidden`, offline ou após falhas repetidas.
- [ ] Aplicar backoff: 60 s, 120 s, 300 s; botão manual continua disponível.
- [ ] Instrumentar quantidade, duração, status e volume das chamadas.

O polling não deve ser ativado por padrão antes de medir o custo das consultas.
Com uma aba admin aberta 8 horas por dia, intervalo de 60 segundos representa
aproximadamente 14.400 ciclos por mês; cada ciclo atual chama mais de um endpoint.

Aceite: o admin conhece a idade dos dados e consegue atualizá-los sem reload da página.

## Fase D3 — Realtime condicionado a necessidade

Prioridade: futura.

### Decisão de entrada

Só implementar se pelo menos uma condição ocorrer:

- operação exige atualização em menos de 10 segundos;
- polling mensuravelmente pesa mais que uma assinatura;
- mais de um operador administra simultaneamente;
- incidentes mostram decisões tomadas com dados antigos;
- produto passa a exigir fila operacional ao vivo.

### Desenho econômico

- [ ] Assinar apenas no painel admin autenticado, nunca em todas as páginas.
- [ ] Preferir evento pequeno de invalidação, sem conteúdo documental.
- [ ] Ao receber evento, refazer consulta autorizada; não confiar no payload
  Realtime como fonte integral.
- [ ] Um canal por sessão admin, com cleanup garantido ao sair da rota/logout.
- [ ] Filtrar tabelas/eventos necessários e evitar presença/broadcast desnecessários.
- [ ] Monitorar mensagens, pico de conexões, reconexões, lag e erros de quota.
- [ ] Manter botão manual e refresh por foco como fallback.
- [ ] Definir limite interno de alerta em 50%, 75% e 90% da quota contratada.

Referência de capacidade consultada em 03/08/2026: o plano Free informa 2 milhões
de mensagens mensais, 200 conexões simultâneas e 100 mensagens por segundo. Uma
mudança de banco conta uma mensagem para cada cliente inscrito. Esses números
devem ser verificados novamente antes da implementação, pois são comerciais.

Aceite: queda ou indisponibilidade do Realtime degrada para atualização manual,
sem bloquear operações e sem gerar tempestade de reconexões.

## Fase D4 — Auditoria backend

Prioridade: alta para operações destrutivas.

- [ ] Evoluir `admin_audit_events` ou criar trilha operacional específica com:
  `operation_id`, `actor_id`, `action`, `target_type`, `target_id`, `result`,
  `error_code`, `request_id`, `created_at` e metadados sanitizados.
- [ ] Registrar tentativa, sucesso e falha no backend; o cliente nunca grava auditoria.
- [ ] Tornar `operation_id` único para idempotência.
- [ ] Restringir tabela a `service_role`; sem leitura por `anon`/`authenticated`.
- [ ] Impedir UPDATE/DELETE da trilha pelo backend normal; correção exige processo
  operacional privilegiado e documentado.
- [ ] Definir retenção e anonimização conforme finalidade/LGPD.
- [ ] Não armazenar título, conteúdo, CPF, e-mail em claro, token ou payload completo.
- [ ] Criar visualização admin filtrável por ação, resultado, data e request ID.
- [ ] Alertar aumento anormal de falhas e exclusões repetidas.
- [ ] Testar que uma falha na auditoria não produz exclusão sem rastreio; usar
  transação/RPC quando exclusão e evento precisarem ser atômicos.

Aceite: toda operação destrutiva relevante possui evidência backend pesquisável,
sanitizada e correlacionável.

## Fase D5 — Exclusão real de conta e dados pessoais

Prioridade: alta, dependente de decisão jurídica de retenção.

- [ ] Mapear dados por usuário: Auth, profile, documents, drafts, pagamentos,
  webhooks, e-mails, logs, backups e auditoria.
- [ ] Definir o que pode ser apagado, anonimizado ou deve ser retido por obrigação
  legal/financeira; validar com responsável jurídico/contábil.
- [ ] Exigir sessão recente e confirmação reforçada; considerar reautenticação.
- [ ] Implementar endpoint backend exclusivo; nunca expor `service_role` ao cliente.
- [ ] Criar solicitação com `operationId` e estado `requested/processing/completed/failed`.
- [ ] Cancelar ou bloquear operações financeiras pendentes antes da exclusão.
- [ ] Apagar/anonimizar dependências em ordem transacional e, por último, remover
  o usuário de `auth.users` quando adequado.
- [ ] Preservar recibo de conclusão sem PII e comunicar claramente exceções de retenção.
- [ ] Definir prazo, retentativa, suporte e procedimento de recuperação de falha parcial.
- [ ] Cobrir concorrência, repetição, logout, conta inexistente e falha intermediária.

Aceite: usuário recebe confirmação honesta do alcance da exclusão; nenhuma conta
é removida deixando dados pessoais órfãos ou fluxo financeiro inconsistente.

## Ordem recomendada

1. D0 — corrigir promessa e contrato;
2. D1 — exclusão confiável de documento;
3. D2 — atualização econômica do admin;
4. D4 — auditoria backend transacional;
5. D5 — exclusão real de conta, após política de retenção;
6. D3 — Realtime somente se os dados justificarem.

## Evidências obrigatórias

- testes unitários do contrato e estados de UI;
- E2E com usuário dono e usuário não proprietário;
- teste de reload após sucesso e após falha;
- teste real de RLS;
- migration reproduzível do zero e rollback operacional;
- métricas de p50/p95 e taxa de erro sem PII;
- prova de auditoria para sucesso e falha;
- revisão de quota/custo antes de habilitar polling ou Realtime.
