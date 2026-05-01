# Bugs Conhecidos e Evolucao do Kriou Docs

> Documento de consulta para melhorias futuras.
> Cada bug documenta: causa raiz, impacto, correcao aplicada e como evitar.

---

## Bug #1 — Filtro de Abas no Dashboard (CORRIGIDO)

**Arquivo**: `src/pages/DashboardPage.jsx`
**Linha**: ~61 (versao original)

### Causa
O tabs de filtro usava `doc.type === activeTab` para TODOS os tipos de documento.
- Curriculos sao salvos como `doc.type = "resume"` (no `DocumentService`)
- Mas a aba de curriculos estava configurada como `id: "curriculo"`
- **Match nunca funcionava** — a aba "Curriculos" sempre mostrava 0 documentos

### Impacto
Usuarios nao conseguiam filtrar apenas curriculos no Dashboard.

### Correcao
1. Trocado `id: "curriculo"` para `id: "resume"` (linha 38)
2. Trocado `doc.type === "curriculo"` para `doc.type === "resume"` (linha 61)
3. Corrigido tambem o filtro de documentos juridicos: agora filtram por `doc.documentType` em vez de `doc.type`

### Como evitar no futuro
- **Sempre verificar** o valor real salvo no banco antes de criar filtros
- Usar constantes compartilhadas (`DOC_TYPE_RESUME = "resume"`) em vez de strings literais
- Testar cada aba de filtro com dados reais

---

## Bug #2 — Permissao `anon` no Supabase (CORRIGIDO)

**Arquivo**: `supabase/migrations/001_initial_schema.sql`
**Linha**: 112-113 (versao original)

### Causa
```sql
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON documents TO anon, authenticated;
```
Usuarios nao autenticados (anon) tinham permissao de INSERT/UPDATE/DELETE em ambas as tabelas.

### Impacto
Embora o RLS (Row Level Security) restringisse o acesso a proprios registros,
um usuario anon ainda poderia:
- Fazer INSERT em `profiles` com `id` de outro usuario (se souber o UUID)
- Fazer INSERT em `documents` com `user_id` arbitrario
- Consumir recursos do banco sem autenticacao

### Correcao
Removido `anon` dos GRANTs:
```sql
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON documents TO authenticated;
```

### Como evitar no futuro
- **Nunca** dar permissao de escrita para `anon`
- Sempre revisar migrations de banco com checklist de seguranca
- Testar RLS fazendo requisicoes sem token de autenticacao

---

## Bug #3 — Bootstrap ignorado na Welcome Page (CORRIGIDO)

**Arquivo**: `src/context/AppContext.jsx`
**Linha**: 90-92 (versao original)

### Causa
```javascript
const isAuthPage = currentPage === "authCallback"
                || currentPage === "completeProfile"
                || currentPage === "welcome"   // <-- AQUI
                || window.location.pathname === "/auth/callback";
```

Quando o usuario estava na `welcome` page, `isAuthPage` era `true`, entao o
`AppBootstrap` **nunca executava** `init()`. Isso impedia o carregamento de:
- Perfil do usuario
- Documentos do Supabase
- Drafts do localStorage

### Impacto
Usuario fazia login, via welcome page, navegava para dashboard, e os dados
nao estavam carregados (profile null, docs vazios).

### Correcao
Removido `"welcome"` da lista `isAuthPage`. A welcome page precisa carregar
dados em background para quando o usuario navegar para o dashboard.

### Como evitar no futuro
- `isAuthPage` deve conter APENAS paginas que sao parte do fluxo de auth
  (authCallback, completeProfile)
- Paginas pos-login (welcome, dashboard) SEMPRE devem carregar dados
- Pensar: "essa pagina precisa de dados do Supabase?" Se sim, nao e auth page

---

## Bug #4 — `triggerSave` com Stale Closure (CORRIGIDO)

