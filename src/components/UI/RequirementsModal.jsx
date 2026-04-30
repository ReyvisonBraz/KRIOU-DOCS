import React, { useState } from "react";
import { Icon } from "../Icons";
import { Card, Button, Badge } from "../UI";

const RequirementsModal = ({ doc, variant, onClose }) => {
  if (!doc) return null;

  const spec = doc.spec || {};
  const requirements = spec.requirements || getDefaultRequirements(doc);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          borderRadius: 20,
          maxWidth: 700,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{
          padding: 24,
          background: "linear-gradient(145deg, var(--teal) 0%, #008B8B 100%)",
          position: "sticky",
          top: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 4 }}>
                {doc.name}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                {variant ? `${variant.icon} ${variant.name}` : "Requisitos para este documento"}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: "white",
              }}
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {spec.whenUse && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                Quando usar este documento
              </h3>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{spec.whenUse}</p>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              Partes envolvidas
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {(spec.parties || []).map((party, i) => (
                <span key={i} style={{
                  padding: "8px 16px",
                  background: "var(--surface-2)",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <Icon name="User" className="w-4 h-4" style={{ color: "var(--teal)" }} />
                  {party}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              Documentos necessários
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(spec.requiredDocs || []).map((doc, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 12,
                  background: "var(--surface-2)",
                  borderRadius: 10,
                  fontSize: 13,
                }}>
                  <Icon name="FileText" className="w-4 h-4" style={{ color: "var(--coral)", flexShrink: 0 }} />
                  {doc}
                </div>
              ))}
            </div>
          </div>

          {requirements.essentials.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Badge variant="coral">OBRIGATÓRIO</Badge>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                  Campos essenciais
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {requirements.essentials.map((req, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(233,69,96,0.08)",
                    borderRadius: 8,
                    borderLeft: "3px solid var(--coral)",
                    fontSize: 13,
                  }}>
                    <Icon name="AlertCircle" className="w-4 h-4" style={{ color: "var(--coral)", flexShrink: 0 }} />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requirements.optional.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Badge variant="teal">OPCIONAL</Badge>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", margin: 0 }}>
                  Campos opcionais
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {requirements.optional.map((req, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(0,210,211,0.08)",
                    borderRadius: 8,
                    borderLeft: "3px solid var(--teal)",
                    fontSize: 13,
                  }}>
                    <Icon name="Circle" className="w-4 h-4" style={{ color: "var(--teal)", flexShrink: 0 }} />
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: 16,
            background: "var(--surface-1)",
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Dicas importantes
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(spec.tips || []).map((tip, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text)",
                }}>
                  <Icon name="Check" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Fechar
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.print()}
              icon="Printer"
              style={{ flex: 1 }}
            >
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

function getDefaultRequirements(doc) {
  const essentials = [];
  const optional = [];
  const sections = doc.commonSections || [];
  const variantSections = doc.variantSections || {};

  Object.values(variantSections).forEach((vars) => {
    vars.forEach((section) => {
      section.fields?.forEach((f) => {
        if (f.required) {
          essentials.push(`${section.title}: ${f.label}`);
        }
      });
    });
  });

  sections.forEach((section) => {
    section.fields?.forEach((f) => {
      if (!f.required) {
        optional.push(`${section.title}: ${f.label}`);
      }
    });
  });

  return { essentials, optional };
}

export default RequirementsModal;
