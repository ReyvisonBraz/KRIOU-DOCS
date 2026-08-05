/** @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./primitives";

describe("Badge", () => {
  it.each(["info", "success", "warning", "danger"])(
    "renderiza a variante semântica %s",
    (variant) => {
      render(<Badge variant={variant}>Em análise</Badge>);

      expect(screen.getByText("Em análise")).toHaveStyle({
        color: `var(--status-${variant})`,
      });
    },
  );

  it("mantém aliases legados durante a migração", () => {
    render(<Badge variant="teal">Concluído</Badge>);

    expect(screen.getByText("Concluído")).toHaveStyle({ color: "var(--status-success)" });
  });
});
