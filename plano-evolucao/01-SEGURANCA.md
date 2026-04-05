# Fase 1 — Segurança
> Prioridade: CRÍTICA | Prazo: Semana 1 (antes de qualquer deploy)

---

## Por que primeiro?

O app atualmente coleta CPF, telefone, e-mail e dados pessoais do usuário. Esses dados estão armazenados em plain text no `localStorage` e manipulados sem sanitização. Publicar isso seria uma violação da LGPD.

---

## Vulnerabilidades Identificadas

### 🔴 CRÍTICO — PII armazenado em texto simples

**Arquivo:** `src/utils/storage.js` (linhas 61-99)

**Problema:** CPF, telefone, e-mail gravados em `localStorage` sem qualquer criptografia.

```javascript
// ATUAL — INSEGURO
localStorage.setItem(key, JSON.stringify({
  cpf: userDataInput?.cpf,   // plain text
  phone: phone,               // plain text
  email: email,               // plain text
}));
```

**Correção:**
```javascript
// CORRETO — Usar apenas token de sessão
// Nunca armazenar PII direto no localStorage
// Armazenar apenas: sessionToken, userId (opaco), expiresAt

function saveSession(token, userId) {
  sessionStorage.setItem('kriou_session', JSON.stringify({
    token,
    userId,
    expiresAt: Date.now() + 3600 * 1000, // 1h
  }));
}
```

**Ação:**
- Remover CPF/telefone/e-mail do `localStorage`
- Usar `sessionStorage` para dados temporários de sessão
- Manter apenas token opaco (UUID) para identificar sessão no backend

---

### 🔴 CRÍTICO — Senha em estado React

**Arquivo:** `src/pages/LoginPage.jsx` (linha 24)

```javascript
const [password, setPassword] = useState(""); // INSEGURO
```

**Problema:** Senha fica em memória do React, visível no React DevTools e em memory dumps.

**Correção:**
- Não armazenar senha em estado — usar ref ou ler direto do input
- Limpar imediatamente após uso:
```javascript
const passwordRef = useRef(null);

const handleLogin = async () => {
  const pwd = passwordRef.current?.value;
  await authService.login(email, pwd);
  if (passwordRef.current) passwordRef.current.value = ''; // limpa
};
```

---

### 🔴 CRÍTICO — Validação de CPF incompleta

**Arquivo:** `src/pages/LoginPage.jsx` (linhas 87, 110)

```javascript
// ATUAL — aceita qualquer 11 dígitos, incluindo "00000000000"
if (cpf.replace(/\D/g, "").length < 11) return "CPF inválido";
```

**Correção — Algoritmo Mod11:**
```javascript
// src/utils/validation.js — substituir função existente
export function validateCpf(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // rejeita 000...000

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits[10]);
}
```

---

### 🟠 ALTO — E-mail regex incompleto

**Arquivo:** `src/utils/validation.js` (linha 34)

```javascript
// ATUAL — aceita a@b.c
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Correção:**
```javascript
// Usar biblioteca confiável ou regex melhorado
export function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim().toLowerCase());
}
```

---

### 🟠 ALTO — Preços hardcoded no frontend

**Arquivo:** `src/pages/CheckoutPage.jsx` (linha 32)

```javascript
const price = "R$ 9,90"; // qualquer dev consegue alterar no browser
```

**Correção:**
- Preços sempre validados no backend
- Frontend exibe apenas o valor retornado pela API
- Nunca confiar em valor vindo do cliente para processar pagamento

---

### 🟠 ALTO — Sem sanitização de inputs

**Arquivos:** `EditorPage.jsx`, `LegalEditorPage.jsx`, `LoginPage.jsx`

Dados de formulário armazenados e usados em PDF sem sanitização — risco de injeção em conteúdo gerado.

**Correção:**
```bash
npm install dompurify
```

```javascript
// src/utils/sanitization.js (novo arquivo)
import DOMPurify from 'dompurify';

export function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }); // strip all HTML
}

export function sanitizeFormData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      typeof v === 'string' ? sanitizeText(v) : v,
    ])
  );
}
```

Aplicar `sanitizeFormData()` antes de qualquer `saveDraft()` ou `saveSession()`.

---

### 🟡 MÉDIO — Sem rate limiting no cliente

**Arquivo:** `src/context/AppContext.jsx` (fluxo de login)

**Correção:**
```javascript
// src/utils/rateLimiter.js
const attempts = new Map();

export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = attempts.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (record.count >= maxAttempts) return false; // blocked

  record.count++;
  return true;
}
```

Aplicar no `handleVerifyOtp()` e `handleLogin()`.

---

### 🟡 MÉDIO — Rascunhos com dados sensíveis sem proteção

**Arquivo:** `src/utils/storage.js` — função `saveDraft()`

**Correção:**
- Dados de rascunho não devem conter CPF em texto puro
- Usar `sessionStorage` em vez de `localStorage` para rascunhos ativos
- Expirar rascunhos após 24h

---

## Checklist da Fase 1

- [ ] Remover CPF/telefone/email do localStorage
- [ ] Implementar `saveSession()` seguro com sessionStorage
- [ ] Remover `password` de `useState`
- [ ] Implementar `validateCpf()` com algoritmo Mod11
- [ ] Corrigir regex de e-mail em validation.js
- [ ] Instalar e configurar DOMPurify
- [ ] Criar `src/utils/sanitization.js`
- [ ] Aplicar sanitização em saveDraft() e saveSession()
- [ ] Implementar rate limiter para login/OTP
- [ ] Mover validação de preço para o backend
- [ ] Revisar storage.js e remover qualquer dado em texto puro
