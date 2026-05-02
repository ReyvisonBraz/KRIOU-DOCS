import React, { useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button, AppNavbar, DocumentCard, EmptyState, SkeletonCard, ConfirmDialog } from "../components/UI";
import { useConfirm } from "../hooks/useConfirm";
import StorageService from "../utils/storage";
import showToast from "../utils/toast";
import { extractPersonData, looksLikeCode, looksLikeCPF, normalizeCPF, normalizeRG, normalizeName } from "../utils/documentCode";

const DashboardPage = () => {
  const {
    navigate, formData, logout, profile,
    userDocuments, setUserDocuments, userId, isLoading,
    setCurrentStep,
    setLegalStep,
    setDocumentType, setSelectedVariant, setLegalFormData, setDisabledFields,
    setFormData, setEditingDocId, setSelectedTemplate,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();

  const handleCreateResume = () => {
    setEditingDocId(null);
    sessionStorage.setItem("kriou_template_category", "resume");
    navigate("templates");
  };

  const handleCreateLegalDocument = () => {
    setEditingDocId(null);
    sessionStorage.setItem("kriou_template_category", "legal");
    navigate("templates");
  };

  const allDocs = userDocuments || [];

  const tabs = [
    { id: "todos", label: "Todos", icon: "FileText", filterType: "all" },
    { id: "resume", label: "Currículos", icon: "User", filterType: "type" },
    { id: "compra-venda", label: "Compra/Venda", icon: "FileText", filterType: "documentType" },
    { id: "locacao", label: "Locação", icon: "Home", filterType: "documentType" },
    { id: "procuracao", label: "Procuração", icon: "Shield", filterType: "documentType" },
    { id: "comodato", label: "Comodato", icon: "Key", filterType: "documentType" },
    { id: "doacao", label: "Doação", icon: "Gift", filterType: "documentType" },
    { id: "recibo", label: "Recibos", icon: "FileCheck", filterType: "documentType" },
    { id: "uniao-estavel", label: "União Estável", icon: "Heart", filterType: "documentType" },
    { id: "autorizacao-viagem", label: "Aut. Viagem", icon: "Plane", filterType: "documentType" },
    { id: "permuta", label: "Permuta", icon: "Repeat", filterType: "documentType" },
    { id: "prestacao-servicos", label: "Prest. Serviços", icon: "Wrench", filterType: "documentType" },
  ];

  const visibleTabs = tabs.slice(0, 6);

  const TAB_FILTER_TYPE = Object.fromEntries(tabs.map(t => [t.id, t.filterType]));

  const getFilteredDocs = useCallback(() => {
    const filterType = TAB_FILTER_TYPE[activeTab] || "all";
    let docs = allDocs;

    if (filterType === "type") {
      docs = docs.filter((doc) => doc.type === activeTab);
    } else if (filterType === "documentType") {
      docs = docs.filter((doc) => doc.documentType === activeTab);
    }

    if (searchQuery.trim()) {
      const rawQuery = searchQuery.trim();
      const queryLower = rawQuery.toLowerCase();

      // Detecta o tipo de busca: codigo, CPF, RG ou texto livre
      const isSearchByCode = looksLikeCode(rawQuery);
      const isSearchByCPF = looksLikeCPF(rawQuery);
      const isSearchByRG = !isSearchByCPF && /^\d+$/.test(rawQuery.replace(/\D/g, "")) && rawQuery.replace(/\D/g, "").length >= 6;

      docs = docs.filter((doc) => {
        // Busca por codigo do documento
        if (isSearchByCode) {
          if (doc.code?.toLowerCase().includes(queryLower)) return true;
        }

        // Busca por CPF
        if (isSearchByCPF) {
          const person = extractPersonData(doc);
          if (person.cpf && normalizeCPF(person.cpf).includes(normalizeCPF(rawQuery))) return true;
        }

        // Busca por RG
        if (isSearchByRG) {
          const person = extractPersonData(doc);
          if (person.rg && normalizeRG(person.rg).includes(normalizeRG(rawQuery))) return true;
        }

        // Busca por nome da pessoa
        const person = extractPersonData(doc);
        if (person.nome && normalizeName(person.nome).includes(normalizeName(rawQuery))) return true;

        // Busca por titulo, template e code (fallback)
        return (
          doc.title?.toLowerCase().includes(queryLower) ||
          doc.template?.toLowerCase().includes(queryLower) ||
          doc.code?.toLowerCase().includes(queryLower)
        );
      });
    }
    return docs;
  }, [allDocs, activeTab, searchQuery]);

  const handleEditDocument = (doc) => {
    if (doc.type === "resume") {
      if (doc.status === "finalizado" && doc.formData) {
        setFormData(doc.formData);
        if (doc.templateId) {
          setSelectedTemplate({ id: doc.templateId, name: doc.templateName || "Modelo" });
        }
        setEditingDocId(doc.id);
      } else {
        setEditingDocId(null);
      }
      setCurrentStep(0);
      navigate("editor");
    } else if (doc.type === "legal") {
      if (doc.draft) {
        if (doc.draft.documentType) setDocumentType(doc.draft.documentType);
        if (doc.draft.selectedVariant) setSelectedVariant(doc.draft.selectedVariant);
        if (doc.draft.legalFormData) setLegalFormData(doc.draft.legalFormData);
        if (doc.draft.disabledFields) setDisabledFields(doc.draft.disabledFields);
        setLegalStep(doc.draft.legalStep ?? 1);
        setEditingDocId(null);
      } else if (doc.status === "finalizado" && doc.legalData) {
        setDocumentType({ id: doc.documentType, name: doc.documentTypeName || "Documento" });
        setSelectedVariant(doc.variantId || doc.variant || null);
        setLegalFormData(doc.legalData);
        setDisabledFields({});
        setLegalStep(1);
        setEditingDocId(doc.id);
      } else {
        setLegalStep(0);
        setEditingDocId(null);
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

    try {
      StorageService.saveDocuments(updated, userId);
      showToast.success("Documento excluído.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] saveDocuments falhou apos delecao:", err.message);
      showToast.error("Documento removido da lista, mas pode não ter sido salvo no servidor.");
    }
  };

  const getUserName = () => {
    const name = profile?.nome || formData.nome;
    return name ? name.split(" ")[0] : "Usuário";
  };

  const filteredDocs = getFilteredDocs();
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || "documentos";

  return (
    <div className="min-h-screen bg-navy flex flex-col">

      <AppNavbar
        title={<span className="font-display text-2xl font-black cursor-pointer tracking-tight" onClick={() => navigate("landing")}><span className="text-coral">Kriou</span> <span className="text-white">Docs</span></span>}
        rightAction={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("profile")} aria-label="Perfil" className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
              <Icon name="User" className="w-5 h-5" />
            </button>
            <button onClick={logout} aria-label="Sair" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-text-muted hover:text-coral transition-colors rounded-lg hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60">
              <Icon name="LogOut" className="w-4 h-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-10">

        {/* ─── Welcome ─── */}
        <section className="animate-fadeUp mb-10">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-text-muted/80 text-sm font-medium tracking-wide uppercase mb-1">Painel</p>
              <h1 className="font-display text-3xl md:text-4xl font-black text-white">
                Olá, <span className="text-coral">{getUserName()}</span>
              </h1>
            </div>
            {allDocs.length > 0 && (
              <div className="flex items-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>{allDocs.filter(d => d.status === "finalizado").length} finalizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <span>{allDocs.filter(d => d.status !== "finalizado").length} rascunhos</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Command Bar ─── */}
        <section className="animate-fadeUp delay-1 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1 min-w-0">
              <Icon name="Search" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/60" />
              <input
                type="text"
                placeholder="Buscar por nome ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-2xl pl-11 pr-4 py-3.5 text-[15px] outline-none text-white placeholder-text-muted/50 transition-all duration-200 focus:border-coral/50 focus:ring-4 focus:ring-coral/10"
              />
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Button variant="primary" icon="Plus" onClick={handleCreateResume} className="px-5 py-3.5 whitespace-nowrap">
                Novo Currículo
              </Button>
              <Button variant="secondary" icon="FileText" onClick={handleCreateLegalDocument} className="px-5 py-3.5 whitespace-nowrap">
                Novo Documento
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Tabs ─── */}
        {allDocs.length > 0 && (
          <section className="animate-fadeUp delay-2 mb-8">
            <nav aria-label="Filtrar documentos" className="flex gap-1.5 flex-wrap">
              {visibleTabs.map((tab) => {
                const count = tab.id === "todos" ? allDocs.length :
                  tab.filterType === "type" ? allDocs.filter(d => d.type === tab.id).length :
                  tab.filterType === "documentType" ? allDocs.filter(d => d.documentType === tab.id).length :
                  0;
                if (count === 0 && tab.id !== "todos") return null;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/60
                      ${isActive
                        ? 'bg-coral text-white shadow-lg shadow-coral/20'
                        : 'bg-surface text-text-muted hover:text-text hover:bg-surface-2 border border-transparent hover:border-border'}`}
                  >
                    <Icon name={tab.icon} className="w-3.5 h-3.5" />
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-black tabular-nums ${isActive ? 'bg-white/20 text-white' : 'bg-surface-3 text-text-muted'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </section>
        )}

        {/* ─── Content ─── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredDocs.length > 0 ? (
          <section className="animate-fadeUp delay-3 columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredDocs.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onClick={() => handleEditDocument(doc)}
                onDelete={() => handleDeleteDocument(doc)}
                animationDelay={index * 0.04}
              />
            ))}
          </section>
        ) : (
          <section className="animate-fadeUp delay-2">
            <EmptyState
              icon={searchQuery.trim() ? "Search" : "FileText"}
              title={searchQuery.trim() ? "Nenhum documento encontrado" : "Ainda não há documentos"}
              description={searchQuery.trim()
                ? `Nenhum resultado para "${searchQuery}" em ${activeTabLabel.toLowerCase()}.`
                : "Crie seu primeiro currículo ou contrato jurídico agora mesmo."}
              action={!searchQuery.trim() && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button variant="primary" onClick={handleCreateResume} className="justify-center px-6">Criar Currículo</Button>
                  <Button variant="secondary" onClick={handleCreateLegalDocument} className="justify-center px-6">Criar Documento Jurídico</Button>
                </div>
              )}
            />
          </section>
        )}
      </main>

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DashboardPage;
