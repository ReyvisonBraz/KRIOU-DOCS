# Kriou Docs - Base de Conhecimento

## Visão Geral

O **Kriou Docs** é uma plataforma para criação de documentos profissionais focada em usuários leigos em tecnologia. A plataforma oferece dois tipos principais de documentos:

- **Currículos**: Documentos para busca de emprego
- **Documentos Jurídicos**: Contratos e documentos legais

---

## Tipos de Documentos

### 1. Currículo

Sistema de 7 etapas com preenchimento guiado e ajuda visual:

| Etapa | Descrição | Campos |
|-------|-----------|--------|
| **1. Dados Pessoais** | Informações básicas de contato | Nome, E-mail, Telefone, Cidade/Estado, LinkedIn |
| **2. Objetivo** | Objetivo profissional | Texto livre com exemplos por nível |
| **3. Experiência** | Histórico profissional | Empresa, Cargo, Período, Descrição |
| **4. Formação** | Formação acadêmica | Instituição, Curso, Período, Status |
| **5. Habilidades** | Competências técnicas e comportamentais | Checkboxes |
| **6. Idiomas** | Proficiência em idiomas | Idioma + Nível |
| **7. Extras** | Cursos e certificações | Texto livre |

#### Recursos de Ajuda para Currículos

- **FieldWithIcon**: Ícones emoji antes de cada label (👤 📧 📱 📍 🔗)
- **VisualExample**: Cards visuais mostrando o formato esperado
- **QuickFillCard**: Exemplos por nível (Iniciante/Intermediário/Avançado)
- **FieldHint**: Dicas expansíveis com onde encontrar informações

### 2. Documentos Jurídicos

| Tipo | Status | Descrição |
|------|--------|-----------|
| **Compra/Venda** | ✅ Disponível | Compra e venda de imóveis ou veículos |
| **Aluguel** | ✅ Disponível | Locação de imóveis |
| **Procuração** | ✅ Disponível | Delegação de poderes |
| **Doação** | ❌ Em breve | Transferência gratuita de bens |
| **Declaração Residência** | ❌ Em breve | Comprovação de endereço |
| **União Estável** | ❌ Em breve | Declaração de convivência marital |

---

## Fluxo do Usuário

```
Landing Page → Login → Dashboard → Templates → Editor → Preview → Checkout
```

### 1. Landing Page
- Apresentação da plataforma
- Botões de ação principal

### 2. Login
- Autenticação por OTP (mockado)
- Telefone + código

### 3. Dashboard
- Lista de documentos criados
- Abas por tipo (Currículos, Compra/Venda, Locação, Procuração)
- Barra de pesquisa
- Botões para criar novo documento

### 4. Seleção de Template
- Escolha entre Currículo ou Documento Jurídico
- Modelos de currículo disponíveis

### 5. Editor
- Formulário passo a passo (wizard)
- Navegação entre etapas
- Auto-save automático
- Botão Salvar Rascunho

### 6. Preview
- Visualização do documento
- Download em PDF
- Voltar para editar

### 7. Checkout
- Resumo do pedido
- Forma de pagamento
- Finalização (mockado)

---

## Melhorias de UX Implementadas

### Sistema de Abas no Dashboard
- Abas: Todos, Currículos, Compra/Venda, Locação, Procuração
- Barra de pesquisa para filtrar
- Contador de documentos por aba
- Layout mobile-first com scroll horizontal

### Campos com Ajuda e Exemplos
- FIELD_HINTS: Base de dados com dicas para cada campo
- Componentes:
  - `FieldHint`: Dica expansível (clique para ver)
  - `QuickSuggestion`: Sugestões rápidas em chips
  - `FieldWithIcon`: Ícone emoji + tip abaixo do campo
  - `VisualExample`: Card visual com formato esperado
  - `QuickFillCard`: Exemplos por nível com clique para preencher

### Botões de Navegação
- "← Voltar" mais claro
- "Avançar →" maior com destaque (cor coral)
- "Salvar" destacado entre os botões
- "✓ Visualizar" com animação

### Validação Amigável
- Mensagens de erro com exemplos práticos:
  - Nome: "Preencha seu nome completo. Ex: João da Silva"
  - Email: "Informe um e-mail válido. Ex: joao@email.com"
  - Telefone: "Informe um telefone com DDD. Ex: (11) 98765-4321"

