# Fase 2 — Arquitetura
> Prioridade: ALTA | Prazo: Semanas 2–3

---

## Problemas Estruturais Atuais

| Arquivo                    | Linhas | Problema                                        |
|----------------------------|--------|-------------------------------------------------|
| `src/components/UI.jsx`    | 1.365  | 20+ componentes num único arquivo               |
| `src/data/legalDocuments.js`| 1.949 | Carregado sempre, usado condicionalmente        |
| `src/context/AppContext.jsx`| 376   | Auth + forms + navegação num único contexto     |
| `src/pages/EditorPage.jsx` | 850    | UI + lógica + validação misturados              |
| `src/pages/LegalEditorPage.jsx`| 804| Idem                                            |
| Raiz do projeto            | 2.626  | Código morto de protótipos antigos              |

---

## 2.1 Limpeza Imediata — Código Morto

**Ação:** Deletar os seguintes arquivos da raiz (todo o histórico está no git):

```bash
# Na raiz do projeto:
git rm kriou-docs-prototype.jsx    # 1.020 linhas
git rm DocumentLanding.jsx         #   373 linhas
git rm DocumentDetails.jsx         #   369 linhas
git rm LegalDocEditor.jsx          #   511 linhas
git rm ProfilePage.jsx             #   353 linhas
# Total removido: 2.626 linhas de código morto
```

**Benefício:** Reduz confusão e tamanho de análise de código.

---

## 2.2 Dividir UI.jsx em Módulos

**Problema:** 1 arquivo com 20+ componentes torna:
- Tree-shaking impossível
- Imports confusos
- Colaboração difícil (merge conflicts constantes)

**Nova estrutura:**

```
src/components/
├── Button/
│   ├── Button.jsx
│   └── index.js
├── Card/
│   ├── Card.jsx
│   ├── DocumentCard.jsx
│   └── index.js
├── Form/
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Textarea.jsx
│   ├── ErrorMessage.jsx
│   ├── FieldLabel.jsx
│   └── index.js
├── Layout/
│   ├── AppNavbar.jsx
│   ├── BottomNavigation.jsx
│   ├── PageHeader.jsx
│   └── index.js
├── Navigation/
│   ├── AppStepper.jsx
│   └── index.js
├── Feedback/
│   ├── LoadingSpinner.jsx
│   ├── Toast.jsx
│   ├── EmptyState.jsx
│   └── index.js
├── ErrorBoundary/
│   ├── ErrorBoundary.jsx
│   └── index.js
├── Icons.jsx
├── Theme.jsx
└── index.js  ← re-exporta tudo (backward compat durante migração)
```

**Regra:** cada arquivo de componente tem máximo 150 linhas. Acima disso, é sinal de que precisa ser dividido.

---

## 2.3 Dividir AppContext em Contextos Especializados

**Problema atual:** `AppContext.jsx` mistura:
- Autenticação (login, OTP, usuário)
- Estado do formulário (resumo)
- Estado do documento legal
- Navegação/steps
- UI states

Qualquer atualização em qualquer um desses re-renderiza **todos** os consumidores.

**Nova divisão:**

