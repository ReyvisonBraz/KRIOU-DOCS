/**
 * ============================================
 * KRIOU DOCS - Profile Page Component
 * ============================================
 * Design: Luxury Refined + Bold Editorial
 * Colors: Navy (#090914), Coral (#F43F5E), Gold (#D4AF37), Teal (#14B8A6)
 * Typography: Outfit (display), Plus Jakarta Sans (body)
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import { DocumentService } from "../services/DocumentService";
import StorageService from "../utils/storage";
import showToast from "../utils/toast";
import { validateCpf } from "../utils/validation";

// ─── CSS Variables Reference ─────────────────────────────────────────────────
// --navy, --surface, --surface-2, --surface-3, --coral, --gold, --teal,
// --text, --text-dim, --text-muted, --text-faint, --border, --border-hover,
// --success, --danger

const ProfilePage = () => {
  const { navigate, logout, profile, setProfile, email, userId, userDocuments } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: profile?.nome || "",
    sobrenome: profile?.sobrenome || "",
    cpf: profile?.cpf || "",
  });

  const displayName  = profile?.nome ? `${profile.nome} ${profile.sobrenome || ""}`.trim() : "Usuário";
  const displayEmail = email || null;
  const displayCity  = null;

  const handleStartEdit = () => {
    setEditForm({
      nome: profile?.nome || "",
      sobrenome: profile?.sobrenome || "",
      cpf: profile?.cpf || "",
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleSaveProfile = async () => {
    if (!editForm.nome.trim() || !editForm.sobrenome.trim()) {
      showToast.error("Nome e sobrenome são obrigatórios.");
      return;
    }
    if (editForm.cpf.trim() && !validateCpf(editForm.cpf)) {
      showToast.error("CPF inválido. Verifique o número.");
      return;
    }
    setSaving(true);
    try {
      await DocumentService.updateProfile({
        nome: editForm.nome.trim(),
        sobrenome: editForm.sobrenome.trim(),
        cpf: editForm.cpf.trim(),
      });
      setProfile((prev) => ({
        ...prev,
        nome: editForm.nome.trim(),
        sobrenome: editForm.sobrenome.trim(),
        cpf: editForm.cpf.trim(),
      }));
      setEditMode(false);
      showToast.success("Perfil atualizado com sucesso.");
    } catch (err) {
      console.error("[ProfilePage][ERRO] handleSaveProfile:", err.message);
      showToast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const getUserInitials = () =>
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    logout();
  };

  const handleDeleteData = () => {
    if (userId) {
      StorageService.clearUserData(userId);
      localStorage.removeItem(`kriou_onboarding_${userId}_seen`);
    }
    logout();
  };

  const docCount = userDocuments?.length ?? 0;
  const finalizedCount = userDocuments?.filter(d => d.status === "finalizado").length ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--navy)" }}>
      <AppNavbar
        title="Perfil"
        leftAction={
          <button
            onClick={() => navigate("dashboard", { replace: true })}
            aria-label="Voltar ao Dashboard"
            style={{
              minWidth: 44,
              minHeight: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      <div style={{ maxWidth: 600, margin: "32px auto", padding: "0 24px calc(32px + env(safe-area-inset-bottom, 0px))" }}>

        {/* ─── Avatar Section ─── */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            aria-hidden="true"
            style={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #F43F5E 0%, #A855F7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              fontSize: 40,
              fontWeight: 900,
              fontFamily: "var(--font-display)",
              color: "#fff",
              letterSpacing: "0.02em",
              boxShadow: "0 8px 36px rgba(244,63,94,0.30), 0 2px 8px rgba(168,85,247,0.25)",
            }}
          >
            {getUserInitials()}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.015em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              {displayName}
            </h1>
            {!editMode && (
              <button
                onClick={handleStartEdit}
                aria-label="Editar perfil"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1.5px solid var(--border)",
                  background: "var(--surface-2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--coral)"; e.currentTarget.style.color = "var(--coral)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <Icon name="Edit" className="w-4 h-4" />
              </button>
            )}
          </div>
          {displayEmail && (
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--text-muted)",
              letterSpacing: "-0.005em",
            }}>
              {displayEmail}
            </p>
          )}
        </div>

        {/* ─── Stats (editorial) ─── */}
        <Card
          className="animate-fadeUp"
          style={{ marginBottom: 16, padding: "18px 20px" }}
        >
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, margin: 0,
          }}>
            Você criou{" "}
            <strong style={{ color: "var(--text)" }}>{docCount} documento{docCount !== 1 ? "s" : ""}</strong>
            {finalizedCount > 0 && (
              <>, dos quais <strong style={{ color: "var(--teal)" }}>{finalizedCount} estão finalizado{finalizedCount !== 1 ? "s" : ""}</strong></>
            )}
            {docCount > 0 && finalizedCount < docCount && (
              <> e <strong style={{ color: "var(--coral)" }}>{docCount - finalizedCount} em rascunho</strong></>
            )}.
          </p>
        </Card>

        {/* ─── Account Info ─── */}
        <Card
          className="animate-fadeUp delay-1"
          style={{ marginBottom: 16, padding: "20px 20px 4px" }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Informações da Conta
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {editMode ? (
              <>
                <EditField
                  icon="User"
                  label="Nome"
                  value={editForm.nome}
                  onChange={(v) => setEditForm((f) => ({ ...f, nome: v }))}
                  placeholder="Seu nome"
                />
                <EditField
                  icon="User"
                  label="Sobrenome"
                  value={editForm.sobrenome}
                  onChange={(v) => setEditForm((f) => ({ ...f, sobrenome: v }))}
                  placeholder="Seu sobrenome"
                />
                <EditField
                  icon="Shield"
                  label="CPF"
                  value={editForm.cpf}
                  onChange={(v) => setEditForm((f) => ({ ...f, cpf: v }))}
                  placeholder="000.000.000-00"
                  mask="cpf"
                  last
                />
                <div style={{ display: "flex", gap: 10, paddingTop: 16, paddingBottom: 8 }}>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: 13,
                      border: "1.5px solid var(--border)",
                      background: "transparent",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      letterSpacing: "-0.005em",
                      transition: "all 0.2s ease",
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50"
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-dim)"; }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: 13,
                      border: "none",
                      background: saving ? "var(--text-muted)" : "linear-gradient(135deg, #F43F5E 0%, #E4324D 100%)",
                      color: "#fff",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      letterSpacing: "-0.005em",
                      boxShadow: saving ? "none" : "0 4px 18px rgba(244,63,94,0.30)",
                      transition: "all 0.22s ease",
                    }}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <InfoRow icon="User" label="Nome" value={displayName} />
                {displayEmail && <InfoRow icon="Mail" label="E-mail" value={displayEmail} />}
                <InfoRow icon="Shield" label="CPF" value={profile?.cpf || "—"} last={!displayEmail && !displayCity} />
                {!displayEmail && <InfoRow icon="Globe" label="Cidade" value="—" last />}
              </>
            )}
          </div>
        </Card>

        {/* ─── Plan Info ─── */}
        <Card
          className="animate-fadeUp delay-2"
          style={{ marginBottom: 16, padding: 20 }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              marginBottom: 14,
            }}
          >
            Plano Atual
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Plano Avulso
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: "rgba(244,63,94,0.12)",
                    color: "var(--coral)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  Atual
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                R$ 9,90 por documento
              </div>
            </div>
            <button
              style={{
                minWidth: 44,
                minHeight: 44,
                padding: "9px 18px",
                borderRadius: 12,
                border: "1.5px solid rgba(212,175,55,0.25)",
                background: "rgba(212,175,55,0.06)",
                color: "var(--gold)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                whiteSpace: "nowrap",
                letterSpacing: "-0.005em",
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.13)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(212,175,55,0.06)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
              }}
            >
              Atualizar Plano
            </button>
          </div>
        </Card>

        {/* ─── Settings ─── */}
        <Card
          className="animate-fadeUp delay-3"
          style={{ marginBottom: 16, padding: "20px 20px 4px" }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text)",
              marginBottom: 8,
            }}
          >
            Configurações
          </h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <SettingsRow icon="Bell" label="Notificações" />
            <SettingsRow icon="Shield" label="Privacidade" />
            <SettingsRow icon="HelpCircle" label="Ajuda e Suporte" last />
          </div>
        </Card>

        {/* ─── Logout ─── */}
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            minHeight: 52,
            padding: "14px 24px",
            borderRadius: 14,
            border: "1.5px solid rgba(255,255,255,0.10)",
            background: "var(--surface-2)",
            color: "var(--text-dim)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            marginTop: 8,
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
            e.currentTarget.style.color = "var(--text-dim)";
          }}
        >
          <Icon name="LogOut" className="w-5 h-5" />
          Sair da Conta
        </button>

        {/* ─── Delete Data ─── */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              minWidth: 44,
              minHeight: 44,
              padding: "12px 16px",
              margin: "16px auto 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              display: "block",
              textAlign: "center",
              textDecoration: "underline",
              textUnderlineOffset: 3,
              transition: "color 0.2s ease",
            }}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)] rounded-xl"
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Apagar meus dados
          </button>
        ) : (
          <Card
            style={{
              marginTop: 16,
              padding: 20,
              border: "1.5px solid rgba(244,63,94,0.35)",
              background: "rgba(244,63,94,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(244,63,94,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--coral)",
                }}
              >
                <Icon name="Shield" className="w-5 h-5" />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--text-dim)",
                  letterSpacing: "-0.005em",
                  margin: 0,
                }}
              >
                Isso vai apagar <strong style={{ color: "var(--text)" }}>todos os seus documentos e dados salvos</strong> localmente e desconectar sua conta. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  minHeight: 48,
                  padding: "12px 20px",
                  borderRadius: 13,
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "-0.005em",
                  transition: "all 0.2s ease",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-dim)";
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteData}
                style={{
                  flex: 1,
                  minHeight: 48,
                  padding: "12px 20px",
                  borderRadius: 13,
                  border: "none",
                  background: "linear-gradient(135deg, #F43F5E 0%, #E4324D 100%)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "-0.005em",
                  boxShadow: "0 4px 18px rgba(244,63,94,0.30)",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #FB7185 0%, #F43F5E 100%)";
                  e.currentTarget.style.boxShadow = "0 8px 28px rgba(244,63,94,0.45)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #F43F5E 0%, #E4324D 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(244,63,94,0.30)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </Card>
        )}

        <div style={{ height: 48 }} />
      </div>
    </div>
  );
};

