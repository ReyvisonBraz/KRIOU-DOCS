import { describe, expect, it, vi } from "vitest";
import {
  LOCAL_DATA_CLEANUP_COPY,
  clearLocalAccountData,
} from "./localDataCleanup";

describe("clearLocalAccountData", () => {
  it("limpa somente dados locais identificados e onboarding", () => {
    const storageService = { clearUserData: vi.fn(() => true) };
    const browserStorage = { removeItem: vi.fn() };

    expect(
      clearLocalAccountData({ userId: "user-1", storageService, browserStorage }),
    ).toBe(true);
    expect(storageService.clearUserData).toHaveBeenCalledWith("user-1");
    expect(browserStorage.removeItem).toHaveBeenCalledWith(
      "kriou_onboarding_user-1_seen",
    );
  });

  it("não anuncia nem executa exclusão de conta no servidor", () => {
    expect(LOCAL_DATA_CLEANUP_COPY.description).toContain(
      "continuam armazenados no servidor",
    );
    expect(LOCAL_DATA_CLEANUP_COPY.trigger).not.toMatch(/excluir|apagar/i);
  });

  it("não altera armazenamento sem usuário", () => {
    const storageService = { clearUserData: vi.fn() };
    expect(clearLocalAccountData({ userId: null, storageService })).toBe(false);
    expect(storageService.clearUserData).not.toHaveBeenCalled();
  });

  it("preserva onboarding quando a limpeza principal falha", () => {
    const storageService = { clearUserData: vi.fn(() => false) };
    const browserStorage = { removeItem: vi.fn() };

    expect(
      clearLocalAccountData({ userId: "user-1", storageService, browserStorage }),
    ).toBe(false);
    expect(browserStorage.removeItem).not.toHaveBeenCalled();
  });
});
