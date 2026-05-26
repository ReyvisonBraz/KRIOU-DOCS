/**
 * ============================================
 * KRIOU DOCS - Login Page
 * ============================================
 * Tela de acesso do cliente com preview do produto.
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--navy)" }}>
      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: minmax(0, 1.06fr) minmax(380px, 0.94fr);
        }
        .login-visual {
          position: relative;
          padding: 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--border);
          background:
            linear-gradient(130deg, rgba(20,184,166,0.12), transparent 38%),
            linear-gradient(25deg, rgba(244,63,94,0.13), transparent 34%),
            var(--navy-light);
        }
        .login-preview-grid {
          display: grid;
          grid-template-columns: 1fr 0.78fr;
          gap: 18px;
          align-items: end;
          margin-top: 54px;
        }
        .login-pdf {
          min-height: 470px;
          border-radius: 10px;
          background: #fbfaf6;
          color: #171722;
          box-shadow: 0 30px 90px rgba(0,0,0,0.42);
          overflow: hidden;
          transform: rotate(-2deg);
        }
        .login-panel {
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(26,26,54,0.88);
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.32);
        }
        .login-form-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
        }
        @media (max-width: 960px) {
          .login-page {
            grid-template-columns: 1fr;
          }
          .login-visual {
            display: none;
          }
          .login-form-wrap {
            min-height: 100vh;
            min-height: 100dvh;
          }
        }
      `}</style>

      <div className="login-page">
        <section className="login-visual" aria-hidden="true">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("landing")}
              className="font-display text-2xl font-black tracking-tight text-text bg-transparent border-none cursor-pointer"
            >
              <span className="text-coral">Kriou</span>Docs
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
              <Icon name="Lock" className="w-4 h-4 text-teal" />
              Acesso seguro
            </div>
          </div>

          <div>
            <p className="text-xs text-gold font-extrabold uppercase tracking-[0.16em] mb-4">
              Área do cliente
            </p>
            <h1 className="font-display text-[clamp(2.3rem,4.4vw,4.7rem)] font-black leading-none text-text max-w-[690px] mb-5">
              Seu workspace de documentos, rascunhos e PDFs.
            </h1>
            <p className="text-text-dim text-lg max-w-[560px] leading-relaxed">
              Acesse sua biblioteca, continue preenchimentos, duplique modelos e gere arquivos com layout adaptado ao conteúdo.
            </p>

            <div className="login-preview-grid">
              <div className="login-pdf">
                <div style={{ padding: "38px 38px 18px", textAlign: "center" }}>
                  <div style={{ height: 2, width: 118, margin: "0 auto 20px", background: "#b59b49" }} />
                  <div style={{ color: "#8b3a3a", fontFamily: "Times New Roman, serif", fontSize: 24, fontWeight: 700 }}>CONTRATO</div>
                  <div style={{ height: 1, width: 76, margin: "22px auto 0", background: "#d4af37" }} />
                </div>
                <div style={{ margin: "0 32px", padding: "12px 16px", borderLeft: "4px solid #a58737", background: "#faf7ee", border: "1px solid #e8e1cf" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#a58737", marginBottom: 7 }}>FUNDAMENTO LEGAL</div>
                  <div style={{ height: 6, width: "82%", background: "#15151f", opacity: 0.16, borderRadius: 10 }} />
                </div>
                <div style={{ padding: "24px 32px", display: "grid", gap: 9 }}>
                  {[98, 88, 94, 78, 100, 64].map((w) => (
                    <div key={w} style={{ width: `${w}%`, height: 7, borderRadius: 10, background: "#15151f", opacity: 0.14 }} />
                  ))}
                </div>
                <div style={{ padding: "10px 32px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
                  {["VENDEDOR", "COMPRADOR"].map((label) => (
                    <div key={label}>
                      <div style={{ borderTop: "1px dashed #30303a", height: 13 }} />
                      <div style={{ height: 6, width: "68%", margin: "0 auto 6px", borderRadius: 10, background: "#15151f", opacity: 0.13 }} />
                      <div style={{ fontSize: 8, fontWeight: 800, color: "#a58737", textAlign: "center" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="login-panel">
                <p className="text-xs text-text-muted font-bold uppercase tracking-wide mb-4">Ações recentes</p>
                <div className="grid gap-3">
                  {[
                    ["Search", "Pesquisar CPF"],
                    ["Copy", "Copiar contrato"],
                    ["Archive", "Arquivar recibo"],
                    ["Download", "Baixar PDF"],
                  ].map(([icon, text]) => (
                    <div key={text} className="flex items-center gap-3 rounded-xl bg-surface-2 border border-border p-3">
                      <span className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center text-teal">
                        <Icon name={icon} className="w-4 h-4" />
                      </span>
                      <span className="text-sm font-bold text-text-dim">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-[640px]">
            {["PDF adaptável", "Busca rápida", "Mobile pronto"].map((item) => (
              <div key={item} className="surface-card" style={{ padding: "14px 16px", borderRadius: 14 }}>
                <Icon name="Check" className="w-4 h-4 text-success mb-2" />
                <p className="text-sm text-text font-bold m-0">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="login-form-wrap">
          <div className="w-full max-w-[440px] animate-fade-up">
            <button
              onClick={() => navigate("landing")}
              className="group inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors text-sm font-medium mb-8 bg-transparent border-none cursor-pointer py-2 touch-target"
            >
              <Icon name="ChevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Voltar ao início
            </button>

            <div className="surface-card" style={{ padding: "32px", borderRadius: 18, boxShadow: "0 24px 70px rgba(0,0,0,0.24)" }}>
              <div className="mb-8">
                <button
                  onClick={() => navigate("landing")}
                  className="font-display text-[2rem] font-black tracking-tight text-text bg-transparent border-none cursor-pointer inline-block"
                >
                  <span className="text-coral">Kriou</span>Docs
                </button>
                <p className="text-xs text-text-muted uppercase tracking-[0.16em] font-bold mt-2 mb-0">
                  Login do cliente
                </p>
              </div>

              <h1 className="font-display text-[2rem] font-extrabold text-text mb-3 leading-tight">
                Entre para continuar
              </h1>
              <p className="text-text-dim text-[15px] leading-relaxed mb-8">
                Use sua conta Google para acessar documentos, rascunhos, histórico e PDFs gerados.
              </p>

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
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 1.875a8.125 8.125 0 1 0 5.337 14.249l-.864-1.097A6.875 6.875 0 1 1 16.6 9.375h-6.6v1.25h5.288a6.858 6.858 0 0 1-5.288 6.525A6.875 6.875 0 0 1 10 3.125c1.535 0 2.973.506 4.137 1.426l.884-.884A8.125 8.125 0 0 0 10 1.875Z" fill="#4285F4" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 10.625v1.25h5.288a6.858 6.858 0 0 1-1.281 3.152l-.864-1.097a5.625 5.625 0 1 0-3.143-3.305Z" fill="#34A853" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 3.125c1.535 0 2.973.506 4.137 1.426l.884-.884A8.125 8.125 0 0 0 10 1.875v1.25Z" fill="#FBBC05" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 16.875a6.86 6.86 0 0 0 4.052-1.348l.864 1.097A8.125 8.125 0 0 1 10 18.125v-1.25Z" fill="#EA4335" />
                    </svg>
                    Continuar com Google
                  </>
                )}
              </button>

              <div className="grid grid-cols-3 gap-2 mt-6">
                {[
                  ["Lock", "Seguro"],
                  ["Save", "Rascunhos"],
                  ["Download", "PDF"],
                ].map(([icon, label]) => (
                  <div key={label} className="bg-surface-2 border border-border rounded-xl p-3 text-center">
                    <Icon name={icon} className="w-4 h-4 text-teal mx-auto mb-2" />
                    <span className="text-[11px] text-text-muted font-bold">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-muted text-center mt-6 leading-relaxed mb-0">
                Ao continuar, você concorda com os{" "}
                <span className="text-coral cursor-pointer font-medium hover:underline">Termos de Uso</span>
                {" "}e a{" "}
                <span className="text-coral cursor-pointer font-medium hover:underline">Política de Privacidade</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
