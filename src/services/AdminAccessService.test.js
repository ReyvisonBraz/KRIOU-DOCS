import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.fn();
vi.mock("../lib/supabase", () => ({ supabase: { functions: { invoke } } }));

describe("AdminAccessService", () => {
  beforeEach(() => invoke.mockReset());

  it("gera operationId no cliente e envia somente o contrato esperado", async () => {
    vi.stubGlobal("crypto", { randomUUID: () => "11111111-1111-4111-8111-111111111111" });
    invoke.mockResolvedValue({ data: { changed: true }, error: null });
    const { AdminAccessService } = await import("./AdminAccessService");

    await AdminAccessService.changeRole({ targetUserId: "target", role: "support", reason: "Motivo administrativo" });

    expect(invoke).toHaveBeenCalledWith("admin-access", { body: {
      targetUserId: "target",
      role: "support",
      reason: "Motivo administrativo",
      operationId: "11111111-1111-4111-8111-111111111111",
    } });
    vi.unstubAllGlobals();
  });
});
