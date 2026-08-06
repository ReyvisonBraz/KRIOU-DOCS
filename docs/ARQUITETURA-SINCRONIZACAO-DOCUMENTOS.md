# Arquitetura de sincronização de documentos

## Fonte de verdade

| Dado | Fonte oficial | Cópia local | Regra |
|---|---|---|---|
| Documento finalizado ou em pagamento | `public.documents` | Estado React | O servidor sempre prevalece |
| Documento na lixeira | `public.documents.deleted_at` | Estado React | Não aparece nas visões comuns |
| Rascunho | `public.document_drafts` | `localStorage` | Prevalece a versão com `updated_at` mais recente |
| Sessão | Supabase Auth | Storage do SDK | Nunca duplicar em storage próprio |

Não deve existir cache Redis com o conteúdo dos documentos. São dados privados,
mutáveis e já indexados por usuário no PostgreSQL. Redis só passa a fazer sentido
para contadores de rate limit, idempotência e jobs, nunca como segunda fonte de verdade.

## Ciclo de sincronização

1. A interface atualiza o formulário imediatamente.
2. O autosave aguarda 1,5 segundo sem novas alterações.
3. O rascunho é salvo localmente para recuperação offline.
4. A mesma versão é enviada para `document_drafts`.
5. A interface só comunica sincronização quando a gravação na nuvem responde.
6. Eventos do Supabase Realtime disparam reconciliação em outras abas/dispositivos.
7. Na reconciliação, documentos do servidor prevalecem; somente rascunhos locais são mesclados.

Ao descartar um rascunho, o timer pendente é cancelado antes da remoção local e
remota. Isso impede que uma gravação atrasada recrie o item excluído.

## Exclusão e lixeira

- Primeira exclusão: define `deleted_at` e `deleted_by`.
- Restauração: limpa os dois campos.
- Exclusão definitiva: `DELETE`, após confirmação separada.
- Rascunhos continuam sendo descartados definitivamente nas duas fontes.
- Uma rotina de retenção poderá apagar itens da lixeira após 30 dias quando a
  política de produto e privacidade for aprovada.

## Rate limit e cache

O debounce do autosave é a primeira proteção contra excesso de gravações. Em
produção, os limites de API devem ficar no gateway/Edge Functions e ser medidos
por usuário autenticado, operação e IP. Redis pode ser introduzido quando houver
mais de uma instância de backend ou jobs assíncronos. Limites iniciais sugeridos:

- autosave: uma operação simultânea por tipo de rascunho;
- criação: 10 documentos por minuto por usuário;
- lixeira/restauração: 20 operações por minuto por usuário;
- geração de PDF e checkout: limites próprios por custo e idempotency key.

Não é recomendado aplicar rate limit apenas no navegador, pois ele pode ser
contornado. O cliente deve apenas reduzir chamadas; a autoridade fica no servidor.

## Ambiente Docker local

O Supabase CLI já orquestra PostgreSQL, Auth, PostgREST, Realtime e Edge Runtime
em Docker. Um `docker-compose.yml` paralelo para esses mesmos serviços criaria
duas configurações concorrentes. O fluxo oficial do projeto é:

```bash
npx supabase start
npx supabase db reset
npm run test:documents:local
npm run test:security:local
npm run test:e2e:local
```

Redis deve ser adicionado ao Compose somente quando existir um consumidor real
de idempotência, rate limit distribuído ou fila. Até lá, PostgreSQL + Realtime é
a arquitetura menor, mais observável e mais confiável para este produto.
