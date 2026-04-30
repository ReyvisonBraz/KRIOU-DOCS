# KRIOU DOCS - Análise Completa do Projeto

> **Data da Análise:** Abril 2026  
> **Analista:** opencode  
> **Versão do Projeto:** 0.0.0

---

## 1. Visão Geral

### 1.1 Descrição do Projeto
Plataforma web para criação de documentos profissionais (currículos e contratos jurídicos) com preenchimento guiado, geração de PDF e entrega via WhatsApp.

### 1.2 Stack Tecnológico

| Categoria | Tecnologia | Versão |
|-----------|-----------|-------|
| Frontend | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.2.2 |
| Autenticação | Supabase Auth (Google OAuth) | - |
| Database | Supabase (PostgreSQL) | - |
| PDF | JSPDF | 4.2.1 |
| Build | Vite | 8.0.1 |
| Testes | Vitest | 4.1.2 |
| Notificações | Sonner | 2.0.7 |

---

## 2. Estrutura de Arquivos

```
KRIOU-DOCS/
├── src/
│   ├── components/           # Componentes de UI
│   │   ├── ui/             # Subcomponentes organizados por tipo
│   │   │   ├── primitives.jsx   # Button, Card, Badge, Tag, Spinner
│   │   │   ├── form.jsx         # Input, Textarea, Select
│   │   │   ├── layout.jsx       # Navbar, AppNavbar, AppStepper, BottomNavigation
│   │   │   ├── feedback.jsx     # EmptyState, ErrorMessage, SaveIndicator, ConfirmDialog
│   │   │   ├── resume-helpers.jsx  # FieldHint, QuickSuggestion, ExperienceTypeSelector
│   │   │   ├── legal-helpers.jsx  # VariantSelector, SectionHeader, LegalHelpButton
│   │   │   └── document.jsx    # DocumentCard
│   │   ├── UI.jsx           # Re-export (compatibilidade)
│   │   ├── Icons.jsx         # Biblioteca de ícones SVG (50+ ícones)
│   │   ├── Theme.jsx        # Provider de tema
│   │   └── ErrorBoundary.jsx
│   │
│   ├── context/            # Estado global
│   │   ├── AppContext.jsx   # Orquestrador (compõe todos)
│   │   ├── AuthContext.jsx  # Supabase Auth
│   │   ├── ResumeContext.jsx # Currículo
│   │   └── LegalContext.jsx # Documentos jurídicos
│   │
│   ├── data/              # Dados e constantes
│   │   ├── constants.js      # Configurações globais
│   │   ├── legalDocuments.js # Central de documentos jurídicos
│   │   └── documents/      # Templates individuais
│   │       ├── compra-venda.js
│   │       ├── locacao.js
│   │       ├── procuracao.js
│   │       ├── doacao.js
│   │       ├── recibo.js
│   │       ├── uniao-estavel.js
│   │       ├── autorizacao-viagem.js
│   │       ├── comodato.js
│   │       ├── permuta.js
│   │       └── _shared.js
│   │
│   ├── hooks/             # Hooks personalizados
│   │   ├── useAutoSave.js      # Debounce save (1.5s)
│   │   ├── useConfirm.js     # Diálogo de confirmação
│   │   ├── usePDF.js       # Geração de PDF
│   │   └── useUnsavedChanges.js
│   │
│   ├── pages/             # Páginas
│   │   ├── LandingPage.jsx     # Homepage pública
│   │   ├── LoginPage.jsx      # Login Google
│   │   ├── DashboardPage.jsx  # Painel usuário
│   │   ├── TemplatesPage.jsx  # Escolha template currículo
│   │   ├── EditorPage.jsx    # Wizard currículo 7 etapas
│   │   ├── PreviewPage.jsx    # Preview PDF
│   │   ├── LegalEditorPage.jsx # Editor documentos jurídicos
│   │   ├── ProfilePage.jsx    # Perfil usuário
│   │   ├── CheckoutPage.jsx   # Pagamento
│   │   ├── WelcomePage.jsx   # Onboarding
│   │   ��── CompleteProfilePage.jsx
│   │   └── AuthCallbackPage.jsx
│   │
│   ├── services/         # Integrações externas
│   │   └── DocumentService.js # Supabase (CRUD documentos/perfil)
│   │
│   ├── lib/              # Configurações
│   │   └── supabase.js    # Cliente Supabase singleton
│   │
│   ├── utils/            # Funções utilitárias
│   │   ├── validation.js     # Validação CPF, email, phone, steps
│   │   ├── formatting.js   # Formatação CPF, phone, CNPJ, CEP, moeda
│   │   ├── sanitization.js # Limpeza de dados
│   │   ├── storage.js     # localStorage wrapper
│   │   ├── toast.js       # Notificações
│   │   ├── legalPdfGenerator.js
│   │   └── textCleanup.js # Limpeza gramatical pt-BR
│   │
│   ├── workers/          # Web Workers
│   │   └── pdfWorker.js  # Geração PDF em background
│   │
│   ├── constants/       # Constantes de estilo
│   │   ├── styles.js
│   │   ├── timing.js
│   │   └── storage.js
│   │
│   ├── hooks/
│   │   └── index.js
│   │
│   ├── App.jsx          # Router principal
│   └── main.jsx        # Entry point
│
├── public/              # Arquivos estáticos
├── package.json
├── vite.config.js
├── eslint.config.js
└── index.html
```

