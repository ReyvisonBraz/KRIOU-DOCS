# KRIOU-DOCS - Plano de Implementação de Correções e Melhorias

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir bugs de navegação, navegação do botão voltar, dimensionamento responsivo, integração de componentes e melhorias na experiência de digitação para todos os tipos de documentos.

**Architecture:** O projeto usa React com contexto unificado (AppContext), sistema de navegação via history API com popstate, e componentes UI centralizados. O estado é persistido via localStorage. O plano foca em: (1) melhorar gestão de estado de navegação, (2) corrigir comportamento do botão voltar sem recarregar app, (3) padronizar responsividade, (4) integrar componentes de ajuda em todos os documentos.

**Tech Stack:** React 18, Vite, Tailwind-like inline styles, localStorage persistence, history API, jsPDF para geração de PDF

---

## Fase 1: Correção de Navegação e Botão Voltar

### Task 1: AppContext - Melhorar Gestão de Histórico e Scroll

**Files:**
- Modify: `src/context/AppContext.jsx:34-85`

**Problema:** O botão voltar do browser não restaura estado corretamente em todas as situações. Scroll não é restaurado.

**Solução:** Adicionar estado de scroll por página e melhorar handling de popstate.

- [ ] **Step 1: Implementar scroll position tracking**

```javascript
// Adicionar em NavigationProvider
const [scrollPositions, setScrollPositions] = useState({});

const navigate = useCallback((page) => {
  // Salvar scroll da página atual antes de navegar
  setScrollPositions(prev => ({
    ...prev,
    [currentPage]: window.scrollY
  }));
  
  setCurrentPage(page);
  
  // Empurra entrada no histórico
  if (!isPopstateRef.current) {
    window.history.pushState({ 
      page,
      scrollY: 0, // Nova página começa no topo
    }, "", window.location.pathname);
  }
  
  // Scroll para topo imediatamente
  window.scrollTo(0, 0);
  
  // Persiste no localStorage
  if (RESTORABLE_PAGES.has(page)) {
    StorageService.savePage(page);
  } else {
    StorageService.clearPage();
  }
}, [currentPage]); // Dependência correta
```

- [ ] **Step 2: Melhorar handlePopstate para restaurar scroll**

```javascript
useEffect(() => {
  const handlePopstate = (event) => {
    const page = event.state?.page;
    if (page) {
      isPopstateRef.current = true;
      setCurrentPage(page);
      
      // Restaurar scroll após um frame
      requestAnimationFrame(() => {
        window.scrollTo(0, event.state?.scrollY || 0);
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

- [ ] **Step 3: Testar navegação e voltar**

Run: Abrir app no browser, navegar entre páginas, usar botão voltar do browser
Expected: App não recarrega, estado é restaurado, scroll é restaurado

- [ ] **Step 4: Commit**

```bash
git add src/context/AppContext.jsx
git commit -m "fix: improve navigation state management and scroll restoration"
```

---

### Task 2: EditorPage - Corrigir Transição de Etapas e Voltar

**Files:**
- Modify: `src/pages/EditorPage.jsx:396-424`

**Problema:** Ao pressionar voltar, o usuário perde dados de formulário preenchidos porque não há estado intermediário no history.

**Solução:** Navegação de etapas via setState (não history API), preservar dados do formulário no contexto.

- [ ] **Step 1: Verificar que formData persiste entre etapas**

Verificar que `useApp()` fornece `formData` e `updateForm` corretamente.

```javascript
// EditorPage.jsx - handlePrevious
const handlePrevious = () => {
  if (!isFirstStep) {
    setCurrentStep(currentStep - 1); // Apenas muda etapa, não navega
  } else {
    navigate("dashboard"); // Apenas aqui usa navigate (history API)
  }
};
```

- [ ] **Step 2: Garantir que AppNavbar back funciona corretamente**

```javascript
// AppNavbar leftAction no EditorPage
leftAction={
  <button
    onClick={handlePrevious} // Não navigate diretamente
    className="flex items-center gap-1.5 text-text-muted hover:text-white..."
  >
    <Icon name="ChevronLeft" className="w-5 h-5" />
    <span className="hidden sm:inline">
      {isFirstStep ? "Dashboard" : "Voltar"}
    </span>
  </button>
}
```

- [ ] **Step 3: Testar navegação de etapas**

Run: Preencher dados na etapa 1, avançar para etapa 2, voltar para etapa 1
Expected: Dados da etapa 1 permanecem preenchidos

- [ ] **Step 4: Commit**

```bash
git add src/pages/EditorPage.jsx
git commit -m "fix: preserve form data when navigating between steps"
```

---

### Task 3: LegalEditorPage - Corrigir Navegação e Estado

**Files:**
- Modify: `src/pages/LegalEditorPage.jsx:180-218`

**Problema:** Mesmo problema de navegação de etapas e comportamento do botão voltar.

- [ ] **Step 1: Verificar navegação de etapas**

```javascript
const handlePrevious = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
    setShowErrors(false);
    // NÃO usa navigate para etapas internas
  }
};

