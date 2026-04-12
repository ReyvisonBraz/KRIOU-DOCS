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
import { Button } from "../components/UI";
import { formatCpf, formatPhone } from "../utils/formatting";
import { validateCpf } from "../utils/validation";
import { LABEL_STYLE, ERROR_STYLE } from "../constants/styles";
import { checkRateLimit, resetRateLimit, formatRetryTime } from "../utils/rateLimiter";

const LoginPage = () => {
  const { navigate, loginStep, setLoginStep, phone, setPhone, otp, setOtp, login } = useApp();

  const [authAction, setAuthAction] = useState(null); // "login" | "create"
  const [loginMethod, setLoginMethod] = useState(null); // "whatsapp" | "email" | "cpf"
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const passwordRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const validateCreate = () => {
    const newErrors = {};
    if (!nome.trim()) newErrors.nome = "Preencha seu nome";
    if (!sobrenome.trim()) newErrors.sobrenome = "Preencha seu sobrenome";
    if (!cpf.trim()) newErrors.cpf = "Preencha seu CPF";
    else if (!validateCpf(cpf)) newErrors.cpf = "CPF inválido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const validateCpfLogin = () => {
    const pwd = passwordRef.current?.value || "";
    const newErrors = {};
    if (!cpf.trim()) newErrors.cpf = "Preencha seu CPF";
    else if (!validateCpf(cpf)) newErrors.cpf = "CPF inválido";
    if (!pwd.trim()) newErrors.password = "Preencha sua senha";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueCreate = () => {
    if (validateCreate()) {
      setLoginStep(1);
    }
  };

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

  // Convert legacy objects to Tailwind classes where feasible, mapping to globals
  const errorJSX = (msg) => <div className="text-coral font-semibold text-xs mt-1.5 ml-1">{msg}</div>;
  const labelClass = "block text-text-muted text-xs font-bold uppercase tracking-wide mb-1.5 ml-1";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-navy relative overflow-hidden">
      {/* Elementos de fundo dinâmicos */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-coral/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] glass-card p-6 md:p-8 relative z-10 mx-auto">
        
        {/* Back to Home - Always visible in Card Header */}
        <button 
          onClick={() => navigate("landing")} 
          className="group flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-8"
        >
          <Icon name="ChevronLeft" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Voltar ao início
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="font-display text-3xl font-black cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate("landing")}
          >
            <span className="text-coral">Kriou</span><span className="text-white ml-0.5">Docs</span>
          </div>
        </div>

        {/* STEP 0: Initial - Choose Action */}
        {loginStep === 0 && !authAction && (
          <div className="animate-fadeIn">
            <h1 className="text-2xl font-black text-center mb-2 font-display text-white tracking-tight">
              O que você quer fazer?
            </h1>
            <p className="text-text-muted text-center mb-8 text-[15px]">
              Escolha uma opção para continuar
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setAuthAction("login")}
                className="group flex items-center justify-between p-5 bg-surface-2 border border-border rounded-2xl cursor-pointer transition-all duration-300 hover:border-coral hover:bg-surface-3 hover:shadow-lg hover:shadow-coral/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-coral/10 text-coral flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name="LogIn" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[16px] text-white">Entrar</div>
                    <div className="text-[13px] text-text-muted">Já tenho conta</div>
                  </div>
                </div>
                <Icon name="ChevronRight" className="w-5 h-5 text-text-muted group-hover:text-coral transition-colors" />
              </button>

              <button
                onClick={() => setAuthAction("create")}
                className="group flex items-center justify-between p-5 bg-gradient-to-r from-coral to-coral-light border border-transparent rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-coral/30 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-white/20 text-white flex items-center justify-center shrink-0">
                    <Icon name="UserPlus" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-[16px] text-white">Criar Conta</div>
                    <div className="text-[13px] text-white/80">Sou novo aqui</div>
                  </div>
                </div>
                <Icon name="ChevronRight" className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 0: Login - Choose Method */}
        {loginStep === 0 && authAction === "login" && !loginMethod && (
          <div className="animate-slideLeft">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">
              Como você quer entrar?
            </h1>
            <p className="text-text-muted mb-8 text-[15px]">
              Escolha a melhor forma para você
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setLoginMethod("whatsapp")}
                className="group flex items-center gap-4 p-[18px] bg-surface-2 border border-border rounded-[14px] cursor-pointer w-full text-left transition-all hover:bg-surface-3 hover:border-[#25D366]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0 shadow-lg shadow-[#25D366]/20">
                  <Icon name="MessageCircle" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-white group-hover:text-[#25D366] transition-colors">WhatsApp</div>
                  <div className="text-[13px] text-text-muted">Receber código por mensagem</div>
                </div>
              </button>

              <button
                onClick={() => setLoginMethod("email")}
                className="group flex items-center gap-4 p-[18px] bg-surface-2 border border-border rounded-[14px] cursor-pointer w-full text-left transition-all hover:bg-surface-3 hover:border-coral"
              >
                <div className="w-11 h-11 rounded-xl bg-coral flex items-center justify-center shrink-0 shadow-lg shadow-coral/20">
                  <Icon name="Mail" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-white group-hover:text-coral transition-colors">E-mail e Senha</div>
                  <div className="text-[13px] text-text-muted">Entrar com credenciais</div>
                </div>
              </button>

              <button
                onClick={() => setLoginMethod("cpf")}
                className="group flex items-center gap-4 p-[18px] bg-surface-2 border border-border rounded-[14px] cursor-pointer w-full text-left transition-all hover:bg-surface-3 hover:border-[#6C5CE7]"
              >
                <div className="w-11 h-11 rounded-xl bg-[#6C5CE7] flex items-center justify-center shrink-0 shadow-lg shadow-[#6C5CE7]/20">
                  <Icon name="CreditCard" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-white group-hover:text-[#6C5CE7] transition-colors">CPF e Senha</div>
                  <div className="text-[13px] text-text-muted">Entrar com CPF</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 0: Create Account - Form */}
        {loginStep === 0 && authAction === "create" && (
          <div className="animate-slideLeft">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">Criar conta</h1>
            <p className="text-text-muted mb-6 text-[15px]">Preencha seus dados para começar</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>Nome</label>
                <input
                  className="input-field"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                {errors.nome && errorJSX(errors.nome)}
              </div>
              <div>
                <label className={labelClass}>Sobrenome</label>
                <input
                  className="input-field"
                  placeholder="Seu sobrenome"
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                />
                {errors.sobrenome && errorJSX(errors.sobrenome)}
              </div>
            </div>

            <div className="mb-3">
              <label className={labelClass}>CPF</label>
              <input
                className="input-field"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
              />
              {errors.cpf && errorJSX(errors.cpf)}
            </div>

            <div className="mb-4">
              <label className={labelClass}>WhatsApp</label>
              <input
                className="input-field"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
              {errors.phone && errorJSX(errors.phone)}
            </div>

            <p className="text-xs text-text-muted/80 text-center font-medium bg-surface-2 p-3 rounded-xl border border-border/50">
              Enviaremos um código seguro via WhatsApp.
            </p>

            <Button variant="primary" className="w-full mt-6 py-4" onClick={handleContinueCreate}>
              Continuar
            </Button>
          </div>
        )}

        {/* STEP 0: Login - WhatsApp */}
        {loginStep === 0 && authAction === "login" && loginMethod === "whatsapp" && (
          <div className="animate-slideLeft">
            <button onClick={() => setLoginMethod(null)} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="MessageCircle" className="w-7 h-7 text-[#25D366]" />
            </div>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">Entrar com WhatsApp</h1>
            <p className="text-text-muted mb-6 text-[15px]">Digite seu número para receber o código</p>

            <div className="mb-6">
              <label className={labelClass}>Seu WhatsApp</label>
              <input
                className="input-field"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
              {errors.phone && errorJSX(errors.phone)}
            </div>

            <Button variant="primary" className="w-full py-4 text-center justify-center border-none !bg-gradient-to-r !from-[#25D366] !to-[#128C7E] shadow-xl shadow-[#25D366]/20 hover:shadow-[#25D366]/40" onClick={handleContinueWhatsApp}>
               <span className="flex items-center gap-2">Receber Código <Icon name="ChevronRight" className="w-4 h-4" /></span>
            </Button>
          </div>
        )}

        {/* STEP 0: Login - Email */}
        {loginStep === 0 && authAction === "login" && loginMethod === "email" && (
          <div className="animate-slideLeft">
            <button onClick={() => setLoginMethod(null)} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">Entrar com E-mail</h1>
            <p className="text-text-muted mb-6 text-[15px]">Digite suas credenciais</p>

            <div className="mb-4">
              <label className={labelClass}>E-mail</label>
              <input
                className="input-field"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && errorJSX(errors.email)}
            </div>

            <div className="mb-2 relative">
              <label className={labelClass}>Senha</label>
              <input
                ref={passwordRef}
                className="input-field pr-12"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-text-muted hover:text-white transition-colors focus:outline-none"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-5 h-5" />
              </button>
              {errors.password && errorJSX(errors.password)}
            </div>

            <div className="flex justify-end mb-6">
              <button className="text-[13px] text-coral hover:text-coral-light transition-colors font-medium cursor-pointer bg-transparent border-none">
                Esqueci minha senha
              </button>
            </div>

            <Button variant="primary" className="w-full py-4 text-center justify-center font-bold text-lg" onClick={handleContinueEmail}>
              Acessar
            </Button>
          </div>
        )}

        {/* STEP 0: Login - CPF */}
        {loginStep === 0 && authAction === "login" && loginMethod === "cpf" && (
          <div className="animate-slideLeft">
            <button onClick={() => setLoginMethod(null)} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">Entrar com CPF</h1>
            <p className="text-text-muted mb-6 text-[15px]">Acesse com seu documento</p>

            <div className="mb-4">
              <label className={labelClass}>CPF</label>
              <input
                className="input-field"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
              />
              {errors.cpf && errorJSX(errors.cpf)}
            </div>

            <div className="mb-2 relative">
              <label className={labelClass}>Senha</label>
              <input
                ref={passwordRef}
                className="input-field pr-12"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-text-muted hover:text-white transition-colors focus:outline-none"
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-5 h-5" />
              </button>
              {errors.password && errorJSX(errors.password)}
            </div>

            <div className="flex justify-end mb-6">
              <button className="text-[13px] text-coral hover:text-coral-light transition-colors font-medium cursor-pointer bg-transparent border-none">
                Esqueci minha senha
              </button>
            </div>

            <Button variant="primary" className="w-full py-4 text-center justify-center font-bold text-lg bg-gradient-to-r from-[#6C5CE7] to-[#8C7BFF] hover:shadow-[#6C5CE7]/40 shadow-xl border-none" onClick={handleContinueCpf}>
              Acessar
            </Button>
          </div>
        )}

        {/* STEP 1: OTP Input */}
        {loginStep === 1 && (
          <div className="animate-slideLeft">
            <button onClick={handleBack} className="flex items-center gap-1.5 text-text-muted hover:text-white transition-colors text-sm font-medium mb-6">
              <Icon name="ChevronLeft" className="w-4 h-4" /> Voltar
            </button>

            <h1 className="text-2xl font-black mb-2 font-display text-white tracking-tight">Confirme o código</h1>
            <p className="text-text-muted mb-8 text-[15px] leading-relaxed">
              Enviamos um código de 6 dígitos para o número <br/>
              <span className="text-coral font-bold ml-1">{phone}</span>
            </p>

            <div className="flex gap-2.5 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  className="w-12 h-14 bg-surface-2 border border-border rounded-xl text-center text-2xl font-black text-white focus:border-coral focus:ring-4 focus:ring-coral/20 outline-none transition-all shadow-inner"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                />
              ))}
            </div>

            <Button variant="primary" className="w-full py-4 justify-center text-lg font-bold" onClick={handleVerifyOtp}>
              Verificar
            </Button>

            <p className="text-[13px] text-text-muted text-center mt-6">
              Não recebeu? Reenviar código em <span className="text-coral font-bold ml-1">0:59</span>
            </p>
          </div>
        )}

        {/* STEP 2: Success */}
        {loginStep === 2 && (
          <div className="animate-scaleIn text-center py-10">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,200,151,0.2)]">
              <Icon name="Check" className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 font-display">Tudo certo!</h2>
            <p className="text-text-muted text-[15px]">Redirecionando para o seu dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;