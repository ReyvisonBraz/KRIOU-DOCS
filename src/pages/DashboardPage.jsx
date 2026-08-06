import React, { useRef, useState, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { Button, IconButton, Input, Modal, AppNavbar, AppShell, PageContainer, DocumentCard, EmptyState, MetricCard, SkeletonCard, Skeleton, ConfirmDialog } from "../components/UI";
import { useConfirm } from "../hooks/useConfirm";
import { DocumentAccessService } from "../services/DocumentAccessService";
import { DocumentService } from "../services/DocumentService";
import StorageService from "../utils/storage";
import showToast from "../utils/toast";
import { usePDF } from "../hooks/usePDF";
import { generateDocumentCode } from "../utils/documentCode";
import { INITIAL_FORM_DATA } from "../data/constants";
import {
  canDownloadDocument,
  isDocumentPaid,
  isDocumentPaymentPending,
  isLocalDraftDocument,
  matchesDocumentPaymentFilter,
} from "../domain/documents/payment";
import { selectDashboardDocuments } from "../domain/documents/dashboard";

const DashboardPage = () => {
  const {
    navigate, formData, logout, profile,
    userDocuments, setUserDocuments, userId, isLoading,
    setCurrentStep,
    setLegalStep,
    setDocumentType, setSelectedVariant, setLegalFormData, setDisabledFields,
    setFormData, setEditingDocId, setSelectedTemplate,
    discardResumeDraft, discardLegalDraft,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [archiveFilter, setArchiveFilter] = useState("ativos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("recentes");
  const [renameDoc, setRenameDoc] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const renameInputRef = useRef(null);
  const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm();
  const { generatePDF } = usePDF();

  const handleCreateResume = () => {
    setEditingDocId(null);
    setFormData(INITIAL_FORM_DATA);
    setSelectedTemplate(null);
    setDocumentType(null);
    setCurrentStep(0);
    StorageService.clearDraft(userId, "resume");
    sessionStorage.setItem("kriou_template_category", "resume");
    navigate("templates");
  };

  const handleCreateLegalDocument = () => {
    setEditingDocId(null);
    setLegalFormData({});
    setDocumentType(null);
    setSelectedVariant(null);
    setDisabledFields({});
    setLegalStep(0);
    StorageService.clearDraft(userId, "legal");
    sessionStorage.setItem("kriou_template_category", "legal");
    navigate("templates");
  };

  const allDocs = useMemo(() => userDocuments || [], [userDocuments]);

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

  const visibleTabs = tabs;

  const TAB_FILTER_TYPE = Object.fromEntries(tabs.map(t => [t.id, t.filterType]));

  const filteredDocs = useMemo(() => selectDashboardDocuments(allDocs, {
    activeTab, archiveFilter, statusFilter, searchQuery, sortBy, tabFilterType: TAB_FILTER_TYPE,
  }), [allDocs, activeTab, archiveFilter, statusFilter, searchQuery, sortBy, TAB_FILTER_TYPE]);

  const sendDocumentToCheckout = useCallback((doc) => {
    if (!doc?.id) return;

    if (doc.type === "resume") {
      setFormData(doc.formData || INITIAL_FORM_DATA);
      if (doc.templateId) {
        setSelectedTemplate({ id: doc.templateId, name: doc.templateName || "Modelo" });
      }
      setDocumentType(null);
    } else {
      setDocumentType({ id: doc.documentType, name: doc.documentTypeName || "Documento" });
      setSelectedVariant(doc.variantId || doc.variant || null);
      setLegalFormData(doc.legalData || {});
      setDisabledFields({});
      setLegalStep(1);
    }

    setEditingDocId(doc.id);
    showToast.info(
      isDocumentPaymentPending(doc)
        ? "Conclua o pagamento para liberar este documento."
        : "Este documento ainda não está pago. Finalize o pagamento para liberar o PDF."
    );
    navigate("checkout");
  }, [
    navigate,
    setDisabledFields,
    setDocumentType,
    setEditingDocId,
    setFormData,
    setLegalFormData,
    setLegalStep,
    setSelectedTemplate,
    setSelectedVariant,
  ]);

  const handleEditDocument = (doc) => {
    if (doc.type === "resume") {
      if (doc.status === "finalizado" && doc.formData) {
        setFormData(doc.formData);
        if (doc.templateId) {
          setSelectedTemplate({ id: doc.templateId, name: doc.templateName || "Modelo" });
        }
        setEditingDocId(doc.id);
        setCurrentStep(0);
        navigate("editor");
      } else if (doc.draft?.formData) {
        setFormData(doc.draft.formData);
        setEditingDocId(null);
        setCurrentStep(doc.draft.currentStep ?? 0);
        if (doc.draft.selectedTemplate) {
          setSelectedTemplate(doc.draft.selectedTemplate);
          navigate("editor");
        } else {
          sessionStorage.setItem("kriou_template_category", "resume");
          navigate("templates");
        }
      } else {
        setEditingDocId(null);
        setCurrentStep(0);
        navigate("editor");
      }
    } else if (doc.type === "legal" || (doc.draft && doc.documentType && doc.type !== "resume")) {
      if (doc.draft) {
        if (doc.draft.documentType) setDocumentType(doc.draft.documentType);
        if (doc.draft.selectedVariant) setSelectedVariant(doc.draft.selectedVariant);
        if (doc.draft.legalFormData) setLegalFormData(doc.draft.legalFormData);
        if (doc.draft.formData) setLegalFormData(doc.draft.formData); // compatibilidade com draft antigo
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
      title: isLocalDraftDocument(doc) ? "Excluir rascunho" : "Mover para a lixeira",
      message: isLocalDraftDocument(doc)
        ? `Deseja excluir o rascunho "${doc.title}"? Esta ação não pode ser desfeita.`
        : `Deseja mover "${doc.title}" para a lixeira? Você poderá restaurá-lo depois.`,
      confirmLabel: isLocalDraftDocument(doc) ? "Excluir rascunho" : "Mover para lixeira",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!confirmed) return;

    try {
      if (isLocalDraftDocument(doc)) {
        if (doc.type === "resume") await discardResumeDraft();
        else await discardLegalDraft();
      } else {
        const trashed = await DocumentService.moveToTrash(doc.id, userId);
        const updated = (userDocuments || []).map((item) =>
          item.id === doc.id ? { ...item, ...trashed } : item
        );
        setUserDocuments(updated);
        StorageService.saveDocuments(updated, userId);
        showToast.success("Documento movido para a lixeira.");
        return;
      }

      const updated = (userDocuments || []).filter((d) => d.id !== doc.id);
      setUserDocuments(updated);
      StorageService.saveDocuments(updated, userId);
      showToast.success("Rascunho excluído definitivamente.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] exclusao nao confirmada:", err.message);
      showToast.error("Não foi possível excluir o documento. Ele continua na sua lista.");
    }
  };

  const handleRestoreDocument = async (doc) => {
    try {
      await DocumentService.restoreFromTrash(doc.id, userId);
      const updated = (userDocuments || []).map((item) =>
        item.id === doc.id ? { ...item, deletedAt: null, deletedBy: null } : item
      );
      setUserDocuments(updated);
      StorageService.saveDocuments(updated, userId);
      showToast.success("Documento restaurado.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] restauracao nao confirmada:", err.message);
      showToast.error("Não foi possível restaurar o documento.");
    }
  };

  const handlePermanentDeleteDocument = async (doc) => {
    const confirmed = await requestConfirm({
      title: "Excluir definitivamente",
      message: `Deseja apagar "${doc.title}" permanentemente? Esta ação não pode ser desfeita.`,
      confirmLabel: "Excluir definitivamente",
      cancelLabel: "Cancelar",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await DocumentService.remove(doc.id, userId);
      const updated = (userDocuments || []).filter((item) => item.id !== doc.id);
      setUserDocuments(updated);
      StorageService.saveDocuments(updated, userId);
      showToast.success("Documento excluído definitivamente.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] exclusao definitiva nao confirmada:", err.message);
      showToast.error("Não foi possível excluir definitivamente.");
    }
  };

  const handleDownloadPDF = useCallback(async (doc) => {
    try {
      if (!canDownloadDocument(doc, profile)) {
        showToast.error("PDF liberado somente após pagamento aprovado.");
        return;
      }

      await DocumentAccessService.authorizeDownload(doc.id);

      if (doc.type === "resume") {
        const template = doc.templateId
          ? { id: doc.templateId, name: doc.templateName || "Modelo", color: doc.template?.color, accent: doc.template?.accent }
          : null;
        await generatePDF({ type: "GENERATE_RESUME", formData: doc.formData, template });
      } else {
        const docType = { id: doc.documentType, name: doc.documentTypeName };
        await generatePDF({
          type: "GENERATE_LEGAL",
          formData: doc.legalData,
          docType,
          disabledFields: {},
          variantId: doc.variantId,
        });
      }
    } catch (err) {
      console.error("[DashboardPage][ERRO] handleDownloadPDF:", err.message);
      showToast.error("Erro ao gerar PDF. Tente novamente.");
    }
  }, [generatePDF, profile]);

  const handlePrintPDF = useCallback(async (doc) => {
    try {
      if (!canDownloadDocument(doc, profile)) {
        showToast.error("Impressão liberada somente após pagamento aprovado.");
        return;
      }

      await DocumentAccessService.authorizeDownload(doc.id);

      let arrayBuffer;
      if (doc.type === "resume") {
        const template = doc.templateId
          ? { id: doc.templateId, name: doc.templateName || "Modelo", color: doc.template?.color, accent: doc.template?.accent }
          : null;
        const { generateResumePDF } = await import("../utils/pdfGenerator");
        const pdf = generateResumePDF(doc.formData, template);
        arrayBuffer = pdf.output("arraybuffer");
      } else {
        const { generateLegalPDF } = await import("../utils/legalPdfGenerator");
        const docType = { id: doc.documentType, name: doc.documentTypeName };
        const pdf = generateLegalPDF(doc.legalData, docType, {}, doc.variantId);
        arrayBuffer = pdf.output("arraybuffer");
      }

      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      } else {
        showToast.error("Popup bloqueado. Permita popups para imprimir.");
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("[DashboardPage][ERRO] handlePrintPDF:", err.message);
      showToast.error("Erro ao gerar PDF para impressão.");
    }
  }, [profile]);

  const handleArchiveDocument = async (doc) => {
    const newArchived = !doc.archived;
    const updated = (userDocuments || []).map((d) =>
      d.id === doc.id ? { ...d, archived: newArchived } : d
    );
    setUserDocuments(updated);
    StorageService.saveDocuments(updated, userId);
    try {
      await DocumentService.setArchived(doc.id, userId, newArchived);
    } catch (err) {
      console.error("[DashboardPage][ERRO] Falha ao sincronizar archive:", err.message);
    }
    showToast.success(newArchived ? "Documento arquivado." : "Documento restaurado.");
  };

  const openRenameDialog = (doc) => {
    setRenameDoc(doc);
    setRenameTitle(doc.title || "");
  };

  const closeRenameDialog = () => {
    setRenameDoc(null);
    setRenameTitle("");
  };

  const handleRenameDocument = async (event) => {
    event?.preventDefault();
    const nextTitle = renameTitle.trim();
    if (!renameDoc || !nextTitle) return;
    setRenameBusy(true);

    const updated = (userDocuments || []).map((d) =>
      d.id === renameDoc.id ? { ...d, title: nextTitle, updatedAt: new Date().toISOString() } : d
    );
    setUserDocuments(updated);
    StorageService.saveDocuments(updated, userId);

    try {
      if (!isLocalDraftDocument(renameDoc)) {
        await DocumentService.rename(renameDoc.id, userId, nextTitle);
      }
      showToast.success("Documento renomeado.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] Falha ao renomear:", err.message);
      showToast.error("Renomeado localmente, mas não sincronizou com o servidor.");
    } finally {
      setRenameBusy(false);
      closeRenameDialog();
    }
  };

  const handleDuplicateDocument = async (doc) => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
    const copyTitle = `${doc.title || doc.documentTypeName || "Documento"} (Cópia)`;
    const docTypeKey = doc.documentType || doc.type || "documento";
    const copyCode = generateDocumentCode(userDocuments || [], docTypeKey);
    const duplicateDraft = doc.type === "resume"
      ? {
          formData: doc.formData || doc.draft?.formData || INITIAL_FORM_DATA,
          selectedTemplate: doc.templateId
            ? { id: doc.templateId, name: doc.templateName || "Modelo" }
            : doc.draft?.selectedTemplate || null,
          currentStep: 0,
        }
      : {
          documentType: doc.documentType
            ? { id: doc.documentType, name: doc.documentTypeName || "Documento" }
            : doc.draft?.documentType || null,
          selectedVariant: doc.variantId || doc.variant || doc.draft?.selectedVariant || null,
          legalFormData: doc.legalData || doc.draft?.legalFormData || doc.draft?.formData || {},
          disabledFields: doc.draft?.disabledFields || {},
          legalStep: 1,
        };

    const duplicate = {
      ...doc,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
      title: copyTitle,
      code: copyCode,
      status: "rascunho",
      paymentStatus: null,
      paymentId: null,
      paymentAmount: null,
      paidAt: null,
      paidIdentitySnapshot: null,
      sensitiveEditUsed: false,
      sensitiveEditUsedAt: null,
      sensitiveEditSummary: null,
      archived: false,
      date: dateLabel,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      draft: JSON.parse(JSON.stringify(duplicateDraft)),
      _duplicatedFrom: doc.id,
    };

    const insertLocalCopy = (copy) => {
      const updated = [copy, ...(userDocuments || [])];
      setUserDocuments(updated);
      StorageService.saveDocuments(updated, userId);
    };

    try {
      insertLocalCopy(duplicate);
      showToast.success("Documento copiado.");
    } catch (err) {
      console.error("[DashboardPage][ERRO] Falha ao duplicar:", err.message);
      insertLocalCopy(duplicate);
      showToast.error("Cópia criada localmente, mas não sincronizou com o servidor.");
    }
  };

  const getUserName = () => {
    const name = profile?.nome || formData.nome;
    return name ? name.split(" ")[0] : "Usuário";
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || "documentos";
  const activeDocs = allDocs.filter((doc) => !doc.deletedAt);
  const trashCount = allDocs.filter((doc) => doc.deletedAt).length;
  const isTrashView = archiveFilter === "lixeira";
  const paidCount = activeDocs.filter(isDocumentPaid).length;
  const pendingPaymentCount = activeDocs.filter(isDocumentPaymentPending).length;
  const draftCount = activeDocs.filter(isLocalDraftDocument).length;
  const logoTitle = (
    <span className="font-display text-2xl font-black tracking-tight">
      <span className="text-coral">Kriou</span>{" "}
      <span style={{ color: "var(--text)" }}>Docs</span>
    </span>
  );

  return (
    <AppShell>

      <AppNavbar
        title={logoTitle}
        maxWidth="var(--layout-dashboard-max)"
        rightAction={
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <IconButton
              icon="User"
              label="Perfil"
              onClick={() => navigate("profile")}
            />
            <button
              onClick={logout}
              aria-label="Sair"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 44,
                minHeight: 44,
                padding: "8px 14px",
                borderRadius: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60"
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--coral)"; e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name="LogOut" className="w-4 h-4" />
              <span style={{ display: "none" }} className="sm-dashboard-inline">Sair</span>
            </button>
          </div>
        }
      />

      {/* Global responsive style */}
      <style>{`.sm-dashboard-inline{display:inline!important}@media(max-width:639px){.sm-dashboard-inline{display:none!important}}`}</style>

      <PageContainer maxWidth="var(--layout-dashboard-max)">

        {/* ─── Welcome Section ─── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0 0 6px",
              }}>
                {getGreeting()}
              </p>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.625rem, 4vw, 2.25rem)",
                fontWeight: 800,
                color: "var(--text)",
                margin: 0,
                letterSpacing: "-0.025em",
                lineHeight: 1.15,
              }}>
                Olá,{" "}
                <span style={{ color: "var(--coral)" }}>
                  {getUserName()}
                </span>
              </h1>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--text-dim)",
                margin: "8px 0 0",
                lineHeight: 1.5,
              }}>
                {activeDocs.length === 0
                  ? "Crie seu primeiro documento profissional."
                  : `${activeDocs.length} documento${activeDocs.length !== 1 ? "s" : ""} no seu workspace`}
              </p>
            </div>

            {allDocs.length > 0 && (
              <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexWrap: "wrap" }}>
                <MetricCard compact
                  value={paidCount}
                  label={`pago${paidCount !== 1 ? "s" : ""}`}
                  accent="success"
                />
                <MetricCard compact
                  value={pendingPaymentCount}
                  label={`pendente${pendingPaymentCount !== 1 ? "s" : ""}`}
                  accent="warning"
                />
                <MetricCard compact
                  value={draftCount}
                  label={`rascunho${draftCount !== 1 ? "s" : ""}`}
                  accent="accent"
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── Contrato Personalizado CTA ─── */}
        <section style={{ marginBottom: 24 }}>
          <style>{`
            .wa-cta {
              display: flex; align-items: center; gap: 16;
              padding: 16px 18px; border-radius: 16px;
              background: linear-gradient(135deg, rgba(37,211,102,0.10) 0%, rgba(37,211,102,0.03) 100%);
              border: 1.5px solid rgba(37,211,102,0.20);
              text-decoration: none; transition: all 0.25s ease; cursor: pointer;
            }
            .wa-cta:active { transform: scale(0.99); }
            @media (max-width: 480px) {
              .wa-cta { flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; }
              .wa-cta-btn { width: 100% !important; justify-content: center !important; }
            }
          `}</style>
          <a
            href="https://wa.me/5591986450659?text=Ol%C3%A1!%20Gostaria%20de%20solicitar%20um%20contrato%20personalizado."
            target="_blank"
            rel="noopener noreferrer"
            className="wa-cta"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(37,211,102,0.40)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,211,102,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(37,211,102,0.20)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "rgba(37,211,102,0.15)", border: "1.5px solid rgba(37,211,102,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name="WhatsApp" className="w-5 h-5" style={{ color: "#25D366" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
                  color: "var(--text)", margin: "0 0 3px", letterSpacing: "-0.02em",
                }}>
                  Precisa de um contrato personalizado?
                </h3>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: 14,
                  color: "var(--text-dim)", margin: 0, lineHeight: 1.5,
                }}>
                  Receba um documento sob medida via WhatsApp.
                </p>
              </div>
            </div>
            <div className="wa-cta-btn" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
              borderRadius: 12, background: "var(--action-whatsapp)", color: "var(--on-action)",
              fontFamily: "var(--font-body)", fontWeight: 700,
              fontSize: 14, whiteSpace: "nowrap", flexShrink: 0, border: "none",
            }}>
              <Icon name="WhatsApp" className="w-4 h-4" />
              Falar no WhatsApp
            </div>
          </a>
        </section>

        {/* ─── Command Bar ─── */}
        <section style={{ marginBottom: 32 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {/* Search row */}
            <div style={{
              position: "relative",
              width: "100%",
            }}>
              <Icon name="Search" style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                width: 18,
                height: 18,
                color: "var(--text-muted)",
                opacity: 0.6,
                pointerEvents: "none",
              }} />
              <input
                type="text"
                placeholder="Buscar por nome, CPF, RG ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--control-border)",
                  borderRadius: 16,
                  padding: "14px 16px 14px 48px",
                  fontSize: "1rem", /* 16px previne zoom no iOS */
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  color: "var(--text)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.25s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(244,63,94,0.45)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--control-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Action buttons row */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleCreateResume}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  minWidth: 44,
                  minHeight: 48,
                  padding: "13px 22px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  background: "var(--coral)",
                  color: "var(--on-action)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "-0.005em",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--action-accent-hover)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(244,63,94,0.4)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--coral)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(244,63,94,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Icon name="User" className="w-4 h-4" />
                Novo Currículo
              </button>
              <button
                onClick={handleCreateLegalDocument}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  minWidth: 44,
                  minHeight: 48,
                  padding: "13px 22px",
                  borderRadius: 14,
                  border: "1.5px solid rgba(212,175,55,0.25)",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--gold)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  letterSpacing: "-0.005em",
                  transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.08)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,175,55,0.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Icon name="FileText" className="w-4 h-4" />
                Novo Documento
              </button>
              <button
                type="button"
                onClick={() => {
                  setArchiveFilter("lixeira");
                  setActiveTab("todos");
                  setStatusFilter("todos");
                  setSearchQuery("");
                }}
                aria-pressed={archiveFilter === "lixeira"}
                style={{
                  flex: "1 1 160px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minWidth: 44,
                  minHeight: 48,
                  padding: "13px 18px",
                  borderRadius: 14,
                  border: archiveFilter === "lixeira" ? "1.5px solid var(--danger)" : "1px solid var(--control-border)",
                  cursor: "pointer",
                  background: archiveFilter === "lixeira"
                    ? "color-mix(in srgb, var(--danger) 12%, var(--surface))"
                    : "var(--surface)",
                  color: archiveFilter === "lixeira" ? "var(--danger)" : "var(--text-dim)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                }}
              >
                <Icon name="Trash2" className="w-4 h-4" />
                Lixeira{trashCount > 0 ? ` (${trashCount})` : ""}
              </button>
            </div>
          </div>

          {/* Filters */}
          {allDocs.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              marginTop: 10,
            }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Arquivo
                </span>
                <select
                  value={archiveFilter}
                  onChange={(e) => setArchiveFilter(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    borderRadius: 12,
                    border: "1px solid var(--control-border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    padding: "0 12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                  }}
                >
                  <option value="ativos">Ativos</option>
                  <option value="arquivados">Arquivados ({allDocs.filter(d => d.archived).length})</option>
                  <option value="lixeira">Lixeira ({trashCount})</option>
                  <option value="todos">Todos</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    borderRadius: 12,
                    border: "1px solid var(--control-border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    padding: "0 12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                  }}
                >
                  <option value="todos">Todos</option>
                  <option value="pagos">Pagos</option>
                  <option value="pagamento_pendente">Pagamento pendente</option>
                  <option value="nao_pagos">Não pagos</option>
                  <option value="rascunhos">Rascunhos</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Ordenar
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    borderRadius: 12,
                    border: "1px solid var(--control-border)",
                    background: "var(--surface)",
                    color: "var(--text)",
                    padding: "0 12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                  }}
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="antigos">Mais antigos</option>
                  <option value="titulo">Titulo</option>
                  <option value="tipo">Tipo</option>
                </select>
              </label>
            </div>
          )}
        </section>

        {/* ─── Tabs ─── */}
        {allDocs.length > 0 && (
          <nav aria-label="Filtrar documentos" className="tab-scroll" style={{ marginBottom: 24 }}>
            {visibleTabs.map((tab) => {
              const countBase = allDocs
                .filter((d) => archiveFilter === "lixeira"
                  ? Boolean(d.deletedAt)
                  : !d.deletedAt && (archiveFilter === "ativos" ? !d.archived : archiveFilter === "arquivados" ? d.archived : true))
                .filter((d) => matchesDocumentPaymentFilter(d, statusFilter));
              const count = tab.id === "todos" ? countBase.length :
                tab.filterType === "type" ? countBase.filter(d => d.type === tab.id).length :
                tab.filterType === "documentType" ? countBase.filter(d => d.documentType === tab.id).length :
                0;
              if (count === 0 && tab.id !== "todos") return null;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    minWidth: 44,
                    minHeight: 44,
                    padding: "10px 18px",
                    borderRadius: 14,
                    border: isActive ? "none" : "1px solid transparent",
                    cursor: "pointer",
                    background: isActive ? "var(--coral)" : "var(--surface)",
                    color: isActive ? "var(--on-action)" : "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                    fontWeight: isActive ? 700 : 600,
                    fontSize: "0.875rem",
                    letterSpacing: "-0.005em",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isActive ? "0 4px 16px rgba(244,63,94,0.25)" : "none",
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60"
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--surface-2)";
                      e.currentTarget.style.color = "var(--text)";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--surface)";
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <Icon name={tab.icon} className="w-3.5 h-3.5" />
                  {tab.label}
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 22,
                    height: 22,
                    padding: "0 6px",
                    borderRadius: 8,
                    background: isActive ? "transparent" : "var(--surface-3)",
                    color: isActive ? "var(--on-action)" : "var(--text-muted)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    lineHeight: 1,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* ─── Content ─── */}
        {isLoading ? (
          <div>
            <section style={{ marginBottom: 32 }}>
              <Skeleton width={80} height={12} borderRadius={6} />
              <Skeleton width={200} height={32} borderRadius={10} delay={0.05} style={{ marginTop: 8 }} />
              <Skeleton width={160} height={14} delay={0.1} style={{ marginTop: 6 }} />
            </section>
            <section style={{ marginBottom: 28 }}>
              <Skeleton height={52} borderRadius={16} delay={0.12} />
            </section>
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} width={100} height={36} borderRadius={100} delay={i * 0.04} />
                ))}
              </div>
            </section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div style={{ columnCount: 1, columnGap: 16 }}>
            <style>{`
              @media (min-width: 640px) { .dash-cols { column-count: 2 !important; } }
              @media (min-width: 1024px) { .dash-cols { column-count: 3 !important; } }
            `}</style>
            <div className="dash-cols" style={{ columnCount: 1, columnGap: 16 }}>
              {filteredDocs.map((doc, index) => (
                <div key={doc.id} style={{ breakInside: "avoid", marginBottom: 16 }}>
                  <DocumentCard
                    doc={doc}
                    onClick={() => handleEditDocument(doc)}
                    onDelete={() => handleDeleteDocument(doc)}
                    onDownload={handleDownloadPDF}
                    onPay={sendDocumentToCheckout}
                    onPrint={handlePrintPDF}
                    onArchive={handleArchiveDocument}
                    onRename={() => openRenameDialog(doc)}
                    onDuplicate={() => handleDuplicateDocument(doc)}
                    onRestore={handleRestoreDocument}
                    onPermanentDelete={handlePermanentDeleteDocument}
                    unlimitedAccess={profile?.role === "admin"}
                    animationDelay={index * 0.04}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "80px 20px",
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
            }}>
              <Icon
                name={searchQuery.trim() ? "Search" : isTrashView ? "Trash2" : "FileText"}
                style={{ width: 34, height: 34, color: searchQuery.trim() ? "var(--text-muted)" : isTrashView ? "var(--danger)" : "var(--coral)" }}
              />
            </div>

            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
            }}>
              {searchQuery.trim()
                ? "Nenhum documento encontrado"
                : isTrashView ? "Sua lixeira está vazia" : "Ainda não há documentos"}
            </h2>

            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: "var(--text-muted)",
              maxWidth: 420,
              margin: "0 0 32px",
            }}>
              {searchQuery.trim()
                ? `Nenhum resultado para "${searchQuery}" em ${activeTabLabel.toLowerCase()}. Tente outro termo de busca.`
                : isTrashView
                  ? "Documentos movidos para a lixeira aparecem aqui e podem ser restaurados."
                  : "Seu workspace está pronto. Crie seu primeiro currículo profissional ou documento jurídico agora mesmo."}
            </p>

            {!searchQuery.trim() && isTrashView && (
              <button
                type="button"
                onClick={() => setArchiveFilter("ativos")}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  minWidth: 44, minHeight: 48, padding: "12px 20px", borderRadius: 14,
                  border: "1px solid var(--control-border)", cursor: "pointer",
                  background: "var(--surface)", color: "var(--text)",
                  fontFamily: "var(--font-body)", fontWeight: 800, fontSize: "0.875rem",
                }}
              >
                <Icon name="ArrowLeft" className="w-4 h-4" /> Voltar aos documentos
              </button>
            )}

            {!searchQuery.trim() && !isTrashView && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
                <button
                  onClick={handleCreateResume}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    minWidth: 44,
                    minHeight: 48,
                    padding: "14px 24px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    background: "var(--coral)",
                    color: "var(--on-action)",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "-0.005em",
                    transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: "0 4px 16px rgba(244,63,94,0.3)",
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--action-accent-hover)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(244,63,94,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--coral)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(244,63,94,0.3)";
                  }}
                >
                  <Icon name="User" className="w-5 h-5" />
                  Criar Currículo
                </button>
                <button
                  onClick={handleCreateLegalDocument}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    minWidth: 44,
                    minHeight: 48,
                    padding: "14px 24px",
                    borderRadius: 14,
                    border: "1.5px solid rgba(212,175,55,0.25)",
                    cursor: "pointer",
                    background: "transparent",
                    color: "var(--gold)",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "-0.005em",
                    transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212,175,55,0.08)";
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,175,55,0.12)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon name="FileText" className="w-5 h-5" />
                  Criar Documento Jurídico
                </button>
              </div>
            )}

            {searchQuery.trim() && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("todos");
                  setArchiveFilter("ativos");
                  setStatusFilter("todos");
                  setSortBy("recentes");
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 44,
                  minHeight: 44,
                  padding: "11px 22px",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background: "var(--surface-2)",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  letterSpacing: "-0.005em",
                  transition: "all 0.2s ease",
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-3)";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                  e.currentTarget.style.color = "var(--text-dim)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </PageContainer>

      <Modal
        open={Boolean(renameDoc)}
        title="Renomear arquivo"
        eyebrow="Documento"
        description="Escolha um nome claro para localizar este documento com facilidade."
        onClose={closeRenameDialog}
        onSubmit={handleRenameDocument}
        busy={renameBusy}
        initialFocusRef={renameInputRef}
        width={440}
        footer={(
          <>
            <Button variant="secondary" onClick={closeRenameDialog} disabled={renameBusy}>Cancelar</Button>
            <Button type="submit" disabled={!renameTitle.trim()} loading={renameBusy} loadingLabel="Salvando nome">
              Salvar nome
            </Button>
          </>
        )}
      >
        <Input
          ref={renameInputRef}
          label="Novo nome"
          required
          disabled={renameBusy}
          value={renameTitle}
          onChange={(event) => setRenameTitle(event.target.value)}
          containerStyle={{ marginBottom: 0 }}
        />
      </Modal>

      <ConfirmDialog
        {...confirmState}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AppShell>
  );
};

export default DashboardPage;
