/**
 * ============================================
 * KRIOU DOCS - Login Page
 * ============================================
 * Clean, centered Google OAuth flow.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import showToast from "../utils/toast";

const LoginPage = () => {
  const { navigate, signInWithGoogle } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("[LoginPage] Google OAuth error:", err);
      showToast.error("Erro ao iniciar login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-5 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-[-20%] right-[-15%] w-[600px] h-[600px] bg-coral/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] animate-fade-up relative z-10">

        {/* Back link */}
        <button
          onClick={() => navigate("landing")}
          className="group inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors text-sm font-medium mb-10 bg-transparent border-none cursor-pointer py-2 touch-target"
        >
          <Icon name="ChevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Voltar ao in&iacute;cio
        </button>

        {/* Branding */}
        <div className="mb-8">
          <button
            onClick={() => navigate("landing")}
            className="font-display text-[2.25rem] font-black tracking-tight text-text bg-transparent border-none cursor-pointer inline-block"
          >
            <span className="text-coral">Kriou</span>Docs
          </button>
        </div>

        {/* Heading */}
        <h1 className="font-display text-[1.75rem] font-extrabold text-text mb-2 leading-tight">
          Acesse sua conta
        </h1>
        <p className="text-text-dim text-[15px] leading-relaxed mb-9">
          Currículos profissionais, contratos e documentos jurídicos com preenchimento guiado.
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
                     bg-white text-gray-900 font-semibold text-[15px]
                     transition-all duration-200
                     hover:bg-gray-100 hover:shadow-lg
                     active:scale-[0.98]
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy
                     touch-target"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Redirecionando...
            </>
          ) : (
            <>
              {/* Styled "G" in circle — no external icon dependency */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 1.875a8.125 8.125 0 1 0 5.337 14.249l-.864-1.097A6.875 6.875 0 1 1 16.6 9.375h-6.6v1.25h5.288a6.858 6.858 0 0 1-5.288 6.525A6.875 6.875 0 0 1 10 3.125c1.535 0 2.973.506 4.137 1.426l.884-.884A8.125 8.125 0 0 0 10 1.875Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10 10.625v1.25h5.288a6.858 6.858 0 0 1-1.281 3.152l-.864-1.097a5.625 5.625 0 1 0-3.143-3.305Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10 3.125c1.535 0 2.973.506 4.137 1.426l.884-.884A8.125 8.125 0 0 0 10 1.875v1.25Z" fill="#FBBC05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10 16.875a6.86 6.86 0 0 0 4.052-1.348l.864 1.097A8.125 8.125 0 0 1 10 18.125v-1.25Z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </>
          )}
        </button>

        {/* Terms */}
        <p className="text-xs text-text-muted text-center mt-6 leading-relaxed">
          Ao continuar, você concorda com os{" "}
          <span className="text-coral cursor-pointer font-medium hover:underline">Termos de Uso</span>
          {" "}e a{" "}
          <span className="text-coral cursor-pointer font-medium hover:underline">Política de Privacidade</span>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
