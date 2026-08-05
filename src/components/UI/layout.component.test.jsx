/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppNavbar, AppShell, PageContainer } from "./layout";

describe("contratos de layout", () => {
  it("estrutura a página com shell e região principal semântica", () => {
    render(
      <AppShell data-testid="shell">
        <PageContainer>Conteúdo</PageContainer>
      </AppShell>,
    );

    expect(screen.getByTestId("shell")).toHaveStyle({ minHeight: "100dvh" });
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo");
    expect(screen.getByRole("main")).toHaveStyle({
      maxWidth: "var(--layout-content-max)",
      boxSizing: "border-box",
    });
  });

  it("permite adaptar container e largura do cabeçalho por contexto", () => {
    render(
      <>
        <AppNavbar title="Painel" maxWidth="72rem" />
        <PageContainer as="section" aria-label="Resumo" maxWidth="64rem">
          Métricas
        </PageContainer>
      </>,
    );

    expect(screen.getByRole("banner")).toHaveTextContent("Painel");
    expect(screen.getByRole("banner").firstElementChild).toHaveStyle({ maxWidth: "72rem" });
    expect(screen.getByRole("region", { name: "Resumo" })).toHaveStyle({ maxWidth: "64rem" });
  });
});
