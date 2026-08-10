/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StorageService from "./storage";

beforeEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("StorageService documentos", () => {
  it("isola documentos por usuário", () => {
    expect(StorageService.saveDocuments([{ id: "a" }], "user-a")).toBe(true);
    expect(StorageService.saveDocuments([{ id: "b" }], "user-b")).toBe(true);

    expect(StorageService.loadDocuments("user-a")).toEqual([{ id: "a" }]);
    expect(StorageService.loadDocuments("user-b")).toEqual([{ id: "b" }]);
    expect(StorageService.loadDocuments()).toEqual([]);
  });

  it("não derruba a aplicação quando o JSON local está corrompido", () => {
    localStorage.setItem("kriou_user_user-a_documents", "{invalido");
    expect(StorageService.loadDocuments("user-a")).toEqual([]);
  });

  it("adiciona, atualiza e remove mantendo o restante da coleção", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T12:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0.12345);

    const created = StorageService.addDocument({ title: "Original" }, "user-a");
    expect(created).toEqual(expect.objectContaining({
      title: "Original",
      createdAt: "2026-08-10T12:00:00.000Z",
      updatedAt: "2026-08-10T12:00:00.000Z",
    }));
    expect(created.id).toBeTruthy();

    expect(StorageService.updateDocument(created.id, { title: "Atualizado" }, "user-a")).toBe(true);
    expect(StorageService.loadDocuments("user-a")[0].title).toBe("Atualizado");
    expect(StorageService.updateDocument("inexistente", {}, "user-a")).toBe(false);

    expect(StorageService.deleteDocument(created.id, "user-a")).toBe(true);
    expect(StorageService.loadDocuments("user-a")).toEqual([]);
  });
});

describe("StorageService rascunhos", () => {
  it("separa rascunho por usuário e tipo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T12:00:00.000Z"));

    expect(StorageService.saveDraft({ nome: "Ana" }, "user-a", "resume")).toBe(true);
    expect(StorageService.saveDraft({ cidade: "Belém" }, "user-a", "legal")).toBe(true);
    expect(StorageService.saveDraft({ nome: "Visitante" }, null, "resume")).toBe(true);

    expect(StorageService.loadDraft("user-a", "resume")).toEqual(expect.objectContaining({
      nome: "Ana",
      draftType: "resume",
      savedAt: "2026-08-10T12:00:00.000Z",
    }));
    expect(StorageService.loadDraft("user-a", "legal").cidade).toBe("Belém");
    expect(StorageService.loadDraft(null, "resume").nome).toBe("Visitante");
  });

  it("limpa apenas o rascunho solicitado", () => {
    StorageService.saveDraft({ nome: "Ana" }, "user-a", "resume");
    StorageService.saveDraft({ cidade: "Belém" }, "user-a", "legal");

    expect(StorageService.clearDraft("user-a", "resume")).toBe(true);
    expect(StorageService.loadDraft("user-a", "resume")).toBeNull();
    expect(StorageService.loadDraft("user-a", "legal")).not.toBeNull();
  });
});

describe("StorageService sessão legada", () => {
  it("carrega a sessão pedida e descobre a sessão ativa mais recente", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-10T10:00:00.000Z"));
    StorageService.saveSession({ userId: "user-a", isAuthenticated: true });

    vi.setSystemTime(new Date("2026-08-10T11:00:00.000Z"));
    StorageService.saveSession({ userId: "user-b", isAuthenticated: true });

    expect(StorageService.loadSession("user-a")).toEqual(expect.objectContaining({ userId: "user-a" }));
    expect(StorageService.loadSession()).toEqual(expect.objectContaining({ userId: "user-b" }));
  });

  it("ignora entradas de sessão malformadas durante a descoberta", () => {
    localStorage.setItem("kriou_user_quebrado_session", "{json");
    localStorage.setItem("kriou_user_valido_session", JSON.stringify({
      userId: "valido",
      isAuthenticated: true,
      lastActive: "2026-08-10T12:00:00.000Z",
    }));

    expect(StorageService.loadSession()).toEqual(expect.objectContaining({ userId: "valido" }));
  });

  it("remove a sessão isolada do usuário", () => {
    StorageService.saveSession({ userId: "user-a", isAuthenticated: true });
    StorageService.saveSession({ userId: "user-b", isAuthenticated: true });

    expect(StorageService.clearSession("user-a")).toBe(true);
    expect(StorageService.loadSession("user-a")).toBeNull();
    expect(StorageService.loadSession("user-b")).not.toBeNull();
  });
});

