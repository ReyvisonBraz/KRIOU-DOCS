/**
 * ============================================
 * KRIOU DOCS - Auth Context
 * ============================================
 * Gerencia autenticação: sessão, userId, login, logout.
 * Não armazena CPF, telefone nem dados PII em texto puro.
 *
 * @module context/AuthContext
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import StorageService from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children, onNavigate }) => {
  const [loginStep, setLoginStep] = useState(0);
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [userData, setUserData]   = useState({ nome: "", sobrenome: "", cpf: "" });
  const [userId, setUserId]       = useState(null);

  const login = useCallback((phoneNumber, userDataInput) => {
    const newUserId = phoneNumber.replace(/\D/g, "");

    setUserId(newUserId);
    setPhone(phoneNumber);
    setUserData(userDataInput || { nome: "", sobrenome: "", cpf: "" });
    setLoginStep(2);

    if (StorageService.isAvailable()) {
      StorageService.migrateLegacyData(newUserId);
      StorageService.saveSession({
        isAuthenticated: true,
        userId: newUserId,
        displayName: userDataInput?.nome || "",
        loginTime: new Date().toISOString(),
      });
    }

    setTimeout(() => onNavigate?.("dashboard"), 1500);
  }, [onNavigate]);

  const logout = useCallback((currentUserId) => {
    setLoginStep(0);
    setOtp(["", "", "", "", "", ""]);
    setPhone("");
    setUserData({ nome: "", sobrenome: "", cpf: "" });
    StorageService.clearSession(currentUserId ?? userId);
    onNavigate?.("landing");
  }, [onNavigate, userId]);

  const value = {
    loginStep, setLoginStep,
    phone, setPhone,
    otp, setOtp,
    userData, setUserData,
    userId, setUserId,
    login, logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