// ─── Sub-components ───

const InfoRow = ({ icon, label, value, last }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "var(--surface-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
      }}
    >
      <Icon name={icon} className="w-5 h-5" />
    </div>
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "0.01em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text)",
          letterSpacing: "-0.005em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

const EditField = ({ icon, label, value, onChange, placeholder, mask, last }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "var(--surface-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
      }}
    >
      <Icon name={icon} className="w-5 h-5" />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "0.01em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          let val = e.target.value;
          if (mask === "cpf") {
            val = val.replace(/\D/g, "").slice(0, 11);
            val = val.replace(/(\d{3})(\d)/, "$1.$2");
            val = val.replace(/(\d{3})(\d)/, "$1.$2");
            val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
          }
          onChange(val);
        }}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1.5px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 600,
          outline: "none",
          letterSpacing: "-0.005em",
          boxSizing: "border-box",
          transition: "border-color 0.2s ease",
        }}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50"
      />
    </div>
  </div>
);

const SettingsRow = ({ icon, label, last }) => (
  <button
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 0",
      background: "none",
      border: "none",
      borderBottom: last ? "none" : "1px solid var(--border)",
      cursor: "pointer",
      width: "100%",
      textAlign: "left",
      minHeight: 52,
      transition: "all 0.2s ease",
    }}
    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)] rounded-lg"
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "var(--surface-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
      }}
    >
      <Icon name={icon} className="w-5 h-5" />
    </div>
    <span
      style={{
        flex: 1,
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        color: "var(--text)",
        letterSpacing: "-0.005em",
      }}
    >
      {label}
    </span>
    <Icon name="ChevronRight" className="w-4 h-4" style={{ color: "var(--text-faint)" }} />
  </button>
);

export default ProfilePage;