const handleNext = () => {
  // ... validação ...
  if (currentStep < STEPS.length - 1) {
    setCurrentStep(currentStep + 1); // Apenas muda etapa
  }
};
```

- [ ] **Step 2: Garantir que step 0 vai para dashboard**

```javascript
leftAction={
  <button
    onClick={() => isFirstStep ? navigate("dashboard") : handlePrevious()}
    // Correct: usa navigate apenas para sair do wizard
  >
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LegalEditorPage.jsx
git commit -m "fix: standardize step navigation in LegalEditorPage"
```

---

## Fase 2: Correções de Responsividade e Dimensionamento

### Task 4: BottomNavigation - Padronizar maxWidth e responsividade

**Files:**
- Modify: `src/components/ui/layout.jsx:186-314`

**Problema:** maxWidth de 600px é muito estreito para desktop, causando espaço vazio nas laterais.

- [ ] **Step 1: Ajustar BottomNavigation maxWidth para 1200px**

```javascript
<div
  style={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: "rgba(15, 15, 30, 0.98)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "14px 16px 20px",
    ...style,
  }}
>
  <div
    style={{
      display: "flex",
      gap: 10,
      maxWidth: 1200, // Alterado de 600 para 1200
      margin: "0 auto",
    }}
  >
```

- [ ] **Step 2: Garantir que BottomNavigation é consistente no mobile**

Verificar que padding bottom do conteúdo principal evita sobreposição:
- EditorPage já tem `pb-[100px]` para espaço do BottomNav
- LegalEditorPage tem `padding: "24px 24px 120px"` - OK

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/layout.jsx
git commit -m "fix: improve BottomNavigation maxWidth for better desktop display"
```

---

### Task 5: AppNavbar - Responsividade corrigida

**Files:**
- Modify: `src/components/ui/layout.jsx:44-88`

**Problema:** AppNavbar tem maxWidth 600px muito estreito.

- [ ] **Step 1: Ajustar AppNavbar maxWidth para 1200px**

```javascript
<div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(15, 15, 30, 0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    ...style,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      maxWidth: 1200, // Alterado de 600 para 1200
      margin: "0 auto",
    }}
  >
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/layout.jsx
git commit -m "fix: update AppNavbar maxWidth for desktop consistency"
```

---

### Task 6: LegalEditorPage Content - Padding responsivo

**Files:**
- Modify: `src/pages/LegalEditorPage.jsx:801-872`

**Problema:** Content container tem padding inadequado em telas grandes.

- [ ] **Step 1: Melhorar container de conteúdo**

```javascript
<div 
  ref={contentRef} 
  className="page-container" 
  style={{ 
    flex: 1, 
    maxWidth: 1200, // Aumentado de 920 para 1200
    margin: "0 auto", 
    padding: "24px 24px 120px",
    width: "100%",
  }}
>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/LegalEditorPage.jsx
git commit -m "fix: improve LegalEditorPage content container maxWidth"
```

---

## Fase 3: Melhorias na Experiência de Digitação

### Task 7: LegalFieldRenderer - Adicionar auto-focus e tab navigation

**Files:**
- Modify: `src/components/ui/legal-helpers.jsx`

**Problema:** Campos não têm navegação por Tab adequada e falta auto-focus em campos obrigatórios.

- [ ] **Step 1: Adicionar autoFocus ao primeiro campo obrigatório de cada seção**

```javascript
// LegalFieldRenderer - renderizar primeiro campo de cada seção com autoFocus
const LegalFieldRenderer = ({ fieldDef, value, onChange, error, disabled, onToggleDisabled }) => {
  const inputRef = useRef(null);
  const isFirstInSection = fieldDef.autofocus;
  
  useEffect(() => {
    if (isFirstInSection && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFirstInSection]);
  
  // ... restante do componente
  return (
    <input
      ref={inputRef}
      // ... outras props
    />
  );
};
```

- [ ] **Step 2: Melhorar SectionHeader para marcar primeiro campo**