---

## 3. Arquitetura de Estado

### 3.1 Hierarquia de Providers

```
AppProvider (orquestrador)
├── NavigationContext
│   ├── currentPage: string ("landing" | "login" | "dashboard" | ...)
│   └── navigate: (page) => void
├── AuthProvider (Supabase)
│   ├── user: object
│   ├── userId: string | null
│   ├── displayName: string
│   ├── avatarUrl: string | null
│   ├── email: string | null
│   ├── isAuthLoading: boolean
│   ├── signInWithGoogle: () => Promise
│   └── logout: () => Promise
├── ResumeProvider (currículo)
│   ├── selectedTemplate: object | null
│   ├── currentStep: number (0-6)
│   ├── formData: object
│   ├── saveStatus: "idle" | "saving" | "saved" | "error"
│   ├── userDocuments: array
│   ├── filter: string
│   └── hooks: setSelectedTemplate, updateForm, resetForm...
├── LegalProvider (documentos jurídicos)
│   ├── documentType: object | null
│   ├── selectedVariant: object | null
│   ├── legalFormData: object
│   ├── disabledFields: object
│   └── legalStep: number
└── UIContext
    ├── isLoading: boolean
    ├── checkoutComplete: boolean
    ├── profile: object | null
    └── saveStatus: string
```

### 3.2 Hook Unificado (`useApp()`)

Retorna todos os contextos combinados:
```javascript
const {
  // Navegação
  currentPage, navigate,
  
  // Auth
  userId, displayName, avatarUrl, email, isAuthLoading, signInWithGoogle, logout,
  
  // Resume
  selectedTemplate, setSelectedTemplate, templates, currentStep, setCurrentStep,
  formData, setFormData, updateForm, resetForm, saveStatus, lastSaved,
  triggerSave, userDocuments, setUserDocuments, saveDocument, filter, setFilter,
  
  // Legal
  documentType, setDocumentType, selectedVariant, setSelectedVariant,
  legalFormData, setLegalFormData, disabledFields, setDisabledFields,
  legalStep, setLegalStep, legalDocumentTypes, updateLegalField,
  selectDocumentType, resetLegalForm, triggerLegalSave,
  
  // UI
  isLoading, checkoutComplete, setCheckoutComplete, profile, setProfile,
} = useApp();
```

---

## 4. Navegação

### 4.1 Rotas

