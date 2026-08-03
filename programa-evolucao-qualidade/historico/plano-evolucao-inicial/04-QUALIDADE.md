# Fase 4 — Qualidade de Código
> Prioridade: ALTA | Prazo: Semana 4 (paralela à Performance)

---

## Objetivos

- Eliminar ~800 linhas de código duplicado
- Centralizar estilos e constantes
- Estabelecer padrões consistentes
- Adicionar tipagem gradual

---

## 4.1 Utilitários de Formatação Centralizados

**Problema:** `formatCpf()` e `formatPhone()` duplicados em LoginPage.jsx e outros locais.

**Criar `src/utils/formatting.js`:**

```javascript
// src/utils/formatting.js

export function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCnpj(value) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
```

**Substituir em:** LoginPage.jsx, LegalEditorPage.jsx, UI.jsx (LegalFieldRenderer)

---

## 4.2 Estilos Compartilhados Centralizados

**Problema:** `labelStyle` e `errorStyle` definidos em EditorPage.jsx e LoginPage.jsx identicamente.

**Criar `src/constants/styles.js`:**

```javascript
// src/constants/styles.js

export const LABEL_STYLE = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '6px',
  letterSpacing: '0.02em',
};

export const ERROR_STYLE = {
  color: '#ef4444',
  fontSize: '0.78rem',
  marginTop: '4px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

export const SECTION_TITLE_STYLE = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '2px solid var(--border-color)',
};

export const INPUT_BASE_STYLE = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1.5px solid var(--border-color)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s',
  outline: 'none',
};

export const CARD_STYLE = {
  background: 'var(--bg-secondary)',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  padding: '16px',
};
```

**Substituir em:** EditorPage.jsx, LoginPage.jsx, LegalEditorPage.jsx, DashboardPage.jsx

---

## 4.3 Componente ErrorMessage Reutilizável

**Problema:** 15+ locais com `{errors.campo && <div style={errorStyle}>{errors.campo}</div>}`

**Criar componente:**

```javascript
// src/components/Form/ErrorMessage.jsx
import { ERROR_STYLE } from '../../constants/styles.js';

export function ErrorMessage({ message, style }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ ...ERROR_STYLE, ...style }}>
      {message}
    </p>
  );
}
```

**Uso simplificado:**

```javascript
// ANTES
{errors.nome && <div style={errorStyle}>{errors.nome}</div>}

// DEPOIS
<ErrorMessage message={errors.nome} />
```

---

## 4.4 Componente FormField Reutilizável

Encapsula: label + input + mensagem de erro

```javascript
// src/components/Form/FormField.jsx
import { LABEL_STYLE } from '../../constants/styles.js';
import { ErrorMessage } from './ErrorMessage.jsx';

export function FormField({
  label,
  required,
  error,
  children,
  hint,
  style,
}) {
  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label style={LABEL_STYLE}>
          {label}
          {required && <span style={{ color: '#ef4444' }}> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {hint}
        </p>
      )}
      <ErrorMessage message={error} />
    </div>
  );
}
```

**Antes:** cada campo tinha label + input + erro inline (~8 linhas)
**Depois:** 4 linhas:

```jsx
<FormField label="Nome completo" required error={errors.nome}>
  <Input value={formData.nome} onChange={e => updateField('nome', e.target.value)} />
</FormField>
```

---

## 4.5 Constantes de Armazenamento

**Problema:** Strings de chaves no localStorage espalhadas pelo código.

**Criar `src/constants/storage.js`:**

```javascript
// src/constants/storage.js
export const STORAGE_KEYS = {
  SESSION:          'kriou_session',
  RESUME_DRAFT:     'kriou_resume_draft',
  LEGAL_DRAFT:      'kriou_legal_draft',
  USER_PREFERENCES: 'kriou_prefs',
};

export const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas
export const SESSION_EXPIRY_MS = 60 * 60 * 1000;    // 1 hora
```

---

## 4.6 Constantes de Configuração

