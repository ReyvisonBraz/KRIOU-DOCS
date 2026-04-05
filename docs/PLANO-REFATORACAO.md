# Plano de Refatoração - Kriou Docs

## Visão Geral

Este documento detalha o plano de refatoração para eliminar a repetição de código identificada no projeto, reaproveitando componentes e funções já existentes.

---

## 1. Problemas Identificados

### 1.1 Componentes Repetidos (Alta Prioridade)

| Componente | Localização Atual | Locações Usadas |
|------------|-------------------|-----------------|
| Stepper/Navegação de Etapas | `EditorPage.jsx:692-757` | EditorPage, LegalEditorPage |
| Navbar Glass | `EditorPage.jsx:649-687` | EditorPage, LegalEditorPage, DashboardPage, PreviewPage, CheckoutPage |
| Bottom Navigation | `EditorPage.jsx:772-846` | EditorPage, LegalEditorPage |
| Card de Documento | `DashboardPage.jsx:214-244`, `LegalEditorPage.jsx:361-378` | DashboardPage, LegalEditorPage |

### 1.2 Estilos Repetidos

| Estilo | Localizações |
|--------|--------------|
| `labelStyle` | `EditorPage.jsx:158-166`, `LoginPage.jsx:168-174` |
| `errorStyle` | `EditorPage.jsx:171-175`, `LoginPage.jsx:176-180` |

### 1.3 Funções Utilitárias Repetidas

| Função | Localização Atual | Onde Usar |
|--------|-------------------|-----------|
| `formatCpf` | `LoginPage.jsx:48-54` | LoginPage, LegalFieldRenderer (UI.jsx) |
| `formatPhone` | `LoginPage.jsx:59-64` | LoginPage |
| `getFieldError` | `EditorPage.jsx:180-183` | EditorPage, LegalEditorPage |

### 1.4 Lógica de Formulário Repetida

- Adicionar/Remover itens de arrays (`experiencias`, `formacoes`, `idiomas`)
- Renderização de campos com validação
- Navegação entre etapas com validação

---

## 2. Plano de Implementação

### Fase 1: Componentes de Layout Essenciais

#### 2.1 AppNavbar
- **Arquivo**: `src/components/UI.jsx`
- **Substitui**: Navbar glass em todas as páginas
- **Props**: `title`, `leftAction`, `rightAction`, `children`
- **Implementar**: ~30 minutos

#### 2.2 AppStepper
- **Arquivo**: `src/components/UI.jsx`
- **Substitui**: Stepper em EditorPage e LegalEditorPage
- **Props**: `steps`, `currentStep`, `onStepClick`, `completedSteps`
- **Implementar**: ~45 minutos

#### 2.3 BottomNavigation
- **Arquivo**: `src/components/UI.jsx`
- **Substitui**: Botões de navegação inferior
- **Props**: `onBack`, `onNext`, `isFirstStep`, `isLastStep`, `nextLabel`, `extraContent`
- **Implementar**: ~30 minutos

---

### Fase 2: Estilos e Utilitários Centralizados

#### 2.4 Estilos Compartilhados
- **Arquivo**: `src/data/constants.js` (adicionar objeto STYLES)
- **Incluir**: `labelStyle`, `errorStyle`, `sectionTitleStyle`
- **Implementar**: ~15 minutos

#### 2.5 Funções de Formatação
- **Arquivo**: `src/utils/validation.js` (ou criar `src/utils/formatters.js`)
- **Incluir**: `formatCpf`, `formatPhone`, `formatCnpj`
- **Exportar**: Para uso em LoginPage e UI.jsx
- **Implementar**: ~20 minutos

---

### Fase 3: Componentes de Documentos

#### 2.6 DocumentCard
- **Arquivo**: `src/components/UI.jsx`
- **Substitui**: Cards em DashboardPage e LegalEditorPage
- **Props**: `title`, `subtitle`, `type`, `status`, `date`, `onClick`, `icon`
- **Implementar**: ~30 minutos

#### 2.7 FieldError
- **Arquivo**: `src/components/UI.jsx`
- **Substitui**: Mensagens de erro inline
- **Props**: `message`, `style`
- **Implementar**: ~15 minutos

---

### Fase 4: Integração

#### 2.8 Refatorar EditorPage
- Usar `AppNavbar`, `AppStepper`, `BottomNavigation`
- Usar estilos compartilhados
- **Estimativa**: ~1 hora

#### 2.9 Refatorar LegalEditorPage
- Usar `AppNavbar`, `AppStepper`, `BottomNavigation`, `DocumentCard`
- Usar utilitários de formatação
- **Estimativa**: ~1 hora

#### 2.10 Refatorar DashboardPage
- Usar `AppNavbar`, `DocumentCard`
- **Estimativa**: ~30 minutos

