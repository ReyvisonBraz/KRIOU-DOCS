# Fase 5 — UX e Funcionalidades
> Prioridade: ALTA (para o cliente) | Prazo: Semana 5

---

## Princípio

Todas as melhorias desta fase são orientadas ao **cliente final**. Cada item responde à pergunta: *"O que faz o usuário confiar, entender e usar melhor o produto?"*

---

## 5.1 Indicador de Auto-Save Visível

**Problema:** O estado `saveStatus` existe no código mas **não é exibido** em nenhuma página.

**Solução — Componente de status de salvamento:**

```javascript
// src/components/Feedback/SaveIndicator.jsx
const STATUS_CONFIG = {
  idle:    { label: '',            icon: null,        color: 'transparent' },
  pending: { label: 'Salvando…',  icon: '⏳',        color: 'var(--text-muted)' },
  saved:   { label: 'Salvo',      icon: '✓',          color: '#22c55e' },
  error:   { label: 'Erro ao salvar', icon: '⚠',    color: '#ef4444' },
};

export function SaveIndicator({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  if (!config.icon) return null;

  return (
    <span style={{ fontSize: '0.78rem', color: config.color, display: 'flex', alignItems: 'center', gap: 4 }}>
      {config.icon} {config.label}
    </span>
  );
}
```

Exibir na `AppNavbar` de EditorPage e LegalEditorPage.

---

## 5.2 Aviso de Saída com Dados Não Salvos

**Problema:** Usuário pode fechar a aba ou navegar para outra rota e perder o formulário.

```javascript
// src/hooks/useUnsavedChanges.js
import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useUnsavedChanges(hasChanges) {
  // Aviso ao fechar/recarregar a aba
  useEffect(() => {
    if (!hasChanges) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  // Aviso ao navegar internamente (react-router)
  useBlocker(({ currentLocation, nextLocation }) => {
    return hasChanges && currentLocation.pathname !== nextLocation.pathname;
  });
}
```

Uso em EditorPage:
```javascript
const { hasUnsavedChanges } = useResume();
useUnsavedChanges(hasUnsavedChanges);
```

---

## 5.3 Toast de Notificação Global

**Problema:** Erros e sucessos não têm feedback visual — apenas `console.error`.

**Instalar:**
```bash
npm install sonner
```

**Configurar em App.jsx:**
```javascript
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors duration={4000} />
      <Routes>...</Routes>
    </>
  );
}
```

**Usar no código:**
```javascript
import { toast } from 'sonner';

// Sucesso
toast.success('Documento salvo com sucesso!');

// Erro
toast.error('Falha ao gerar PDF. Tente novamente.');

// Info
toast.info('Seu rascunho foi atualizado.');
```

Substituir todos os `console.error()` expostos ao usuário por `toast.error()`.

---

## 5.4 Skeleton Loading nas Listagens

**Problema:** DashboardPage exibe lista de documentos com dados mock — sem estado de carregamento real.

```javascript
// src/components/Feedback/SkeletonCard.jsx
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '16px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 16, width: '60%', background: 'var(--border-color)', borderRadius: 8, marginBottom: 10 }} />
      <div style={{ height: 12, width: '40%', background: 'var(--border-color)', borderRadius: 8 }} />
    </div>
  );
}
```

Exibir enquanto documentos carregam:
```javascript
{isLoading
  ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
  : documents.map(doc => <DocumentCard key={doc.id} {...doc} />)
}
```

---

## 5.5 Estado Vazio (Empty State)

**Problema:** DashboardPage com dados mock não trata o caso de usuário sem documentos.

```javascript
// src/components/Feedback/EmptyState.jsx
export function EmptyState({ title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{description}</p>
      {action}
    </div>
  );
}
```

Uso:
```javascript
{documents.length === 0 && (
  <EmptyState
    title="Nenhum documento ainda"
    description="Crie seu primeiro currículo ou contrato"
    action={<Button onClick={() => navigate('/templates')}>Criar documento</Button>}
  />
)}
```

---

## 5.6 Progresso Visual no Formulário

**Melhoria:** Mostrar percentual de preenchimento além do step atual.