describe("StorageService compatibilidade legada", () => {
  it("persiste e recupera os dois formulários legados", () => {
    expect(StorageService.saveFormData({ nome: "Ana" })).toBe(true);
    expect(StorageService.loadFormData()).toEqual({ nome: "Ana" });
    expect(StorageService.saveLegalFormData({ cidade: "Belém" })).toBe(true);
    expect(StorageService.loadLegalFormData()).toEqual({ cidade: "Belém" });

    expect(StorageService.clearLegalFormData()).toBe(true);
    expect(StorageService.loadLegalFormData()).toBeNull();
  });

  it("retorna fallback quando um formulário legado está corrompido", () => {
    localStorage.setItem("kriou_docs_form_data", "{invalido");
    localStorage.setItem("kriou_docs_legal_form_data", "{invalido");

    expect(StorageService.loadFormData()).toBeNull();
    expect(StorageService.loadLegalFormData()).toBeNull();
  });

  it("persiste página e preferências de template", () => {
    expect(StorageService.savePage("dashboard")).toBe(true);
    expect(StorageService.loadPage()).toBe("dashboard");
    expect(StorageService.clearPage()).toBe(true);
    expect(StorageService.loadPage()).toBeNull();

    expect(StorageService.saveTemplatePreferences({ modelo: "moderno" })).toBe(true);
    expect(StorageService.loadTemplatePreferences()).toEqual({ modelo: "moderno" });
  });

  it("remove as chaves-base sem afetar dados externos", () => {
    StorageService.saveFormData({ nome: "Ana" });
    StorageService.saveLegalFormData({ cidade: "Belém" });
    StorageService.savePage("dashboard");
    StorageService.saveTemplatePreferences({ modelo: "moderno" });
    localStorage.setItem("outra_app", "preservar");

    expect(StorageService.clearAll()).toBe(true);
    expect(StorageService.loadFormData()).toBeNull();
    expect(StorageService.loadLegalFormData()).toBeNull();
    expect(StorageService.loadPage()).toBeNull();
    expect(StorageService.loadTemplatePreferences()).toBeNull();
    expect(localStorage.getItem("outra_app")).toBe("preservar");
  });
});

describe("StorageService limpeza e migração", () => {
  it("remove todos os dados do usuário alvo sem tocar em outro usuário", () => {
    StorageService.saveDocuments([{ id: "a" }], "user-a");
    StorageService.saveDraft({ nome: "Ana" }, "user-a", "resume");
    StorageService.saveDraft({ cidade: "Belém" }, "user-a", "legal");
    StorageService.saveSession({ userId: "user-a", isAuthenticated: true });
    StorageService.saveDocuments([{ id: "b" }], "user-b");

    expect(StorageService.clearUserData("user-a")).toBe(true);
    expect(StorageService.getUserData("user-a")).toEqual({
      session: null,
      documents: [],
      draftResume: null,
      draftLegal: null,
    });
    expect(StorageService.loadDocuments("user-b")).toEqual([{ id: "b" }]);
  });

  it("migra dados legados para as chaves isoladas do usuário", () => {
    localStorage.setItem("kriou_docs_form_data", JSON.stringify({ nome: "Ana" }));
    localStorage.setItem("kriou_docs_legal_form_data", JSON.stringify({ cidade: "Belém" }));
    localStorage.setItem("kriou_user_documents", JSON.stringify([{ id: "legacy" }]));

    expect(StorageService.migrateLegacyData("user-a")).toBe(true);
    expect(StorageService.loadDraft("user-a", "resume").nome).toBe("Ana");
    expect(StorageService.loadDraft("user-a", "legal").cidade).toBe("Belém");
    expect(StorageService.loadDocuments("user-a")).toEqual([{ id: "legacy" }]);
  });
});

describe("StorageService resiliência", () => {
  it("informa indisponibilidade e retorna fallback quando o navegador bloqueia escrita", () => {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota bloqueada");
    });

    expect(StorageService.isAvailable()).toBe(false);
    expect(StorageService.saveDocuments([], "user-a")).toBe(false);
  });

  it("mede apenas chaves da aplicação", () => {
    localStorage.setItem("kriou_exemplo", "abc");
    localStorage.setItem("outra_app", "ignorar");

    const info = StorageService.getStorageInfo();

    expect(info.items).toEqual({ kriou_exemplo: 3 });
    expect(info.totalSize).toBe(3);
    expect(info.available).toBe(true);
  });

  it("trata falha de remoção sem confirmar limpeza inexistente", () => {
    vi.spyOn(localStorage, "removeItem").mockImplementation(() => {
      throw new Error("acesso bloqueado");
    });

    expect(StorageService.clearSession("user-a")).toBe(false);
    expect(StorageService.clearDraft("user-a", "resume")).toBe(false);
    expect(StorageService.clearLegalFormData()).toBe(false);
    expect(StorageService.clearPage()).toBe(false);
    expect(StorageService.clearAll()).toBe(false);
  });

  it("trata falha de leitura sem expor exceção ao chamador", () => {
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("acesso bloqueado");
    });

    expect(StorageService.loadSession("user-a")).toBeNull();
    expect(StorageService.loadDraft("user-a", "resume")).toBeNull();
    expect(StorageService.loadFormData()).toBeNull();
    expect(StorageService.loadLegalFormData()).toBeNull();
    expect(StorageService.loadPage()).toBeNull();
    expect(StorageService.loadTemplatePreferences()).toBeNull();
  });
});
