/**
 * ============================================
 * KRIOU DOCS - Login Page Component
 * ============================================
 * Clean and intuitive authentication flow.
 * Supports WhatsApp login and account creation.
 */

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button } from "../components/UI";
import { formatCpf, formatPhone } from "../utils/formatting";
import { validateCpf } from "../utils/validation";
import { LABEL_STYLE, ERROR_STYLE } from "../constants/styles";
import { checkRateLimit, resetRateLimit, formatRetryTime } from "../utils/rateLimiter";

/**
 * LoginPage - Clean authentication UI
 */
const LoginPage = () => {
  const { navigate, loginStep, setLoginStep, phone, setPhone, otp, setOtp, login } = useApp();

  const [authAction, setAuthAction] = useState(null); // "login" | "create"
  const [loginMethod, setLoginMethod] = useState(null); // "whatsapp" | "email" | "cpf"
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  // password uses a ref — never stored in React state to avoid DevTools exposure
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Reset to initial state
   */
  const handleBack = () => {
    if (loginStep === 1) {
      setLoginStep(0);
    } else if (loginStep === 0) {
      if (authAction === "login" && loginMethod) {
        setLoginMethod(null);
      } else {
        setAuthAction(null);
      }
    }
  };

  /**
   * Handle OTP change
   */
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  /**
   * Validate create account
   */
  const validateCreate = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = "Preencha seu nome";
    if (!sobrenome.trim()) newErrors.sobrenome = "Preencha seu sobrenome";
    if (!cpf.trim()) newErrors.cpf = "Preencha seu CPF";
    else if (!validateCpf(cpf)) newErrors.cpf = "CPF inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate email login
   */
  const validateEmailLogin = () => {
    const pwd = passwordRef.current?.value || "";
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Preencha seu e-mail";
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
      newErrors.email = "E-mail inválido";
    if (!pwd.trim()) newErrors.password = "Preencha sua senha";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate CPF login
   */
  const validateCpfLogin = () => {
    const pwd = passwordRef.current?.value || "";
    const newErrors = {};
    if (!cpf.trim()) newErrors.cpf = "Preencha seu CPF";
    else if (!validateCpf(cpf)) newErrors.cpf = "CPF inválido";
    if (!pwd.trim()) newErrors.password = "Preencha sua senha";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Continue create account
   */
  const handleContinueCreate = () => {
    if (validateCreate()) {
      setLoginStep(1);
    }
  };

  /**
   * Continue WhatsApp login
   */
  const handleContinueWhatsApp = () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setErrors({ phone: "Digite um WhatsApp válido" });
      return;
    }
    const rl = checkRateLimit("login", phone.replace(/\D/g, ""));
    if (!rl.allowed) {
      setErrors({ phone: `Muitas tentativas. Tente novamente em ${formatRetryTime(rl.retryAfterMs)}.` });
      return;
    }
    setErrors({});
    setLoginStep(1);
  };

  /**
   * Continue email login
   */
  const handleContinueEmail = () => {
    const rl = checkRateLimit("password", email);
    if (!rl.allowed) {
      setErrors({ general: `Muitas tentativas. Tente novamente em ${formatRetryTime(rl.retryAfterMs)}.` });
      return;
    }
    if (validateEmailLogin()) {
      resetRateLimit("password", email);
      login(email, { nome: email.split("@")[0], sobrenome: "", cpf: "" });
      if (passwordRef.current) passwordRef.current.value = "";
    }
  };

  /**
   * Continue CPF login
   */
  const handleContinueCpf = () => {
    const identifier = cpf.replace(/\D/g, "");
    const rl = checkRateLimit("password", identifier);
    if (!rl.allowed) {
      setErrors({ general: `Muitas tentativas. Tente novamente em ${formatRetryTime(rl.retryAfterMs)}.` });
      return;
    }
    if (validateCpfLogin()) {
      resetRateLimit("password", identifier);
      login(identifier, { nome: "", sobrenome: "", cpf: "" });
      if (passwordRef.current) passwordRef.current.value = "";
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOtp = () => {
    if (otp.every((digit) => digit !== "")) {
      const rl = checkRateLimit("otp", phone.replace(/\D/g, ""));
      if (!rl.allowed) {
        setErrors({ otp: `Muitas tentativas. Tente novamente em ${formatRetryTime(rl.retryAfterMs)}.` });
        return;
      }
      if (authAction === "create") {
        login(phone, { nome, sobrenome, cpf });
      } else {
        login(phone, { nome: "", sobrenome: "", cpf: "" });
      }
      resetRateLimit("otp", phone.replace(/\D/g, ""));
    }
  };

  // labelStyle e errorStyle importados de constants/styles.js
  const labelStyle = LABEL_STYLE;
  const errorStyle = ERROR_STYLE;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--navy)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Back to Home - Always visible */}
        <button 
          onClick={() => navigate("landing")} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "var(--text-muted)", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: 6, 
            fontSize: 14,
            marginBottom: 24 
          }}
        >
          <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar ao início
        </button>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div 
            className="font-display" 
            style={{ fontSize: 32, fontWeight: 900, cursor: "pointer" }} 
            onClick={() => navigate("landing")}
          >
            <span style={{ color: "var(--coral)" }}>Kriou</span> Docs
          </div>
        </div>

        {/* STEP 0: Initial - Choose Action */}
        {loginStep === 0 && !authAction && (
          <div className="animate-fadeIn">
            <h1 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", marginBottom: 8 }}>
              O que você quer fazer?
            </h1>
            <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: 32, fontSize: 15 }}>
              Escolha uma opção para continuar
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => setAuthAction("login")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="LogIn" className="w-6 h-6" style={{ color: "white" }} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>Entrar</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Já tenho conta</div>
                  </div>
                </div>
                <Icon name="ChevronRight" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              </button>

              <button
                onClick={() => setAuthAction("create")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  background: "var(--coral)",
                  border: "none",
                  borderRadius: 16,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="UserPlus" className="w-6 h-6" style={{ color: "var(--coral)" }} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Criar Conta</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Sou novo aqui</div>
                  </div>
                </div>
                <Icon name="ChevronRight" className="w-5 h-5" style={{ color: "white" }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 0: Login - Choose Method */}
        {loginStep === 0 && authAction === "login" && !loginMethod && (
          <div className="animate-fadeIn">
            <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Como você quer entrar?
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 15 }}>
              Escolha a melhor forma para você
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => setLoginMethod("whatsapp")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="MessageCircle" className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>WhatsApp</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Receber código por mensagem</div>
                </div>
              </button>

              <button
                onClick={() => setLoginMethod("email")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--coral)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="Mail" className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>E-mail e Senha</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Entrar com credenciais</div>
                </div>
              </button>

              <button
                onClick={() => setLoginMethod("cpf")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#6C5CE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="CreditCard" className="w-5 h-5" style={{ color: "white" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>CPF e Senha</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Entrar com CPF</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 0: Create Account - Form */}
        {loginStep === 0 && authAction === "create" && (
          <div className="animate-fadeIn">
            <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Criar conta
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>
              Preencha seus dados para começar
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Nome</label>
                <input
                  className="input-field"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                {errors.nome && <div style={errorStyle}>{errors.nome}</div>}
              </div>
              <div>
                <label style={labelStyle}>Sobrenome</label>
                <input
                  className="input-field"
                  placeholder="Sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                />
                {errors.sobrenome && <div style={errorStyle}>{errors.sobrenome}</div>}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>CPF</label>
              <input
                className="input-field"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
              />
              {errors.cpf && <div style={errorStyle}>{errors.cpf}</div>}
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>WhatsApp</label>
              <input
                className="input-field"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </div>

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
              Enviaremos um código de verificação via WhatsApp
            </p>

            <Button variant="primary" style={{ width: "100%", marginTop: 20, padding: "16px" }} onClick={handleContinueCreate}>
              Continuar
            </Button>
          </div>
        )}

        {/* STEP 0: Login - WhatsApp */}
        {loginStep === 0 && authAction === "login" && loginMethod === "whatsapp" && (
          <div className="animate-fadeIn">
            <button onClick={() => setLoginMethod(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Entrar com WhatsApp
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>
              Digite seu número para receber o código
            </p>

            <div>
              <label style={labelStyle}>Seu WhatsApp</label>
              <input
                className="input-field"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
            </div>

            <Button variant="primary" style={{ width: "100%", marginTop: 20, padding: "16px" }} onClick={handleContinueWhatsApp} icon="MessageCircle" iconPosition="right">
              Receber Código
            </Button>
          </div>
        )}

        {/* STEP 0: Login - Email */}
        {loginStep === 0 && authAction === "login" && loginMethod === "email" && (
          <div className="animate-fadeIn">
            <button onClick={() => setLoginMethod(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Entrar com E-mail
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>
              Digite seus dados para acessar
            </p>

            <div>
              <label style={labelStyle}>E-mail</label>
              <input
                className="input-field"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={passwordRef}
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-5 h-5" />
                </button>
              </div>
              {errors.password && <div style={errorStyle}>{errors.password}</div>}
            </div>

            <button style={{ background: "none", border: "none", color: "var(--coral)", fontSize: 13, cursor: "pointer", marginTop: 12 }}>
              Esqueci minha senha
            </button>

            <Button variant="primary" style={{ width: "100%", marginTop: 20, padding: "16px" }} onClick={handleContinueEmail}>
              Entrar
            </Button>
          </div>
        )}

        {/* STEP 0: Login - CPF */}
        {loginStep === 0 && authAction === "login" && loginMethod === "cpf" && (
          <div className="animate-fadeIn">
            <button onClick={() => setLoginMethod(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Entrar com CPF
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>
              Digite seus dados para acessar
            </p>

            <div>
              <label style={labelStyle}>CPF</label>
              <input
                className="input-field"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
              />
              {errors.cpf && <div style={errorStyle}>{errors.cpf}</div>}
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={passwordRef}
                  className="input-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-5 h-5" />
                </button>
              </div>
              {errors.password && <div style={errorStyle}>{errors.password}</div>}
            </div>

            <button style={{ background: "none", border: "none", color: "var(--coral)", fontSize: 13, cursor: "pointer", marginTop: 12 }}>
              Esqueci minha senha
            </button>

            <Button variant="primary" style={{ width: "100%", marginTop: 20, padding: "16px" }} onClick={handleContinueCpf}>
              Entrar
            </Button>
          </div>
        )}

        {/* STEP 1: OTP Input */}
        {loginStep === 1 && (
          <div className="animate-fadeIn">
            <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 24, fontSize: 14 }}>
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              Digite o código
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 15 }}>
              Enviamos para <span style={{ color: "var(--coral)", fontWeight: 600 }}>{phone}</span>
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  className="input-field"
                  maxLength={1}
                  style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, padding: 0 }}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <Button variant="primary" style={{ width: "100%", padding: "16px" }} onClick={handleVerifyOtp}>
              Verificar
            </Button>

            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
              Reenviar código em <span style={{ color: "var(--coral)", fontWeight: 600 }}>0:59</span>
            </p>
          </div>
        )}

        {/* STEP 2: Success */}
        {loginStep === 2 && (
          <div className="animate-scaleIn" style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,200,151,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Icon name="Check" className="w-8 h-8" style={{ color: "var(--success)" }} />
            </div>
            <h2 style={{ fontWeight: 800, marginBottom: 8, fontSize: 22 }}>Bem-vindo!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Redirecionando...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;