### AuthContext
```javascript
// src/context/AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // { id, name }
  const [sessionToken, setSessionToken] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // idle | otp | done

  const login = useCallback(async (identifier) => { ... }, []);
  const verifyOtp = useCallback(async (otp) => { ... }, []);
  const logout = useCallback(() => { ... }, []);

  return (
    <AuthContext.Provider value={{ user, authStep, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### ResumeContext
```javascript
// src/context/ResumeContext.jsx
export function ResumeProvider({ children }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle');

  const updateField = useCallback((section, value) => { ... }, []);
  const nextStep = useCallback(() => { ... }, []);
  const prevStep = useCallback(() => { ... }, []);

  return (
    <ResumeContext.Provider value={{ formData, currentStep, errors, saveStatus, updateField, nextStep, prevStep }}>
      {children}
    </ResumeContext.Provider>
  );
}
```

### LegalContext
```javascript
// src/context/LegalContext.jsx
// Estado do documento jurídico selecionado + campos preenchidos
```

### UIContext
```javascript
// src/context/UIContext.jsx
// Toasts, modais abertos, tema, estado de loading global
```

---

## 2.4 Dividir Páginas Complexas

### EditorPage

```
src/pages/EditorPage/
├── EditorPage.jsx          ← orquestrador (max 150 linhas)
├── steps/
│   ├── DadosPessoaisStep.jsx
│   ├── ObjetivoStep.jsx
│   ├── ExperienciasStep.jsx
│   ├── FormacoesStep.jsx
│   ├── HabilidadesStep.jsx
│   └── IdiomasStep.jsx
├── EditorPage.test.jsx
└── index.js
```

Cada step é um componente puro que recebe `formData`, `errors` e `onChange` como props.

### LoginPage

```
src/pages/LoginPage/
├── LoginPage.jsx           ← orquestrador (max 100 linhas)
├── flows/
│   ├── WhatsAppFlow.jsx    ← login por WhatsApp/OTP
│   ├── EmailFlow.jsx       ← login por e-mail+senha
│   └── CpfFlow.jsx         ← identificação por CPF
└── index.js
```

---

## 2.5 Dividir legalDocuments.js

**Problema:** 1.949 linhas carregadas mesmo para usuários que só fazem currículo.

**Solução — Lazy loading por documento:**

```
src/data/legalDocuments/
├── index.js          ← lazy imports
├── compraVenda.js
├── locacao.js
├── procuracao.js
├── prestacaoServicos.js
└── ...
```

```javascript
// src/data/legalDocuments/index.js
export async function loadDocument(type) {
  switch (type) {
    case 'compra_venda':
      return import('./compraVenda.js');
    case 'locacao':
      return import('./locacao.js');
    default:
      throw new Error(`Documento desconhecido: ${type}`);
  }
}
```

Uso em LegalEditorPage:
```javascript
const [docSchema, setDocSchema] = useState(null);

useEffect(() => {
  loadDocument(selectedDocType).then(mod => setDocSchema(mod.default));
}, [selectedDocType]);
```

---

## 2.6 Criar Camada de Serviços

**Problema:** Lógica de negócio espalhada em componentes e contextos.

```
src/services/
├── authService.js      ← login, OTP, logout, session
├── documentService.js  ← CRUD de documentos, drafts
├── pdfService.js       ← geração de PDF (abstrai jsPDF)
└── storageService.js   ← abstração do localStorage/sessionStorage
```

Exemplo:
```javascript
// src/services/authService.js
export const authService = {
  async sendOtp(phone) {
    // chama API
  },
  async verifyOtp(phone, otp) {
    // valida e retorna token
  },
  async logout() {
    sessionStorage.removeItem('kriou_session');
  },
};
```

---

## 2.7 Criar Camada de Hooks Reutilizáveis

```
src/hooks/
├── useAuth.js          ← wrapper do AuthContext
├── useResume.js        ← wrapper do ResumeContext
├── usePDF.js           ← gera PDF com estado (loading, error)
├── useStorage.js       ← lê/escreve com debounce
├── useFormStep.js      ← navegação entre etapas com validação
└── index.js
```

Exemplo do `usePDF`:
```javascript
export function usePDF() {
  const [status, setStatus] = useState('idle'); // idle | generating | done | error

  const generate = useCallback(async (data, type) => {
    setStatus('generating');
    try {
      const blob = await pdfService.generate(data, type);
      setStatus('done');
      return blob;
    } catch (err) {
      setStatus('error');
      throw err;
    }
  }, []);

  return { status, generate };
}
```

---

## 2.8 Adicionar ErrorBoundary Global

```javascript
// src/components/ErrorBoundary/ErrorBoundary.jsx
import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Enviar para Sentry/logger quando integrado
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Algo deu errado</h2>
          <p>Por favor, recarregue a página.</p>
          <button onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Usar em `App.jsx`:
```javascript
<ErrorBoundary>
  <Router>
    <Routes>...</Routes>
  </Router>
</ErrorBoundary>
```

---

## Checklist da Fase 2

- [ ] Deletar arquivos protótipo da raiz (5 arquivos, 2.626 linhas)
- [ ] Criar estrutura de pastas components/
- [ ] Quebrar UI.jsx em componentes individuais
- [ ] Criar AuthContext com separação de responsabilidades
- [ ] Criar ResumeContext
- [ ] Criar LegalContext
- [ ] Criar UIContext (toasts, loading global)
- [ ] Dividir EditorPage em steps
- [ ] Dividir LoginPage em flows
- [ ] Criar legalDocuments/ com lazy loading
- [ ] Criar src/services/
- [ ] Criar hooks reutilizáveis (usePDF, useFormStep)
- [ ] Adicionar ErrorBoundary em App.jsx
