# Fase 3 — Performance
> Prioridade: ALTA | Prazo: Semana 4

---

## Diagnóstico

Problemas de performance identificados no bundle e em runtime:

| Problema                          | Impacto        | Esforço |
|-----------------------------------|----------------|---------|
| Sem code splitting                | Bundle grande, TTI alto | Baixo |
| legalDocuments.js carregado sempre| +100KB desnecessário | Baixo |
| PDF gerado no thread principal    | UI congela     | Médio   |
| AppContext monolítico             | Re-renders excessivos | Médio |
| Sem memoização em componentes     | Renders desnecessários | Baixo |
| localStorage write a cada tecla   | Lag em digitação | Baixo  |
| Sem Suspense boundaries           | Tela em branco | Baixo  |

---

## 3.1 Code Splitting por Rota

**Estado atual:** Vite/React carrega TODAS as páginas no bundle inicial.

**Correção em `src/App.jsx`:**

```javascript
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/Feedback';

// Lazy load por rota — código só carrega quando a rota é acessada
const DashboardPage   = lazy(() => import('./pages/DashboardPage'));
const EditorPage      = lazy(() => import('./pages/EditorPage'));
const LegalEditorPage = lazy(() => import('./pages/LegalEditorPage'));
const PreviewPage     = lazy(() => import('./pages/PreviewPage'));
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const TemplatesPage   = lazy(() => import('./pages/TemplatesPage'));
const ProfilePage     = lazy(() => import('./pages/ProfilePage'));

// LoginPage e LandingPage NÃO lazy — são a entrada, devem ser rápidas
import LoginPage    from './pages/LoginPage';
import LandingPage  from './pages/LandingPage';

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/editor"     element={<EditorPage />} />
        <Route path="/legal"      element={<LegalEditorPage />} />
        <Route path="/preview"    element={<PreviewPage />} />
        <Route path="/checkout"   element={<CheckoutPage />} />
        <Route path="/templates"  element={<TemplatesPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
      </Routes>
    </Suspense>
  );
}
```

**Ganho esperado:** Redução de 40-60% no bundle inicial.

---

## 3.2 PDF em Web Worker

**Problema:** `pdfGenerator.js` roda no thread principal — bloqueia a UI por 1-3 segundos.

**Solução:**

```javascript
// src/workers/pdfWorker.js
import { generateResumePDF } from '../utils/pdfGenerator.js';

self.onmessage = async function(event) {
  const { type, data } = event.data;

  try {
    let blob;
    if (type === 'resume') {
      blob = await generateResumePDF(data);
    } else if (type === 'legal') {
      const { generateLegalPDF } = await import('../utils/legalPdfGenerator.js');
      blob = await generateLegalPDF(data);
    }
    self.postMessage({ success: true, blob });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
```

```javascript
// src/hooks/usePDF.js
export function usePDF() {
  const [status, setStatus] = useState('idle');
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/pdfWorker.js', import.meta.url),
      { type: 'module' }
    );
    return () => workerRef.current?.terminate();
  }, []);

  const generate = useCallback((type, data) => {
    return new Promise((resolve, reject) => {
      setStatus('generating');
      workerRef.current.postMessage({ type, data });
      workerRef.current.onmessage = ({ data: result }) => {
        if (result.success) {
          setStatus('done');
          resolve(result.blob);
        } else {
          setStatus('error');
          reject(new Error(result.error));
        }
      };
    });
  }, []);

  return { status, generate };
}
```

**Ganho:** UI permanece fluida durante geração de PDF.

---

## 3.3 Debounce no Auto-Save

**Problema atual:** `saveDraft()` chamado a cada keystroke → lag perceptível.

```javascript
// src/hooks/useAutoSave.js
import { useCallback, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService.js';

export function useAutoSave(key, data, delay = 1500) {
  const timerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    clearTimeout(timerRef.current);
    setSaveStatus('pending');

    timerRef.current = setTimeout(async () => {
      try {
        await storageService.saveDraft(key, data);
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [key, data, delay]);

  return saveStatus; // 'idle' | 'pending' | 'saved' | 'error'
}
```

