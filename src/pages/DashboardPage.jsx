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

const DashboardPage = () => {
  const {
    navigate, formData, logout, userData,
    userDocuments, setUserDocuments, userId, isLoading,
    setCurrentStep,
    setLegalStep,
    setDocumentType, setSelectedVariant, setLegalFormData, setDisabledFields,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleCreateLegalDocument = () => {
    setLegalStep(0);
    navigate("legalEditor");
  };

  const allDocs = userDocuments || [];

  const tabs = [
    { id: "todos", label: "Todos", icon: "FileText" },
    { id: "curriculo", label: "Currículos", icon: "User" },
    { id: "compra-venda", label: "Compra/Venda", icon: "FileText" },
    { id: "locacao", label: "Locação", icon: "Home" },
    { id: "procuracao", label: "Procuração", icon: "Shield" },
  ];

  const getFilteredDocs = () => {
    let docs = activeTab === "todos" ? allDocs : allDocs.filter((doc) => doc.type === activeTab);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter((doc) => doc.title?.toLowerCase().includes(query) || doc.template?.toLowerCase().includes(query));
    }
    return docs;
  };

  const handleEditDocument = (doc) => {
    if (doc.type === "curriculo") {
      setCurrentStep(0);
      navigate("editor");
    } else {
      // Restaurar estado do rascunho jurídico se disponível
      if (doc.draft) {
        if (doc.draft.documentType) setDocumentType(doc.draft.documentType);
        if (doc.draft.selectedVariant) setSelectedVariant(doc.draft.selectedVariant);
        if (doc.draft.legalFormData) setLegalFormData(doc.draft.legalFormData);
        if (doc.draft.disabledFields) setDisabledFields(doc.draft.disabledFields);
        setLegalStep(doc.draft.legalStep ?? 1);
      } else {
        setLegalStep(0);
      }
      navigate("legalEditor");
    }
  };

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

  const getUserName = () => {
    const name = userData?.nome || formData.nome;
    return name ? name.split(" ")[0] : "Usuário";
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col relative">
      {/* Background elements */}
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-blue/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <AppNavbar
        title={<span className="font-display text-2xl font-black cursor-pointer tracking-tight" onClick={() => navigate("landing")}><span className="text-coral">Kriou</span> <span className="text-white">Docs</span></span>}
        rightAction={
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("profile")} aria-label="Perfil" className="p-2 bg-surface-2 rounded-full border border-border text-text-muted hover:text-white hover:border-coral transition-colors">
              <Icon name="User" className="w-5 h-5" />
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-text-muted hover:text-coral transition-colors bg-transparent border-none cursor-pointer">
              <Icon name="LogOut" className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 z-10 relative">
        {/* Welcome */}
        <div className="animate-fadeUp mb-8 md:mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-black mb-2 text-white">
            Olá, <span className="text-coral">{getUserName()}</span> 👋
          </h1>
          <p className="text-text-muted text-base md:text-lg">Gerencie seus documentos com facilidade ou crie algo novo agora mesmo.</p>
        </div>

        {/* Action Panel: Search and Buttons */}
        <div className="animate-fadeUp delay-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-surface/40 p-4 md:p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          {/* Search Bar */}
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Icon name="Search" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nome ou modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-xl pl-12 pr-4 py-3.5 text-[15px] outline-none text-white placeholder-text-muted/70 transition-all focus:border-coral focus:ring-2 focus:ring-coral/20 shadow-inner"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="primary" icon="Plus" onClick={() => navigate("templates")} className="flex-1 md:flex-none justify-center px-5 py-3 shadow-coral/20 shadow-lg">
              Novo Currículo
            </Button>
            <Button variant="secondary" icon="FileText" onClick={handleCreateLegalDocument} className="flex-1 md:flex-none justify-center px-5 py-3 border-white/10 bg-surface/80 hover:bg-surface-3">
              Novo Documento
            </Button>
          </div>
        </div>

        {/* Tabs - Scrollable */}
        <div className="animate-fadeUp delay-2 mb-8 relative">
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
            {tabs.map((tab) => {
              const count = tab.id === "todos" ? allDocs.length : allDocs.filter(d => d.type === tab.id).length;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`snap-start whitespace-nowrap flex py-2.5 px-4 items-center gap-2.5 rounded-xl text-sm font-bold transition-all border
                    ${isActive ? 'bg-coral text-white border-coral shadow-lg shadow-coral/20 hover:bg-coral-light select-none' : 'bg-surface border-border text-text-muted hover:border-coral/50 hover:text-white'}`}
                >
                  <Icon name={tab.icon} className="w-4 h-4 opacity-80" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-surface-3 text-text'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Fade edge effect for tabs overflow on mobile */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-navy to-transparent pointer-events-none md:hidden" />
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : getFilteredDocs().map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onClick={() => handleEditDocument(doc)}
                  onDelete={() => handleDeleteDocument(doc)}
                  animationDelay={index * 0.05}
                />
              ))
          }
        </div>

        {/* Empty State */}
        {!isLoading && getFilteredDocs().length === 0 && (
          <EmptyState
            icon="Search"
            title={searchQuery.trim() ? "Nenhum documento encontrado" : "Nenhum documento no momento"}
            description={searchQuery.trim() ? "Tente buscar utilizando outros termos ou filtros diferentes." : "Que tal começar agora? Crie seu primeiro currículo ou contrato jurídico."}
            action={
              !searchQuery.trim() && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button variant="primary" onClick={() => navigate("templates")} className="justify-center px-6">Criar Currículo</Button>
                  <Button variant="secondary" onClick={handleCreateLegalDocument} className="justify-center px-6">Criar Documento Jurídico</Button>
                </div>
              )
            }
          />
        )}
      </div>

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      
      {/* Hide scrollbar injected style for tabs specifically */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;