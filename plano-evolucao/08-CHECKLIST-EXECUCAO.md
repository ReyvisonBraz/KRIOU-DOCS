# Checklist de Execução — Kriou Docs
> Use este arquivo para acompanhar o progresso. Marque com [x] à medida que completa.

---

## Fase 1 — Segurança (Semana 1)

### Armazenamento Seguro
- [ ] Remover CPF de localStorage em `storage.js`
- [ ] Remover telefone de localStorage em `storage.js`
- [ ] Remover e-mail de localStorage em `storage.js`
- [ ] Criar função `saveSession(token, userId)` usando sessionStorage
- [ ] Rascunhos: migrar de localStorage para sessionStorage

### Login Seguro
- [ ] Remover `password` de `useState` em `LoginPage.jsx`
- [ ] Usar `useRef` para o campo de senha
- [ ] Limpar campo de senha após envio

### Validações
- [ ] Implementar algoritmo Mod11 para CPF em `validation.js`
- [ ] Corrigir regex de e-mail em `validation.js`
- [ ] Testar CPF válido: `123.456.789-09` → aceito
- [ ] Testar CPF inválido: `000.000.000-00` → rejeitado

### Sanitização
- [ ] `npm install dompurify`
- [ ] Criar `src/utils/sanitization.js`
- [ ] Exportar `sanitizeText()` e `sanitizeFormData()`
- [ ] Aplicar `sanitizeFormData()` em `saveDraft()`

### Rate Limiting
- [ ] Criar `src/utils/rateLimiter.js`
- [ ] Aplicar `checkRateLimit()` no handler de login
- [ ] Aplicar `checkRateLimit()` no handler de verificação de OTP

---

## Fase 2 — Limpeza (Semana 2)

### Código Morto
- [ ] `git rm kriou-docs-prototype.jsx`
- [ ] `git rm DocumentLanding.jsx`
- [ ] `git rm DocumentDetails.jsx`
- [ ] `git rm LegalDocEditor.jsx`
- [ ] `git rm ProfilePage.jsx` (raiz)
- [ ] Commit: "chore: remove prototype dead code"

### Utilitários Centralizados
- [ ] Criar `src/utils/formatting.js` com formatCpf, formatPhone, formatCnpj, formatCep, formatCurrency
- [ ] Remover formatCpf de `LoginPage.jsx` e importar de formatting.js
- [ ] Remover formatPhone de `LoginPage.jsx` e importar de formatting.js
- [ ] Verificar outros arquivos com formatadores duplicados

### Estilos Centralizados
- [ ] Criar `src/constants/styles.js` com LABEL_STYLE, ERROR_STYLE, SECTION_TITLE_STYLE, INPUT_BASE_STYLE, CARD_STYLE
- [ ] Remover `labelStyle` de `EditorPage.jsx` e importar de constants
- [ ] Remover `labelStyle` de `LoginPage.jsx` e importar de constants
- [ ] Remover `errorStyle` de `EditorPage.jsx` e importar de constants
- [ ] Remover `errorStyle` de `LoginPage.jsx` e importar de constants

### Constantes
- [ ] Criar `src/constants/storage.js` com STORAGE_KEYS
- [ ] Criar `src/constants/timing.js` com DEBOUNCE_MS, TRANSITION_*
- [ ] Substituir magic numbers `1500` pelo DEBOUNCE_AUTOSAVE_MS
- [ ] Substituir string literals de chave storage pelos STORAGE_KEYS

### Componentes Base
- [ ] Criar `src/components/Form/ErrorMessage.jsx`
- [ ] Substituir todos os `{errors.campo && <div>}` por `<ErrorMessage />`
- [ ] Criar `src/components/Form/FormField.jsx`
- [ ] Criar `src/utils/logger.js`

---

## Fase 3 — Componentes Reutilizáveis (Semana 3)

### Estrutura de Pastas
- [ ] Criar `src/components/Button/`
- [ ] Criar `src/components/Card/`
- [ ] Criar `src/components/Form/`
- [ ] Criar `src/components/Layout/`
- [ ] Criar `src/components/Navigation/`
- [ ] Criar `src/components/Feedback/`
- [ ] Criar `src/components/ErrorBoundary/`

