# KRIOU-DOCS - Plano de Correções e Melhorias

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir bugs de navegação, scroll, responsividade, dimensionamento e integração de componentes para proporcionar experiência consistente entre currículos e documentos jurídicos.

**Architecture:** O projeto usa React com contexto unificado (AppContext), sistema de navegação via history API com popstate, e componentes UI centralizados em `src/components/ui/`. O estado é persistido via localStorage com auto-save debounced. O plano foca em: (1) scroll restoration, (2) responsividade de containers, (3) autoFocus em campos, (4) consistência de UI entre editores.

**Tech Stack:** React 18, Vite, Tailwind CSS (via @theme + @apply), inline styles para componentes dinâmicos, localStorage persistence, history API, jsPDF

---

## Análise de Problemas Identificados (Análise Profunda Concluída)

### 1. Navegação e Botão Voltar
- `AppContext.jsx` `handlePopstate` restaura página mas não scroll position
- `navigate` sempre faz `scrollTo(0, 0)` sem salvar posição atual
- Navegação de etapas (steps) dentro do wizard usa `setState` (CORRETO - não polui history)

### 2. Responsividade dos Containers (maxWidth)
- `AppNavbar` maxWidth: 600px (layout.jsx:64) - MUITO RESTRITIVO
- `BottomNavigation` maxWidth: 600px (layout.jsx:219) - MUITO RESTRITIVO
- `LegalEditorPage` content maxWidth: 920px (LegalEditorPage.jsx:840)
- `CheckoutPage` maxWidth: 600px (CheckoutPage.jsx:183)
- `PreviewPage` maxWidth: 700px (PreviewPage.jsx:110)
- Dashboard usa `max-w-7xl` (1280px) - CORRETO

### 3. Consistência EditorPage vs LegalEditorPage
- EditorPage BottomNavigation: versão simples, sem onSaveLater, sem extraContent
- LegalEditorPage BottomNavigation: versão completa com onSaveLater e filledCount

### 4. AutoFocus em LegalFieldRenderer
- Não há autofocus no primeiro campo de cada seção
- Usuário precisa tocar/clicar manualmente

### 5. Sistema de Persistência (Funcionando)
- `StorageService` implementa save/load para session, documents, drafts, page
- `useAutoSave` com debounce 1500ms funcionando corretamente
- Drafts são salvos e restaurados corretamente

---

## Fase 1: Scroll Restoration

### Task 1: AppContext - Implementar Scroll Position Tracking

**Files:**
- Modify: `src/context/AppContext.jsx:34-85`

**Problema:** Scroll position não é salvo nem restaurado quando usuário usa botão voltar.

- [ ] **Step 1: Modificar navigate para salvar scroll no history state**

```javascript
const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("landing");
  const isPopstateRef = useRef(false);
  // Adicionar para tracking de scroll
  const scrollPositionsRef = useRef({});

  const navigate = useCallback((page) => {
    // Salvar scroll da página atual antes de sair
    if (currentPage) {
      scrollPositionsRef.current[currentPage] = window.scrollY;
    }
    
    setCurrentPage(page);
    window.scrollTo(0, 0);

    if (!isPopstateRef.current) {
      window.history.pushState({ 
        page,
        scrollY: 0,
      }, "", window.location.pathname);
    }

    if (RESTORABLE_PAGES.has(page)) {
      StorageService.savePage(page);
    } else {
      StorageService.clearPage();
    }
  }, [currentPage]);
```

- [ ] **Step 2: Modificar handlePopstate para restaurar scroll**

```javascript
useEffect(() => {
  const handlePopstate = (event) => {
    const page = event.state?.page;
    if (page) {
      isPopstateRef.current = true;
      setCurrentPage(page);
      // Restaurar scroll após renderizar
      requestAnimationFrame(() => {
        const savedScroll = event.state?.scrollY ?? scrollPositionsRef.current[page] ?? 0;
        window.scrollTo(0, savedScroll);
      });
      isPopstateRef.current = false;
    } else {
      isPopstateRef.current = true;
      setCurrentPage("landing");
      window.scrollTo(0, 0);
      isPopstateRef.current = false;
    }
  };

  window.addEventListener("popstate", handlePopstate);
  return () => window.removeEventListener("popstate", handlePopstate);
}, []);
```