**Arquivo**: `src/hooks/useAutoSave.js`
**Linha**: ~38 (versao original)

### Causa
```javascript
const triggerSave = useCallback(async () => {
  await saveFnRef.current(data);  // 'data' do closure — pode estar desatualizado
}, [data]);
```

O `triggerSave` capturava `data` do closure no momento em que era criado.
Se `data` mudasse depois, `triggerSave` ainda usaria o valor antigo.

### Impacto
Ao chamar `triggerSave()` manualmente (ex: ao sair da pagina), os dados salvos
podiam estar desatualizados — perdendo a ultima alteracao do usuario.

### Correcao
Adicionado `dataRef` para sempre acessar o valor mais recente:
```javascript
const dataRef = useRef(data);
useEffect(() => { dataRef.current = data; }, [data]);

const triggerSave = useCallback(async () => {
  await saveFnRef.current(dataRef.current);  // sempre o valor atual
}, []);
```

### Como evitar no futuro
- Em hooks com `useCallback` + `setTimeout`, sempre usar `useRef` para dados
  que mudam com frequencia
- `triggerSave` nunca deve depender de `data` no array de dependencias
- Padrao: `dataRef` + `saveFnRef` para evitar stale closures

---

## Bug #5 — Logs sem Prefixo Identificavel (CORRIGIDO)

**Arquivo**: Multiplos arquivos

### Causa
Logs espalhados pelo codigo com formatos inconsistentes:
- `console.log("[AuthContext] render:", ...)`
- `console.error("Error saving document:", ...)`
- `console.warn("Credentials not configured", ...)`

Sem padrao unificado, era dificil filtrar logs no console.

### Correcao
Unificado todos os logs para o padrao:
- `[NomeModulo] mensagem` — logs informativos
- `[NomeModulo][ERRO] mensagem` — erros recuperaveis
- `[NomeModulo][ERRO_CRITICO] mensagem` — erros que impedem funcionamento

### Como evitar no futuro
- Sempre seguir o padrao `[NomeModulo]` no inicio de todo log
- Usar `[ERRO]` para erros tratados, `[ERRO_CRITICO]` para fatais
- Preferir `console.error` para erros, `console.warn` para avisos

---

## Bug #6 — Query sem Filtro `user_id` (CORRIGIDO)

**Arquivo**: `src/services/DocumentService.js`
**Linha**: 14-19 (versao original)

### Causa
```javascript
async fetchAll() {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("status", "finalizado")
    .order("created_at", { ascending: false });
```

A query nao filtrava por `user_id`. Embora o RLS bloqueasse registros de
outros usuarios, a query trafegava dados desnecessarios do banho para o client.

### Impacto
- Performance: trafego de dados maior que o necessario
- Seguranca: dependencia exclusiva de RLS (sem defesa em profundidade)

### Correcao
Adicionado parametro `userId` e filtro explícito:
```javascript
async fetchAll(userId = null) {
  let query = supabase.from("documents").select("*").eq("status", "finalizado");
  if (userId) {
    query = query.eq("user_id", userId);
  }
  // ...
}
```

### Como evitar no futuro
- Sempre filtrar por `user_id` nas queries (defesa em profundidade)
- Nao confiar APENAS em RLS para filtrar dados
- Validar que o userId recebido corresponde ao usuario autenticado

---

## Bug #7 — Delecao sem Tratamento de Erro (CORRIGIDO)

**Arquivo**: `src/pages/DashboardPage.jsx`
**Linha**: 88-91 (versao original)

### Causa
```javascript
const updated = (userDocuments || []).filter((d) => d.id !== doc.id);
setUserDocuments(updated);
StorageService.saveDocuments(updated, userId);
showToast.success("Documento excluido.");
```

`StorageService.saveDocuments` podia falhar (localStorage cheio, etc.) sem
nenhum tratamento — o documento sumia da UI mas o usuario nao era avisado.

