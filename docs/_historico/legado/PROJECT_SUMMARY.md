# Kriou Docs - Project Summary

## Goal

The user (Reyvison) is building "Kriou Docs" - a React application for creating professional documents like resumes and legal contracts. The goal is to create a scalable, well-commented, high-level architecture project similar to Claude Code's approach.

## Instructions

- Keep all code well-commented with JSDoc style headers
- Use high-level, scalable architecture for easy maintenance and bug fixes
- Prioritize: PDF download, form validation, mobile responsiveness, document editing, user profile, and legal document structure
- User wants everything implemented at once

## Discoveries

1. **Project Setup**: Started as a basic Vite + React + Tailwind project
2. **Original Issue**: User couldn't run `vite` directly - needed to use `npm run dev`
3. **Git Issue**: 4K modifications in source control were due to `node_modules/` - resolved by creating `.gitignore`
4. **Login System**: Currently mocked (simulated) - no real backend integration yet
5. **PDF Generation**: Using `jspdf` library - already functional
6. **Project Structure**: Refactored from single monolithic App.jsx into modular structure with components, context, hooks, pages, utils, and data folders

---

## Completed Items

### ✅ Security (Fase 1)
- [x] **CPF Validation** — Mod11 algorithm implemented in `validation.js`
  - Rejects all-same-digit sequences (e.g., `000.000.000-00`)
  - Full checksum validation for both digits
- [x] **Email Validation** — RFC-compliant pattern in `validation.js`
- [x] **Rate Limiter** — Client-side protection in `rateLimiter.js`
  - Login: 5 attempts / 15 min
  - OTP: 3 attempts / 10 min
  - Uses sessionStorage (expires when tab closes)
- [x] **Sanitization** — XSS prevention in `sanitization.js`
  - `sanitizeText()` — strips HTML tags
  - `sanitizeFormData()` — recursive object sanitization
  - Works in Web Workers (no DOMPurify dependency)
- [x] **useUnsavedChanges** hook — warns on page close/navigation
- [x] **useConfirm** hook — async confirmation dialog without blocking UI
- [x] **ErrorBoundary** — graceful error handling with fallback UI

### ✅ Quality (Fase 2/4)
- [x] **Centralized Formatting** — `formatCpf`, `formatPhone`, `formatCnpj`, `formatCep`, `formatCurrency`, `formatDate` in `formatting.js`
- [x] **Centralized Styles** — `LABEL_STYLE`, `ERROR_STYLE`, `SECTION_TITLE_STYLE`, `INPUT_BASE_STYLE`, `CARD_STYLE`, `GLASS_STYLE` in `constants/styles.js`
- [x] **Centralized Timing** — `DEBOUNCE_AUTOSAVE_MS`, `SAVE_FEEDBACK_DELAY_MS`, etc. in `constants/timing.js`
- [x] **Centralized Storage Keys** — `STORAGE_KEYS` pattern with user isolation in `storage.js`
- [x] **Logger utility** — Console logging utility

### ✅ Performance (Fase 3)
- [x] **Code Splitting** — Lazy loading routes in `App.jsx`
  - DashboardPage, TemplatesPage, EditorPage, PreviewPage, CheckoutPage, ProfilePage, LegalEditorPage loaded on demand
  - LandingPage and LoginPage loaded immediately (entry points)
- [x] **Suspense Boundaries** — Loading spinner fallback for lazy routes
- [x] **PDF Web Worker** — `pdfWorker.js` generates PDFs in background thread
- [x] **usePDF Hook** — `usePDF.js` manages worker lifecycle and download trigger
- [x] **useAutoSave Hook** — Debounced auto-save with status feedback (`idle`, `saving`, `saved`, `error`)
- [x] **Sonner Toaster** — Configured in `App.jsx` at bottom-center

### ✅ Tests
- [x] `validation.test.js` — CPF validation tests (6+ cases)
- [x] `formatting.test.js` — formatCpf, formatPhone tests
- [x] `sanitization.test.js` — sanitizeText tests
- [x] `useAutoSave.hook.test.js` — hook behavior tests
- [x] `Button.component.test.jsx` — component tests
- [x] `loginValidation.test.js` — login flow validation tests