```javascript
// src/hooks/useFormProgress.js
export function useFormProgress(formData, requiredFields) {
  return useMemo(() => {
    const filled = requiredFields.filter(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], formData);
      return value !== undefined && value !== '' && value !== null;
    });
    return Math.round((filled.length / requiredFields.length) * 100);
  }, [formData, requiredFields]);
}
```

Exibir na navbar:
```javascript
const progress = useFormProgress(formData, REQUIRED_FIELDS);

// Na AppNavbar
<div style={{ width: '100%', height: 3, background: 'var(--border-color)', borderRadius: 2 }}>
  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--coral)', transition: 'width 0.3s ease' }} />
</div>
```

---

## 5.7 Preview do Documento Antes do Checkout

**Problema:** Usuário completa o formulário e vai direto ao checkout sem ver o documento completo.

**Solução:** Etapa de revisão antes do checkout com preview real do documento.

```
Fluxo atual:    Formulário → Checkout
Fluxo proposto: Formulário → Preview/Revisão → Checkout
```

Na PreviewPage, garantir:
- Botão "Editar" voltar para etapa específica
- Botão "Comprar" habilitado apenas após revisão
- PDF gerado com marca d'água "PRÉVIA" para não-pagantes

---

## 5.8 Confirmação Antes de Apagar Dados

**Toda ação destrutiva deve ter confirmação:**

```javascript
// src/hooks/useConfirm.js
export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null });

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, message, resolve });
    });
  }, []);

  const handleResponse = useCallback((confirmed) => {
    state.resolve(confirmed);
    setState({ open: false, message: '', resolve: null });
  }, [state]);

  const Dialog = state.open ? (
    <ConfirmDialog
      message={state.message}
      onConfirm={() => handleResponse(true)}
      onCancel={() => handleResponse(false)}
    />
  ) : null;

  return { confirm, Dialog };
}
```

Uso:
```javascript
const { confirm, Dialog } = useConfirm();

const handleDeleteDocument = async (id) => {
  const ok = await confirm('Tem certeza que deseja excluir este documento?');
  if (ok) await documentService.delete(id);
};
```

---

## 5.9 Acessibilidade (a11y)

**Mínimo para produção:**

```javascript
// Inputs devem ter id + label htmlFor
<label htmlFor="nome-input" style={LABEL_STYLE}>Nome completo</label>
<input id="nome-input" aria-required="true" aria-describedby="nome-error" ... />
{errors.nome && <p id="nome-error" role="alert">{errors.nome}</p>}

// Botões sem texto devem ter aria-label
<button aria-label="Fechar modal" onClick={onClose}>×</button>

// Modais devem ter role e aria-modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirmar exclusão</h2>
</div>

// Indicadores de carregamento
<div aria-live="polite" aria-atomic="true">
  {saveStatus === 'saving' ? 'Salvando...' : ''}
</div>
```

---

## 5.10 Responsividade Aprimorada

**Verificar e corrigir em dispositivos comuns:**
- Mobile (375px — iPhone SE)
- Mobile (390px — iPhone 14)
- Tablet (768px — iPad)
- Desktop (1280px+)

**Usar `responsive.js` existente consistentemente** — atualmente usado em alguns lugares e ignorado em outros.

Criar breakpoints centralizados:
```javascript
// src/constants/breakpoints.js
export const BREAKPOINTS = {
  mobile:  '(max-width: 480px)',
  tablet:  '(max-width: 768px)',
  desktop: '(min-width: 769px)',
};
```

---

## Checklist da Fase 5

- [ ] Implementar SaveIndicator e exibir nas páginas de edição
- [ ] Implementar useUnsavedChanges com bloqueio de navegação
- [ ] Instalar Sonner e configurar Toaster em App.jsx
- [ ] Substituir todos os alertas de erro por toast.error()
- [ ] Criar SkeletonCard para loading de documentos
- [ ] Criar EmptyState para dashboard sem documentos
- [ ] Remover dados mock do DashboardPage
- [ ] Adicionar barra de progresso de preenchimento no EditorPage
- [ ] Inserir etapa de Preview antes do Checkout
- [ ] Implementar ConfirmDialog para ações destrutivas
- [ ] Adicionar aria-labels e role em elementos interativos
- [ ] Testar em 375px, 390px, 768px, 1280px
- [ ] Centralizar breakpoints em constants/breakpoints.js
