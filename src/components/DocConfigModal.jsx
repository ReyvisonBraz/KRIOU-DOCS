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
import { Button } from "./UI";

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 16,
          padding: 28,
          maxWidth: 560,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            NOVO DOCUMENTO
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            ID: {currentDocument.id || "GERANDO..."}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label
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
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DOCUMENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    updateCurrentDocument("tipo", t.id);
                    updateCurrentDocument("partes", []);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: currentDocument.tipo === t.id ? "var(--coral)" : "var(--surface-2)",
                    color: currentDocument.tipo === t.id ? "white" : "var(--text)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: 6,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              Título do Documento *
            </label>
            <input
              className="input-field"
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
              style={errors.titulo ? { borderColor: "var(--coral)" } : {}}
            />
            {errors.titulo && (
              <div style={{ fontSize: 11, color: "var(--coral)", marginTop: 4 }}>
                {errors.titulo}
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                Partes Envolvidas *
              </label>
              <button
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
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Nome Completo
                        </label>
                        <input
                          className="input-field"
                          placeholder="Nome da parte"
                          value={parte.nome}
                          onChange={(e) => handleUpdateParte(parte.id, "nome", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          CPF
                        </label>
                        <input
                          className="input-field"
                          placeholder="000.000.000-00"
                          value={parte.cpf}
                          onChange={(e) => handleUpdateParte(parte.id, "cpf", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          RG
                        </label>
                        <input
                          className="input-field"
                          placeholder="00.000.000-0"
                          value={parte.rg}
                          onChange={(e) => handleUpdateParte(parte.id, "rg", e.target.value)}
                        />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Endereço
                        </label>
                        <input
                          className="input-field"
                          placeholder="Rua, número, bairro, cidade"
                          value={parte.endereco}
                          onChange={(e) => handleUpdateParte(parte.id, "endereco", e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>
                          Telefone
                        </label>
                        <input
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
              <div style={{ fontSize: 11, color: "var(--coral)", marginTop: 8 }}>
                {errors.partes}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={handleSave}>
            Continuar para o Editor
            <Icon name="ArrowRight" className="w-4 h-4" style={{ marginLeft: 8 }} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocConfigModal;
