/**
 * ============================================
 * KRIOU DOCS - Profile Page Component
 * ============================================
 * User profile and settings management page.
 * Reads data from AppContext (session + formData).
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, AppNavbar } from "../components/UI";
import StorageService from "../utils/storage";

/**
 * ProfilePage - User profile and settings
 */
const ProfilePage = () => {
  const { navigate, logout, profile, email, userId, userDocuments } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const displayName  = profile?.nome ? `${profile.nome} ${profile.sobrenome || ""}`.trim() : "Usuário";
  const displayEmail = email || null;
  const displayCity  = null;

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () =>
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * Handle full account/data deletion from localStorage
   */
  const handleDeleteData = () => {
    if (userId) {
      StorageService.clearUserData(userId);
      localStorage.removeItem(`kriou_onboarding_${userId}_seen`);
    }
    logout();
  };

  const docCount = userDocuments?.length ?? 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Navbar ─── */}
      <AppNavbar
        title="Perfil"
        leftAction={
          <button
            onClick={() => navigate("dashboard")}
            aria-label="Voltar ao Dashboard"
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6 }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
        }
      />

      {/* ─── Profile Content ─── */}
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>

        {/* Avatar Section */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            aria-hidden="true"
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--coral), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 36, fontWeight: 900, color: "white",
            }}
          >
            {getUserInitials()}
          </div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {displayName}
          </h1>
          {displayEmail && (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{displayEmail}</p>
          )}
        </div>

        {/* Stats */}
        <Card className="animate-fadeUp" style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            <div style={{ textAlign: "center", padding: "16px 0", borderRight: "1px solid var(--border)" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--coral)" }}>{docCount}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Documentos</div>
            </div>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--teal)" }}>
                {userDocuments?.filter(d => d.status === "finalizado").length ?? 0}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Finalizados</div>
            </div>
          </div>
        </Card>

        {/* Account Info */}
        <Card className="animate-fadeUp delay-1" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Informações da Conta</h3>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <InfoRow icon="User" label="Nome" value={displayName} />
            {displayEmail && <InfoRow icon="Mail" label="E-mail" value={displayEmail} />}
            {displayCity && <InfoRow icon="Globe" label="Cidade" value={displayCity} last />}
            {!displayEmail && !displayCity && (
              <InfoRow icon="Globe" label="Cidade" value="—" last />
            )}
          </div>
        </Card>

        {/* Plan Info */}
        <Card className="animate-fadeUp delay-2" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Plano Atual</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--coral)" }}>Plano Avulso</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>R$ 9,90 por documento</div>
            </div>
            <Button variant="secondary" size="small">Atualizar Plano</Button>
          </div>
        </Card>

        {/* Settings */}
        <Card className="animate-fadeUp delay-3" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Configurações</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <SettingsRow icon="Bell" label="Notificações" />
            <SettingsRow icon="Shield" label="Privacidade" />
            <SettingsRow icon="HelpCircle" label="Ajuda e Suporte" last />
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="secondary"
          style={{ width: "100%", marginTop: 8 }}
          icon="LogOut"
          onClick={handleLogout}
        >
          Sair da Conta
        </Button>

        {/* Delete data */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", fontSize: 12, marginTop: 16,
              display: "block", width: "100%", textAlign: "center",
              textDecoration: "underline",
            }}
          >
            Apagar meus dados
          </button>
        ) : (
          <Card style={{ marginTop: 16, border: "1px solid var(--coral)", padding: 16 }}>
            <p style={{ fontSize: 13, marginBottom: 14, color: "var(--text)" }}>
              Isso vai apagar <strong>todos os seus documentos e dados salvos</strong> localmente e desconectar sua conta. Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <button
                onClick={handleDeleteData}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 10,
                  background: "var(--coral)", color: "white",
                  border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Confirmar exclusão
              </button>
            </div>
          </Card>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

// ─── Sub-components ───

const InfoRow = ({ icon, label, value, last }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 0",
    borderBottom: last ? "none" : "1px solid var(--border)",
  }}>
    <Icon name={icon} className="w-5 h-5" style={{ color: "var(--text-muted)", flexShrink: 0 }} />
    <div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  </div>
);

const SettingsRow = ({ icon, label, last }) => (
  <button style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 0", background: "none", border: "none",
    borderBottom: last ? "none" : "1px solid var(--border)",
    cursor: "pointer", width: "100%", textAlign: "left",
  }}>
    <Icon name={icon} className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
    <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
    <Icon name="ChevronRight" className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
  </button>
);

export default ProfilePage;
