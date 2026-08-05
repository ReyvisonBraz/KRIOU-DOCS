/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox, Input, Select, Textarea } from "./form";

describe("controles de formulário", () => {
  it("gera ids únicos mesmo quando os rótulos se repetem", () => {
    render(
      <>
        <Input label="Nome" />
        <Input label="Nome" />
      </>,
    );

    const fields = screen.getAllByRole("textbox", { name: "Nome" });
    expect(fields[0].id).toBeTruthy();
    expect(fields[0].id).not.toBe(fields[1].id);
  });

  it("conecta descrição e erro ao campo sem descartar referência externa", () => {
    render(
      <>
        <span id="external-help">Ajuda externa</span>
        <Input
          label="CPF"
          description="Digite apenas números."
          error="CPF inválido."
          aria-describedby="external-help"
        />
      </>,
    );

    const field = screen.getByRole("textbox", { name: "CPF" });
    const describedBy = field.getAttribute("aria-describedby").split(" ");

    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(describedBy).toContain("external-help");
    expect(describedBy).toContain(`${field.id}-description`);
    expect(describedBy).toContain(`${field.id}-error`);
    expect(screen.getByRole("alert")).toHaveTextContent("CPF inválido.");
  });

  it("repassa required e disabled para os controles nativos", () => {
    render(
      <>
        <Input label="E-mail" required disabled />
        <Textarea label="Observações" required disabled />
        <Select label="Estado" required disabled options={["PA", "SP"]} />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "E-mail" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Observações" })).toBeRequired();
    expect(screen.getByRole("combobox", { name: "Estado" })).toBeDisabled();
  });

  it("mantém opções simples e estruturadas no select", () => {
    render(
      <Select
        label="Tipo"
        options={["Currículo", { value: "contrato", label: "Contrato" }]}
      />,
    );

    expect(screen.getByRole("option", { name: "Currículo" })).toHaveValue("Currículo");
    expect(screen.getByRole("option", { name: "Contrato" })).toHaveValue("contrato");
  });

  it("fornece checkbox nativo com área de toque, ajuda e erro associados", () => {
    render(
      <Checkbox
        label="Aceito os termos"
        description="Leia antes de continuar."
        error="Confirmação obrigatória."
        required
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Aceito os termos" });
    const describedBy = checkbox.getAttribute("aria-describedby").split(" ");

    expect(checkbox).toBeRequired();
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(getComputedStyle(checkbox.closest("label")).minHeight).toBe("44px");
    expect(describedBy).toContain(`${checkbox.id}-description`);
    expect(describedBy).toContain(`${checkbox.id}-error`);
  });
});
