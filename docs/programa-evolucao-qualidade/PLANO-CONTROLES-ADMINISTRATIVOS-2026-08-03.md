# Plano de controles administrativos — 2026-08-03

## Objetivo

Transformar o painel em uma central operacional completa para usuários,
documentos, pagamentos, downloads e incidentes, preservando segurança,
privacidade, rastreabilidade e separação de responsabilidades.

Este documento é planejamento. Nenhuma ação administrativa nova está autorizada
para implementação ou produção até sua fase ser priorizada e seus bloqueadores
de segurança estarem concluídos.

## Princípio central

O painel não terá botões genéricos como `Autorizar`, `Cancelar` ou `Marcar pago`.
Cada ação deve declarar exatamente qual estado muda, por que pode mudar, quem
pode executá-la, se é reversível e qual evidência será preservada.

## Capacidades recomendadas

### Usuários

- localizar e visualizar metadados mínimos;
- suspender e reativar acesso;
- bloquear nova autenticação por motivo de segurança;
- revogar sessões ativas;
- exigir redefinição/reautenticação quando suportado;
- consultar linha do tempo operacional;
- iniciar solicitação de exclusão/anonimização;
- alterar papel somente em fluxo de owner, nunca pela própria conta.

### Documentos

- visualizar metadados e histórico de versões;
- arquivar e restaurar;
- bloquear e desbloquear edição/download;
- cancelar documento ainda não pago/em processamento;
- corrigir título ou classificação sem abrir o conteúdo;
- abrir conteúdo somente em atendimento autorizado;
- propor edição assistida com consentimento e histórico;
- baixar cópia somente por fluxo excepcional auditado;
- excluir conforme política de retenção e confirmação backend.

### Pagamentos e entrega

- reconsultar pagamento no Mercado Pago;
- reprocessar webhook de forma idempotente;
- reenviar confirmação por e-mail;
- reconciliar divergências;
- liberar download quando o pagamento real for confirmado;
- registrar cortesia separadamente, sem falsificar status de pagamento;
- solicitar cancelamento/estorno no provedor quando aplicável;
- acompanhar resultado e falhas de cada operação.

### Operação

- atualizar painel e visualizar idade dos dados;
- registrar notas internas sem conteúdo documental desnecessário;
- atribuir caso a operador;
- abrir/fechar incidente;
- exportar metadados permitidos;
- pesquisar auditoria por operação/request ID.

## Ações que não devem existir de forma irrestrita

- marcar `payment_status = approved` manualmente;
- editar documento do cliente silenciosamente;
- baixar conteúdo em massa;
- excluir histórico financeiro;
- desbloquear a própria conta ou elevar o próprio papel;
- impersonar usuário ou obter sua sessão/token;
- alterar registro de auditoria;
- remover o último owner;
- executar mutação crítica apenas porque o botão está visível no frontend.

## Modelo de papéis

| Capacidade | `support` | `finance` | `admin` | `owner` |
|---|:---:|:---:|:---:|:---:|
| Ver usuário mascarado e metadados | sim | sim | sim | sim |
| Arquivar/restaurar documento | sim, com motivo | não | sim | sim |
| Suspender/reativar usuário | solicitar | não | sim | sim |
| Revogar sessões | solicitar | não | sim | sim |
| Ver linha financeira | resumo | sim | sim | sim |
| Reconsultar/reprocessar pagamento | não | sim | sim | sim |
| Solicitar estorno | não | sim | sim | sim |
| Aprovar estorno/cortesia | não | não | limite definido | sim |
| Abrir conteúdo do cliente | caso autorizado | não | caso autorizado | caso autorizado |
| Baixar documento do cliente | não por padrão | não | excepcional | excepcional |
| Editar documento do cliente | proposta assistida | não | proposta assistida | proposta assistida |
| Gerir papéis | não | não | não | sim |
| Ver auditoria completa | limitada | financeira | sim | sim |

Na transição, o papel atual `admin` permanece somente leitura para capacidades
novas. A separação em tabela privada deve existir antes de liberar mutações.

## Estados de domínio propostos

### Conta

`active` → `suspended` → `active`

`active/suspended` → `blocked_security` → revisão owner → `active`

`active/suspended` → `deletion_requested` → `deletion_processing` →
`deleted/anonymized`

Suspender impede uso normal, mas preserva registros. Bloqueio de segurança também
revoga sessões e exige investigação. Exclusão é um processo separado.

### Documento

- ciclo: `draft`, `awaiting_payment`, `finalized`, `cancelled`;
- visibilidade: `active`, `archived`;
- acesso: `normal`, `editing_blocked`, `download_blocked`, `legal_hold`.