### Impacto
Usuario via confirmacao de sucesso ("Documento excluido.") mesmo quando o
save no localStorage falhava. Ao recarregar, o documento reaparecia.

### Correcao
Adicionado try/catch com feedback:
```javascript
try {
  StorageService.saveDocuments(updated, userId);
  showToast.success("Documento excluido.");
} catch (err) {
  console.error("[DashboardPage][ERRO] saveDocuments falhou:", err.message);
  showToast.error("Erro ao salvar. Tente novamente.");
}
```

### Como evitar no futuro
- Toda operacao de escrita em storage deve ter try/catch
- Feedback ao usuario deve ser honesto sobre o estado real dos dados
- Operacoes otimistas (UI atualizada antes da confirmacao) precisam de rollback

---

## Bug #8 — ErrorBoundary Duplicado (CORRIGIDO)

**Arquivo**: `src/App.jsx`
**Linha**: 90-95 (versao original)

### Causa
```jsx
<ErrorBoundary>
  <ThemeProvider>
    <AppProvider>
      <ErrorBoundary>   {/* <-- Duplicado */}
        <PageRouter />
      </ErrorBoundary>
      <Toaster />
    </AppProvider>
  </ThemeProvider>
</ErrorBoundary>
```

### Impacto
O segundo `ErrorBoundary` era redundante — o primeiro ja captura todos os erros.

### Correcao
Removido o segundo `ErrorBoundary`:
```jsx
<ErrorBoundary>
  <ThemeProvider>
    <AppProvider>
      <PageRouter />
      <Toaster />
    </AppProvider>
  </ThemeProvider>
</ErrorBoundary>
```

### Como evitar no futuro
- Um unico `ErrorBoundary` na raiz e suficiente
- So adicionar `ErrorBoundary` aninhado para recovery granular (ex: cada pagina)

---

## Guia Rapido — Como Depurar Problemas

### 1. Problemas de Login / Auth

```
1. Abra o console do navegador (F12 > Console)
2. Filtre por "[AuthContext]" ou "[AuthCallback]"
3. Verifique se getSession() retornou OK
4. Verifique se onAuthStateChange disparou SIGNED_IN
5. Se timeout de 8s: clique em "Forcar recarregamento"
6. Verifique se o popup do Google nao foi bloqueado
```

### 2. Documentos nao Aparecem no Dashboard

```
1. Filtre o console por "[AppBootstrap]"
2. Verifique se fetchAll foi chamado e retornou dados
3. Filtre por "[DocumentService]" para ver erros de query
4. Verifique no Supabase Dashboard se a tabela documents tem registros
5. Verifique se o RLS nao esta bloqueando (erro 401/403)
```

### 3. Auto-Save nao Funciona

```
1. Filtre o console por "[useAutoSave]"
2. Verifique se saveStatus muda para "saving" ao digitar
3. Verifique se saveFn e chamado apos o debounce de 1500ms
4. Verifique se StorageService.saveDraft persiste no localStorage
5. Abra Application > Local Storage no DevTools e procure "kriou_user_*_draft"
```

---

## Checklist para Nova Features

- [ ] Os logs seguem o padrao `[NomeModulo]` ?
- [ ] Os erros tem prefixo `[ERRO]` ou `[ERRO_CRITICO]` ?
- [ ] O `GRANT` no SQL e apenas para `authenticated` (nunca `anon`)?
- [ ] As queries tem filtro `user_id` explicito?
- [ ] As operacoes de storage tem try/catch com feedback ao usuario?
- [ ] `triggerSave` do useAutoSave usa `dataRef` (nao `data` do closure)?
- [ ] A pagina de auth nao esta incluida em `isAuthPage` sem necessidade?
- [ ] Os tipos de documento usam constantes importadas (strings literais evitadas)?
- [ ] Os testes existentes passam? `npm test` ou `npm run test`
- [ ] O build passa sem erros? `npm run build`
