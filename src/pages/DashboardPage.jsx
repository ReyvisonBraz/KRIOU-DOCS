/**
 * ============================================
 * KRIOU DOCS - Dashboard Page Component
 * ============================================
 * User dashboard showing created documents
 * and quick actions for creating new documents.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button, AppNavbar, DocumentCard, EmptyState, SkeletonCard, ConfirmDialog } from "../components/UI";
import { useConfirm } from "../hooks/useConfirm";
import StorageService from "../utils/storage";
import showToast from "../utils/toast";

/**
 * DashboardPage - User's document management hub
 */
const DashboardPage = () => {
  const { navigate, formData, setFormData, setCurrentStep, logout, userData, userDocuments, setUserDocuments, userId, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  /**
   * Handle create new legal document
   */
  const handleCreateLegalDocument = () => {
    setCurrentStep(0);
    navigate("legalEditor");
  };

  /**
   * Use real documents from context; fall back to demo data when list is empty
   */
  const demoDocs = [
    { id: "demo-1", type: "curriculo", title: "Dev Full Stack", template: "Tech", date: "25 Mar", status: "finalizado" },
    { id: "demo-2", type: "curriculo", title: "Designer UX", template: "Criativo", date: "22 Mar", status: "rascunho" },
    { id: "demo-3", type: "compra-venda", title: "Aluguel Apt 302", template: "Padrão", date: "18 Mar", status: "finalizado" },
    { id: "demo-4", type: "locacao", title: "Contrato Locação", template: "Padrão", date: "15 Mar", status: "rascunho" },
  ];
  const allDocs = userDocuments && userDocuments.length > 0 ? userDocuments : demoDocs;

  /**
   * Tab options
   */
  const tabs = [
    { id: "todos", label: "Todos", icon: "FileText" },
    { id: "curriculo", label: "Currículos", icon: "User" },
    { id: "compra-venda", label: "Compra/Venda", icon: "FileText" },
    { id: "locacao", label: "Locação", icon: "Home" },
    { id: "procuracao", label: "Procuração", icon: "Shield" },
  ];

  /**
   * Get filtered docs by tab and search
   */
  const getFilteredDocs = () => {
    let docs = activeTab === "todos" ? allDocs : allDocs.filter((doc) => doc.type === activeTab);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter((doc) => doc.title?.toLowerCase().includes(query) || doc.template?.toLowerCase().includes(query));
    }
    return docs;
  };

  /**
   * Handle document edit — redireciona para o editor correto
   */
  const handleEditDocument = (doc) => {
    if (doc.type === "curriculo") {
      setCurrentStep(0);
      navigate("editor");
    } else {
      setCurrentStep(0);
      navigate("legalEditor");
    }
  };

  /**
   * Handle document delete with confirmation
   */
  const handleDeleteDocument = async (doc) => {
    const confirmed = await requestConfirm({
      title: "Excluir documento",
      message: `Deseja excluir "${doc.title}"? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!confirmed) return;
    const updated = (userDocuments || []).filter((d) => d.id !== doc.id);
    setUserDocuments(updated);
    StorageService.saveDocuments(updated, userId);
    showToast.success("Documento excluído.");
  };

  /**
   * Get user's first name
   */
  const getUserName = () => {
    const name = userData?.nome || formData.nome;
    return name ? name.split(" ")[0] : "Usuário";
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <AppNavbar
        title={<span className="font-display" style={{ fontSize: 22, fontWeight: 900, cursor: "pointer" }} onClick={() => navigate("landing")}><span style={{ color: "var(--coral)" }}>Kriou</span> Docs</span>}
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => navigate("profile")} aria-label="Perfil" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}>
              <Icon name="User" className="w-4 h-4" />
            </button>
            <button onClick={logout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13, padding: 4 }}>
              <Icon name="LogOut" className="w-4 h-4" /> Sair
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            Olá, {getUserName()} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Gerencie seus documentos ou crie um novo.</p>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fadeUp delay-1" style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <Button variant="primary" icon="Plus" onClick={() => navigate("templates")}>
            + Novo Currículo
          </Button>
          <Button variant="secondary" icon="FileText" onClick={handleCreateLegalDocument}>
            + Novo Documento
          </Button>
        </div>

        {/* Search Bar */}
        <div className="animate-fadeUp delay-1" style={{ marginBottom: 20 }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <Icon name="Search" className="w-4 h-4" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 12px 12px 42px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 14,
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fadeUp delay-2" style={{ display: "flex", gap: 6, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "var(--coral)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-muted)",
                border: activeTab === tab.id ? "none" : "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all .2s",
              }}
            >
              {tab.label}
              <span style={{ background: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "var(--surface-2)", padding: "2px 8px", borderRadius: 10, fontSize: 11 }}>
                {tab.id === "todos" ? allDocs.length : allDocs.filter(d => d.type === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : getFilteredDocs().map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onClick={() => handleEditDocument(doc)}
                  onDelete={doc.id.startsWith("demo-") ? undefined : () => handleDeleteDocument(doc)}
                  animationDelay={index * 0.05}
                />
              ))
          }
        </div>

        {/* Empty State */}
        {!isLoading && getFilteredDocs().length === 0 && (
          <EmptyState
            icon="FileText"
            title="Nenhum documento encontrado"
            description="Crie um novo documento para começar"
          />
        )}
      </div>

      {/* ConfirmDialog para exclusão de documentos */}
      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DashboardPage;