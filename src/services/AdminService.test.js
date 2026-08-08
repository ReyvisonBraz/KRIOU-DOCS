import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../lib/supabase";
import { AdminService } from "./AdminService";

vi.mock("../lib/supabase", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

describe("AdminService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getStats chama a action stats sem parâmetros extras", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: { totalUsers: 1 }, error: null });

    await AdminService.getStats();

    expect(supabase.functions.invoke).toHaveBeenCalledWith("admin", {
      body: { action: "stats" },
    });
  });

  it("getUsers usa os valores padrão quando nada é informado", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: { users: [], total: 0 }, error: null });

    await AdminService.getUsers();

    expect(supabase.functions.invoke).toHaveBeenCalledWith("admin", {
      body: { action: "users", page: 1, pageSize: 20, search: "" },
    });
  });

  it("getUsers repassa página, tamanho e busca informados", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: { users: [], total: 0 }, error: null });

    await AdminService.getUsers({ page: 3, pageSize: 10, search: "maria" });

    expect(supabase.functions.invoke).toHaveBeenCalledWith("admin", {
      body: { action: "users", page: 3, pageSize: 10, search: "maria" },
    });
  });

  it("getUserDocs exige um userId", () => {
    expect(() => AdminService.getUserDocs()).toThrow("userId é obrigatório");
  });

  it("getUserDocs envia o userId correto", async () => {
    supabase.functions.invoke.mockResolvedValue({ data: [], error: null });

    await AdminService.getUserDocs("user-1");

    expect(supabase.functions.invoke).toHaveBeenCalledWith("admin", {
      body: { action: "user-docs", userId: "user-1" },
    });
  });

  it("propaga erro de transporte", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "rede indisponível" },
    });

    await expect(AdminService.getStats()).rejects.toThrow("rede indisponível");
  });

  it("propaga erro devolvido pela função (ex.: 403 de não-admin)", async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { error: "Acesso restrito a administradores" },
      error: null,
    });

    await expect(AdminService.getStats()).rejects.toThrow("Acesso restrito a administradores");
  });
});
