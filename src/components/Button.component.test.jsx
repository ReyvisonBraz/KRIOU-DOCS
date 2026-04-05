/**
 * ============================================
 * KRIOU DOCS - Testes: Button component
 * ============================================
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./UI";

describe("Button", () => {
  it("renderiza o texto filho", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
  });

  it("chama onClick ao clicar", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clique</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("não chama onClick quando desabilitado", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Desabilitado</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("aplica classe btn-primary por padrão", () => {
    render(<Button>Primário</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it("aplica classe btn-secondary para variant secondary", () => {
    render(<Button variant="secondary">Secundário</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-secondary");
  });

  it("aplica className extra quando fornecido", () => {
    render(<Button className="minha-classe">Extra</Button>);
    expect(screen.getByRole("button")).toHaveClass("minha-classe");
  });

  it("aplica atributo disabled quando disabled=true", () => {
    render(<Button disabled>Bloqueado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("não tem disabled quando disabled=false (padrão)", () => {
    render(<Button>Ativo</Button>);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("renderiza ícone à esquerda por padrão quando icon fornecido", () => {
    render(<Button icon="Plus">Com Ícone</Button>);
    const button = screen.getByRole("button");
    // Ícone SVG deve estar presente antes do texto
    const svgs = button.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renderiza ícone à direita quando iconPosition='right'", () => {
    render(<Button icon="Plus" iconPosition="right">Direita</Button>);
    const button = screen.getByRole("button");
    expect(button.querySelectorAll("svg").length).toBeGreaterThan(0);
  });

  it("aplica style customizado", () => {
    render(<Button style={{ width: "200px" }}>Estilizado</Button>);
    expect(screen.getByRole("button")).toHaveStyle({ width: "200px" });
  });

  it("passa props extras para o elemento button", () => {
    render(<Button aria-label="ação especial">Acessível</Button>);
    expect(screen.getByRole("button", { name: "ação especial" })).toBeInTheDocument();
  });
});