Arquivar não cancela, bloquear não exclui e cancelar não significa estornar.
`legal_hold` impede exclusão até liberação autorizada.

### Pagamento

- estado do provedor: `pending`, `approved`, `rejected`, `cancelled`, `refunded`,
  `charged_back`;
- estado de conciliação: `unverified`, `matched`, `divergent`, `manual_review`;
- origem da liberação: `provider_payment`, `courtesy`, `owner_override`.

Nunca representar `courtesy` como `approved`: receita e acesso são conceitos
diferentes e precisam permanecer distinguíveis nas métricas.

## Matriz de risco das ações

| Ação | Risco | Confirmação | Reversível | Auditoria bloqueante |
|---|---|---|:---:|:---:|
| Atualizar/consultar | baixo | nenhuma | — | leitura resumida |
| Arquivar/restaurar | médio | motivo | sim | sim |
| Corrigir título/classificação | médio | motivo + antes/depois | sim, por versão | sim |
| Suspender/reativar | alto | motivo + confirmação digitada | sim | sim |
| Bloquear segurança/revogar sessões | alto | MFA/AAL2 + motivo | parcialmente | sim |
| Reconsultar pagamento | médio | motivo/caso | sim, idempotente | sim |
| Reprocessar webhook/e-mail | alto | MFA/AAL2 + motivo | idempotente | sim |
| Cortesia | crítico financeiro | MFA/AAL2 + owner/limite | não automática | sim |
| Solicitar estorno | crítico financeiro | MFA/AAL2 + resumo financeiro | depende do provedor | sim |
| Ver conteúdo | alto privacidade | caso + finalidade + MFA/AAL2 | acesso expira | sim |
| Baixar conteúdo | crítico privacidade | caso + finalidade + MFA/AAL2 | não | sim |
| Propor edição | crítico integridade | consentimento + versão | sim | sim |
| Excluir conta/dados | crítico | reautenticação + política | geralmente não | sim |

## Fase A0 — Fundação obrigatória

Bloqueia todas as demais mutações.

- [x] Migrar a autorização backend de leitura para estrutura privada com permissões;
  `profiles.role` permanece somente como compatibilidade temporária da interface.
- [x] Criar `support`, `finance`, `admin` e `owner` com matriz versionada.
- [ ] Exigir MFA/AAL2 para ação mutável ou acesso a conteúdo; helper backend e
  primeiro bloqueio negativo prontos, fluxo de cadastro e cobertura total pendentes.
- [ ] Implementar helper transacional de auditoria append-only; mudança de papel
  já é atômica com auditoria, demais mutações futuras devem reutilizar o padrão.
- [x] Adicionar `operation_id`, `request_id`, resultado e erro sanitizado à auditoria.
- [x] Criar matriz de autorização backend com negação por padrão; exposição
  segura de capacidades ao frontend permanece pendente até a decomposição da rota.
- [ ] Aplicar rate limit mais rígido a mutações, downloads e exportações.
- [ ] Definir confirmação padrão, motivo obrigatório e códigos de motivo.
- [ ] Separar ambientes e exibir produção/teste de forma inequívoca.
- [ ] Criar feature flags/kill switches por categoria de ação.

Aceite: usuário comum e papel insuficiente recebem 403; admin sem AAL2 não executa
mutação; falha da auditoria impede ação crítica.

Evidência local: migration `020` e função `admin-access` exigem `owner`, AAL2,
motivo e UUID de operação. A transação altera o papel privado, sincroniza apenas
o campo legado da interface e grava auditoria; repetição retorna o resultado sem
duplicar evento. Autoalteração e qualquer promoção/revogação de `owner` são
bloqueadas até existir fluxo de dupla aprovação.

## Fase A1 — Busca e detalhe operacional somente leitura

- [ ] Busca server-side paginada por usuário, documento, código, pagamento e request ID.
- [ ] Mascarar e-mail/CPF até existir finalidade autorizada.
- [ ] Drawer do usuário com estado, documentos, pagamentos e eventos.
- [ ] Drawer do documento apenas com metadados por padrão.
- [ ] Linha do tempo unificada sem conteúdo sensível.
- [ ] Indicadores de dados desatualizados e botão Atualizar.
- [ ] Copiar identificador gera feedback e registro somente quando necessário.
- [ ] Exportação inicial limitada a metadados e quantidade máxima.

Aceite: operador resolve triagem normal sem abrir conteúdo documental.

## Fase A2 — Arquivar, bloquear, suspender e cancelar