**Problema:** Magic numbers espalhados (`1500`, `0.2s`, `16px`, etc.)

**Criar `src/constants/timing.js`:**

```javascript
// src/constants/timing.js
export const DEBOUNCE_AUTOSAVE_MS = 1500;
export const DEBOUNCE_SEARCH_MS   = 300;
export const TRANSITION_FAST      = '0.15s ease';
export const TRANSITION_DEFAULT   = '0.2s ease';
export const TRANSITION_SLOW      = '0.3s ease';

export const ANIMATION_DURATION = {
  fast:    150,
  normal:  200,
  slow:    300,
};
```

---

## 4.7 Padronização de Nomenclatura

**Regras a seguir:**

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `DocumentCard`, `AppNavbar` |
| Hooks | camelCase com `use` | `useFormStep`, `usePDF` |
| Constantes | UPPER_SNAKE_CASE | `STORAGE_KEYS`, `DEBOUNCE_MS` |
| Funções utilitárias | camelCase | `formatCpf`, `validateEmail` |
| Contextos | PascalCase + Context | `AuthContext`, `ResumeContext` |
| Arquivos de componente | PascalCase.jsx | `Button.jsx`, `FormField.jsx` |
| Outros arquivos | camelCase.js | `authService.js`, `formatting.js` |

**Problema específico:** Mistura de português e inglês em nomes de variáveis.
- Manter nomes de variáveis em **inglês** (código é universal)
- Manter strings visíveis ao usuário em **português**
- Não misturar: `formData.pessoaFisica` → `formData.naturalPerson`

---

## 4.8 JSDoc nas Funções Críticas

**Prioridade:** Funções públicas em `utils/`, `services/`, `hooks/`

```javascript
/**
 * Valida e formata um CPF brasileiro
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {{ valid: boolean, formatted: string }} Resultado da validação
 * @example
 * validateAndFormatCpf('123.456.789-09') // { valid: true, formatted: '123.456.789-09' }
 */
export function validateAndFormatCpf(cpf) { ... }
```

---

## 4.9 Remover Console.log de Produção

**Configurar Vite para remover logs em build:**

```javascript
// vite.config.js
export default defineConfig({
  esbuild: {
    drop: ['console', 'debugger'], // Remove em produção
  },
  // ...
});
```

Ou para manter logs de erro:

```javascript
// src/utils/logger.js
const isDev = import.meta.env.DEV;

export const logger = {
  log:   (...args) => isDev && console.log(...args),
  warn:  (...args) => isDev && console.warn(...args),
  error: (...args) => console.error(...args), // erro sempre visível
};
```

---

## Resumo — Impacto da Limpeza

| Ação | Linhas Removidas | Benefício |
|------|------------------|-----------|
| Deletar protótipos | ~2.626 | Elimina confusão |
| Extrair formatCpf/Phone | ~30 | 3 duplicatas → 1 fonte |
| Extrair labelStyle/errorStyle | ~60 | 8 duplicatas → 1 fonte |
| Criar ErrorMessage component | ~45 | 15 duplicatas → 1 componente |
| Centralizar chaves de storage | ~20 | String literals dispersas |
| Criar FormField component | ~200 | Formulários 50% menores |

**Total:** ~2.981 linhas eliminadas / centralizadas

---

## Checklist da Fase 4

- [ ] Criar src/utils/formatting.js com todos os formatadores
- [ ] Substituir formatCpf/formatPhone em LoginPage e outros
- [ ] Criar src/constants/styles.js
- [ ] Substituir labelStyle/errorStyle em todas as páginas
- [ ] Criar componente ErrorMessage
- [ ] Criar componente FormField
- [ ] Criar src/constants/storage.js
- [ ] Criar src/constants/timing.js
- [ ] Substituir magic numbers pelo constants
- [ ] Criar src/utils/logger.js
- [ ] Configurar remoção de console.log no build de produção
- [ ] Padronizar nomenclatura (português → inglês em variáveis de código)
- [ ] Adicionar JSDoc em funções públicas de utils/ e services/
