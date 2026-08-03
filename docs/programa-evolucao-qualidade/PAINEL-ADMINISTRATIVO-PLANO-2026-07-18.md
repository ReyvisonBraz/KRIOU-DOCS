# Plano do Painel Administrativo — Kriou Docs

## Objetivo

Criar uma central operacional segura para acompanhar usuários, documentos, pagamentos e falhas, sem expor o conteúdo pessoal dos documentos por padrão e sem transformar o frontend em autoridade administrativa.

## Princípios

- Toda ação administrativa é validada pela Edge Function e pelo papel armazenado no banco.
- Listagens retornam metadados mínimos; conteúdo documental não aparece por padrão.
- Ações mutáveis exigem confirmação, motivo e registro de auditoria.
- Nenhuma ação financeira altera pagamento diretamente; reprocessamento consulta o provedor e aplica regras idempotentes.
- O painel deve funcionar a partir de 320 px, mas tabelas densas viram cartões no celular.
- Administrador não pode promover a própria conta nem apagar o último administrador.

## Perfis de acesso propostos

| Papel | Capacidades |
|---|---|
| `support` | localizar usuário, visualizar metadados e orientar o cliente |
| `finance` | conciliação, reprocessamento e consulta de eventos financeiros |
| `admin` | operação geral, downloads ilimitados dos próprios documentos e gestão não destrutiva |
| `owner` | permissões administrativas críticas e gestão de papéis |

Na primeira versão, `admin` continua sendo o único papel privilegiado. A separação acima entra antes de ações financeiras ou destrutivas.

## Navegação proposta

1. **Visão geral** — usuários, documentos, pagamentos aprovados/pendentes/recusados, falhas recentes e tendência por período.
2. **Usuários** — busca por nome/e-mail/ID, estado da conta, quantidade de documentos e último acesso.
3. **Documentos** — código, tipo, estado, pagamento, proprietário e datas; conteúdo oculto por padrão.
4. **Pagamentos** — conciliação, preferência, pagamento, webhook, e-mail e download autorizado.
5. **Eventos e erros** — correlação, função, código seguro, horário, tentativas e resolução.
6. **Configurações** — papéis, parâmetros comerciais, modelos ativos e saúde das integrações.
7. **Auditoria** — quem fez, o quê, alvo, motivo, antes/depois seguro e resultado.

## Fases de execução

### P01 — Fundação segura

- [x] Rota protegida por papel do perfil.
- [x] Endpoint administrativo autenticado e validado server-side.
- [x] Corrigir obtenção de e-mail pela API administrativa de autenticação.
- [x] Remover consulta N+1 da contagem de documentos.
- [x] Restringir lista de documentos a metadados.
- [ ] Criar tabela `admin_audit_events` com RLS bloqueada para clientes.
- [ ] Adicionar paginação, limites máximos e busca server-side.

Aceite: usuário comum recebe 403; nenhuma lista retorna `form_data` ou `legal_data`; 100 usuários não geram 100 consultas extras.

### P02 — Operação de usuários e documentos

- busca e filtros combináveis;
- tela detalhada do usuário com linha do tempo;
- cartões responsivos no celular;
- copiar IDs/códigos com confirmação visual;
- arquivar/restaurar documento mediante motivo;
- suspender conta sem excluir histórico obrigatório.

Aceite: todas as mutações auditadas e reversíveis; nenhum conteúdo sensível visível na listagem.

### P03 — Financeiro somente leitura

- funil criado → preferência → aprovado/recusado;
- divergências entre documento, webhook e Mercado Pago;
- pagamentos sem documento e documentos sem confirmação;
- estado do e-mail transacional e downloads autorizados;
- exportação CSV sem dados documentais.

Aceite: painel nunca marca pagamento como aprovado manualmente.

### P04 — Reprocessamento seguro

- reenviar e-mail;
- reconsultar pagamento no provedor;
- reprocessar webhook idempotente;
- liberar download somente após confirmação backend;
- registrar motivo, operador e resultado.

Aceite: repetir a ação não duplica efeitos nem altera o documento errado.

### P05 — Observabilidade e produção

- indicadores de erro e latência por Edge Function;
- alertas para webhook, confirmação e e-mail;
- período e comparação de métricas;
- exportação de auditoria;
- testes E2E com contas `user` e `admin` determinísticas.

Aceite: incidente financeiro pode ser rastreado por correlação sem visualizar conteúdo ou PII desnecessária.

## Primeira entrega visual

- cabeçalho com ambiente (`Produção`/`Teste`) e saúde geral;
- quatro indicadores: usuários, documentos, pagamentos aprovados e pendências;
- gráfico diário de documentos/pagamentos;
- lista curta de falhas que exigem ação;
- abas Usuários e Documentos com busca, filtros e paginação;
- drawer lateral para detalhes, preservando o contexto da lista.

## Fora do escopo inicial

- editar o conteúdo do documento de outro usuário;
- baixar documentos de outros usuários sem consentimento/processo auditado;
- aprovar pagamento manualmente;
- excluir definitivamente registros financeiros;
- promover administradores apenas pelo frontend.