### ✅ Dependencies Installed
- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `jsdom`
- `rollup-plugin-visualizer`
- `sonner` — toast notifications

---

## What's Left to Do

### 🔴 CRITICAL — Security

| Item | Status | Notes |
|------|--------|-------|
| Remove password from `useState` in LoginPage | ❌ TODO | Use `useRef` instead |
| DOMPurify installation | ⚠️ PARTIAL | Using custom stripHtml instead |
| Migrate drafts to `sessionStorage` | ❌ TODO | Currently still using `localStorage` |
| Migrate session data to `sessionStorage` | ❌ TODO | Session still in `localStorage` |
| Backend price validation | ❌ TODO | Price hardcoded in `CheckoutPage` |

### 🟠 HIGH — Architecture

| Item | Status | Notes |
|------|--------|-------|
| Split `UI.jsx` into components/ | ❌ TODO | 1,365 lines — needs modularization |
| Split `AppContext` into contexts/ | ❌ TODO | AuthContext, ResumeContext, LegalContext, UIContext |
| Create `services/` layer | ❌ TODO | authService, documentService, pdfService, storageService |
| Lazy load legal documents by type | ❌ TODO | 1,949 lines loaded always |
| IndexedDB for large drafts | ❌ TODO | localStorage has 5-10MB limit |

### 🟡 MEDIUM — UX

| Item | Status | Notes |
|------|--------|-------|
| `SaveIndicator` component | ❌ TODO | Show save status in navbar |
| `SkeletonCard` component | ❌ TODO | Loading skeleton for document list |
| `EmptyState` component | ❌ TODO | Empty dashboard state |
| `FormField` component | ❌ TODO | Reusable label + input + error wrapper |
| `AppNavbar` component | ❌ TODO | Unified navbar for all pages |
| `AppStepper` component | ❌ TODO | Step indicator for wizards |
| `BottomNavigation` component | ❌ TODO | Back/Next navigation |
| `ConfirmDialog` component | ❌ TODO | Destructive action confirmation |
| Replace `console.error` with toasts | ⚠️ PARTIAL | Audit all occurrences |
| Remove mock data from Dashboard | ❌ TODO | Connect to real context data |
| Form progress bar | ❌ TODO | Visual fill percentage |

### 🟡 MEDIUM — Accessibility

| Item | Status | Notes |
|------|--------|-------|
| Audit `aria-labels` | ❌ TODO | All interactive elements |
| Audit `role="alert"` on errors | ❌ TODO | Error messages |
| Audit `role="dialog"` on modals | ❌ TODO | Modal accessibility |
| Keyboard navigation | ❌ TODO | Tab order and focus management |
| Responsive testing (375px, 768px, 1280px) | ❌ TODO | Physical or emulated testing |

### 🟢 LOW — Quality of Life

| Item | Status | Notes |
|------|--------|-------|
| JSDoc on all public functions | ⚠️ PARTIAL | Core utils done, need full audit |
| Remove prototype dead code | ⚠️ PARTIAL | Check if files still exist in root |
| `npm run build` analysis | ❌ TODO | Run and verify bundle size < 300KB |
| `npm run test:coverage` | ❌ TODO | Verify ≥ 80% on critical utils |
| Manual E2E testing | ❌ TODO | All user flows |

---

## Project Structure

