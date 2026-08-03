import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { MetricsService } from "./MetricsService";

vi.mock("../lib/supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

describe("MetricsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("invoca admin-metrics com GET e período codificado", async () => {
    const metrics = { period: "30d", summary: { totalUsers: 2 } };
    supabase.functions.invoke.mockResolvedValue({ data: metrics, error: null });

    await expect(MetricsService.getMetrics("30d")).resolves.toEqual(metrics);
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      "admin-metrics?period=30d",
      { method: "GET" },
    );
  });

  it("propaga falha HTTP sem expor dados adicionais", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Falha ao carregar métricas" },
    });

    await expect(MetricsService.getMetrics()).rejects.toThrow(
      "Falha ao carregar métricas",
    );
  });
});
