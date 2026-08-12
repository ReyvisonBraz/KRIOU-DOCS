/**
 * ============================================
 * KRIOU DOCS - Complete Profile Page
 * ============================================
 * Exibida após o primeiro login com Google.
 * Coleta nome e sobrenome (obrigatórios) e
 * CPF (opcional) para registro interno.
 */

import React, { useState, useEffect, useRef } from "react";
import { DocumentService } from "../services/DocumentService";
import { Icon } from "../components/Icons";
import showToast from "../utils/toast";
import { validateCpf } from "../utils/validation";
import { formatCpf } from "../utils/formatting";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const labelClass = "block text-[12px] font-bold text-text-muted mb-1.5 uppercase tracking-wide ml-1";
const inputClass = "w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-[15px] outline-none text-text placeholder-text-muted/60 transition-all focus:border-coral focus:ring-2 focus:ring-coral/20";
const inputErrorClass = "border-coral ring-2 ring-coral/20";

const CompleteProfilePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { logout, setProfile } = useApp();
  const [nome, setNome]           = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf]             = useState("");
  const [errors, setErrors]       = useState({});
  const [isSaving, setIsSaving]   = useState(false);
  const saveInFlightRef           = useRef(false);
  const mountedRef                = useRef(false);
  const operationRef              = useRef(0);
  const userIdRef                 = useRef(user?.id || null);

  userIdRef.current = user?.id || null;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
    };
  }, []);

  // Auto-preencher sobrenome com dados do Google se disponível
  useEffect(() => {
    if (user) {
      const rawMeta = user.raw_user_meta_data || {};
      const meta = { ...rawMeta, ...(user.user_metadata || {}) };
      const fullName = meta?.full_name || meta?.name || "";
      if (fullName) {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length > 1) {
          setNome(parts[0]);
          setSobrenome(parts.slice(1).join(" "));
        } else {
          setNome(fullName);
        }
      }
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!nome.trim())      errs.nome      = "Nome é obrigatório";
    if (!sobrenome.trim()) errs.sobrenome = "Sobrenome é obrigatório";
    if (cpf.trim() && !validateCpf(cpf.replace(/\D/g, ""))) errs.cpf = "CPF inválido";
    return errs;
  };

  const buildGoogleData = () => {
    const rawMeta = user?.raw_user_meta_data || {};
    const meta = { ...rawMeta, ...(user?.user_metadata || {}) };

    return {
      email: user?.email || meta.email || null,
      avatar_url: meta.avatar_url || null,
      google_id: meta.sub || null,
    };
  };

  const beginSave = () => {
    if (saveInFlightRef.current) return null;
    saveInFlightRef.current = true;
    operationRef.current += 1;
    setIsSaving(true);
    return {
      id: operationRef.current,
      userId: userIdRef.current,
    };
  };

  const finishSave = (completed) => {
    setIsSaving(false);
    if (!completed) saveInFlightRef.current = false;
  };

  const isCurrentOperation = (operation) => (
    mountedRef.current
    && operationRef.current === operation.id
    && userIdRef.current === operation.userId
  );

  const handleLogout = async () => {
    operationRef.current += 1;
    saveInFlightRef.current = true;
    if (mountedRef.current) setIsSaving(false);
    await logout();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const operation = beginSave();
    if (operation === null) return;

    let completed = false;
    try {
      const updatedProfile = await DocumentService.updateProfile({
        nome:      nome.trim(),
        sobrenome: sobrenome.trim(),
        cpf:       cpf.replace(/\D/g, "") || null,
        googleData: buildGoogleData(),
      });
      if (!isCurrentOperation(operation)) return;
      if (setProfile(updatedProfile) === false) return;
      showToast.success("Cadastro concluído! Bem-vindo ao Kriou Docs.");
      onNavigate("welcome", { replace: true });
      completed = true;
    } catch (err) {
      if (!isCurrentOperation(operation)) return;
      console.error("[CompleteProfile] Erro ao salvar perfil:", err);
      showToast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      if (isCurrentOperation(operation)) finishSave(completed);
    }
  };

  const handleSkip = async () => {
    const operation = beginSave();
    if (operation === null) return;

    const normalizedCpf = cpf.replace(/\D/g, "");
    const safeCpf = normalizedCpf && validateCpf(normalizedCpf) ? normalizedCpf : null;
    let completed = false;
    try {
      try {
        const updatedProfile = await DocumentService.updateProfile({
          nome:      nome.trim() || "Usuário",
          sobrenome: sobrenome.trim() || "Kriou",
          cpf:       safeCpf,
          googleData: buildGoogleData(),
        });
        if (!isCurrentOperation(operation)) return;
        if (setProfile(updatedProfile) === false) return;
      } catch (err) {
        if (!isCurrentOperation(operation)) return;
        console.warn("[CompleteProfile] Falha ao salvar perfil opcional:", err?.message || err);
      }
      if (!isCurrentOperation(operation)) return;
      onNavigate("dashboard", { replace: true });
      completed = true;
    } finally {
      if (isCurrentOperation(operation)) finishSave(completed);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-coral/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sair button */}
      <button
        onClick={handleLogout}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 text-text-muted text-sm font-semibold hover:text-coral transition-colors bg-transparent border-none cursor-pointer"
      >
        <Icon name="LogOut" className="w-4 h-4" /> Sair
      </button>

      <div className="w-full max-w-[480px] bg-surface border border-border rounded-3xl p-8 relative z-10 shadow-2xl animate-fadeUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-2xl font-black mb-6">
            <span className="text-coral">Kriou</span><span className="text-text ml-0.5">Docs</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="User" className="w-7 h-7 text-coral" />
          </div>
          <h1 className="text-2xl font-black text-text font-display mb-2">
            Complete seu cadastro
          </h1>
          <p className="text-text-muted text-[14px] leading-relaxed">
            Precisamos de algumas informações antes de você começar.
            <br />
            Isso é feito apenas uma vez.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nome */}
          <div>
            <label htmlFor="complete-profile-nome" className={labelClass}>Nome *</label>
            <input
              id="complete-profile-nome"
              type="text"
              placeholder="Seu primeiro nome"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: "" })); }}
              className={`${inputClass} ${errors.nome ? inputErrorClass : ""}`}
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? "complete-profile-nome-error" : undefined}
              autoFocus
            />
            {errors.nome && <p id="complete-profile-nome-error" role="alert" className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.nome}</p>}
          </div>

          {/* Sobrenome */}
          <div>
            <label htmlFor="complete-profile-sobrenome" className={labelClass}>Sobrenome *</label>
            <input
              id="complete-profile-sobrenome"
              type="text"
              placeholder="Seu sobrenome"
              value={sobrenome}
              onChange={(e) => { setSobrenome(e.target.value); setErrors((p) => ({ ...p, sobrenome: "" })); }}
              className={`${inputClass} ${errors.sobrenome ? inputErrorClass : ""}`}
              aria-invalid={Boolean(errors.sobrenome)}
              aria-describedby={errors.sobrenome ? "complete-profile-sobrenome-error" : undefined}
            />
            {errors.sobrenome && <p id="complete-profile-sobrenome-error" role="alert" className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.sobrenome}</p>}
          </div>

          {/* CPF */}
          <div>
            <label htmlFor="complete-profile-cpf" className={labelClass}>CPF <span className="text-text-faint font-normal normal-case tracking-normal">(opcional)</span></label>
            <input
              id="complete-profile-cpf"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              maxLength={14}
              onChange={(e) => { setCpf(formatCpf(e.target.value)); setErrors((p) => ({ ...p, cpf: "" })); }}
              className={`${inputClass} ${errors.cpf ? inputErrorClass : ""}`}
              aria-invalid={Boolean(errors.cpf)}
              aria-describedby={errors.cpf ? "complete-profile-cpf-error" : undefined}
            />
            {errors.cpf && <p id="complete-profile-cpf-error" role="alert" className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.cpf}</p>}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue/10 border border-blue/20 rounded-xl">
            <Icon name="Shield" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-text-muted leading-relaxed">
              Dados usados apenas para identificação interna. Não aparecem nos documentos. Você pode completar o CPF depois no seu perfil.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-coral hover:bg-coral-hover text-white font-bold text-[16px] rounded-2xl transition-all shadow-lg shadow-coral/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Icon name="Check" className="w-5 h-5" />
                Concluir cadastro
              </>
            )}
          </button>

          {/* Pular */}
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSaving}
            className="w-full py-3 bg-transparent hover:bg-surface-2 text-text-muted hover:text-text font-semibold text-[14px] rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center gap-2"
          >
            Pular, vou preencher depois
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