- [ ] **Step 3: Testar scroll restoration**

Run: npm run dev
1. Ir para Dashboard
2. Scrollar para baixo
3. Clicar em criar documento
4. Usar botão voltar do browser
Expected: Página volta E scroll está na posição anterior

- [ ] **Step 4: Commit**

```bash
git add src/context/AppContext.jsx
git commit -m "fix: implement scroll position tracking and restoration"
```

---

## Fase 2: Responsividade de Containers

### Task 2: AppNavbar - Aumentar maxWidth de 600 para 1200

**Files:**
- Modify: `src/components/ui/layout.jsx:44-88`

- [ ] **Step 1: Alterar maxWidth de 600 para 1200**

Localizar no arquivo `layout.jsx`:
```javascript
// Linha ~64
maxWidth: 600, // Alterar para 1200
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/layout.jsx
git commit -m "fix: increase AppNavbar maxWidth to 1200px"
```

---

### Task 3: BottomNavigation - Aumentar maxWidth de 600 para 1200

**Files:**
- Modify: `src/components/ui/layout.jsx:186-314`

- [ ] **Step 1: Alterar maxWidth de 600 para 1200**

Localizar no arquivo `layout.jsx`:
```javascript
// Linha ~219
maxWidth: 600, // Alterar para 1200
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/layout.jsx
git commit -m "fix: increase BottomNavigation maxWidth to 1200px"
```

---

### Task 4: LegalEditorPage - Aumentar content maxWidth de 920 para 1200

**Files:**
- Modify: `src/pages/LegalEditorPage.jsx:840`

- [ ] **Step 1: Alterar maxWidth de 920 para 1200**

```javascript
// Linha 840
style={{ 
  flex: 1, 
  maxWidth: 1200, // Alterado de 920 para 1200
  margin: "0 auto", 
  padding: "24px 24px 120px",
  width: "100%",
}}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LegalEditorPage.jsx
git commit -m "fix: increase LegalEditorPage content maxWidth to 1200px"
```

---

### Task 5: CheckoutPage - Aumentar maxWidth de 600 para 1200

**Files:**
- Modify: `src/pages/CheckoutPage.jsx:183`

- [ ] **Step 1: Alterar maxWidth de 600 para 1200**

```javascript
// Linha 183
style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CheckoutPage.jsx
git commit -m "fix: increase CheckoutPage maxWidth to 1200px"
```

---

### Task 6: PreviewPage - Aumentar maxWidth de 700 para 1200

**Files:**
- Modify: `src/pages/PreviewPage.jsx:110`

- [ ] **Step 1: Alterar maxWidth de 700 para 1200**

```javascript
// Linha 110
style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PreviewPage.jsx
git commit -m "fix: increase PreviewPage maxWidth to 1200px"
```

---

## Fase 3: AutoFocus e UX

### Task 7: LegalFieldRenderer - Adicionar AutoFocus

**Files:**
- Modify: `src/components/ui/legal-helpers.jsx:466-633`
- Modify: `src/pages/LegalEditorPage.jsx:460-474`

**Problema:** Primeiro campo de cada seção não recebe autoFocus.

- [ ] **Step 1: Adicionar prop autoFocus ao LegalFieldRenderer**

No arquivo `legal-helpers.jsx`, localizar o componente `LegalFieldRenderer` e adicionar:

```javascript
export const LegalFieldRenderer = ({
  fieldDef,
  value,
  onChange,
  error,
  disabled,
  onToggleDisabled,
  autoFocus = false, // NOVA PROP
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);
```

- [ ] **Step 2: Passar autoFocus=true para primeiro campo de cada seção**

No arquivo `LegalEditorPage.jsx`, no map de renderização de campos:

