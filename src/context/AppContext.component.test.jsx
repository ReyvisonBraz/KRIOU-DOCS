/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { AppProvider, useApp } from "./AppContext";

const contextState = vi.hoisted(() => ({
  auth: {},
  resume: {},
  legal: {},
}));

vi.mock("../constants/timing", () => ({ APP_INIT_DELAY_MS: 0 }));

vi.mock("../utils/storage", () => ({
  default: {
    savePage: vi.fn(),
    clearPage: vi.fn(),
    loadDocuments: vi.fn(),
    loadDraft: vi.fn(),
  },
}));

vi.mock("../services/DocumentService", () => ({
  DocumentService: {
    fetchProfile: vi.fn(),
    isProfileComplete: vi.fn(),
    fetchAll: vi.fn(),
    loadDraft: vi.fn(),
  },
}));

vi.mock("./AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => contextState.auth,
}));

vi.mock("./ResumeContext", () => ({
  ResumeProvider: ({ children }) => children,
  useResume: () => contextState.resume,
}));

vi.mock("./LegalContext", () => ({
  LegalProvider: ({ children }) => children,
  useLegal: () => contextState.legal,
}));

const Probe = () => {
  const app = useApp();
  return (
    <div>
      <span data-testid="page">{app.currentPage}</span>
      <span data-testid="loading">{String(app.isLoading)}</span>
      <span data-testid="profile">{app.profile?.nome ?? "sem-perfil"}</span>
      <button onClick={() => app.navigate("profile")}>perfil</button>
      <button onClick={() => app.goBack("dashboard")}>voltar</button>
      <button onClick={() => void app.logout()}>logout</button>
      <button onClick={() => app.resetForm()}>resetar</button>
      <button onClick={() => app.saveDocument({ title: "Novo" }, { source: "test" })}>salvar</button>
      <button onClick={() => app.updateDocument("doc-1", { title: "Editado" }, { source: "test" })}>
        atualizar
      </button>
    </div>
  );
};

const makeAuth = (overrides = {}) => ({
  userId: null,
  displayName: "Usuario",
  avatarUrl: null,
  email: null,
  isAuthLoading: false,
  signInWithGoogle: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeResume = () => ({
  selectedTemplate: { id: "template-1" },
  setSelectedTemplate: vi.fn(),
  templates: [],
  currentStep: 0,
  setCurrentStep: vi.fn(),
  formData: {},
  setFormData: vi.fn(),
  updateForm: vi.fn(),
  resetForm: vi.fn(),
  saveStatus: "saved",
  lastSaved: null,
  triggerSave: vi.fn(),
  userDocuments: [],
  setUserDocuments: vi.fn(),
  saveDocument: vi.fn(),
  updateDocument: vi.fn(),
  editingDocId: null,
  setEditingDocId: vi.fn(),
  filter: "all",
  setFilter: vi.fn(),
});

const makeLegal = () => ({
  documentType: { id: "contrato" },
  setDocumentType: vi.fn(),
  selectedVariant: "imovel",
  setSelectedVariant: vi.fn(),
  legalFormData: {},
  setLegalFormData: vi.fn(),
  disabledFields: {},
  setDisabledFields: vi.fn(),
  legalStep: 1,
  setLegalStep: vi.fn(),
  legalDocumentTypes: [],
  updateLegalField: vi.fn(),
  selectDocumentType: vi.fn(),
  resetLegalForm: vi.fn(),
  triggerSave: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});

  contextState.auth = makeAuth();
  contextState.resume = makeResume();
  contextState.legal = makeLegal();

  StorageService.loadDocuments.mockReturnValue([]);
  StorageService.loadDraft.mockReturnValue(null);
  DocumentService.fetchProfile.mockResolvedValue(null);
  DocumentService.isProfileComplete.mockReturnValue(true);
  DocumentService.fetchAll.mockResolvedValue([]);
  DocumentService.loadDraft.mockResolvedValue(null);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AppProvider bootstrap", () => {
  it("libera página pública para visitante sem consultar dados", async () => {
    render(<AppProvider><Probe /></AppProvider>);

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("page")).toHaveTextContent("landing");
    expect(DocumentService.fetchAll).not.toHaveBeenCalled();
  });

  it("redireciona visitante de página protegida para landing", async () => {
    window.history.replaceState(null, "", "/dashboard");
    render(<AppProvider><Probe /></AppProvider>);

    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("landing"));
    expect(window.location.pathname).toBe("/");
    expect(StorageService.clearPage).toHaveBeenCalled();
  });

  it("carrega perfil, documentos e rascunhos e redireciona usuário autenticado", async () => {
    contextState.auth = makeAuth({ userId: "user-1", displayName: "Ana" });
    DocumentService.fetchProfile.mockResolvedValue({ nome: "Ana" });
    DocumentService.fetchAll.mockResolvedValue([{ id: "server-1", status: "finalizado" }]);
    DocumentService.loadDraft.mockImplementation(async (_userId, type) => (
      type === "resume" ? { data: { nome: "Cloud" } } : null
    ));
    StorageService.loadDraft.mockImplementation((_userId, type) => (
      type === "resume"
        ? { nome: "Local", cargo: "Dev", email: "ana@example.com" }
        : { parte: "Ana", cidade: "Belém", objeto: "Imóvel" }
    ));

    render(<AppProvider><Probe /></AppProvider>);

    await waitFor(() => expect(contextState.resume.setUserDocuments).toHaveBeenCalled());
    const merged = contextState.resume.setUserDocuments.mock.calls[0][0];
    expect(merged).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "server-1" }),
      expect.objectContaining({ id: "draft-resume-user-1", _draftOrigin: "autoSave" }),
      expect.objectContaining({ id: "draft-legal-user-1", _draftOrigin: "autoSave" }),
    ]));
    expect(contextState.resume.setFormData).toHaveBeenCalledWith({ nome: "Cloud" });
    expect(contextState.legal.setLegalFormData).toHaveBeenCalledWith(expect.objectContaining({ cidade: "Belém" }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("Ana"));
    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("dashboard"));
  });

  it("usa documentos e rascunhos locais quando o Supabase falha", async () => {
    contextState.auth = makeAuth({ userId: "user-1" });
    window.history.replaceState(null, "", "/dashboard");
    const offlineDocuments = [{ id: "local-1", status: "rascunho" }];
    DocumentService.fetchProfile.mockRejectedValue(new Error("offline"));
    DocumentService.fetchAll.mockRejectedValue(new Error("offline"));
    DocumentService.loadDraft.mockRejectedValue(new Error("offline"));
    StorageService.loadDocuments.mockReturnValue(offlineDocuments);
    StorageService.loadDraft.mockImplementation((_userId, type) => (
      type === "resume" ? { nome: "Local" } : { cidade: "Belém" }
    ));

    render(<AppProvider><Probe /></AppProvider>);

    await waitFor(() => expect(contextState.resume.setUserDocuments).toHaveBeenCalledWith(offlineDocuments));
    expect(contextState.resume.setFormData).toHaveBeenCalledWith({ nome: "Local" });
    expect(contextState.legal.setLegalFormData).toHaveBeenCalledWith({ cidade: "Belém" });
    expect(screen.getByTestId("page")).toHaveTextContent("dashboard");
  });
});