---

## Componentes Principais

### UI Components (`src/components/UI.jsx`)
- `Button`: Botões com variantes (primary, secondary)
- `Card`: Container de cards
- `Input`, `Textarea`, `Select`: Campos de formulário
- `Badge`: Tags de status
- `Tag`: Chips interativos
- `FieldWithIcon`: Campo com ícone
- `VisualExample`: Exemplo visual
- `QuickFillCard`: Card de exemplos
- `FieldHint`: Dica expansível

### Context (`src/context/AppContext.jsx`)
- Estado global da aplicação
- Navegação entre páginas
- Dados do formulário
- Estado de documentos legais
- Sistema de auto-save

### Constants (`src/data/constants.js`)
- `RESUME_TEMPLATES`: Modelos de currículo
- `LEGAL_DOCUMENT_TYPES`: Tipos de documentos jurídicos
- `FIELD_HINTS`: Dicas para campos do currículo
- `SKILLS_OPTIONS`: Opções de habilidades
- `LANGUAGE_LEVELS`: Níveis de idioma

---

## Estrutura do Projeto

```
KRIOU-DOCS/
├── src/
│   ├── components/
│   │   ├── Icons.jsx      # Biblioteca de ícones SVG
│   │   ├── Theme.jsx       # Estilos globais
│   │   └── UI.jsx          # Componentes reutilizáveis
│   ├── context/
│   │   └── AppContext.jsx  # Estado global
│   ├── data/
│   │   └── constants.js    # Constantes e dados
│   ├── hooks/
│   │   └── index.js        # Hooks customizados
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── TemplatesPage.jsx
│   │   ├── EditorPage.jsx
│   │   ├── LegalEditorPage.jsx
│   │   ├── PreviewPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   └── ProfilePage.jsx
│   ├── utils/
│   │   ├── pdfGenerator.js       # Geração PDF currículo
│   │   ├── legalPdfGenerator.js # Geração PDF jurídico
│   │   ├── validation.js         # Validação de formulários
│   │   └── storage.js            # localStorage
│   ├── App.jsx
│   └── main.jsx
├── docs/
│   ├── CONHECIMENTO.md       # Este documento
│   ├── UX_IMPROVEMENTS.md    # Checklist de melhorias
│   └── PROJECT_SUMMARY.md   # Resumo do projeto
├── package.json
└── README.md
```

---

## Documentos Legais - Detalhes

### Compra/Venda
**Campos:**
- Tipo do imóvel (Residencial, Rural, Comercial, Terreno, Veículo)
- Dados do Comprador: Nome, CPF, Estado Civil, Profissão, Endereço
- Dados do Vendedor: Nome, CPF, Estado Civil, Profissão, Endereço
- Descrição do Imóvel: Endereço, Cidade, Estado, Medidas
- Valores: Valor da transação, Forma de pagamento, Data de assinatura

### Aluguel
**Campos:**
- Dados do Locador: Nome, CPF, Estado Civil, Endereço
- Dados do Locatário: Nome, CPF, Estado Civil, Profissão, Endereço
- Dados do Imóvel: Tipo, Endereço, Cidade, Estado
- Valores: Aluguel, Caução, IPTU
- Prazos: Início, Término, Dia de vencimento

### Procuração
**Campos:**
- Dados do Outorgante: Nome, CPF, Estado Civil, Profissão, Endereço
- Dados do Outorgado: Nome, CPF, Profissão, Endereço
- Poderes: Texto livre, Finalidade, Validade

---

## Tecnologias Utilizadas

- **React**: Framework principal
- **Vite**: Build tool
- **Tailwind CSS**: Estilos (via CSS variables)
- **jsPDF**: Geração de PDFs
- **localStorage**: Persistência de dados

---

## Status do Projeto

- [x] Currículo com 7 etapas
- [x] Documentos jurídicos (3 tipos disponíveis)
- [x] Sistema de abas no dashboard
- [x] Campos com ajuda visual
- [x] Validação amigável
- [x] Preview e download PDF
- [x] Checkout (mockado)
- [ ] Backend real
- [ ] Pagamento real
- [ ] Mais tipos de documentos jurídicos
