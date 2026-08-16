# SEC2.1 — Auth + RLS controlados em produção

Este procedimento se limita às duas contas novas do ensaio e aos UUIDs gerados pelo novo
`run_id`. Os 3 perfis, 10 documentos e 8 drafts classificados anteriormente são preservados e
nunca entram nos filtros de escrita ou limpeza.

## Bloqueio humano antes da primeira escrita

O executor não cria nem remove usuários e nunca usa `service_role`. Um responsável com sessão no
Dashboard deve:

1. Garantir que runner, biblioteca, validador de chave e lockfile estejam commitados. O executor
   falha fechado se qualquer uma dessas fontes tiver diff staged/unstaged ou estiver untracked;
   arquivos ignorados como `.env.sec21.local` não invalidam o preflight.
2. Em **Authentication → Users**, criar duas contas sintéticas novas, exclusivas do SEC2.1 e já
   confirmadas. Usar endereços não pessoais sob domínio controlado e senhas aleatórias locais.
3. Registrar os dois UUIDs exibidos pelo Dashboard. Não reutilizar usuário preexistente.
4. Copiar `scripts/sec21.env.example` para `.env.sec21.local`, preencher localmente a URL pública,
   a chave publishable/anon e as credenciais das duas contas, e executar `chmod 600
   .env.sec21.local`. Nunca passar esses valores como argumentos, chat, log ou arquivo versionado.
5. Confirmar que `git check-ignore .env.sec21.local` encontra o arquivo e que o project-ref é
   exatamente `uyptmlezmdzfufzuknfz`.

Sem esses passos, a execução permanece bloqueada. Não buscar chaves por CLI, não copiar secrets de
Edge Functions e não substituir a chave pública por `service_role`.

## Execução manual

```sh
npm run verify:production-rls -- --env-file .env.sec21.local
```

O script usa dois clientes Supabase autenticados comuns, com sessão sem persistência. Ele:

- valida que cada login corresponde ao UUID esperado;
- trata `profiles` como read-only: A apenas lê o próprio id; B tenta leitura sensível, update
  idempotente de `id` e insert duplicado, que precisam afetar zero linhas ou falhar;
- persiste antes da escrita um manifesto temporário `0600` somente com os UUIDs do run;
- para a bateria no primeiro vazamento, write cruzado ou resposta inesperada;
- tenta a limpeza apenas pelos UUIDs exatos e pelo owner esperado, mesmo depois de uma parada;
- imprime somente o relatório sanitizado: timestamp, `run_id`, ref público, commit, digest SHA-256
  determinístico das fontes executadas, aliases irreversíveis, cenário, contagem e código de erro;
- retém o caminho do manifesto local se a limpeza não for comprovada, sem imprimir seu conteúdo.

Nunca redirecione logs de debug do SDK para a evidência e nunca altere o script para imprimir
objetos de resposta.

## Limpeza humana das contas

Depois de `records_cleanup=verified`, o responsável deve voltar a **Authentication → Users** e
excluir somente os dois UUIDs novos registrados no passo 2. A exclusão ampla, os usuários
preexistentes e qualquer outro registro continuam proibidos. A execução só está concluída depois
de o Dashboard confirmar que ambos os UUIDs não existem mais.

Se o relatório indicar `stopped`, `failed`, `blocked_cleanup_failed` ou
`recovery_manifest_retained=true`, não afirmar conclusão e não apagar o manifesto temporário até a
recuperação por UUID exato ser resolvida.