```javascript
{section.fields.map((fieldDef, fieldIndex) => (
  <div key={fieldDef.key} id={`field-${fieldDef.key}`}>
    <LegalFieldRenderer
      fieldDef={fieldDef}
      value={legalFormData[fieldDef.key]}
      onChange={handleUpdateField}
      error={getFieldError(fieldDef.key)}
      disabled={disabledFields[fieldDef.key]}
      onToggleDisabled={() => handleToggleDisabled(fieldDef.key)}
      autoFocus={fieldIndex === 0} // PRIMEIRO CAMPO DA SEÇÃO
    />
  </div>
))}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/legal-helpers.jsx src/pages/LegalEditorPage.jsx
git commit -m "feat: add autoFocus to first field in each legal section"
```

---

## Fase 4: Consistência de UI

### Task 8: EditorPage - Adicionar onSaveLater e Progress Indicator

**Files:**
- Modify: `src/pages/EditorPage.jsx:478-484`

**Problema:** EditorPage não tem indicador de progresso nem botão salvar.

- [ ] **Step 1: Adicionar handleSaveLater**

```javascript
const handleSaveLater = async () => {
  await triggerSave();
  navigate("dashboard");
  showToast.success("Rascunho salvo!");
};
```

- [ ] **Step 2: Calcular filledCount**

```javascript
const filledCount = Object.values(formData).filter(
  v => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== "")
).length;
```

- [ ] **Step 3: Atualizar BottomNavigation**

```javascript
<BottomNavigation
  onBack={handlePrevious}
  onNext={isLastStep ? () => navigate("preview") : handleNext}
  isFirstStep={isFirstStep}
  isLastStep={isLastStep}
  nextLabel={isLastStep ? "✓ Visualizar Mágica" : undefined}
  onSaveLater={handleSaveLater}
  extraContent={
    <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "var(--coral)", fontWeight: 700 }}>{filledCount}</span>
      campos preenchidos
    </div>
  }
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/EditorPage.jsx
git commit -m "feat: add saveLater and progress indicator to EditorPage"
```

---

## Fase 5: Testes

### Task 9: Testar Fluxo Completo

**Files:**
- Test: Todo o app

- [ ] **Step 1: Testar Scroll Restoration**

1. npm run dev
2. Dashboard - scrollar para baixo
3. Clicar em criar currículo
4. Usar botão voltar
5. Verificar scroll preservado

- [ ] **Step 2: Testar Navegação de Etapas**

1. Criar currículo
2. Preencher etapa 1
3. Avançar para etapa 2
4. Voltar - dados devem persistir

- [ ] **Step 3: Testar Documentos Legais**

1. Criar documento jurídico
2. Selecionar tipo e variante
3. Preencher alguns campos
4. Usar "Preencher Demo"
5. Navegar pelo wizard
6. Voltar - dados devem persistir

- [ ] **Step 4: Testar Responsividade**

1. DevTools - device toolbar
2. iPhone 12 size
3. Verificar containers
4. Verificar BottomNavigation

- [ ] **Step 5: Build Test**

```bash
npm run build
```

Expected: Build completes without errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: comprehensive navigation and responsiveness testing"
```

---

## Resumo de Tarefas

| # | Tarefa | Prioridade | Arquivos |
|---|--------|-----------|----------|
| 1 | Scroll Restoration | Alta | AppContext.jsx |
| 2 | AppNavbar maxWidth 600→1200 | Alta | layout.jsx |
| 3 | BottomNavigation maxWidth 600→1200 | Alta | layout.jsx |
| 4 | LegalEditor content maxWidth 920→1200 | Alta | LegalEditorPage.jsx |
| 5 | CheckoutPage maxWidth 600→1200 | Média | CheckoutPage.jsx |
| 6 | PreviewPage maxWidth 700→1200 | Média | PreviewPage.jsx |
| 7 | AutoFocus em campos | Média | legal-helpers.jsx, LegalEditorPage.jsx |
| 8 | EditorPage saveLater + progress | Alta | EditorPage.jsx |
| 9 | Testes completos | Alta | Todo |

---

## Commands para Teste

```bash
# Development
npm run dev

# Build
npm run build
```
