import React, { useState } from "react";
import { Icon } from "../Icons";
import { Card, Button, Badge } from "../UI";

const LEVELS = {
  minimo: {
    id: "minimo",
    label: "Mínimo",
    icon: "Minus",
    color: "var(--text-muted)",
    desc: "Apenas campos obrigatórios para funcionar",
    badge: "bg-surface-2",
  },
  essencial: {
    id: "essencial",
    label: "Essencial",
    icon: "Check",
    color: "var(--gold)",
    desc: "O necessário para um documento seguro",
    badge: "rgba(249,168,37,0.15)",
  },
  completo: {
    id: "completo",
    label: "Completo",
    icon: "Star",
    color: "var(--coral)",
    desc: "Todos os campos para máxima proteção",
    badge: "rgba(233,69,96,0.12)",
  },
};

const RequirementsModal = ({ doc, variant, onClose }) => {
  const [selectedLevel, setSelectedLevel] = useState("essencial");

  if (!doc) return null;

  const spec = doc.spec || {};
  const requirements = getRequirementsByLevel(doc, selectedLevel);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          borderRadius: 24,
          maxWidth: 680,
          width: "100%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{
          padding: 28,
          background: `linear-gradient(145deg, ${LEVELS[selectedLevel].color}22 0%, ${LEVELS[selectedLevel].color}11 100%)`,
          borderBottom: `2px solid ${LEVELS[selectedLevel].color}33`,
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(0,0,0,0.1)",
              border: "none",
              borderRadius: 10,
              padding: 10,
              cursor: "pointer",
              color: "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            <Icon name="X" className="w-5 h-5" />
          </button>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `${LEVELS[selectedLevel].color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${LEVELS[selectedLevel].color}40`,
            }}>
              <Icon name="ClipboardList" className="w-7 h-7" style={{ color: LEVELS[selectedLevel].color }} />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", marginBottom: 4 }}>
                {doc.name}
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                {variant ? `${variant.icon} ${variant.name}` : "Verifique os requisitos"}
              </p>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}>
            {Object.values(LEVELS).map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                style={{
                  padding: "14px 16px",
                  background: selectedLevel === level.id ? level.color : "rgba(0,0,0,0.05)",
                  border: `2px solid ${selectedLevel === level.id ? level.color : "transparent"}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Icon name={level.icon} className="w-4 h-4" style={{ color: selectedLevel === level.id ? "white" : level.color }} />
                  <span style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: selectedLevel === level.id ? "white" : "var(--text)",
                  }}>
                    {level.label}
                  </span>
                </div>
                <p style={{
                  fontSize: 11,
                  color: selectedLevel === level.id ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
                  lineHeight: 1.3,
                }}>
                  {level.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            padding: "12px 16px",
            background: LEVELS[selectedLevel].badge,
            borderRadius: 12,
            border: `1px solid ${LEVELS[selectedLevel].color}22`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={LEVELS[selectedLevel].icon} className="w-5 h-5" style={{ color: LEVELS[selectedLevel].color }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
                {requirements.count} campos
              </span>
            </div>
            <Badge variant={selectedLevel === "minimo" ? "gray" : selectedLevel === "essencial" ? "gold" : "coral"}>
              {LEVELS[selectedLevel].label}
            </Badge>
          </div>

          {spec.whenUse && selectedLevel === "essencial" && (
            <div style={{
              padding: 16,
              background: "linear-gradient(135deg, rgba(0,210,211,0.08) 0%, rgba(108,99,255,0.08) 100%)",
              borderRadius: 14,
              border: "1px solid rgba(0,210,211,0.2)",
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="Lightbulb" className="w-5 h-5" style={{ color: "var(--teal)" }} />
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--teal)" }}>Quando usar este documento</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{spec.whenUse}</p>
            </div>
          )}

          {requirements.obligatorios.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                padding: "8px 12px",
                background: "rgba(233,69,96,0.08)",
                borderRadius: 8,
                borderLeft: "3px solid var(--coral)",
              }}>
                <Badge variant="coral" style={{ fontSize: 10 }}>OBRIGATÓRIO</Badge>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Não funciona sem estes</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.obrigatorios.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--coral)" />
                ))}
              </div>
            </div>
          )}

          {requirements.opcionais.length > 0 && selectedLevel !== "minimo" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                padding: "8px 12px",
                background: "rgba(0,210,211,0.08)",
                borderRadius: 8,
                borderLeft: "3px solid var(--teal)",
              }}>
                <Badge variant="teal" style={{ fontSize: 10 }}>OPCIONAL</Badge>
                {selectedLevel === "completo" && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Recomendado para máxima segurança</span>
                )}
                {selectedLevel === "essencial" && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Importantes para proteção completa</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.opcionais.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--teal)" />
                ))}
              </div>
            </div>
          )}

          {selectedLevel === "completo" && requirements.extras.length > 0 && (
            <div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                padding: "8px 12px",
                background: "rgba(249,168,37,0.08)",
                borderRadius: 8,
                borderLeft: "3px solid var(--gold)",
              }}>
                <Badge variant="gold" style={{ fontSize: 10 }}>EXTRAS</Badge>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Detalles para documents premium</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {requirements.extras.map((req, i) => (
                  <RequirementItem key={i} label={req} color="var(--gold)" />
                ))}
              </div>
            </div>
          )}

          {spec.requiredDocs && spec.requiredDocs.length > 0 && (
            <div style={{
              marginTop: 24,
              padding: 20,
              background: "var(--surface-2)",
              borderRadius: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="FileText" className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Documentos necessários</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {spec.requiredDocs.map((doc, i) => (
                  <span key={i} style={{
                    padding: "8px 14px",
                    background: "var(--surface-3)",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text)",
                  }}>
                    {doc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {spec.tips && spec.tips.length > 0 && selectedLevel !== "minimo" && (
            <div style={{
              marginTop: 20,
              padding: 20,
              background: "linear-gradient(135deg, rgba(0,200,151,0.06) 0%, rgba(0,210,211,0.06) 100%)",
              borderRadius: 14,
              border: "1px solid rgba(0,200,151,0.15)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Icon name="Sparkles" className="w-5 h-5" style={{ color: "var(--success)" }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--success)" }}>Dicas importantes</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {spec.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text)" }}>
                    <Icon name="Check" className="w-4 h-4" style={{ color: "var(--success)", flexShrink: 0, marginTop: 3 }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: 20,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 12,
        }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={() => window.print()}
            icon="Printer"
            style={{ flex: 1, background: LEVELS[selectedLevel].color }}
          >
            Imprimir Checklist
          </Button>
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

const RequirementItem = ({ label, color }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    background: "var(--surface-2)",
    borderRadius: 10,
    fontSize: 13,
    borderLeft: `3px solid ${color}`,
  }}>
    <Icon name="Circle" className="w-3 h-3" style={{ color, flexShrink: 0 }} />
    <span style={{ color: "var(--text)" }}>{label}</span>
  </div>
);

function getRequirementsByLevel(doc, level) {
  const sections = doc.commonSections || [];
  const variantSections = doc.variantSections || {};
  const allVariantSections = Object.values(variantSections).flat();

  const allFields = [
    ...sections.flatMap((s) => s.fields || []),
    ...allVariantSections.flatMap((s) => s.fields || []),
  ];

  const obrigatorios = allFields
    .filter((f) => f.required)
    .map((f) => `${f.label}`);

  const opcionais = allFields
    .filter((f) => !f.required && !f.disableable)
    .map((f) => `${f.label}`);

  const extras = allFields
    .filter((f) => f.disableable)
    .map((f) => `${f.label}`);

  switch (level) {
    case "minimo":
      return {
        obrigatorios: obrigatorios.slice(0, Math.ceil(obrigatorios.length * 0.5)),
        opcionais: [],
        extras: [],
        count: Math.ceil(obrigatorios.length * 0.5),
      };
    case "essencial":
      return {
        obrigatorios,
        opcionais: opcionais.slice(0, Math.ceil(opcionais.length * 0.6)),
        extras: [],
        count: obrigatorios.length + Math.ceil(opcionais.length * 0.6),
      };
    case "completo":
      return {
        obrigatorios,
        opcionais,
        extras,
        count: obrigatorios.length + opcionais.length + extras.length,
      };
    default:
      return { obrigatorios, opcionais: [], extras: [], count: obrigatorios.length };
  }
}

export default RequirementsModal;