```
KRIOU-DOCS/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx      ✅
│   │   ├── Icons.jsx
│   │   ├── Theme.jsx
│   │   ├── UI.jsx                 ⚠️ Needs splitting
│   │   └── ui/
│   │       ├── layout.jsx
│   │       ├── legal-helpers.jsx
│   │       ├── primitives.jsx
│   │       └── resume-helpers.jsx
│   ├── constants/
│   │   ├── styles.js              ✅
│   │   ├── timing.js              ✅
│   │   ├── storage.js             ✅
│   │   └── responsive.js
│   ├── context/
│   │   └── AppContext.jsx         ⚠️ Needs splitting
│   ├── data/
│   │   ├── constants.js
│   │   └── legalDocuments.js      ⚠️ Needs lazy loading
│   ├── hooks/
│   │   ├── index.js
│   │   ├── useAutoSave.js         ✅
│   │   ├── useConfirm.js          ✅
│   │   ├── useUnsavedChanges.js  ✅
│   │   └── usePDF.js             ✅
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TemplatesPage.jsx
│   │   ├── EditorPage.jsx
│   │   ├── PreviewPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── LegalEditorPage.jsx
│   ├── utils/
│   │   ├── formatting.js          ✅
│   │   ├── validation.js          ✅
│   │   ├── sanitization.js        ✅
│   │   ├── rateLimiter.js         ✅
│   │   ├── storage.js            ✅
│   │   ├── pdfGenerator.js
│   │   ├── legalPdfGenerator.js
│   │   ├── responsive.js
│   │   ├── toast.js
│   │   └── mockData.js
│   ├── workers/
│   │   └── pdfWorker.js           ✅
│   └── App.jsx                   ✅ (code splitting done)
├── plano-evolucao/
│   ├── 00-VISAO-GERAL.md
│   ├── 01-SEGURANCA.md
│   ├── 02-ARQUITETURA.md
│   ├── 03-PERFORMANCE.md
│   ├── 04-QUALIDADE.md
│   ├── 05-UX-FUNCIONALIDADES.md
│   ├── 06-TESTES.md
│   ├── 07-CRONOGRAMA.md
│   └── 08-CHECKLIST-EXECUCAO.md
└── docs/
    ├── PROJECT_SUMMARY.md         ← This file
    ├── HISTORICO-PROJETO-KRIOU-DOCS.md
    └── PLANO-REFATORACAO.md
```

---

## Legal Document Types (Current)

| Type | Status | Fields |
|------|--------|--------|
| Compra e Venda | ✅ Available | Nome/CPF comprador/vendedor, descrição imóvel, valor, forma pagamento, data |
| Aluguel | ✅ Available | Nome/CPF locador/locatário, endereço, valor aluguel/caucão, prazos |
| Procuração | ✅ Available | Nome/CPF outorgante/outorgado, poderes, validade |
| Doação | ✅ Available | Donation documents with variants |
| União Estável | ✅ Available | Contract and dissolution variants |
| Recibo | ✅ Available | Payment and rental receipt variants |
| Dissolução | ✅ Available | Union dissolution with pension/sharing variants |

---

## Next Steps (Priority Order)

### 1. Security Fixes (Week 1)
```
- [ ] Remove password from useState in LoginPage.jsx
- [ ] Audit localStorage for PII — migrate sensitive data to sessionStorage
- [ ] Implement server-side price validation
```

### 2. Component Architecture (Week 2-3)
```
- [ ] Split UI.jsx into Button/, Card/, Form/, Layout/, Navigation/, Feedback/
- [ ] Create AppNavbar, AppStepper, BottomNavigation
- [ ] Create SaveIndicator, SkeletonCard, EmptyState, FormField, ConfirmDialog
- [ ] Split AppContext → AuthContext + ResumeContext + LegalContext + UIContext
```

### 3. Service Layer (Week 3-4)
```
- [ ] Create src/services/authService.js
- [ ] Create src/services/documentService.js
- [ ] Create src/services/pdfService.js
- [ ] Migrate legalDocuments.js to lazy loading per type
- [ ] Consider IndexedDB for large draft storage
```

### 4. UX Polish (Week 5)
```
- [ ] Replace all console.error with toast.error()
- [ ] Connect DashboardPage to real data (remove mocks)
- [ ] Add form progress indicator
- [ ] Accessibility audit and fixes
- [ ] Responsive testing across breakpoints
```

### 5. Production Readiness (Week 6-7)
```
- [ ] Run npm run build — analyze bundle
- [ ] Run npm run test:coverage — verify ≥ 80% on critical utils
- [ ] Manual E2E testing all flows
- [ ] Fix any bugs found
```

---

*Document generated: Abril 2026*
*Last updated: Abril 2026*
