/**
 * ============================================
 * KRIOU DOCS - Login Page Component
 * ============================================
 * Phone authentication with OTP verification
 * flow for user login.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button } from "../components/UI";

/**
 * LoginPage - Authentication with WhatsApp OTP
 */
const LoginPage = () => {
  const { navigate, loginStep, setLoginStep, phone, setPhone, otp, setOtp, setLoginStep: setLoginStepCtx } = useApp();

  /**
   * Format phone number as user types
   * @param {string} value - Raw input value
   * @returns {string} Formatted phone number
   */
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  /**
   * Handle OTP input change with auto-advance
   * @param {number} index - Input index
   * @param {string} value - Input value
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
   * Handle OTP submission
   */
  const handleSendOtp = () => {
    if (phone.length >= 14) {
      setLoginStep(1);
    }
  };

  /**
   * Handle OTP verification
   */
  const handleVerifyOtp = () => {
    if (otp.every((digit) => digit !== "")) {
      setLoginStep(2);
      setTimeout(() => navigate("dashboard"), 1500);
    }
  };

  /**
   * Get step title based on current login step
   */
  const getStepTitle = () => {
    switch (loginStep) {
      case 0:
        return "Entre com seu WhatsApp";
      case 1:
        return "Digite o código recebido";
      case 2:
        return "Verificado com sucesso!";
      default:
        return "";
    }
  };

  /**
   * Get step subtitle based on current login step
   */
  const getStepSubtitle = () => {
    switch (loginStep) {
      case 0:
        return "Você receberá um código de 6 dígitos no seu WhatsApp para confirmar o acesso.";
      case 1:
        return `Código enviado para ${phone}`;
      case 2:
        return "Redirecionando...";
      default:
        return "";
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: `radial-gradient(ellipse at top, rgba(233,69,96,0.06) 0%, var(--navy) 60%)` }}>
      <div className="animate-scaleIn" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="font-display" style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, cursor: "pointer" }} onClick={() => navigate("landing")}>
            <span style={{ color: "var(--coral)" }}>Kriou</span> Docs
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>{getStepTitle()}</p>
        </div>

        {/* Form Card */}
        <Card style={{ padding: 32 }}>
          {/* Step 0: Phone Input */}
          {loginStep === 0 && (
            <div className="animate-fadeIn">
              <label className="label">Número do WhatsApp</label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <Icon name="Phone" className="w-5 h-5" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                />
              </div>
              <Button variant="primary" style={{ width: "100%" }} onClick={handleSendOtp} icon="MessageCircle" iconPosition="right">
                Enviar Código
              </Button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
                {getStepSubtitle()}
              </p>
            </div>
          )}

          {/* Step 1: OTP Input */}
          {loginStep === 1 && (
            <div className="animate-fadeIn">
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20, textAlign: "center" }}>
                {getStepSubtitle()}
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
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
              <Button variant="primary" style={{ width: "100%" }} onClick={handleVerifyOtp}>
                Verificar
              </Button>
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
                Reenviar código em <span style={{ color: "var(--coral)", fontWeight: 600 }}>0:59</span>
              </p>
            </div>
          )}

          {/* Step 2: Success */}
          {loginStep === 2 && (
            <div className="animate-scaleIn" style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,200,151,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Icon name="Check" className="w-8 h-8" style={{ color: "var(--success)" }} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Bem-vindo!</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{getStepSubtitle()}</p>
            </div>
          )}
        </Card>

        {/* Back Button */}
        <button onClick={() => navigate("landing")} style={{ display: "block", margin: "24px auto 0", background: "none", border: "none", color: "var(--text-muted)", fontSize: 14, cursor: "pointer" }}>
          <Icon name="ChevronLeft" className="w-4 h-4" style={{ display: "inline", marginRight: 4 }} /> Voltar ao início
        </button>
      </div>
    </div>
  );
};

export default LoginPage;