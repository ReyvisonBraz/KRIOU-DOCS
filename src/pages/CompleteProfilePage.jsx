/**
 * ============================================
 * KRIOU DOCS - Complete Profile Page
 * ============================================
 * Exibida após o primeiro login com Google.
 * Coleta nome, sobrenome e CPF obrigatoriamente
 * para registro interno antes de acessar o app.
 */

import React, { useState, useEffect } from "react";
import { DocumentService } from "../services/DocumentService";
import { Icon } from "../components/Icons";
import showToast from "../utils/toast";
import { validateCpf } from "../utils/validation";
import { formatCpf } from "../utils/formatting";
import { useAuth } from "../context/AuthContext";

const labelClass = "block text-[12px] font-bold text-text-muted mb-1.5 uppercase tracking-wide ml-1";
const inputClass = "w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-[15px] outline-none text-white placeholder-text-muted/60 transition-all focus:border-coral focus:ring-2 focus:ring-coral/20";
const inputErrorClass = "border-coral ring-2 ring-coral/20";

const CompleteProfilePage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [nome, setNome]           = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [cpf, setCpf]             = useState("");
  const [errors, setErrors]       = useState({});
  const [isSaving, setIsSaving]   = useState(false);

  // Auto-preencher sobrenome com dados do Google se disponível
  useEffect(() => {
    if (user) {
      const rawMeta = user.raw_user_meta_data || {};
      const meta = user.user_metadata || rawMeta;
      const fullName = meta?.full_name || meta?.name || "";
      if (fullName) {
        const parts = fullName.split(" ");
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
    if (!cpf.trim())       errs.cpf       = "CPF é obrigatório";
    else if (!validateCpf(cpf.replace(/\D/g, ""))) errs.cpf = "CPF inválido";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      // Preparar googleData com dados do Google
      const rawMeta = user?.raw_user_meta_data || {};
      const meta = user?.user_metadata || rawMeta;
      const googleData = {
        email: user?.email || meta?.email || null,
        avatar_url: meta?.avatar_url || null,
        google_id: rawMeta?.sub || null,
      };

      await DocumentService.updateProfile({
        nome:      nome.trim(),
        sobrenome: sobrenome.trim(),
        cpf:       cpf.replace(/\D/g, ""),
        googleData,
      });
      showToast.success("Cadastro concluído! Bem-vindo ao Kriou Docs.");
      onNavigate("welcome");
    } catch (err) {
      console.error("[CompleteProfile] Erro ao salvar perfil:", err);
      showToast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-coral/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[480px] bg-surface border border-border rounded-3xl p-8 relative z-10 shadow-2xl animate-fadeUp">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-2xl font-black mb-6">
            <span className="text-coral">Kriou</span><span className="text-white ml-0.5">Docs</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="User" className="w-7 h-7 text-coral" />
          </div>
          <h1 className="text-2xl font-black text-white font-display mb-2">
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
            <label className={labelClass}>Nome *</label>
            <input
              type="text"
              placeholder="Seu primeiro nome"
              value={nome}
              onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: "" })); }}
              className={`${inputClass} ${errors.nome ? inputErrorClass : ""}`}
              autoFocus
            />
            {errors.nome && <p className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.nome}</p>}
          </div>

          {/* Sobrenome */}
          <div>
            <label className={labelClass}>Sobrenome *</label>
            <input
              type="text"
              placeholder="Seu sobrenome"
              value={sobrenome}
              onChange={(e) => { setSobrenome(e.target.value); setErrors((p) => ({ ...p, sobrenome: "" })); }}
              className={`${inputClass} ${errors.sobrenome ? inputErrorClass : ""}`}
            />
            {errors.sobrenome && <p className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.sobrenome}</p>}
          </div>

          {/* CPF */}
          <div>
            <label className={labelClass}>CPF *</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              maxLength={14}
              onChange={(e) => { setCpf(formatCpf(e.target.value)); setErrors((p) => ({ ...p, cpf: "" })); }}
              className={`${inputClass} ${errors.cpf ? inputErrorClass : ""}`}
            />
            {errors.cpf && <p className="text-coral text-xs mt-1.5 ml-1 font-semibold">{errors.cpf}</p>}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue/10 border border-blue/20 rounded-xl">
            <Icon name="Shield" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-text-muted leading-relaxed">
              Seus dados são armazenados com segurança e usados apenas para identificação interna. Não aparecem nos documentos gerados.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 bg-coral hover:bg-coral-light text-white font-bold text-[16px] rounded-2xl transition-all shadow-lg shadow-coral/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
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
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