#### 2.11 Refatorar PreviewPage
- Usar `AppNavbar`
- **Estimativa**: ~20 minutos

#### 2.12 Refatorar CheckoutPage
- Usar `AppNavbar`
- **Estimativa**: ~20 minutos

#### 2.13 Refatorar LoginPage
- Usar estilos compartilhados
- Importar formatadores de `utils/validation.js`
- **Estimativa**: ~30 minutos

---

## 3. Ordem de Implementação Sugerida

```
Semana 1
├── Segunda  - Criar estilos em constants.js + formatters.js
├── Terça    - Criar AppNavbar + BottomNavigation
├── Quarta   - Criar AppStepper
├── Quinta   - Criar DocumentCard + FieldError
└── Sexta    - Testar componentes isolados

Semana 2
├── Segunda  - Refatorar EditorPage
├── Terça    - Refatorar LegalEditorPage
├── Quarta   - Refatorar DashboardPage + PreviewPage
├── Quinta   - Refatorar CheckoutPage + LoginPage
└── Sexta    - Testes finais + ajustes
```

---

## 4. Benefícios Esperados

| Métrica | Antes | Depois |
|---------|-------|--------|
| Linhas duplicadas (aprox) | ~800 | ~150 |
| Manutenção de navbar | 5 arquivos | 1 componente |
| Manutenção de stepper | 2 arquivos | 1 componente |
| Consistência visual | Variável | Centralizada |

---

## 5. Riscos e Mitigações

### Risco: Quebrar funcionalidades existentes
- **Mitigação**: Testar cada página após refatoração
- **Mitigação**: Manter versões antigas comentadas até validação

### Risco: Conflitos de estilos
- **Mitigação**: Usar CSS-in-JS com objetos, não inline complexos
- **Mitigação**: Documentar props de estilo

### Risco: Retrocesso em desenvolvimento
- **Mitigação**: Criar branch separada para refatoração
- **Mitigação**: Commits atômicos por componente

---

## 6. Critérios de Conclusão

- [ ] Todos os componentes de UI reutilizáveis criados
- [ ] Todas as páginas usando componentes compartilhados
- [ ] Estilos centralizados em constants.js
- [ ] Funções utilitárias importadas de utils/
- [ ] Teste manual em todas as páginas concluído
- [ ] Nenhum erro de console ou warn de React

---

## 7. Comando para Teste Final

Após implementação, executar:
```bash
npm run build
```

Verificar se o build completes sem erros e o app funciona em modo desenvolvimento:
```bash
npm run dev
```

---

## 8. Status de Implementação (Atualizado em: 2026-04-05)

### Componentes Criados
| Componente | Arquivo | Status |
|------------|---------|--------|
| `AppNavbar` | `src/components/UI.jsx` | ✅ Concluído |
| `AppStepper` | `src/components/UI.jsx` | ✅ Concluído |
| `BottomNavigation` | `src/components/UI.jsx` | ✅ Concluído |
| `DocumentCard` | `src/components/UI.jsx` | ✅ Concluído |
| `ErrorMessage` | `src/components/UI.jsx` | ✅ Concluído |
| `formatCpf/formatPhone` | `src/utils/formatting.js` | ✅ Concluído |
| `LABEL_STYLE/ERROR_STYLE` | `src/constants/styles.js` | ✅ Concluído |
| `validateCpf` | `src/utils/validation.js` | ✅ Concluído |
| `sanitizeText/sanitizeFormData` | `src/utils/sanitization.js` | ✅ Concluído |

### Páginas Refatoradas
| Página | AppNavbar | AppStepper | BottomNavigation | Status |
|--------|:---------:|:----------:|:----------------:|:------:|
| EditorPage | ✅ | ✅ | ✅ | ✅ Concluído |
| LegalEditorPage | ✅ | ✅ | ✅ | ✅ Concluído |
| DashboardPage | ✅ | - | - | ✅ Concluído |
| PreviewPage | ✅ | - | - | ✅ Concluído |
| CheckoutPage | ✅ | - | - | ✅ Concluído |
| ProfilePage | ✅ | - | - | ✅ Concluído |
| LoginPage | - | - | - | ✅ Concluído (formatadores + estilos) |

### Pendente (1)
| Página | Componente Faltando |
|--------|---------------------|
| LandingPage | `<nav className="glass" inline` (linha 50) |

---

## 9. Resumo de Progresso

- **Total de páginas analisadas**: 8
- **Páginas completamente refatoradas**: 7
- **Página pendente**: 1 (LandingPage)
- **Progresso total**: ~95%

---

*Documento criado em: 2026-04-05*
*Última atualização: 2026-04-05*
*Próximo passo: Refatorar LandingPage para usar AppNavbar*