| Página | Chave | Descrição | Lazy Load |
|--------|------|-----------|----------|
| LandingPage | `landing` | Homepage pública | No |
| LoginPage | `login` | Login Google | No |
| AuthCallbackPage | `authCallback` | Callback OAuth | Yes |
| CompleteProfilePage | `completeProfile` | Completar perfil | Yes |
| WelcomePage | `welcome` | Boas-vindas | Yes |
| DashboardPage | `dashboard` | Painel usuário | Yes |
| TemplatesPage | `templates` | Escolha template | Yes |
| EditorPage | `editor` | Wizard currículo | Yes |
| PreviewPage | `preview` | Preview PDF | Yes |
| CheckoutPage | `checkout` | Pagamento | Yes |
| ProfilePage | `profile` | Perfil usuário | Yes |
| LegalEditorPage | `legalEditor` | Editor jurídico | Yes |

### 4.2 Navegação SPA

- Usa `window.history.pushState()` + popstate listener
- Persiste página atual no localStorage (`kriou_docs_current_page`)
- Restaura página ao fazer login (se não for página de auth)

---

## 5. Páginas Principais

### 5.1 LandingPage (`/`)
- Hero section com CTA
- Lista de funcionalidades (6 cards)
- Documentos disponíveis (grid)
- Planos de preços (3 planos)
- Footer

### 5.2 DashboardPage
- Navbar com perfil e logout
- Barra de busca
- Botões "Novo Currículo" / "Novo Documento"
- Tabs por tipo de documento
- Grid de documentos (DocumentCard)
- Empty state

### 5.3 EditorPage (Wizard Currículo)
- 7 etapas: Dados Pessoais → Objetivo → Experiência → Formação → Habilidades → Idiomas → Extras
- AppStepper com progresso
- Form dinâmico por etapa
- Validação por step
- Preview inline
- Auto-save a cada 1.5s

### 5.4 LegalEditorPage
- Seleção de tipo de documento
- Selector de variante
- Campos dinâmicos por documento
- Editor de texto rico
- Preview do documento gerado

---

## 6. Componentes de UI

### 6.1 Primitives
- **Button**: `variant` (primary/secondary/ghost/small), `size`, `icon`, `disabled`
- **Card**: `variant`, `interactive`, `onClick`
- **Badge**: `variant` (coral/teal/success)
- **Tag**: Label inline
- **Spinner**: Loading indicator

### 6.2 Form
- **Input**: Com placeholder, label, erro
- **Textarea**: Multiline
- **Select**: Dropdown com ícones

### 6.3 Layout
- **Navbar**: Glass sticky header
- **AppNavbar**: Navbar reutilizável com title, leftAction, rightAction
- **AppStepper**: Indicador de progresso
- **BottomNavigation**: Navegação mobile

### 6.4 Feedback
- **EmptyState**: Ícone + título + descrição + ação
- **ErrorMessage**: Mensagem de erro
- **SaveIndicator**: Status de save (idle/saving/saved/error)
- **SkeletonCard**: Loading skeleton
- **ConfirmDialog**: Modal de confirmação

### 6.5 Helpers (Currículo)
- **FieldHint**: Dica contextual
- **QuickSuggestion**: Sugestões rápidas
- **ExperienceTypeSelector**: Tipo de experiência
- **FieldWithIcon**: Input com ícone
- **VisualExample**: Exemplo visual
- **QuickFillCard**: Preenchimento rápido

### 6.6 Helpers (Jurídico)
- **VariantSelector**: Selector de variante
- **SectionHeader**: Cabeçalho de seção
- **LegalHelpButton**: Botão de ajuda
- **OptionalFieldToggle**: Campo opcional
- **ClientNoteBanner**: Nota explicativa
- **LegalFieldRenderer**: Renderizador de campo

### 6.7 Document
- **DocumentCard**: Card de documento no grid

---

## 7. Hooks Personalizados

