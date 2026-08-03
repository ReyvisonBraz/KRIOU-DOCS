/**
 * ============================================
 * KRIOU DOCS - App Router Component
 * ============================================
 * Componente raiz que gerencia rotas via React Router (react-router-dom)
 * e providers globais.
 *
 * ARVORE DE COMPONENTES:
 *   ErrorBoundary (raiz)
 *   └── ThemeProvider
 *       └── BrowserRouter
 *           └── AppProvider (Auth, Resume, Legal, Navigation)
 *               ├── AppRoutes (Routes/Route)
 *               └── Toaster (notificacoes)
 *
 * @module App
 */

import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/Theme";
import { Spinner } from "./components/UI";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

// Rotas eager (sempre no bundle inicial)
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
const AdminPage           = lazy(() => import("./pages/AdminPage"));
const AuthCallbackPage    = lazy(() => import("./pages/AuthCallbackPage"));
const CompleteProfilePage = lazy(() => import("./pages/CompleteProfilePage"));
const WelcomePage         = lazy(() => import("./pages/WelcomePage"));

// ─── withNavigate — Injeta onNavigate em paginas que precisam ──────────────
const withNavigate = (Component) => {
  const Wrapped = (props) => {
    const { navigate } = useApp();
    return React.createElement(Component, { ...props, onNavigate: navigate });
  };
  return Wrapped;
};

const AuthCallbackWrapped = withNavigate(AuthCallbackPage);
const CompleteProfileWrapped = withNavigate(CompleteProfilePage);

// ─── PageFallback — tela de loading enquanto a pagina lazy carrega ──────────
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy">
    <Spinner size={36} />
  </div>
);

// ─── AppRoutes — Definicao de rotas do React Router ─────────────────────────
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackWrapped />} />
        <Route path="/complete-profile" element={<CompleteProfileWrapped />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/legal-editor" element={<LegalEditorPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

// ─── App — Componente raiz ─────────────────────────────────────────────────
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AppProvider>
            <AppRoutes />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: { fontFamily: "inherit", fontSize: 14 },
              }}
            />
          </AppProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