### Extrair de UI.jsx
- [ ] Mover Button para `components/Button/Button.jsx`
- [ ] Mover Card para `components/Card/Card.jsx`
- [ ] Mover Input para `components/Form/Input.jsx`
- [ ] Mover Select para `components/Form/Select.jsx`
- [ ] Mover LoadingSpinner para `components/Feedback/LoadingSpinner.jsx`
- [ ] Criar `components/index.js` re-exportando tudo
- [ ] Verificar que imports existentes ainda funcionam

### Componentes de Layout
- [ ] Criar `AppNavbar` em `components/Layout/AppNavbar.jsx`
  - [ ] Props: title, leftAction, rightAction, children
- [ ] Integrar AppNavbar em EditorPage
- [ ] Integrar AppNavbar em LegalEditorPage
- [ ] Integrar AppNavbar em DashboardPage
- [ ] Integrar AppNavbar em PreviewPage
- [ ] Integrar AppNavbar em CheckoutPage

### Navegação
- [ ] Criar `AppStepper` em `components/Navigation/AppStepper.jsx`
  - [ ] Props: steps, currentStep, onStepClick, completedSteps
- [ ] Integrar AppStepper em EditorPage
- [ ] Integrar AppStepper em LegalEditorPage

### BottomNavigation
- [ ] Criar `BottomNavigation` em `components/Layout/BottomNavigation.jsx`
  - [ ] Props: onBack, onNext, isFirstStep, isLastStep, nextLabel
- [ ] Integrar BottomNavigation em EditorPage
- [ ] Integrar BottomNavigation em LegalEditorPage

### ErrorBoundary
- [ ] Criar `ErrorBoundary.jsx`
- [ ] Envolver app em `App.jsx` com ErrorBoundary

---

## Fase 4 — Arquitetura de Contextos (Semana 4)

### Divisão do AppContext
- [ ] Criar `src/context/AuthContext.jsx`
  - [ ] Migrar: user, sessionToken, authStep, login, verifyOtp, logout
- [ ] Criar `src/context/ResumeContext.jsx`
  - [ ] Migrar: formData, currentStep, errors, saveStatus, updateField, nextStep, prevStep
- [ ] Criar `src/context/LegalContext.jsx`
  - [ ] Migrar: selectedDocType, legalFormData, legalStep
- [ ] Criar `src/context/UIContext.jsx`
  - [ ] Migrar: loading global, modal states
- [ ] Remover estados migrados do AppContext
- [ ] Atualizar `App.jsx` para usar novos providers

### Serviços
- [ ] Criar `src/services/authService.js`
- [ ] Criar `src/services/documentService.js`
- [ ] Criar `src/services/pdfService.js`
- [ ] Criar `src/services/storageService.js` com IndexedDB

### Divisão de legalDocuments.js
- [ ] Criar `src/data/legalDocuments/` pasta
- [ ] Separar cada tipo de documento em arquivo próprio
- [ ] Criar `src/data/legalDocuments/index.js` com lazy imports
- [ ] Atualizar LegalEditorPage para usar `getDocument(type)`

---

## Fase 5 — Performance (Semana 5)

### Code Splitting
- [ ] Converter imports de páginas para `React.lazy()` em App.jsx
  - [ ] DashboardPage
  - [ ] EditorPage
  - [ ] LegalEditorPage
  - [ ] PreviewPage
  - [ ] CheckoutPage
  - [ ] TemplatesPage
  - [ ] ProfilePage
- [ ] Envolver Routes com `<Suspense fallback={<LoadingSpinner />}>`

### Bundle
- [ ] `npm install --save-dev rollup-plugin-visualizer`
- [ ] Adicionar visualizer no `vite.config.js`
- [ ] `npm run build` → analisar bundle-analysis.html
- [ ] Configurar `manualChunks` para react, jspdf

### PDF em Web Worker
- [ ] Criar `src/workers/pdfWorker.js`
- [ ] Implementar `src/hooks/usePDF.js` com Web Worker
- [ ] Atualizar PreviewPage para usar `usePDF`
- [ ] Atualizar CheckoutPage para usar `usePDF`
- [ ] Testar: UI não trava durante geração de PDF

### Auto-Save
- [ ] Criar `src/hooks/useAutoSave.js` com debounce
- [ ] Integrar em EditorPage
- [ ] Integrar em LegalEditorPage