### Arquivar/restaurar documento

- [ ] Alterar apenas visibilidade; não mudar pagamento ou conteúdo.
- [ ] Exigir motivo e preservar estado anterior.
- [ ] Permitir reversão auditada.

### Bloquear/desbloquear documento

- [ ] Bloqueios separados para edição e download.
- [ ] Motivos: fraude suspeita, contestação, solicitação do titular, obrigação legal,
  incidente técnico e outros controlados.
- [ ] Exibir ao cliente mensagem neutra e referência de suporte.
- [ ] Definir expiração opcional e revisão obrigatória.

### Suspender/bloquear usuário

- [ ] Suspensão reversível, com início, motivo e expiração opcional.
- [ ] Bloqueio de segurança revoga sessões e impede novos logins.
- [ ] Não permitir que operador atue sobre si mesmo ou sobre owner superior.
- [ ] Proteger último owner e exigir segunda aprovação para casos críticos.

### Cancelar documento/operação

- [ ] Permitir somente antes da confirmação financeira ou em estado compatível.
- [ ] Não tratar cancelamento de documento como cancelamento/estorno financeiro.
- [ ] Se houver pagamento, direcionar para fluxo financeiro específico.

Aceite: todas as ações possuem state machine, validação de transição, motivo,
antes/depois e reversão quando aplicável.

## Fase A3 — Financeiro seguro

### Reconsulta e conciliação

- [ ] Botão `Reconsultar no Mercado Pago` usa payment ID/external reference.
- [ ] Validar usuário, documento, valor, moeda e ambiente.
- [ ] Atualizar somente a partir da resposta assinada/confiável do provedor.
- [ ] Reprocessamento idempotente não duplica receita, e-mail ou liberação.

### Cortesia em vez de “marcar pago”

- [ ] Criar entidade/registro de concessão separado do pagamento.
- [ ] Nome da ação: `Liberar como cortesia`, nunca `Marcar como pago`.
- [ ] Exigir motivo, validade, operador, aprovação e limite por período.
- [ ] Não somar cortesia à receita aprovada.
- [ ] Permitir revogação futura somente conforme termos comunicados ao cliente.
- [ ] Alertar volume anormal e impedir autocortesia.

### Cancelamento e estorno

- [ ] Diferenciar cancelar preferência, cancelar pagamento pendente e estornar pago.
- [ ] Consultar capacidades/regras atuais do provedor antes de apresentar botão.
- [ ] Mostrar valor, beneficiário, documento e irreversibilidade antes de confirmar.
- [ ] Tratar estado `requested`, `provider_processing`, `completed`, `failed`.
- [ ] Nunca apagar evento financeiro após estorno.

Aceite: painel não consegue fabricar pagamento aprovado; toda receita deriva do
provedor e toda exceção aparece separadamente nas métricas.

## Fase A4 — Visualizar, baixar e editar documentos de clientes

### Acesso excepcional ao conteúdo

- [ ] Conteúdo permanece oculto por padrão e fora das listagens.
- [ ] Operador abre um caso/ticket e informa finalidade.
- [ ] Cliente concede consentimento quando a base operacional exigir; registrar
  data, escopo e expiração sem armazenar texto excessivo.
- [ ] MFA/AAL2 e permissão específica são obrigatórios.
- [ ] Acesso expira em poucos minutos e não cria sessão do cliente.
- [ ] Exibir banner: cliente, caso, ambiente e ação auditada.
- [ ] Registrar abertura, visualização, download e encerramento do acesso.

### Download administrativo

- [ ] Criar endpoint separado do download do próprio usuário.
- [ ] Validar `documentId`, permissão, caso, finalidade e bloqueios.
- [ ] Gerar autorização de uso único e curta duração.
- [ ] Aplicar marca d'água administrativa contendo ID do caso/data, sem expor
  desnecessariamente identidade do operador ao destinatário.
- [ ] Limitar quantidade e frequência; proibir download em massa inicialmente.
- [ ] Não colocar conteúdo ou link permanente na auditoria.
- [ ] Alertar downloads repetidos ou fora do padrão.

### Edição assistida

- [ ] Não impersonar nem editar silenciosamente.
- [ ] Criar nova versão/proposta, preservando original imutável.
- [ ] Mostrar diff de campos e exigir motivo.
- [ ] Para identidade e documento pago, respeitar limites de edição existentes.
- [ ] Preferir aprovação explícita do cliente antes de tornar a versão ativa.
- [ ] Permitir rollback por versão sem apagar a trilha.
- [ ] Nunca alterar pagamento ao editar conteúdo.

