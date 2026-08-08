# Etapa 05 — Dados, Supabase e serviços

## Tarefas

- documentar schema e estados de domínio;
- adicionar constraints, índices compostos e unicidade necessária;
- padronizar migrations numeradas e rollback operacional;
- testar RLS para usuário, anônimo e administrador;
- remover queries N+1 do admin;
- separar DTOs do banco dos modelos de UI;
- centralizar tratamento e classificação de erros;
- criar idempotência para comandos críticos;
- definir retenção, backup e restauração.

## Critérios de aceite

- banco rejeita estados inválidos mesmo fora do frontend;
- migrations sobem do zero em ambiente limpo;
- usuário nunca lê ou altera dados de outro usuário;
- erros têm código estável e mensagem segura;
- consultas críticas têm plano e índice verificados.

