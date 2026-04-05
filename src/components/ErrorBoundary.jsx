/**
 * ============================================
 * KRIOU DOCS - Error Boundary
 * ============================================
 * Captura erros de renderização React e exibe
 * uma UI de fallback amigável em vez de uma
 * tela branca.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Em produção, enviar para serviço de monitoramento (Sentry, etc.)
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Recarregar a página como último recurso se o reset não resolver
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { fallback } = this.props;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          textAlign: "center",
          background: "var(--bg, #0f0f1e)",
          color: "var(--text, #e0e0f0)",
        }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(233,69,96,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 28,
        }}>
          ⚠️
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Algo deu errado
        </h1>

        <p style={{ fontSize: 14, color: "var(--text-muted, #888)", maxWidth: 380, marginBottom: 28, lineHeight: 1.6 }}>
          Ocorreu um erro inesperado. Seus dados locais estão preservados.
          Tente recarregar ou clique no botão abaixo.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px", borderRadius: 10,
              background: "var(--coral, #E94560)", color: "#fff",
              border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px", borderRadius: 10,
              background: "var(--surface-2, rgba(255,255,255,0.06))",
              color: "var(--text-muted)", border: "1px solid var(--border)",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}
          >
            Recarregar página
          </button>
        </div>

        {import.meta.env.DEV && this.state.error && (
          <details style={{ marginTop: 32, maxWidth: 600, textAlign: "left" }}>
            <summary style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
              Detalhes do erro (dev)
            </summary>
            <pre style={{
              marginTop: 8, padding: 12, borderRadius: 8,
              background: "rgba(0,0,0,0.4)", fontSize: 11,
              color: "#ff8080", overflowX: "auto", whiteSpace: "pre-wrap",
            }}>
              {this.state.error.toString()}
            </pre>
          </details>
        )}
      </div>
    );
  }
}

export default ErrorBoundary;
