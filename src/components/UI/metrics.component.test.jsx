/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricCard } from "./metrics";

describe("MetricCard", () => {
  it("nomeia o indicador com rótulo e valor", () => {
    render(<MetricCard label="Documentos" value={12} sub="3 no período" accent="success" />);

    expect(screen.getByRole("group", { name: "Documentos: 12" })).toHaveTextContent("3 no período");
  });

  it("oferece versão compacta para resumos", () => {
    render(<MetricCard compact label="pagos" value={2} accent="success" />);

    expect(screen.getByRole("group", { name: "pagos: 2" })).toHaveClass("bento-stat");
  });

  it("anuncia carregamento sem expor o skeleton decorativo", () => {
    render(<MetricCard label="Receita" value="R$ 0" isLoading />);

    const metric = screen.getByRole("group", { name: "Receita: carregando" });
    expect(metric).toHaveAttribute("aria-busy", "true");
  });
});
