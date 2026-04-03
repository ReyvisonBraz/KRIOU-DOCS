/**
 * ============================================
 * KRIOU DOCS - App Router Component
 * ============================================
 * Main router component that renders pages
 * based on current navigation state.
 * 
 * @module App
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/Theme";

// Componentes de Página
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TemplatesPage from "./pages/TemplatesPage";
import EditorPage from "./pages/EditorPage";
import PreviewPage from "./pages/PreviewPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import LegalEditorPage from "./pages/LegalEditorPage";

/**
 * PageRouter - Renders the appropriate page based on currentPage state
 * Uses useApp hook to access navigation state
 */
const PageRouter = () => {
  const { currentPage } = useApp();

  const routes = {
    landing: LandingPage,
    login: LoginPage,
    dashboard: DashboardPage,
    templates: TemplatesPage,
    editor: EditorPage,
    preview: PreviewPage,
    checkout: CheckoutPage,
    profile: ProfilePage,
    legalEditor: LegalEditorPage,
  };

  const PageComponent = routes[currentPage] || LandingPage;

  return <PageComponent />;
};

/**
 * App - Root application component
 * Wraps application with ThemeProvider for global styles
 * and AppProvider for global state management
 */
const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <PageRouter />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;