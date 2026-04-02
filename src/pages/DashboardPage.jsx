/**
 * ============================================
 * KRIOU DOCS - Dashboard Page Component
 * ============================================
 * User dashboard showing created documents
 * and quick actions for creating new documents.
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Card, Button, Badge } from "../components/UI";

/**
 * DashboardPage - User's document management hub
 */
const DashboardPage = () => {
  const { navigate, filter, setFilter, formData, setFormData, setCurrentStep, logout, phone, userDocuments, legalDocumentTypes, selectDocumentType, setDocumentType } = useApp();

  /**
   * Handle create new legal document
   */
  const handleCreateLegalDocument = () => {
    setDocumentType(null);
    setCurrentStep(0);
    navigate("legalEditor");
  };

  /**
   * Mock documents for demonstration
   * In production, this would come from database/API
   */
  const mockDocs = [
    { id: 1, type: "Currículo", title: "Dev Full Stack", template: "Tech", date: "25 Mar", status: "finalizado" },
    { id: 2, type: "Currículo", title: "Designer UX", template: "Criativo", date: "22 Mar", status: "rascunho" },
    { id: 3, type: "Contrato", title: "Aluguel Apt 302", template: "Padrão", date: "18 Mar", status: "finalizado" },
  ];

  /**
   * Filter documents based on selected type
   * @returns {Array} Filtered document list
   */
  const getFilteredDocs = () => {
    if (filter === "todos") return mockDocs;
    return mockDocs.filter((doc) => doc.type.toLowerCase().includes(filter));
  };

  /**
   * Get status badge variant
   * @param {string} status - Document status
   * @returns {string} Badge variant
   */
  const getStatusVariant = (status) => {
    return status === "finalizado" ? "success" : "warning";
  };

  /**
   * Handle document edit navigation
   * @param {Object} doc - Document to edit
   */
  const handleEditDocument = (doc) => {
    // Carregar dados do documento no editor (simulado com dados mock)
    // Na produção, carregaria do banco de dados
    setFormData({
      nome: doc.title === "Dev Full Stack" ? "Reyvison Silva" : "Designer UX",
      email: "usuario@email.com",
      telefone: "(11) 99999-9999",
      cidade: "São Paulo, SP",
      linkedin: "linkedin.com/in/usuario",
      objetivo: doc.title === "Dev Full Stack" 
        ? "Desenvolvedor Full Stack com 5 anos de experiência buscando posição de liderança técnica."
        : "Designer UX buscando desafios em projetos inovadores.",
      experiencias: [
        { empresa: "Tech Solutions", cargo: "Desenvolvedor Senior", periodo: "Jan 2022 - Atual", descricao: "Liderança técnica e desenvolvimento de APIs." },
      ],
      formacoes: [
        { instituicao: "USP", curso: "Ciência da Computação", periodo: "2018-2022", status: "Completo" },
      ],
      habilidades: ["React", "Node.js", "TypeScript", "Git"],
      idiomas: [{ idioma: "Português", nivel: "Nativo" }],
      cursos: "",
    });
    setCurrentStep(0);
    navigate("editor");
  };

  /**
   * Get user's first name for greeting
   * @returns {string} User's first name
   */
  const getUserName = () => {
    const savedName = formData.nome;
    return savedName ? savedName.split(" ")[0] : "Reyvison";
  };

  /**
   * Filter button options
   */
  const filterOptions = [
    { id: "todos", label: "Todos" },
    { id: "currículo", label: "Currículo" },
    { id: "contrato", label: "Contrato" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Navbar ─── */}
      <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div className="font-display" style={{ fontSize: 24, fontWeight: 900, cursor: "pointer" }} onClick={() => navigate("landing")}>
            <span style={{ color: "var(--coral)" }}>Kriou</span> Docs
          </div>

          {/* User Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button 
              onClick={() => navigate("profile")}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}
            >
              <Icon name="User" className="w-4 h-4" />
            </button>
            <button onClick={logout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              <Icon name="LogOut" className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome Section */}
        <div className="animate-fadeUp" style={{ marginBottom: 32 }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            Olá, {getUserName()} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>Gerencie seus documentos ou crie um novo.</p>
        </div>

        {/* ─── CTA Buttons ─── */}
        <div className="animate-fadeUp delay-1" style={{ display: "flex", gap: 14, marginBottom: 36, flexWrap: "wrap" }}>
          <Button variant="primary" icon="Plus" onClick={() => navigate("templates")}>
            Criar Currículo
          </Button>
          <Button variant="secondary" icon="FileText" onClick={handleCreateLegalDocument}>
            Criar Documento Jurídico
          </Button>
        </div>

        {/* ─── Filter Tabs ─── */}
        <div className="animate-fadeUp delay-2" style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              style={{
                background: filter === option.id ? "var(--coral)" : "var(--surface-2)",
                color: filter === option.id ? "white" : "var(--text-muted)",
                border: "none",
                borderRadius: 100,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all .2s",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* ─── Documents Grid ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {getFilteredDocs().map((doc, index) => (
            <Card
              key={doc.id}
              className="animate-fadeUp"
              style={{ animationDelay: `${(index + 3) * 0.1}s`, padding: 20 }}
            >
              {/* Document Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <Badge variant={getStatusVariant(doc.status)}>
                    {doc.status === "finalizado" ? "Finalizado" : "Rascunho"}
                  </Badge>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>{doc.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    {doc.type} • {doc.template} • {doc.date}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="small" icon="Edit" onClick={() => handleEditDocument(doc)}>
                  Editar
                </Button>
                <Button variant="secondary" size="small" icon="Download" />
                <Button variant="secondary" size="small" icon="Copy" />
              </div>
            </Card>
          ))}

          {/* ─── New Document Card (Empty State) ─── */}
          <Card
            className="animate-fadeUp delay-5"
            onClick={() => navigate("templates")}
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 180,
              cursor: "pointer",
              border: "2px dashed var(--border)",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(233,69,96,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Icon name="Plus" className="w-6 h-6" style={{ color: "var(--coral)" }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Novo Documento</span>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;