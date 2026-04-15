# Kriou Docs - Documentos Profissionais

Plataforma para criação de documentos profissionais como currículos, contratos e documentos jurídicos com entrega via WhatsApp.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ErrorBoundary.jsx  # Error handling
│   ├── Icons.jsx    # SVG icon library
│   ├── Theme.jsx    # Theme and global styles
│   └── UI.jsx       # Buttons, Cards, Forms, etc.
├── constants/       # Application constants
│   ├── styles.js    # Shared style objects
│   ├── timing.js    # Timing/delay values
│   └── storage.js   # Storage key definitions
├── context/        # React Context state management
│   └── AppContext.jsx
├── hooks/          # Custom React Hooks
│   ├── useAutoSave.js      # Debounced auto-save with status
│   ├── useConfirm.js       # Async confirmation dialog
│   ├── useUnsavedChanges.js # Page leave warning
│   ├── usePDF.js           # PDF generation via Web Worker
│   └── index.js
├── pages/          # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── TemplatesPage.jsx
│   ├── EditorPage.jsx      # 7-step resume wizard
│   ├── LegalEditorPage.jsx # Legal document wizard
│   ├── PreviewPage.jsx
│   ├── CheckoutPage.jsx
│   └── ProfilePage.jsx
├── services/       # Business logic services (TODO)
├── utils/          # Utility functions
│   ├── formatting.js      # formatCpf, formatPhone, formatCnpj, etc.
│   ├── validation.js      # validateCpf (Mod11), validateEmail, etc.
│   ├── sanitization.js    # XSS prevention
│   ├── rateLimiter.js     # Client-side rate limiting
│   ├── pdfGenerator.js    # Resume PDF generation
│   ├── legalPdfGenerator.js # Legal PDF generation
│   └── storage.js         # localStorage utilities
├── workers/
│   └── pdfWorker.js       # Web Worker for PDF generation
└── App.jsx         # Router with lazy loading
```

## 🎨 Theme Customization

Edit `src/components/Theme.jsx` to change colors and styles:

```javascript
const theme = {
  colors: {
    coral: "#E94560",
    teal: "#00D2D3",
    // ...
  }
};
```

## 🔐 Security Features

- **CPF Validation** — Mod11 algorithm (rejects `000.000.000-00`)
- **Email Validation** — RFC-compliant regex
- **Rate Limiting** — Client-side protection for login/OTP
- **Input Sanitization** — XSS prevention for all form data
- **useUnsavedChanges** — Warns user before losing changes
- **useConfirm** — Confirms destructive actions

## ⚡ Performance Features

- **Code Splitting** — Pages load on demand via `React.lazy()`
- **PDF Web Worker** — PDF generation doesn't freeze UI
- **Auto-save** — Debounced (1.5s) with visual status indicator
- **Sonner Toasts** — Non-blocking notifications

## 📝 Adding New Templates

1. Add new template to `RESUME_TEMPLATES` in `src/data/constants.js`
2. Define colors and styles
3. PreviewPage and PDF generator will automatically apply

## 🔧 Development

### Add New Page
1. Create component in `src/pages/`
2. Add to lazy routes in `App.jsx`
3. Update `src/context/AppContext.jsx` with new page key

### PDF Generation
```javascript
import { usePDF } from "./hooks/usePDF";

const { generatePDF, isGenerating } = usePDF();
await generatePDF({ type: "GENERATE_RESUME", formData, template });
```

### Validation
```javascript
import { validateCpf, validateEmail } from "./utils/validation";

validateCpf("123.456.789-09"); // true
validateEmail("user@example.com"); // true
```

### Formatting
```javascript
import { formatCpf, formatPhone, formatCurrency } from "./utils/formatting";

formatCpf("12345678909"); // "123.456.789-09"
formatPhone("11987654321"); // "(11) 98765-4321"
formatCurrency(99.90); // "R$ 99,90"
```

## 🧪 Testing

```bash
npm test           # Run tests once
npm run test:watch # Watch mode
```

## 📄 License

MIT License - 2026 Kriou Docs
