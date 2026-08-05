/**
 * ============================================
 * KRIOU DOCS - Document Configuration Modal
 * ============================================
 * Modal for setting document ID, title, and parties
 * before editing begins.
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "./Icons";
import { Button, Input, Modal } from "./UI";

const DOCUMENT_TYPES = [
  { id: "curriculo", label: "Currículo", icon: "FileText" },
  { id: "compra-venda", label: "Compra/Venda", icon: "FileText" },
  { id: "locacao", label: "Locação", icon: "Home" },
  { id: "procuracao", label: "Procuração", icon: "Shield" },
  { id: "doacao", label: "Doação", icon: "Award" },
];

const PARTES_PAPEL = {
  curriculo: ["Candidato"],
  "compra-venda": ["Vendedor", "Comprador"],
  locacao: ["Locador", "Locatário"],
  procuracao: ["Outorgante", "Outorgado"],
  doacao: ["Doador", "Donatário"],
};

export const DocConfigModal = () => {
  const {
    currentDocument,
    updateCurrentDocument,
    addParte,
    removeParte,
    finalizeDocConfig,
    showDocConfig,
  } = useApp();

  const [errors, setErrors] = useState({});

  if (!showDocConfig) return null;

  const handleSave = () => {
    const newErrors = {};
    if (!currentDocument.titulo.trim()) {
      newErrors.titulo = "Dê um título ao documento";
    }
    if (currentDocument.partes.length === 0) {
      newErrors.partes = "Adicione pelo menos uma parte";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    finalizeDocConfig();
  };

  const handleAddParte = () => {
    const tipo = currentDocument.tipo;
    const PapeisDisponiveis = PARTES_PAPEL[tipo] || ["Parte"];
    const existingPapeis = currentDocument.partes.map((p) => p.papel);
    const nextPapel = PapeisDisponiveis.find((p) => !existingPapeis.includes(p)) || PapeisDisponiveis[0];

    addParte({
      papel: nextPapel,
      nome: "",
      cpf: "",
      rg: "",
      endereco: "",
      telefone: "",
    });
  };

  const handleUpdateParte = (parteId, field, value) => {
    const updatedPartes = currentDocument.partes.map((p) =>
      p.id === parteId ? { ...p, [field]: value } : p
    );
    updateCurrentDocument("partes", updatedPartes);
  };

  const PapeisDisponiveis = PARTES_PAPEL[currentDocument.tipo] || ["Parte"];

  return (
    <Modal
      open
      title="Configurar novo documento"
      eyebrow="Novo documento"
      description={`ID: ${currentDocument.id || "Gerando…"}`}
      dismissible={false}
      width={620}
      footer={(
        <Button variant="primary" onClick={handleSave} icon="ArrowRight" iconPosition="right">
          Continuar para o editor
        </Button>
      )}
    >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
            <legend
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 6,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              Tipo de Documento
            </legend>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DOCUMENT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  aria-pressed={currentDocument.tipo === t.id}
                  onClick={() => {
                    updateCurrentDocument("tipo", t.id);
                    updateCurrentDocument("partes", []);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: currentDocument.tipo === t.id ? "var(--coral)" : "var(--surface-2)",
                    color: currentDocument.tipo === t.id ? "var(--on-action)" : "var(--text)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <Input
              label="Título do documento"
              required
              placeholder={
                currentDocument.tipo === "curriculo"
                  ? "Ex: Currículo - Desenvolvedor Backend"
                  : "Ex: Contrato Compra/Venda - Imóvel Rua X"
              }
              value={currentDocument.titulo}
              onChange={(e) => {
                updateCurrentDocument("titulo", e.target.value);
                setErrors((prev) => ({ ...prev, titulo: null }));
              }}
              error={errors.titulo}
              containerStyle={{ marginBottom: 0 }}
            />

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Partes Envolvidas *
              </h3>
              <button
                type="button"
                onClick={handleAddParte}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--teal)",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="Plus" className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {currentDocument.partes.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  border: "2px dashed var(--border)",
                  borderRadius: 12,
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                Nenhuma parte adicionada. Clique em "Adicionar" para incluir.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {currentDocument.partes.map((parte) => (
                  <div
                    key={parte.id}
                    style={{
                      padding: 16,
                      background: "var(--surface-2)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral)" }}>
                        {parte.papel}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeParte(parte.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Remover
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor={`parte-${parte.id}-nome`} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Nome Completo
                        </label>
                        <input
                          id={`parte-${parte.id}-nome`}
                          className="input-field"
                          placeholder="Nome da parte"
                          value={parte.nome}
                          onChange={(e) => handleUpdateParte(parte.id, "nome", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`parte-${parte.id}-cpf`} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          CPF
                        </label>
                        <input
                          id={`parte-${parte.id}-cpf`}
                          className="input-field"
                          placeholder="000.000.000-00"
                          value={parte.cpf}
                          onChange={(e) => handleUpdateParte(parte.id, "cpf", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`parte-${parte.id}-rg`} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          RG
                        </label>
                        <input
                          id={`parte-${parte.id}-rg`}
                          className="input-field"
                          placeholder="00.000.000-0"
                          value={parte.rg}
                          onChange={(e) => handleUpdateParte(parte.id, "rg", e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label htmlFor={`parte-${parte.id}-endereco`} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Endereço
                        </label>
                        <input
                          id={`parte-${parte.id}-endereco`}
                          className="input-field"
                          placeholder="Rua, número, bairro, cidade"
                          value={parte.endereco}
                          onChange={(e) => handleUpdateParte(parte.id, "endereco", e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`parte-${parte.id}-telefone`} style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Telefone
                        </label>
                        <input
                          id={`parte-${parte.id}-telefone`}
                          className="input-field"
                          placeholder="(00) 00000-0000"
                          value={parte.telefone}
                          onChange={(e) => handleUpdateParte(parte.id, "telefone", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.partes && (
              <div role="alert" style={{ fontSize: 11, color: "var(--coral)", marginTop: 8 }}>
                {errors.partes}
              </div>
            )}
          </div>
        </div>

    </Modal>
  );
};

export default DocConfigModal;