### 7.1 useAutoSave
```javascript
const { saveStatus, lastSaved, triggerSave } = useAutoSave(data, saveFn, 1500);
```
- Debounce de 1.5s (default)
- Feedback visual: idle → saving → saved/error
- Não save na montagem inicial

### 7.2 useConfirm
```javascript
const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
```
- Modal de confirmação reutilizável
- Retorna promise

### 7.3 useUnsavedChanges
- Detecta mudanças não salvas
- Alerta ao sair da página

### 7.4 usePDF
- Geração de PDF com JSPDF

---

## 8. Dados e Documentos

### 8.1 Constants (`src/data/constants.js`)

**Templates de Currículo:**
- Executivo (azul/coral)
- Criativo (roxo/turquesa)
- Clássico (preto/dourado)
- Tech (verde/turquesa)
- Primeiro Emprego (coral)

**Steps do Wizard:**
0. Dados Pessoais
1. Objetivo
2. Experiência
3. Formação
4. Habilidades
5. Idiomas
6. Extras

**Skills Predefinidas:**
- Técnicas: JavaScript, TypeScript, React, Node.js, Python, SQL, Git...
- Comportamentais: Comunicação, Liderança, Trabalho em Equipe...

**Níveis de Idiomas:**
- Básico, Intermediário, Avançado, Fluente, Nativo

**Status de Formação:**
- Completo, Cursando, Trancado, Incompleto

### 8.2 Documentos Jurídicos

9 tipos de documentos:
1. **Compra e Venda** - Imóveis, veículos, terrenos
2. **Locação** - Residencial, comercial
3. **Procuração** - geral, ad judiciam
4. **Doação** - Imóveis, com reversão, com usufruto
5. **Recibo** - Pagamento, aluguel
6. **União Estável** - Contrato, dissolução, com pensão
7. **Autorização de Viagem** - Nacional, internacional
8. **Comodato** - Imóvel, rural/parceria
9. **Permuta** - Imóveis

Cada documento tem:
- `id`, `name`, `description`, `icon`
- `available`: boolean
- `variants`: array de variantes
- `defaultVariant`: ID padrão
- `commonSections`: seções gerais
- `variantSections`: seções por variante

---

## 9. Validação

### 9.1 Validation Rules (`src/utils/validation.js`)

```javascript
VALIDATION_RULES = {
  required: (value) => boolean,
  email: (email) => boolean,
  cpf: (cpf) => boolean,  // Algoritmo Mod11
  phone: (phone) => boolean,
  minLength: (min) => (value) => boolean,
  maxLength: (max) => (value) => boolean,
}
```

### 9.2 Step Validations

Cada step (0-6) tem suas próprias regras de validação.

### 9.3 Funções Exportadas

- `validateField(field, value, rules)` → `{ valid, message? }`
- `validateStep(step, formData)` → `{ valid, errors }`
- `validateForm(formData)` → `{ valid, errors }`
- `getStepStatus(step, formData)` → `{ isValid, isComplete, errors }`

---

## 10. Formatação

### 10.1 Funções (`src/utils/formatting.js`)

- `formatCpf(value)` → "000.000.000-00"
- `formatPhone(value)` → "(00) 00000-0000"
- `formatCnpj(value)` → "00.000.000/0000-00"
- `formatCep(value)` → "00000-000"
- `formatCurrency(value)` → "R$ 0,00"
- `formatDate(isoDate)` → "dd/mm/aaaa"

---

## 11. Armazenamento

### 11.1 Storage Keys

```
kriou_docs_form_data           → Form dados (legacy)
kriou_docs_legal_form_data   → Form jurídico (legacy)
kriou_docs_user_session     → Sessão (deprecated)
kriou_docs_template_prefs  → Preferências template
kriou_docs_current_page  → Página atual
kriou_user_{userId}_documents    → Docs do usuário
kriou_user_{userId}_draft_resume → Rascunho currículo
kriou_user_{userId}_draft_legal → Rascunho jurídico
```

