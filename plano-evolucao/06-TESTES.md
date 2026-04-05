# Fase 6 — Testes
> Prioridade: ALTA | Prazo: Semana 6

---

## Estado Atual

**Zero arquivos de teste encontrados.** Nenhuma cobertura de testes no projeto.

Isso significa que qualquer refatoração pode quebrar funcionalidades de forma silenciosa.

---

## Estratégia — Testar o que Importa

Não é necessário 100% de cobertura. A prioridade é:

1. **Lógica crítica** (validação, formatação, segurança)
2. **Fluxos do usuário** (login → edição → preview → checkout)
3. **Componentes reutilizáveis** (garante que a refatoração não quebrou nada)

---

## 6.1 Setup de Testes

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

**`vite.config.js`:**
```javascript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
});
```

**`src/tests/setup.js`:**
```javascript
import '@testing-library/jest-dom';
```

**`package.json`:**
```json
{
  "scripts": {
    "test":       "vitest",
    "test:ui":    "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 6.2 Testes de Utilitários (Alta Prioridade)

### Validação de CPF

```javascript
// src/utils/validation.test.js
import { describe, it, expect } from 'vitest';
import { validateCpf } from './validation.js';

describe('validateCpf', () => {
  it('aceita CPF válido formatado', () => {
    expect(validateCpf('123.456.789-09')).toBe(true);
  });

  it('aceita CPF válido sem formatação', () => {
    expect(validateCpf('12345678909')).toBe(true);
  });

  it('rejeita CPF com todos dígitos iguais', () => {
    expect(validateCpf('111.111.111-11')).toBe(false);
  });

  it('rejeita CPF com dígito verificador errado', () => {
    expect(validateCpf('123.456.789-00')).toBe(false);
  });

  it('rejeita CPF com menos de 11 dígitos', () => {
    expect(validateCpf('123.456.789')).toBe(false);
  });
});
```

### Formatação de CPF

```javascript
// src/utils/formatting.test.js
import { describe, it, expect } from 'vitest';
import { formatCpf, formatPhone, formatCnpj } from './formatting.js';

describe('formatCpf', () => {
  it('formata 11 dígitos corretamente', () => {
    expect(formatCpf('12345678909')).toBe('123.456.789-09');
  });

  it('formata entrada parcial sem crashar', () => {
    expect(formatCpf('123')).toBe('123');
    expect(formatCpf('1234567')).toBe('123.456.7');
  });

  it('ignora caracteres não numéricos no input', () => {
    expect(formatCpf('abc123abc456abc789abc09')).toBe('123.456.789-09');
  });
});

describe('formatPhone', () => {
  it('formata celular com 11 dígitos', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });
});
```

### Sanitização

```javascript
// src/utils/sanitization.test.js
import { sanitizeText } from './sanitization.js';

describe('sanitizeText', () => {
  it('remove tags HTML', () => {
    expect(sanitizeText('<script>alert(1)</script>texto')).toBe('texto');
  });

  it('mantém texto normal intacto', () => {
    expect(sanitizeText('João da Silva')).toBe('João da Silva');
  });

  it('retorna string vazia para não-string', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
  });
});
```

---

## 6.3 Testes de Componentes (Média Prioridade)

### ErrorMessage

```javascript
// src/components/Form/ErrorMessage.test.jsx
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage.jsx';

describe('ErrorMessage', () => {
  it('renderiza mensagem de erro', () => {
    render(<ErrorMessage message="Campo obrigatório" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório');
  });

  it('não renderiza nada quando message é falsy', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });
});
```

### Button

```javascript
// src/components/Button/Button.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button.jsx';

describe('Button', () => {
  it('chama onClick ao ser clicado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique aqui</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('não chama onClick quando desabilitado', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Clique aqui</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('mostra estado de loading', () => {
    render(<Button loading>Enviar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 6.4 Testes de Integração — Fluxos Críticos

### Fluxo de Login

```javascript
// src/pages/LoginPage/LoginPage.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext.jsx';
import LoginPage from './LoginPage.jsx';

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('exibe erro de CPF inválido', async () => {
    renderWithProviders(<LoginPage />);
    const cpfInput = screen.getByLabelText(/cpf/i);
    await userEvent.type(cpfInput, '000.000.000-00');
    await userEvent.click(screen.getByRole('button', { name: /continuar/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('aceita CPF válido e avança para OTP', async () => {
    renderWithProviders(<LoginPage />);
    const cpfInput = screen.getByLabelText(/cpf/i);
    await userEvent.type(cpfInput, '123.456.789-09');
    await userEvent.click(screen.getByRole('button', { name: /continuar/i }));
    await waitFor(() => {
      expect(screen.getByText(/código/i)).toBeInTheDocument();
    });
  });
});
```

---

## 6.5 Testes de Hook

### useAutoSave

```javascript
// src/hooks/useAutoSave.test.js
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAutoSave } from './useAutoSave.js';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('não salva imediatamente após mudança', () => {
    const saveFn = vi.fn();
    renderHook(() => useAutoSave('key', { nome: 'João' }, 1500, saveFn));
    expect(saveFn).not.toHaveBeenCalled();
  });

  it('salva após o delay', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useAutoSave('key', { nome: 'João' }, 1500, saveFn));
    act(() => vi.advanceTimersByTime(1500));
    await act(async () => {});
    expect(saveFn).toHaveBeenCalledWith('key', { nome: 'João' });
  });
});
```

---

## 6.6 Estrutura Sugerida de Testes

```
src/
├── tests/
│   └── setup.js
├── utils/
│   ├── validation.js
│   ├── validation.test.js         ← 
│   ├── formatting.js
│   ├── formatting.test.js         ← 
│   └── sanitization.test.js       ← 
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.test.jsx        ← 
│   └── Form/
│       ├── ErrorMessage.jsx
│       └── ErrorMessage.test.jsx  ← 
├── hooks/
│   ├── useAutoSave.js
│   └── useAutoSave.test.js        ← 
└── pages/
    └── LoginPage/
        └── LoginPage.test.jsx     ← 
```

---

## 6.7 Cobertura Mínima por Categoria

| Categoria             | Meta de Cobertura | Prioridade |
|-----------------------|-------------------|------------|
| `utils/validation.js` | 100%              | Crítica    |
| `utils/formatting.js` | 100%              | Crítica    |
| `utils/sanitization.js`| 100%             | Crítica    |
| `services/authService`| 90%               | Alta       |
| Componentes de UI     | 70%               | Alta       |
| Hooks reutilizáveis   | 80%               | Alta       |
| Páginas               | 50%               | Média      |

---

## Checklist da Fase 6

- [ ] Instalar Vitest, @testing-library/react, user-event, jest-dom
- [ ] Configurar Vitest em vite.config.js
- [ ] Criar src/tests/setup.js
- [ ] Escrever testes para validateCpf (mínimo 6 casos)
- [ ] Escrever testes para formatCpf, formatPhone, formatCnpj
- [ ] Escrever testes para sanitizeText
- [ ] Escrever testes para ErrorMessage
- [ ] Escrever testes para Button
- [ ] Escrever testes de integração para LoginPage (fluxo principal)
- [ ] Escrever testes para useAutoSave
- [ ] Rodar `npm run test:coverage` e verificar cobertura mínima
- [ ] Adicionar `npm test` ao CI/CD se existente
