/**
 * ============================================
 * KRIOU DOCS - Profile Page Component
 * ============================================
 * User profile and settings management page.
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button } from "../components/UI";

/**
 * ProfilePage - User profile and settings
 */
const ProfilePage = () => {
  const { navigate, logout, phone, formData } = useApp();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate("landing");
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    const name = formData.nome || "Usuário";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Navbar ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("dashboard")}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <Icon name="ChevronLeft" className="w-5 h-5" />
          </button>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>Perfil</div>
        </div>
      </nav>

      {/* ─── Profile Content ─── */}
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
        {/* Avatar Section */}
        <div className="animate-fadeUp" style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--coral), var(--purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 36,
              fontWeight: 900,
              color: "white",
            }}
          >
            {getUserInitials()}
          </div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {formData.nome || "Usuário"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{formData.email || "usuario@email.com"}</p>
        </div>

        {/* Account Info */}
        <Card className="animate-fadeUp delay-1" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Informações da Conta</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="Phone" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>WhatsApp</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{phone || "(11) 99999-9999"}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="User" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Nome</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{formData.nome || "Não definido"}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon name="Globe" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Cidade</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{formData.cidade || "Não definida"}</div>
                </div>
              </div>
            </div>
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
            <button style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", width: "100%", textAlign: "left" }}>
              <Icon name="Bell" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <span style={{ flex: 1, fontSize: 14 }}>Notificações</span>
              <Icon name="ChevronRight" className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
            
            <button style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", width: "100%", textAlign: "left" }}>
              <Icon name="Shield" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <span style={{ flex: 1, fontSize: 14 }}>Privacidade</span>
              <Icon name="ChevronRight" className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
            
            <button style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}>
              <Icon name="HelpCircle" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
              <span style={{ flex: 1, fontSize: 14 }}>Ajuda e Suporte</span>
              <Icon name="ChevronRight" className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </Card>

        {/* Logout */}
        <Button 
          variant="secondary" 
          style={{ width: "100%", marginTop: 16 }} 
          icon="LogOut"
          onClick={handleLogout}
        >
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;