### 11.2 Funções Principais

- `saveDraft(draftData, userId, type)` / `loadDraft()`
- `saveDocuments(documents, userId)` / `loadDocuments()`
- `saveFormData()` / `loadFormData()`
- `savePage()` / `loadPage()` / `clearPage()`
- `clearAll()` → Limpa tudo

---

## 12. Supabase

### 12.1 Cliente (`src/lib/supabase.js`)

- Singleton: `export const supabase`
- Credenciais: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Modo stub em dev sem credenciais
- Auth config:
  - `autoRefreshToken: true`
  - `persistSession: true`
  - `detectSessionInUrl: true`

### 12.2 Tabelas

- `documents`: documentos do usuário
- `profiles`: perfil do usuário

### 12.3 DocumentService

```javascript
DocumentService = {
  fetchAll()           → documentos do usuário
  insert(doc, userId)  → cria documento
  remove(id)         → remove documento
  fetchProfile()      → perfil do usuário
  updateProfile()    → atualiza perfil
  isProfileComplete() → verifica perfil
  isOnboardingDone() → verifica onboarding
  markOnboardingDone() → marca done
}
```

---

## 13. Ícones

### 13.1 Biblioteca (`src/components/Icons.jsx`)

50+ ícones SVG inline:
- FileText, User, Briefcase, GraduationCap, Star, Globe
- Plus, Award, Check, ChevronRight/Left
- Phone, Download, Edit, Trash, Copy
- Zap, Shield, Clock, Home, LogOut
- Eye, CreditCard, MessageCircle, Layout, Save
- Bell, HelpCircle, UserPlus, Mail, EyeOff
- LogIn, Lock, ArrowRight, Search, Trash2
- Bookmark, Key, Gift, FileCheck, Heart
- Plane, Repeat, Wrench, MapPin, RefreshCw
- Tag, Users...

---

## 14. Fluxo de Usuário

### 14.1 Sem Login
```
Landing → Login (Google OAuth) → AuthCallback → Dashboard
```

### 14.2 Primeiro Login
```
AuthCallback → CompleteProfile (nome, sobrenome, CPF)
         → Welcome → Dashboard
```

### 14.3 Uso Normal
```
Dashboard → Templates → Editor → Preview → Checkout → Download/WhatsApp
        → Documentos existentes → Editar → Preview → Download
```

### 14.4 Currículo
```
Editor (Step 0) → Step 1 → ... → Step 6 → Preview → Checkout
```

### 14.5 Documento Jurídico
```
LegalEditor → Seleciona tipo → Preenche campos → Preview → Checkout
```

---

## 15. Auto-save

### 15.1 Fluxo

1. Usuário digita → estado muda
2. useAutoSave detecta mudança
3. Aguarda 1.5s de inatividade
4. Chama `saveFn(data)`
5. Atualiza `saveStatus`: idle → saving → saved
6. Se erro: saved → error

### 15.2 Implementação

- Debounce com `setTimeout`
- Não save no primeiro render
- Cleanup no unmount: `clearTimeout`
- Retorna `lastSaved` timestamp

---

## 16. Geração de PDF

### 16.1 Currículo

- Template baseado no estilo selecionado
- html2canvas → canvas → PDF
- ou jsPDF direto

### 16.2 Jurídico

- Interpolação de template com dados
- textCleanup (limpeza gramatical)
- jsPDF com formatação

---

## 17. Theme / Estilos

### 17.1 Cores

```css
--navy: #0F0F1E
--navyLight: #1A1A2E
--blue: #0F3460
--coral: #E94560
--coralLight: #FF6B81
--purple: #533483
--teal: #00D2D3
--gold: #F9A825
--surface: #16162A
--surface2: #1E1E36
--surface3: #26264A
--text: #F0F0F5
--textMuted: #8888A8
--border: #2A2A4A
--success: #00C897
```

### 17.2 Fonts

