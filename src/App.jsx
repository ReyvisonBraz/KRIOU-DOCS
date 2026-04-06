/**
 * ============================================
 * KRIOU DOCS - App Router Component
 * ============================================
 * Main router component that renders pages
 * based on current navigation state.
 * 
 * @module App
 */

import React, { Suspense, lazy } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/Theme";
import { Spinner } from "./components/UI";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

// Páginas carregadas na inicialização (rota inicial + login)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

// Páginas carregadas sob demanda (code splitting)
const DashboardPage   = lazy(() => import("./pages/DashboardPage"));
const TemplatesPage   = lazy(() => import("./pages/TemplatesPage"));
const EditorPage      = lazy(() => import("./pages/EditorPage"));
const PreviewPage     = lazy(() => import("./pages/PreviewPage"));
const CheckoutPage    = lazy(() => import("./pages/CheckoutPage"));
const ProfilePage     = lazy(() => import("./pages/ProfilePage"));
const LegalEditorPage = lazy(() => import("./pages/LegalEditorPage"));

const routes = {
  landing:     LandingPage,
  login:       LoginPage,
  dashboard:   DashboardPage,
  templates:   TemplatesPage,
  editor:      EditorPage,
  preview:     PreviewPage,
  checkout:    CheckoutPage,
  profile:     ProfilePage,
  legalEditor: LegalEditorPage,
};

const PageFallback = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Spinner size={36} />
  </div>
);

/**
 * PageRouter - Renders the appropriate page based on currentPage state
 * Uses useApp hook to access navigation state
 */
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

/**
 * App - Root application component
 * Wraps application with ThemeProvider for global styles
 * and AppProvider for global state management
 */
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppProvider>
          <ErrorBoundary>
            <PageRouter />
          </ErrorBoundary>
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