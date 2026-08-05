/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LegalDocSpecModal, TemplateSpecModal } from "./TemplateDetailsDrawers";

describe("TemplateDetailsDrawers", () => {
  it("mostra a ficha do modelo e mantém a seleção como ação explícita", () => {
    const template = {
      name: "Executivo",
      desc: "Modelo profissional",
      color: "#112233",
      accent: "#445566",
      spec: { target: "Lideranças", bestFor: ["Gestão"], sections: ["Experiência"], tips: ["Seja objetivo"] },
    };
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<TemplateSpecModal template={template} onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByRole("dialog", { name: "Executivo" })).toBeVisible();
    expect(screen.getByText("Lideranças")).toBeVisible();
    expect(screen.getByText("Seja objetivo")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Usar este modelo" }));
    expect(onSelect).toHaveBeenCalledWith(template);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("organiza requisitos jurídicos e pontos de atenção", () => {
    const doc = {
      name: "Contrato de locação",
      description: "Formaliza o aluguel",
      legislation: "Lei do Inquilinato",
      variants: [{ id: "residencial", icon: "🏠", name: "Residencial" }],
      spec: {
        whenUse: "Ao alugar um imóvel",
        parties: ["Locador", "Locatário"],
        requiredDocs: ["RG e CPF"],
        commonIssues: ["Prazo não definido"],
      },
    };
    const onCreate = vi.fn();
    render(<LegalDocSpecModal doc={doc} colors={{ accent: "#0F766E" }} onCreate={onCreate} onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Contrato de locação" })).toBeVisible();
    expect(screen.getByText("Lei do Inquilinato")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Prazo não definido");
    fireEvent.click(screen.getByRole("button", { name: "Criar documento" }));
    expect(onCreate).toHaveBeenCalledWith(doc);
  });
});