- Display: 'Outfit', sans-serif
- Body: 'Plus Jakarta Sans', sans-serif

---

## 18. Testes

### 18.1 Configuração

- Vitest + @vitest/ui
- @testing-library/react
- jsdom

### 18.2 Arquivos de Teste

- `src/utils/*.test.js`
- `src/hooks/*.hook.test.js`
- `src/components/*.test.jsx`

---

## 19. Builds e Deploy

### 19.1 Scripts npm

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### 19.2 Deploy

- Vercel configurado (`vercel.json`)
- Preview: `dist/`

---

## 20. Padrões de Código

### 20.1Naming

- Componentes: PascalCase (`Button.jsx`)
- Hooks: camelCase com prefixo `use` (`useAutoSave.js`)
- Utilitários: camelCase (`formatting.js`)
- Constantes: SCREAMING_SNAKE_CASE

### 20.2 Estrutura

- 1 arquivo por componente/função
- Re-export centralizado
- JSDoc em arquivos principais

### 20.3 Estilo

- Tailwind CSS para estilos
- Variáveis CSS para temas
- Componentes funcionais

---

## 21. Observações

### 21.1 Pontos Fortes

- Código bem estruturado e organizado
- Separação clara de responsabilidades
- Componentes reutilizáveis
- Auto-save robusto
- Supabase bem integrados

### 21.2 Bugs Corrigidos

- **BUG 1:** `pdfGenerator.js` - `margin` e `contentWidth` undefined na função `addSectionHeader` - CORRIGIDO
- **BUG 2:** `Icons.jsx` - ícone `Wand2` não existia - CORRIGIDO (adicionado)
- **BUG 3:** `legal-helpers.jsx` - acesso a ref durante render - CORRIGIDO (refatorado)
- **BUG 4:** `textCleanup.js` - regex com `\x00` control characters - CORRIGIDO (eslint-disable)
- **BUG 5:** `validation.js` - unnecessary escape `\-` - CORRIGIDO
- **BUG 6:** `hooks/index.js` - setState dentro de effect - CORRIGIDO (refatorado)
- **BUG 7:** Various unused vars/imports - CORRIGIDO

### 21.3 Status Atual

- **Build:** ✅ Passa com sucesso
- **Lint:** ~10 errors (todos fast-refresh warnings, não-bloqueantes)
- **Dev Server:** ✅ Funcionando em localhost:5173

### 21.4 Documentos Jurídicos - Status

Todos os 9 tipos de documentos estão com `available: true` e templates completos:

| Documento | Status | Variantes |
|-----------|--------|-----------|
| Compra e Venda | ✅ Pronto | imovel, veiculo, terreno |
| Locação | ✅ Pronto | residencial, comercial |
| Procuração | ✅ Pronto | particular, ad-judicia |
| Doação | ✅ Pronto | (base + variantes) |
| Recibo | ✅ Pronto | pagamento, aluguel |
| União Estável | ✅ Pronto | declaracao, dissolucao |
| Autorização Viagem | ✅ Pronto | nacional, internacional |
| Comodato | ✅ Pronto | imovel, outros |
| Permuta | ✅ Pronto | (base) |

### 21.5 Bugs Corrigidos (8 total)

1. `pdfGenerator.js` - `margin`/`contentWidth` undefined na função `addSectionHeader`
2. `Icons.jsx` - ícone `Wand2` não existia
3. `legal-helpers.jsx` - ref durante render + componente criado durante render
4. `textCleanup.js` - regex control characters (`\x00`)
5. `validation.js` - unnecessary escape `\-`
6. `hooks/index.js` - setState dentro de effect
7. `LegalEditorPage.jsx` - `currentVariantObj` reference before definition
8. Various unused vars/imports (~15 correções)

### 21.6 Próximos Passos

- Checkout - implementar fluxo de pagamento
- Adicionar mais templates de currículo
- Melhorar testes
- Implementar entrega WhatsApp

---

*Fim da análise*