Aceite: cada acesso ao conteúdo possui caso, finalidade, prazo e auditoria;
download não é reutilizável e edição nunca destrói o original.

## Fase A5 — Auditoria e supervisão

- [ ] Tela de auditoria com filtros por ator, ação, alvo, resultado e período.
- [ ] Visualizar antes/depois apenas de metadados permitidos.
- [ ] Associar ações a caso/ticket e correlation ID.
- [ ] Alertas: muitas suspensões, downloads, cortesias, estornos ou falhas.
- [ ] Relatório periódico de acessos a conteúdo de clientes.
- [ ] Revisão de permissões e contas privilegiadas.
- [ ] Kill switch para download, financeiro e edição assistida.
- [ ] Runbooks para conta admin comprometida, fraude e vazamento.

Aceite: owner consegue investigar uma ação sem depender de logs efêmeros e pode
desabilitar rapidamente uma capacidade comprometida.

## Fase A6 — Experiência do painel

### Navegação

1. Visão geral;
2. Usuários;
3. Documentos;
4. Pagamentos;
5. Casos e incidentes;
6. Auditoria;
7. Configurações e permissões.

### Padrão de tela de detalhe

- cabeçalho com estado e alertas;
- resumo de metadados;
- ações permitidas retornadas pelo backend;
- linha do tempo;
- conteúdo sensível fechado por padrão;
- confirmação em modal com consequência, motivo e ambiente;
- resultado com `operationId` copiável para suporte.

### Prevenção de erro humano

- cores não são a única indicação de risco;
- produção sempre identificada;
- ação crítica exige digitar identificador/nome curto do alvo;
- botões destrutivos não ficam próximos de navegação comum;
- resumo final mostra usuário, documento, valor e efeito;
- impedir duplo clique e repetir ação idempotentemente;
- mensagens explicam se a ação foi concluída, rejeitada ou ficou incerta.

## Endpoints administrativos propostos

Evitar um único endpoint genérico com `action` para todas as mutações. Separar
contratos e políticas por recurso, por exemplo:

- `GET /admin-users`, `POST /admin-users/suspend`, `POST /admin-users/reactivate`;
- `GET /admin-documents`, `POST /admin-documents/archive`,
  `POST /admin-documents/block`;
- `POST /admin-payments/reconcile`, `POST /admin-payments/refund-request`;
- `POST /admin-grants/courtesy`;
- `POST /admin-document-access/request`, `POST /admin-document-access/download`;
- `POST /admin-document-revisions/propose`;
- `GET /admin-audit`.

Cada endpoint deve aplicar autenticação, AAL2, capacidade, validação, rate limit,
idempotência, auditoria e resposta sanitizada em uma camada compartilhada.

## Testes obrigatórios

- matriz completa papel × ação × estado do alvo;
- 401, 403, token expirado/revogado e AAL insuficiente;
- IDOR trocando IDs de usuário/documento/pagamento;
- tentativa de agir sobre si mesmo, owner ou último owner;
- transição de estado inválida;
- repetição, concorrência, timeout e falha da auditoria;
- divergência de valor/moeda/ambiente do pagamento;
- cortesia não entra em receita;
- download expira, é de uso único e respeita bloqueio;
- edição cria versão, preserva original e exige aprovação quando aplicável;
- respostas, logs e auditoria sem token, CPF ou conteúdo documental;
- responsividade e acessibilidade dos modais críticos.

## Ordem recomendada

1. A0 — papéis, MFA, auditoria e guardrails;
2. A1 — operação somente leitura;
3. A2 — ações reversíveis e bloqueios;
4. A3 — conciliação financeira; cortesia/estorno por último dentro da fase;
5. A4 — conteúdo, download e edição assistida;
6. A5 — supervisão e alertas;
7. A6 — refinamento contínuo da experiência.

## Recomendação de escopo para a próxima entrega

Entregar primeiro:

- busca/paginação de usuários e documentos;
- detalhe somente leitura e linha do tempo;
- arquivar/restaurar documento;
- suspender/reativar usuário;
- bloquear/desbloquear edição e download;
- botão Atualizar com idade dos dados;
- auditoria efetiva de todas essas ações.

Deixar para uma entrega posterior, após MFA e papéis separados:

- cortesia e estorno;
- download de documento de cliente;
- acesso ao conteúdo;
- edição assistida;
- exclusão de conta.

## Critério de conclusão

Uma capacidade só é concluída quando código, migration, autorização negativa,
auditoria, E2E, rollback/compensação e verificação pós-deploy estiverem registrados.