describe("useApp composição e navegação", () => {
  it("compõe save/update/reset com o estado jurídico atual", async () => {
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    fireEvent.click(screen.getByRole("button", { name: "resetar" }));
    fireEvent.click(screen.getByRole("button", { name: "salvar" }));
    fireEvent.click(screen.getByRole("button", { name: "atualizar" }));

    expect(contextState.resume.resetForm).toHaveBeenCalledWith(contextState.legal.resetLegalForm);
    expect(contextState.resume.saveDocument).toHaveBeenCalledWith(
      { title: "Novo" },
      contextState.legal.documentType,
      contextState.resume.selectedTemplate,
      { id: "imovel", name: "imovel" },
      { source: "test" },
    );
    expect(contextState.resume.updateDocument).toHaveBeenCalledWith(
      "doc-1",
      { title: "Editado" },
      contextState.legal.documentType,
      contextState.resume.selectedTemplate,
      { id: "imovel", name: "imovel" },
      { source: "test" },
    );
  });

  it("persiste navegação restaurável, reage a popstate e limpa rota no logout", async () => {
    contextState.auth = makeAuth({ userId: "user-1" });
    window.history.replaceState(null, "", "/dashboard");
    render(<AppProvider><Probe /></AppProvider>);
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    fireEvent.click(screen.getByRole("button", { name: "perfil" }));
    expect(screen.getByTestId("page")).toHaveTextContent("profile");
    expect(window.location.pathname).toBe("/profile");
    expect(StorageService.savePage).toHaveBeenCalledWith("profile");

    act(() => {
      window.history.replaceState({ page: "templates", appIndex: 2 }, "", "/templates");
      window.dispatchEvent(new PopStateEvent("popstate", { state: { page: "templates", appIndex: 2 } }));
    });
    expect(screen.getByTestId("page")).toHaveTextContent("templates");

    fireEvent.click(screen.getByRole("button", { name: "logout" }));
    await waitFor(() => expect(contextState.auth.logout).toHaveBeenCalledOnce());
    expect(StorageService.clearPage).toHaveBeenCalled();
    expect(screen.getByTestId("page")).toHaveTextContent("landing");
  });

  it("falha explicitamente fora de AppProvider", () => {
    expect(() => render(<Probe />)).toThrow("useApp must be used within AppProvider");
  });
});
