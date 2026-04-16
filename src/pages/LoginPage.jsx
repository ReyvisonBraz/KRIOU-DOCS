/**
 * ============================================
 * KRIOU DOCS - Login Page
 * ============================================
 * Autenticação via Google OAuth (Supabase).
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import showToast from "../utils/toast";

const LoginPage = () => {
  const { navigate, signInWithGoogle } = useApp();
  const [isLoading, setIsLoading]      = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Browser redireciona para o Google automaticamente
    } catch (err) {
      console.error("[LoginPage] Google OAuth error:", err);
      showToast.error("Erro ao iniciar login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-coral/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] bg-surface border border-border rounded-3xl p-8 relative z-10 shadow-2xl animate-fadeUp">
        {/* Voltar */}
        <button
          onClick={() => navigate("landing")}
          className="group flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-8 bg-transparent border-none cursor-pointer"
        >
          <Icon name="ChevronLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao início
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="font-display text-3xl font-black cursor-pointer inline-block"
            onClick={() => navigate("landing")}
          >
            <span className="text-coral">Kriou</span>
            <span className="text-white ml-0.5">Docs</span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-black text-center mb-2 font-display text-white">
          Acesse sua conta
        </h1>
        <p className="text-text-muted text-center mb-8 text-[15px]">
          Seus documentos em qualquer dispositivo
        </p>

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 p-4 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 active:bg-gray-100 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              {/* SVG do Google inline — sem dependência externa */}
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar com Google
            </>
          )}
        </button>

        {/* Rodapé */}
        <p className="text-xs text-text-muted text-center mt-6 leading-relaxed">
          Ao continuar, você concorda com os{" "}
          <span className="text-coral cursor-pointer hover:underline">Termos de Uso</span>
          {" "}e a{" "}
          <span className="text-coral cursor-pointer hover:underline">Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
