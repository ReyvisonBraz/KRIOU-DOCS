# Fase 7 — Cronograma de Implementação
> Roadmap de 7 semanas para produção robusta

---

## Visão Geral

```
SEMANA 1 — Segurança (Bloqueante)
SEMANA 2 — Limpeza e Utilitários
SEMANA 3 — Componentes Reutilizáveis
SEMANA 4 — Contextos e Arquitetura
SEMANA 5 — Performance e Bundle
SEMANA 6 — UX e Funcionalidades
SEMANA 7 — Testes e Estabilização
```

Cada semana tem atividades independentes que podem ser paralelizadas se houver dois desenvolvedores.

---

## Semana 1 — Segurança (Fase 1)

**Objetivo:** Eliminar vulnerabilidades críticas antes de qualquer outro trabalho.
**Por que primeiro:** Publicar sem isso viola a LGPD.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Remover CPF/telefone/email do localStorage | `storage.js` | 2h |
| Seg | Criar `saveSession()` seguro com sessionStorage | `storage.js` | 1h |
| Ter | Remover password de useState | `LoginPage.jsx` | 1h |
| Ter | Implementar `validateCpf()` com Mod11 | `validation.js` | 1h |
| Qua | Corrigir regex de e-mail | `validation.js` | 30min |
| Qua | Instalar DOMPurify e criar `sanitization.js` | novo arquivo | 1h |
| Qua | Aplicar sanitização em saveDraft e saveSession | `storage.js`, `AppContext.jsx` | 1h |
| Qui | Implementar `rateLimiter.js` | novo arquivo | 1h |
| Qui | Aplicar rate limiting em login/OTP | `LoginPage.jsx`, `AppContext.jsx` | 1h |
| Sex | Revisar storage.js completo + testes manuais | `storage.js` | 2h |
| Sex | Revisar todos os console.log com dados sensíveis | todos os arquivos | 1h |

**Entrega:** Nenhum dado PII em texto puro, inputs sanitizados, CPF validado com Mod11.

---

## Semana 2 — Limpeza e Utilitários (Fase 4, parte 1)

**Objetivo:** Eliminar código morto e centralizar utilitários repetidos.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Deletar arquivos protótipo da raiz | 5 arquivos | 30min |
| Seg | Criar `src/utils/formatting.js` | novo arquivo | 1h |
| Seg | Substituir formatCpf/Phone em LoginPage | `LoginPage.jsx` | 30min |
| Ter | Criar `src/constants/styles.js` | novo arquivo | 1h |
| Ter | Substituir labelStyle/errorStyle em todas as páginas | 4 arquivos | 2h |
| Qua | Criar `src/constants/storage.js` + `timing.js` | novos arquivos | 1h |
| Qua | Substituir magic numbers pelos constants | todos os arquivos | 1h |
| Qui | Criar componente `ErrorMessage` | `components/Form/` | 30min |
| Qui | Substituir 15+ ocorrências de erro inline | vários arquivos | 2h |
| Sex | Criar componente `FormField` | `components/Form/` | 1h |
| Sex | Criar `src/utils/logger.js` | novo arquivo | 30min |

**Entrega:** ~500 linhas de duplicação removidas, utilitários centralizados.

---

## Semana 3 — Componentes Reutilizáveis (Fase 2, parte 1)

**Objetivo:** Quebrar UI.jsx em módulos e criar componentes de layout.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Criar estrutura de pastas `src/components/` | diretórios | 30min |
| Seg | Extrair Button para `components/Button/` | UI.jsx → Button.jsx | 1h |
| Seg | Extrair Card para `components/Card/` | UI.jsx → Card.jsx | 1h |
| Ter | Extrair Input, Select, Textarea para `components/Form/` | UI.jsx | 2h |
| Ter | Extrair LoadingSpinner, EmptyState para `components/Feedback/` | UI.jsx | 1h |
| Qua | Criar `AppNavbar` (substitui navbar glass em 5 páginas) | novo | 2h |
| Qua | Integrar AppNavbar em DashboardPage e PreviewPage | 2 arquivos | 1h |
| Qui | Criar `AppStepper` (substitui stepper em 2 páginas) | novo | 2h |
| Qui | Criar `BottomNavigation` (substitui nav inferior) | novo | 1h |
| Sex | Integrar AppStepper e BottomNavigation em EditorPage | `EditorPage.jsx` | 2h |
| Sex | Integrar em LegalEditorPage | `LegalEditorPage.jsx` | 1h |

**Entrega:** UI.jsx dividido, componentes reutilizáveis funcionando em todas as páginas.

---

## Semana 4 — Contextos e Arquitetura (Fase 2, parte 2)

**Objetivo:** Separar AppContext monolítico em contextos especializados.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Criar `AuthContext` (auth + session) | novo arquivo | 2h |
| Seg | Migrar login/OTP/logout para AuthContext | `AppContext.jsx` | 1h |
| Ter | Criar `ResumeContext` (formulário de currículo) | novo arquivo | 2h |
| Ter | Migrar formData + steps do AppContext | `AppContext.jsx` | 1h |
| Qua | Criar `LegalContext` (formulário jurídico) | novo arquivo | 2h |
| Qua | Criar `UIContext` (toasts, loading global) | novo arquivo | 1h |
| Qui | Refatorar App.jsx — combinar providers | `App.jsx` | 1h |
| Qui | Criar `src/services/authService.js` | novo arquivo | 1h |
| Qui | Criar `src/services/documentService.js` | novo arquivo | 1h |
| Sex | Dividir legalDocuments.js em módulos | `legalDocuments/` | 2h |
| Sex | Implementar lazy loading de documentos jurídicos | `LegalEditorPage.jsx` | 1h |