### Memoização
- [ ] Adicionar `React.memo` em ExperienciaItem
- [ ] Adicionar `React.memo` em FormacaoItem
- [ ] Adicionar `React.memo` em IdiomaItem
- [ ] Adicionar `useCallback` em handlers de add/remove de arrays

---

## Fase 6 — UX (Semana 6)

### Notificações
- [ ] `npm install sonner`
- [ ] Adicionar `<Toaster />` em App.jsx
- [ ] Substituir console.error por toast.error (auditoria completa)
- [ ] Substituir alertas de sucesso por toast.success

### Feedback Visual
- [ ] Criar `SaveIndicator` component
- [ ] Integrar SaveIndicator na navbar de EditorPage
- [ ] Integrar SaveIndicator na navbar de LegalEditorPage
- [ ] Criar `SkeletonCard` component
- [ ] Exibir SkeletonCard enquanto documentos carregam no DashboardPage
- [ ] Criar `EmptyState` component
- [ ] Usar EmptyState no DashboardPage quando lista vazia

### Dados Reais
- [ ] Remover dados mock de `DashboardPage.jsx` (linhas 33-39)
- [ ] Conectar lista de documentos ao contexto real

### Prevenção de Perda de Dados
- [ ] Criar `src/hooks/useUnsavedChanges.js`
- [ ] Integrar em EditorPage
- [ ] Integrar em LegalEditorPage

### Ações Destrutivas
- [ ] Criar `ConfirmDialog` component
- [ ] Criar `useConfirm` hook
- [ ] Usar ConfirmDialog antes de excluir documento

### Acessibilidade
- [ ] Auditar todos os inputs: adicionar `id` + `label htmlFor`
- [ ] Adicionar `role="alert"` nas mensagens de erro
- [ ] Adicionar `aria-label` em botões sem texto visível
- [ ] Adicionar `role="dialog"` + `aria-modal` nos modais

### Responsividade
- [ ] Testar em 375px — corrigir problemas
- [ ] Testar em 390px — corrigir problemas
- [ ] Testar em 768px — corrigir problemas
- [ ] Testar em 1280px — corrigir problemas

---

## Fase 7 — Testes (Semana 7)

### Setup
- [ ] `npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`
- [ ] Configurar Vitest em vite.config.js
- [ ] Criar `src/tests/setup.js`
- [ ] Verificar `npm test` roda sem erros

### Testes de Utilitários
- [ ] validation.test.js: validateCpf (6 casos mínimo)
- [ ] formatting.test.js: formatCpf (4 casos), formatPhone (2 casos)
- [ ] sanitization.test.js: sanitizeText (3 casos)

### Testes de Componentes
- [ ] ErrorMessage.test.jsx
- [ ] Button.test.jsx

### Testes de Integração
- [ ] LoginPage.test.jsx: CPF inválido mostra erro
- [ ] LoginPage.test.jsx: CPF válido avança para OTP

### Testes de Hooks
- [ ] useAutoSave.test.js: não salva imediatamente, salva após delay

### Validação Final
- [ ] `npm run test:coverage` — revisar relatório
- [ ] `npm run build` — build sem erros nem warnings críticos
- [ ] `npm run dev` — testar todos os fluxos manualmente:
  - [ ] LandingPage → LoginPage → Dashboard
  - [ ] Dashboard → Editor → Preview → Checkout
  - [ ] Dashboard → Legal Editor → Preview → Checkout
  - [ ] Login → Logout → Login novamente
- [ ] Nenhum `console.error` ou `console.warn` de React no browser

---

## Critérios de Conclusão do Projeto

- [ ] Zero dados PII em localStorage em texto puro
- [ ] CPF validado com algoritmo Mod11
- [ ] Todos os inputs sanitizados antes do armazenamento
- [ ] Bundle inicial < 300KB
- [ ] PDF gerado sem travar a UI
- [ ] `npm run build` completa sem erros
- [ ] Cobertura de testes ≥ 80% nos utilitários críticos
- [ ] Sem dados mock no dashboard de produção
- [ ] Acessibilidade básica (aria-labels, roles)
- [ ] Responsivo em mobile, tablet e desktop
