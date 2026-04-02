# Kriou Docs — Estrutura do Projeto

## Visão Geral
Plataforma SaaS brasileira de criação de documentos profissionais (currículos e documentos jurídicos).

## Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **State:** Zustand (migrar do useState atual)
- **Routing:** React Router v6
- **Backend (futuro):** Supabase + PostgreSQL
- **Auth:** WhatsApp OTP + JWT
- **Pagamento:** Mercado Pago (PIX, Cartão, Boleto)
- **PDF:** Puppeteer / React-PDF
- **Deploy:** Vercel

## Estrutura de Pastas (meta final)

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # Design System base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Stepper.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── shared/
│       ├── SaveIndicator.tsx
│       ├── Watermark.tsx
│       └── DocumentCard.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── hooks/useAuth.ts
│   ├── resume/
│   │   ├── EditorPage.tsx
│   │   ├── PreviewPage.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── steps/
│   │   │   ├── DadosPessoais.tsx
│   │   │   ├── Objetivo.tsx
│   │   │   ├── Experiencia.tsx
│   │   │   ├── Formacao.tsx
│   │   │   ├── Habilidades.tsx
│   │   │   ├── Idiomas.tsx
│   │   │   └── Extras.tsx
│   │   └── templates/
│   │       ├── Executivo.tsx
│   │       ├── Criativo.tsx
│   │       ├── Classico.tsx
│   │       ├── Tech.tsx
│   │       └── PrimeiroEmprego.tsx
│   ├── documents/
│   │   ├── LegalDocEditor.tsx
│   │   ├── DocumentDetails.tsx
│   │   ├── templates/
│   │   │   ├── CompraVenda.json
│   │   │   ├── Aluguel.json
│   │   │   ├── Procuracao.json
│   │   │   └── ... (demais tipos)
│   │   └── hooks/useDocumentForm.ts
│   ├── checkout/
│   │   ├── CheckoutPage.tsx
│   │   └── SuccessPage.tsx
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   └── DocumentGrid.tsx
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   └── SettingsPage.tsx
│   └── landing/
│       ├── HomePage.tsx
│       ├── DocumentLanding.tsx
│       └── PricingSection.tsx
├── hooks/
│   ├── useAutoSave.ts
│   ├── useWhatsApp.ts
│   └── useDocuments.ts
├── store/
│   ├── authStore.ts
│   ├── documentStore.ts
│   └── uiStore.ts
├── lib/
│   ├── supabase.ts
│   ├── mercadopago.ts
│   └── whatsapp.ts
├── templates/
│   └── legal-docs.json
├── types/
│   ├── resume.ts
│   ├── document.ts
│   └── user.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

## Arquivos do Protótipo (nesta entrega)

| Arquivo | Conteúdo |
|---------|----------|
| `kriou-docs-prototype.jsx` | App principal (Landing, Login, Dashboard, Templates, Editor Currículo, Preview, Checkout) |
| `ProfilePage.jsx` | Perfil do usuário + Configurações |
| `LegalDocEditor.jsx` | Editor de documentos jurídicos com templates dinâmicos |
| `DocumentDetails.jsx` | Detalhes do documento + histórico de edições |
| `DocumentLanding.jsx` | Landing pages individuais por tipo de documento |

## Convenções de Código

- Comentários `// TODO: [DB]` para integração com banco
- Comentários `// TODO: [API]` para chamadas de API
- Comentários `// TODO: [AUTH]` para validação de autenticação
- Comentários `// TODO: [PAY]` para integração de pagamento
- Comentários `// TODO: [WPP]` para integração WhatsApp

## Paleta de Cores

```css
--navy: #0F0F1E
--navy-light: #1A1A2E
--blue: #0F3460
--coral: #E94560
--coral-light: #FF6B81
--purple: #533483
--teal: #00D2D3
--gold: #F9A825
--success: #00C897
```

## Tipografia
- Display: Outfit (headings, logotipo)
- Body: Plus Jakarta Sans (texto, formulários)