**Ganho:** Salva no máximo 1x a cada 1,5s em vez de a cada tecla.

---

## 3.4 Memoização Seletiva

Regra: só memoizar onde há evidência de re-renders desnecessários.

### React.memo para componentes de lista

```javascript
// Componente de experiência no EditorPage — renderizado N vezes
const ExperienciaItem = React.memo(function ExperienciaItem({ item, onRemove, onChange }) {
  return (
    <div>
      <Input value={item.empresa} onChange={e => onChange('empresa', e.target.value)} />
      <button onClick={() => onRemove(item.id)}>Remover</button>
    </div>
  );
});
```

### useCallback para handlers em loops

```javascript
// ANTES
const handleRemoveExperiencia = (id) => {
  updateForm('experiencias', formData.experiencias.filter(e => e.id !== id));
};

// DEPOIS
const handleRemoveExperiencia = useCallback((id) => {
  setFormData(prev => ({
    ...prev,
    experiencias: prev.experiencias.filter(e => e.id !== id),
  }));
}, []);
```

### useMemo para dados derivados caros

```javascript
// No DashboardPage — ordenação e filtro de documentos
const sortedDocuments = useMemo(
  () => documents.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
  [documents]
);
```

---

## 3.5 Otimizar legalDocuments.js

**Atual:** 1.949 linhas em um arquivo, sempre carregado.

**Ação:**
1. Dividir por tipo de documento (ver Fase 2 — seção 2.5)
2. Carregar apenas o documento selecionado com `import()`
3. Cache o resultado em memória após primeiro carregamento:

```javascript
const docCache = new Map();

export async function getDocument(type) {
  if (docCache.has(type)) return docCache.get(type);

  const mod = await import(`./${type}.js`);
  docCache.set(type, mod.default);
  return mod.default;
}
```

---

## 3.6 IndexedDB para Rascunhos Grandes

**Problema:** `localStorage` tem limite de 5-10MB. Documentos jurídicos com muitos campos podem causar erros silenciosos.

**Solução:** Usar IndexedDB via biblioteca leve:

```bash
npm install idb
```

```javascript
// src/services/storageService.js
import { openDB } from 'idb';

const DB_NAME = 'kriou_docs';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    },
  });
}

export const storageService = {
  async saveDraft(id, data) {
    const db = await getDB();
    await db.put('drafts', { id, data, updatedAt: Date.now() });
  },

  async getDraft(id) {
    const db = await getDB();
    return db.get('drafts', id);
  },

  async deleteDraft(id) {
    const db = await getDB();
    return db.delete('drafts', id);
  },
};
```

---

## 3.7 Vite Config — Bundle Analysis

Adicionar análise de bundle para visualizar onde está o peso:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, filename: 'dist/bundle-analysis.html' }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ['react', 'react-dom'],
          router:  ['react-router-dom'],
          pdf:     ['jspdf'],
        },
      },
    },
  },
});
```

```bash
npm install --save-dev rollup-plugin-visualizer
npm run build
# Abre automaticamente o relatório visual de bundle
```

---

## Métricas-Alvo Após Fase 3

| Métrica              | Antes (estimado) | Meta    |
|----------------------|------------------|---------|
| Bundle inicial       | ~800KB           | <300KB  |
| TTI (Time to Interactive) | ~4s         | <2s     |
| Freeze ao gerar PDF  | 1-3s             | 0s (Worker) |
| Writes de auto-save  | ~10/s            | 0,7/s   |

---

## Checklist da Fase 3

- [ ] Implementar lazy loading de rotas em App.jsx
- [ ] Adicionar Suspense com fallback visual
- [ ] Mover geração de PDF para Web Worker
- [ ] Implementar `useAutoSave` com debounce
- [ ] Adicionar `React.memo` em listas (ExperienciaItem, FormacaoItem, etc.)
- [ ] Aplicar `useCallback` em handlers dentro de loops
- [ ] Migrar rascunhos de localStorage para IndexedDB (idb)
- [ ] Configurar manualChunks no vite.config.js
- [ ] Instalar rollup-plugin-visualizer e analisar bundle
- [ ] Verificar se legalDocuments.js está lazy loaded