Em cada seção, o primeiro campo deve ter autofocus.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/legal-helpers.jsx
git commit -m "feat: add autofocus to first field in each legal document section"
```

---

### Task 8: Garantir que todos os documentos têm FIELD_HINTS

**Files:**
- Create: `src/data/documents/_fieldHints.js`
- Modify: `src/data/documents/compra-venda.js`, `locacao.js`, etc.

**Problema:** Apenas currículos têm hints detalhados. Documentos legais têm hints básicos mas podem melhorar.

- [ ] **Step 1: Criar arquivo de hints compartilhados**

```javascript
// src/data/documents/_fieldHints.js
export const LEGAL_FIELD_HINTS = {
  nome: {
    placeholder: "Nome completo",
    hint: "Nome conforme documento de identidade (RG, CNH)",
    example: "Maria da Silva",
    whereFind: "Documento de identidade",
  },
  cpf: {
    placeholder: "000.000.000-00",
    hint: "CPF sem pontos ou espaços",
    example: "123.456.789-00",
    mask: "cpf",
  },
  // ... mais hints
};
```

- [ ] **Step 2: Garantir que todos os documentos usam hints**

Verificar que todos os documentos em `src/data/documents/` têm hints adequados para cada campo.

- [ ] **Step 3: Commit**

```bash
git add src/data/documents/_fieldHints.js
git commit -m "feat: add shared field hints for legal documents"
```

---

## Fase 4: Integração e Consistencia

### Task 9: Garantir consistência entre EditorPage e LegalEditorPage

**Files:**
- Review: `src/pages/EditorPage.jsx`, `src/pages/LegalEditorPage.jsx`

**Problema:** Os dois editors têm padrões ligeiramente diferentes de UX.

- [ ] **Step 1: Verificar que ambos usam same BottomNavigation props**

EditorPage:
```javascript
<BottomNavigation
  onBack={handlePrevious}
  onNext={isLastStep ? () => navigate("preview") : handleNext}
  isFirstStep={isFirstStep}
  isLastStep={isLastStep}
  nextLabel={isLastStep ? "✓ Visualizar Mágica" : undefined}
/>
```

LegalEditorPage:
```javascript
<BottomNavigation
  onBack={handlePrevious}
  onNext={isLastStep ? () => navigate("checkout") : handleNext}
  isFirstStep={isFirstStep}
  isLastStep={isLastStep}
  nextLabel={nextLabel}
  onSaveLater={handleSaveLater}
  extraContent={filledCount !== null && (
    <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "var(--teal)", fontWeight: 700 }}>{filledCount}</span>
      campos preenchidos
    </div>
  )}
/>
```

Ambos devem ter API consistente - LegalEditorPage está mais completo.

- [ ] **Step 2: Garantir que EditorPage também tem onSaveLater e extraContent**

- [ ] **Step 3: Commit**

```bash
git add src/pages/EditorPage.jsx
git commit -m "feat: add saveLater and progress indicator to EditorPage BottomNavigation"
```

---

### Task 10: PreviewPage - Garantir volta correta

**Files:**
- Modify: `src/pages/PreviewPage.jsx:76-92`

**Problema:** Botão voltar no Preview pode não restaurar estado corretamente.

- [ ] **Step 1: Verificar navegação volta ao editor correto**

```javascript
leftAction={
  <button
    onClick={() => navigate(isLegalDocument ? "legalEditor" : "editor")}
    aria-label="Voltar ao editor"
  >
    <Icon name="ChevronLeft" className="w-5 h-5" />
  </button>
}
```

Isso está correto - navega de volta ao editor apropriado.

- [ ] **Step 2: Commit**

```bash
git add src/pages/PreviewPage.jsx
git commit -m "fix: ensure PreviewPage navigation returns to correct editor"
```

---

## Fase 5: Testes e Validação

### Task 11: Testar fluxo completo em mobile e desktop

**Files:**
- Test: `src/pages/EditorPage.jsx`, `LegalEditorPage.jsx`, `DashboardPage.jsx`

- [ ] **Step 1: Testar Mobile**

1. Abrir app em device mobile ou DevTools mobile
2. Criar novo currículo, preencher todas as etapas
3. Usar botão voltar do browser
4. Verificar que app não recarrega e estado persiste

- [ ] **Step 2: Testar Desktop**

1. Navegar pelo app
2. Redimensionar janela para mobile
3. Testar navegação
4. Verificar que BottomNavigation está correto

- [ ] **Step 3: Testar todos os tipos de documento legal**

Verificar que cada tipo de documento (compra-venda, locacao, etc.) abre e preenche corretamente.

- [ ] **Step 4: Testar PDF generation**

Verificar que PDF é gerado corretamente para ambos os tipos de documento.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: comprehensive testing of navigation and document flow"
```

---

## Resumo de Tarefas

| # | Tarefa | Prioridade | Status |
|---|--------|-----------|--------|
| 1 | AppContext - Gestão de Histórico e Scroll | Alta | Pendente |
| 2 | EditorPage - Corrigir Navegação de Etapas | Alta | Pendente |
| 3 | LegalEditorPage - Corrigir Navegação | Alta | Pendente |
| 4 | BottomNavigation - Padronizar maxWidth | Média | Pendente |
| 5 | AppNavbar - Responsividade | Média | Pendente |
| 6 | LegalEditorPage - Content Container | Média | Pendente |
| 7 | LegalFieldRenderer - AutoFocus | Baixa | Pendente |
| 8 | FIELD_HINTS para Documentos Legais | Baixa | Pendente |
| 9 | Consistência EditorPage/LegalEditorPage | Alta | Pendente |
| 10 | PreviewPage - Volta Correta | Média | Pendente |
| 11 | Testes Completos | Alta | Pendente |

---

## Commandes para Teste

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```