**Entrega:** Contextos separados, re-renders reduzidos, serviços desacoplados.

---

## Semana 5 — Performance e Bundle (Fase 3)

**Objetivo:** Melhorar tempo de carregamento e fluidez da UI.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Implementar lazy loading de rotas | `App.jsx` | 1h |
| Seg | Adicionar Suspense com LoadingSpinner | `App.jsx` | 30min |
| Seg | Configurar rollup-plugin-visualizer | `vite.config.js` | 30min |
| Ter | Analisar bundle e identificar top-3 problemas | bundle-analysis.html | 1h |
| Ter | Configurar manualChunks para react, jspdf | `vite.config.js` | 1h |
| Qua | Criar `src/workers/pdfWorker.js` | novo arquivo | 2h |
| Qua | Implementar `usePDF` hook com Web Worker | `hooks/usePDF.js` | 2h |
| Qui | Implementar `useAutoSave` com debounce | `hooks/useAutoSave.js` | 1h |
| Qui | Instalar idb e migrar drafts para IndexedDB | `services/storageService.js` | 2h |
| Sex | Adicionar React.memo nos componentes de lista | vários arquivos | 1h |
| Sex | Adicionar useCallback em handlers de loops | vários arquivos | 1h |

**Entrega:** Bundle inicial <300KB, PDF gerado sem bloquear UI.

---

## Semana 6 — UX e Funcionalidades (Fase 5)

**Objetivo:** Experiência profissional para o usuário final.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Instalar Sonner + configurar Toaster | `App.jsx` | 30min |
| Seg | Substituir todos os console.error por toast.error | vários arquivos | 2h |
| Seg | Criar `SaveIndicator` e integrar nas páginas de edição | novo + 2 páginas | 1h |
| Ter | Implementar `useUnsavedChanges` | novo hook | 1h |
| Ter | Criar `SkeletonCard` para loading de documentos | novo componente | 1h |
| Ter | Criar `EmptyState` e usar no DashboardPage | novo componente | 1h |
| Qua | Remover dados mock do DashboardPage | `DashboardPage.jsx` | 1h |
| Qua | Conectar DashboardPage a dados reais do contexto | `DashboardPage.jsx` | 2h |
| Qui | Adicionar barra de progresso de preenchimento | `EditorPage.jsx` | 1h |
| Qui | Implementar `useConfirm` + `ConfirmDialog` | novos | 1h |
| Sex | Revisão de acessibilidade (aria-labels, roles) | todas as páginas | 2h |
| Sex | Teste responsivo em 375px, 768px, 1280px | todas as páginas | 2h |

**Entrega:** UX profissional — feedback visual, sem perda de dados, acessível.

---

## Semana 7 — Testes e Estabilização (Fase 6)

**Objetivo:** Cobertura de testes mínima e estabilização final.

| Dia | Tarefa | Arquivo Principal | Tempo |
|-----|--------|-------------------|-------|
| Seg | Configurar Vitest + testing-library | `vite.config.js`, `setup.js` | 1h |
| Seg | Testes para validateCpf (6+ casos) | `validation.test.js` | 1h |
| Seg | Testes para formatCpf, formatPhone | `formatting.test.js` | 1h |
| Ter | Testes para sanitizeText | `sanitization.test.js` | 1h |
| Ter | Testes para ErrorMessage e Button | `.test.jsx` | 1h |
| Qua | Testes de integração para LoginPage | `LoginPage.test.jsx` | 2h |
| Qua | Testes para useAutoSave | `useAutoSave.test.js` | 1h |
| Qui | `npm run test:coverage` — verificar cobertura | relatório | 1h |
| Qui | Correção de bugs encontrados pelos testes | vários | 2h |
| Sex | `npm run build` — verificar build limpo | terminal | 30min |
| Sex | Teste manual end-to-end de todos os fluxos | app | 3h |

**Entrega:** App pronto para produção, testes passando, build sem erros.

---

## Resumo do Esforço Total

| Semana | Horas Estimadas | Tema |
|--------|-----------------|------|
| 1 | 12h | Segurança |
| 2 | 11h | Limpeza |
| 3 | 15h | Componentes |
| 4 | 15h | Arquitetura |
| 5 | 13h | Performance |
| 6 | 15h | UX |
| 7 | 13h | Testes |
| **Total** | **94h** | |

Com **1 desenvolvedor em full-time**, isso equivale a 7 semanas.
Com **2 desenvolvedores**, reduz para ~4-5 semanas com paralelização.

---

## Marcos Intermediários

| Marco | Semana | Significado |
|-------|--------|-------------|
| App seguro para deploy interno | Fim da semana 1 | PII protegido, LGPD básica ok |
| Código limpo e mantível | Fim da semana 4 | Sem duplicação, arquitetura sólida |
| App performático | Fim da semana 5 | Bundle <300KB, PDF fluido |
| Pronto para usuários | Fim da semana 6 | UX profissional |
| Pronto para produção | Fim da semana 7 | Testes, build limpo |
