/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RESUME_TEMPLATES } from "../data/constants";
import { TemplateCard } from "./TemplatesPage";

describe("TemplateCard", () => {
  const template = RESUME_TEMPLATES[0];

  it("expõe o card como artigo nomeado e ações como botões irmãos", () => {
    render(<TemplateCard template={template} onClick={vi.fn()} onViewSpec={vi.fn()} />);

    const article = screen.getByRole("article", { name: template.name });
    const useButton = screen.getByRole("button", { name: `Usar modelo ${template.name}` });
    const specButton = screen.getByRole("button", { name: `Ver ficha do modelo ${template.name}` });

    expect(article).toContainElement(useButton);
    expect(article).toContainElement(specButton);
    expect(article).not.toHaveAttribute("tabindex");
  });

  it("mantém as duas ações independentes", () => {
    const onClick = vi.fn();
    const onViewSpec = vi.fn();
    render(<TemplateCard template={template} onClick={onClick} onViewSpec={onViewSpec} />);

    fireEvent.click(screen.getByRole("button", { name: `Ver ficha do modelo ${template.name}` }));
    expect(onViewSpec).toHaveBeenCalledWith(template);
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: `Usar modelo ${template.name}` }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
