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
import { Card, Button, Badge } from "../components/UI";

/**
 * DashboardPage - User's document management hub
 */
const DashboardPage = () => {
  const { navigate, filter, setFilter, formData, setFormData, setCurrentStep, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  /**
   * Handle create new legal document
   */
  const handleCreateLegalDocument = () => {
    setCurrentStep(0);
    navigate("legalEditor");
  };

  /**
   * Mock documents for demonstration
   */
  const mockDocs = [
    { id: 1, type: "curriculo", title: "Dev Full Stack", template: "Tech", date: "25 Mar", status: "finalizado" },
    { id: 2, type: "curriculo", title: "Designer UX", template: "Criativo", date: "22 Mar", status: "rascunho" },
    { id: 3, type: "compra-venda", title: "Aluguel Apt 302", template: "Padrão", date: "18 Mar", status: "finalizado" },
    { id: 4, type: "locacao", title: "Contrato Locação", template: "Padrão", date: "15 Mar", status: "rascunho" },
    { id: 5, type: "curriculo", title: "Currículo Primeiro Emprego", template: "Primeiro Emprego", date: "10 Mar", status: "finalizado" },
  ];

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
    let docs = activeTab === "todos" ? mockDocs : mockDocs.filter((doc) => doc.type === activeTab);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter((doc) => doc.title.toLowerCase().includes(query) || doc.template.toLowerCase().includes(query));
    }
    return docs;
  };

  /**
   * Get status badge variant
   */
  const getStatusVariant = (status) => {
    return status === "finalizado" ? "success" : "warning";
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    return status === "finalizado" ? "✓ Finalizado" : "✎ Rascunho";
  };

  /**
   * Handle document edit
   */
  const handleEditDocument = (doc) => {
    setFormData({
      nome: doc.title.includes("Dev") ? "Reyvison Silva" : doc.title.includes("Designer") ? "Maria Santos" : "Nome Completo",
      email: "usuario@email.com",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo, SP",
      linkedin: "linkedin.com/in/usuario",
      objetivo: "Objetivo profissional...",
      experiencias: [{ empresa: "Empresa XPTO", cargo: "Cargo", periodo: "2022 - Atual", descricao: "Descrição" }],
      formacoes: [{ instituicao: "Universidade", curso: "Curso", periodo: "2020 - 2024", status: "Cursando" }],
      habilidades: ["Comunicação", "Trabalho em Equipe"],
      idiomas: [{ idioma: "Português", nivel: "Nativo" }],
      cursos: "",
    });
    setCurrentStep(0);
    navigate("editor");
  };

  /**
   * Get user's first name
   */
  const getUserName = () => {
    return formData.nome ? formData.nome.split(" ")[0] : "Usuário";
  };

  /**
   * Get document type label
   */
  const getTypeLabel = (type) => {
    const labels = {
      curriculo: "Currículo",
      "compra-venda": "Compra/Venda",
      locacao: "Locação",
      procuracao: "Procuração",
    };
    return labels[type] || type;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="font-display" style={{ fontSize: 24, fontWeight: 900, cursor: "pointer" }} onClick={() => navigate("landing")}>
            <span style={{ color: "var(--coral)" }}>Kriou</span> Docs
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => navigate("profile")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              <Icon name="User" className="w-4 h-4" />
            </button>
            <button onClick={logout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              <Icon name="LogOut" className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </nav>

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
                {tab.id === "todos" ? mockDocs.length : mockDocs.filter(d => d.type === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {getFilteredDocs().map((doc, index) => (
            <Card
              key={doc.id}
              className="animate-fadeUp"
              onClick={() => handleEditDocument(doc)}
              style={{
                cursor: "pointer",
                padding: 18,
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{
                  background: doc.type === "curriculo" ? "rgba(233,69,96,0.1)" : "rgba(0,210,211,0.1)",
                  padding: "6px 10px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  color: doc.type === "curriculo" ? "var(--coral)" : "var(--teal)",
                }}>
                  {getTypeLabel(doc.type)}
                </div>
                <Badge variant={getStatusVariant(doc.status)} style={{ fontSize: 10 }}>
                  {getStatusLabel(doc.status)}
                </Badge>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>{doc.title}</h3>
              <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>{doc.template}</span>
                <span>{doc.date}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredDocs().length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
            <Icon name="FileText" className="w-12 h-12" style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ fontSize: 15 }}>Nenhum documento encontrado</p>
            <p style={{ fontSize: 13 }}>Crie um novo documento para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;