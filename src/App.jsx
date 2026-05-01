/**
 * ============================================
 * KRIOU DOCS - App Router Component
 * ============================================
 * Componente raiz que gerencia rotas (SPA sem router externo)
 * e providers globais.
 *
 * ARVORE DE COMPONENTES:
 *   ErrorBoundary (raiz)
 *   └── ThemeProvider
 *       └── AppProvider
 *           ├── PageRouter (pagina atual)
 *           └── Toaster (notificacoes)
 *
 * ROTEAMENTO:
 *   Usa estado interno (currentPage) + history.pushState.
 *   Nao usa React Router — as transicoes sao controladas pelo
 *   NavigationProvider no AppContext.
 *
 * CODE SPLITTING:
 *   Paginas internas (dashboard, editor, etc.) sao lazy-loaded.
 *   Landing e login sao eager (sempre na bundle inicial).
 *
 * LOGS: Prefixo [App] / [PageRouter] para facilitar filtragem.
 *
 * @module App
 */

import React, { Suspense, lazy } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/Theme";
import { Spinner } from "./components/UI";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

// Rotas eager (sempre na bundle inicial)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

// Rotas lazy (code splitting — carregadas sob demanda)
const DashboardPage       = lazy(() => import("./pages/DashboardPage"));
const TemplatesPage       = lazy(() => import("./pages/TemplatesPage"));
const EditorPage          = lazy(() => import("./pages/EditorPage"));
const PreviewPage         = lazy(() => import("./pages/PreviewPage"));
const CheckoutPage        = lazy(() => import("./pages/CheckoutPage"));
const ProfilePage         = lazy(() => import("./pages/ProfilePage"));
const LegalEditorPage     = lazy(() => import("./pages/LegalEditorPage"));
const AuthCallbackPage    = lazy(() => import("./pages/AuthCallbackPage"));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage"));
const WelcomePage         = lazy(() => import("./pages/WelcomePage"));

// ─── withNavigate — Injeta onNavigate em paginas que precisam ──────────────
// Necessario para AuthCallbackPage e CompleteProfilePage, que sao
// montadas antes do AppContext estar completamente pronto e precisam
// navegar programaticamente.
// eslint-disable-next-line no-unused-vars
const withNavigate = (Component) => {
  const Wrapped = (props) => {
    const { navigate } = useApp();
    return <Component {...props} onNavigate={navigate} />;
  };
  return Wrapped;
};

// ─── Rotas ──────────────────────────────────────────────────────────────────
const routes = {
  landing:         LandingPage,
  login:           LoginPage,
  authCallback:    withNavigate(AuthCallbackPage),
  completeProfile: withNavigate(CompleteProfilePage),
  welcome:         WelcomePage,
  dashboard:       DashboardPage,
  templates:       TemplatesPage,
  editor:          EditorPage,
  preview:         PreviewPage,
  checkout:        CheckoutPage,
  profile:         ProfilePage,
  legalEditor:     LegalEditorPage,
};

// ─── PageFallback — tela de loading enquanto a pagina lazy carrega ──────────
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy">
    <Spinner size={36} />
  </div>
);

// ─── PageRouter — renderiza a pagina baseada em currentPage ────────────────
const PageRouter = () => {
  const { currentPage } = useApp();
  const PageComponent = routes[currentPage] || LandingPage;

  return (
    <Suspense fallback={<PageFallback />}>
      <div key={currentPage} className="page-enter">
        <PageComponent />
      </div>
    </Suspense>
  );
};

// ─── App — Componente raiz ─────────────────────────────────────────────────
// NOTA: Apenas um ErrorBoundary (na raiz). O segundo ErrorBoundary
// que antes envolvia PageRouter foi removido por ser redundante —
// o ErrorBoundary raiz ja captura erros de todos os filhos.
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <PageRouter />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { fontFamily: "inherit", fontSize: 14 },
            }}
          />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
