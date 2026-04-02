# Kriou Docs - Documentos Profissionais

Plataforma para criação de documentos profissionais como currículos, contratos e documentos jurídicos com entrega via WhatsApp.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Icons.jsx   # SVG icon library
│   ├── Theme.jsx   # Theme and global styles
│   └── UI.jsx      # Buttons, Cards, Forms, etc.
├── context/        # React Context state management
│   └── AppContext.jsx
├── data/           # Constants and configuration
│   └── constants.js
├── hooks/          # Custom React Hooks
│   └── index.js
├── pages/          # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── TemplatesPage.jsx
│   ├── EditorPage.jsx
│   ├── PreviewPage.jsx
│   └── CheckoutPage.jsx
├── utils/          # Utility functions
│   ├── pdfGenerator.js
│   └── storage.js
└── App.jsx         # Application entry
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

## 📄 Adding New Templates

1. Add new template to `RESUME_TEMPLATES` in `src/data/constants.js`
2. Define colors and styles
3. PreviewPage and PDF generator will automatically apply

## 🔧 Development

### Add New Page
1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Use `useApp()` hook for state access

### PDF Generation
Use `src/utils/pdfGenerator.js`:

```javascript
import { generateResumePDF, downloadPDF } from "./utils/pdfGenerator";

const doc = generateResumePDF(formData, template);
downloadPDF(doc, "my-resume.pdf");
```

## 📝 License

MIT License - 2026 Kriou Docs