/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import { INITIAL_FORM_DATA, INITIAL_LEGAL_FORM_DATA } from "../data/constants";
import { AppProvider, useApp } from "./AppContext";

const contextState = vi.hoisted(() => ({
  auth: {},
  resume: {},
  legal: {},
  onAppRender: null,
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
    updateProfile: vi.fn(),
  },
}));

vi.mock("../utils/toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
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
  contextState.onAppRender?.({
    userId: app.userId,
    isLoading: app.isLoading,
    userDocuments: app.userDocuments,
    formData: app.formData,
    legalFormData: app.legalFormData,
  });
  return (
    <div>
      <span data-testid="page">{app.currentPage}</span>
      <span data-testid="loading">{String(app.isLoading)}</span>
      <span data-testid="profile">{app.profile?.nome ?? "sem-perfil"}</span>
      <span data-testid="profile-last">{app.profile?.sobrenome ?? "sem-sobrenome"}</span>
      <button onClick={() => app.navigate("profile")}>perfil</button>
      <button onClick={() => app.goBack("dashboard")}>voltar</button>
      <button onClick={() => void app.logout()}>logout</button>
      <button onClick={() => app.resetForm()}>resetar</button>
      <button onClick={() => app.saveDocument({ title: "Novo" }, { source: "test" })}>salvar</button>
      <button onClick={() => app.updateDocument("doc-1", { title: "Editado" }, { source: "test" })}>
        atualizar
      </button>
      <button onClick={() => app.setProfile((current) => ({ ...current, sobrenome: "Revisada" }))}>
        atualizar perfil
      </button>
    </div>
  );
};

const EditorDataProbe = () => {
  const { formData } = useApp();
  formData.habilidades.includes("qualquer");
  formData.experiencias.map((experience) => experience.empresa);
  formData.formacoes.map((education) => education.instituicao);
  formData.idiomas.map((language) => language.idioma);
  return <span data-testid="editor-shape">editor-ok</span>;
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
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
  formData: INITIAL_FORM_DATA,
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
  contextState.onAppRender = null;

  StorageService.loadDocuments.mockReturnValue([]);
  StorageService.loadDraft.mockReturnValue(null);
  DocumentService.fetchProfile.mockResolvedValue(null);
  DocumentService.isProfileComplete.mockReturnValue(true);
  DocumentService.fetchAll.mockResolvedValue([]);
  DocumentService.loadDraft.mockResolvedValue(null);
  DocumentService.updateProfile.mockResolvedValue(null);
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
    const merged = contextState.resume.setUserDocuments.mock.calls.find(([documents]) => (
      documents.some((document) => document.id === "server-1")
    ))[0];
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

  it("vincula perfil à identidade e rejeita leituras obsoletas em qualquer ordem", async () => {
    const user = userEvent.setup();
    const pendingProfile = deferred();
    const onNavigate = vi.fn();
    const savedProfile = { id: "user-1", nome: "Nova", sobrenome: "Pessoa" };
    contextState.auth = makeAuth({
      userId: "user-1",
      user: {
        id: "user-1",
        email: "nova@example.com",
        user_metadata: { full_name: "Nova Pessoa", sub: "google-1" },
      },
    });
    window.history.replaceState(null, "", "/complete-profile");
    DocumentService.fetchProfile.mockReturnValue(pendingProfile.promise);
    DocumentService.updateProfile.mockResolvedValue(savedProfile);

    const makeTree = () => (
      <React.StrictMode>
        <AppProvider>
          <CompleteProfilePage onNavigate={onNavigate} />
          <Probe />
          <EditorDataProbe />
        </AppProvider>
      </React.StrictMode>
    );
    const view = render(makeTree());

    await user.click(screen.getByRole("button", { name: /concluir cadastro/i }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("Nova"));
    expect(onNavigate).toHaveBeenCalledWith("welcome", { replace: true });

    await act(async () => pendingProfile.resolve({ id: "user-1", nome: "Antiga" }));

    expect(screen.getByTestId("profile")).toHaveTextContent("Nova");
    await user.click(screen.getByRole("button", { name: "atualizar perfil" }));
    expect(screen.getByTestId("profile-last")).toHaveTextContent("Revisada");

    const staleA = deferred();
    contextState.auth = makeAuth({ userId: "user-1", isAuthLoading: true });
    view.rerender(makeTree());
    DocumentService.fetchProfile.mockReturnValueOnce(staleA.promise);
    const callsBeforeRefreshA = DocumentService.fetchProfile.mock.calls.length;
    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchProfile).toHaveBeenCalledTimes(callsBeforeRefreshA + 1));

    const currentB = deferred();
    const transitionSnapshots = [];
    contextState.resume.userDocuments = [{ id: "private-doc-a" }];
    contextState.resume.formData = {
      ...INITIAL_FORM_DATA,
      nome: "Privado A",
      habilidades: ["segredo-a"],
    };
    contextState.legal.legalFormData = { parte: "Privado A" };
    contextState.onAppRender = (snapshot) => {
      if (snapshot.userId === "user-2") transitionSnapshots.push(snapshot);
    };
    DocumentService.fetchProfile.mockReturnValue(currentB.promise);
    contextState.auth = makeAuth({ userId: "user-2" });
    view.rerender(makeTree());
    // A probe registra durante o render, antes de AppBootstrap/useEffect limpar os providers.
    expect(transitionSnapshots[0]).toEqual({
      userId: "user-2",
      isLoading: true,
      userDocuments: [],
      formData: INITIAL_FORM_DATA,
      legalFormData: INITIAL_LEGAL_FORM_DATA,
    });
    expect(screen.getByTestId("profile")).toHaveTextContent("sem-perfil");
    contextState.resume.setFormData.mockClear();
    contextState.legal.setLegalFormData.mockClear();

    await act(async () => staleA.resolve({ id: "user-1", nome: "A tardio" }));
    expect(screen.getByTestId("profile")).toHaveTextContent("sem-perfil");
    await act(async () => currentB.resolve({ id: "user-2", nome: "Perfil B" }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("Perfil B"));
    await waitFor(() => expect(contextState.resume.setFormData).toHaveBeenCalledWith(INITIAL_FORM_DATA));
    await waitFor(() => expect(contextState.legal.setLegalFormData).toHaveBeenCalledWith(INITIAL_LEGAL_FORM_DATA));
    expect(screen.getByTestId("editor-shape")).toHaveTextContent("editor-ok");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    const staleB = deferred();
    contextState.auth = makeAuth({ userId: "user-2", isAuthLoading: true });
    view.rerender(makeTree());
    DocumentService.fetchProfile.mockReturnValueOnce(staleB.promise);
    const callsBeforeRefreshB = DocumentService.fetchProfile.mock.calls.length;
    contextState.auth = makeAuth({ userId: "user-2" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchProfile).toHaveBeenCalledTimes(callsBeforeRefreshB + 1));

    const currentA = deferred();
    DocumentService.fetchProfile.mockReturnValue(currentA.promise);
    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await act(async () => currentA.resolve({ id: "user-1", nome: "Perfil A atual" }));
    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("Perfil A atual"));
    await act(async () => staleB.resolve({ id: "user-2", nome: "B tardio" }));
    expect(screen.getByTestId("profile")).toHaveTextContent("Perfil A atual");

    const staleSignedOut = deferred();
    contextState.auth = makeAuth({ userId: "user-1", isAuthLoading: true });
    view.rerender(makeTree());
    DocumentService.fetchProfile.mockReturnValueOnce(staleSignedOut.promise);
    const callsBeforeSignedOut = DocumentService.fetchProfile.mock.calls.length;
    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchProfile).toHaveBeenCalledTimes(callsBeforeSignedOut + 1));

    contextState.auth = makeAuth({ userId: null });
    const signedOutSnapshots = [];
    contextState.onAppRender = (snapshot) => {
      if (snapshot.userId === null) signedOutSnapshots.push(snapshot);
    };
    view.rerender(makeTree());
    expect(signedOutSnapshots[0]).toEqual({
      userId: null,
      isLoading: true,
      userDocuments: [],
      formData: INITIAL_FORM_DATA,
      legalFormData: INITIAL_LEGAL_FORM_DATA,
    });
    expect(screen.getByTestId("profile")).toHaveTextContent("sem-perfil");
    await act(async () => staleSignedOut.resolve({ id: "user-1", nome: "A após SIGNED_OUT" }));
    expect(screen.getByTestId("profile")).toHaveTextContent("sem-perfil");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

    DocumentService.fetchProfile.mockResolvedValue(null);
    const staleDocumentsA = deferred();
    const currentDocumentsB = deferred();
    DocumentService.fetchAll.mockImplementation((userId) => (
      userId === "user-1" ? staleDocumentsA.promise : currentDocumentsB.promise
    ));
    DocumentService.fetchAll.mockClear();
    contextState.resume.setUserDocuments.mockClear();

    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchAll).toHaveBeenCalledWith("user-1"));
    contextState.auth = makeAuth({ userId: "user-2" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchAll).toHaveBeenCalledWith("user-2"));

    await act(async () => staleDocumentsA.resolve([{ id: "doc-a" }]));
    expect(contextState.resume.setUserDocuments).not.toHaveBeenCalledWith([{ id: "doc-a" }]);
    await act(async () => currentDocumentsB.resolve([{ id: "doc-b" }]));
    await waitFor(() => expect(contextState.resume.setUserDocuments).toHaveBeenCalledWith([{ id: "doc-b" }]));

    const staleLegalB = deferred();
    DocumentService.fetchAll.mockResolvedValue([]);
    DocumentService.loadDraft.mockImplementation((userId, type) => {
      if (userId === "user-2" && type === "legal") return staleLegalB.promise;
      return Promise.resolve({ data: type === "resume"
        ? { nome: `Currículo ${userId}` }
        : { cidade: `Cidade ${userId}` } });
    });
    DocumentService.loadDraft.mockClear();
    contextState.auth = makeAuth({ userId: "user-2", isAuthLoading: true });
    view.rerender(makeTree());
    contextState.auth = makeAuth({ userId: "user-2" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.loadDraft).toHaveBeenCalledWith("user-2", "legal"));

    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(contextState.resume.setFormData).toHaveBeenCalledWith({ nome: "Currículo user-1" }));
    await waitFor(() => expect(contextState.legal.setLegalFormData).toHaveBeenCalledWith({ cidade: "Cidade user-1" }));
    await act(async () => staleLegalB.resolve({ data: { cidade: "B tardio" } }));
    expect(contextState.legal.setLegalFormData).not.toHaveBeenCalledWith({ cidade: "B tardio" });

    const staleFallbackA = deferred();
    DocumentService.fetchAll.mockImplementation((userId) => (
      userId === "user-1" ? staleFallbackA.promise : Promise.resolve([])
    ));
    DocumentService.fetchAll.mockClear();
    StorageService.loadDocuments.mockClear();
    contextState.auth = makeAuth({ userId: "user-1", isAuthLoading: true });
    view.rerender(makeTree());
    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.fetchAll).toHaveBeenCalledWith("user-1"));
    contextState.auth = makeAuth({ userId: null });
    view.rerender(makeTree());
    await act(async () => staleFallbackA.reject(new Error("A offline tardio")));
    expect(StorageService.loadDocuments).not.toHaveBeenCalledWith("user-1");
    expect(contextState.resume.setUserDocuments).toHaveBeenLastCalledWith([]);

    const staleResumeA = deferred();
    DocumentService.fetchAll.mockResolvedValue([]);
    DocumentService.loadDraft.mockImplementation((userId, type) => (
      userId === "user-1" && type === "resume"
        ? staleResumeA.promise
        : Promise.resolve(null)
    ));
    DocumentService.loadDraft.mockClear();
    contextState.auth = makeAuth({ userId: "user-1" });
    view.rerender(makeTree());
    await waitFor(() => expect(DocumentService.loadDraft).toHaveBeenCalledWith("user-1", "resume"));
    contextState.auth = makeAuth({ userId: null });
    view.rerender(makeTree());
    await act(async () => staleResumeA.resolve({ data: { nome: "A após logout" } }));
    expect(contextState.resume.setFormData).not.toHaveBeenCalledWith({ nome: "A após logout" });
    expect(contextState.resume.setFormData).toHaveBeenLastCalledWith(INITIAL_FORM_DATA);
    expect(contextState.legal.setLegalFormData).toHaveBeenLastCalledWith(INITIAL_LEGAL_FORM_DATA);
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

  it("CompleteProfile usa o logout do app e sai para landing", async () => {
    const user = userEvent.setup();
    contextState.auth = makeAuth({
      userId: "user-1",
      user: { id: "user-1", user_metadata: { full_name: "Ana Silva" } },
    });
    window.history.replaceState(null, "", "/complete-profile");
    DocumentService.fetchProfile.mockResolvedValue({ id: "user-1", nome: "Ana" });
    render(
      <AppProvider>
        <CompleteProfilePage onNavigate={vi.fn()} />
        <Probe />
      </AppProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("profile")).toHaveTextContent("Ana"));

    await user.click(screen.getByRole("button", { name: /sair/i }));

    await waitFor(() => expect(contextState.auth.logout).toHaveBeenCalledOnce());
    expect(StorageService.clearPage).toHaveBeenCalled();
    expect(screen.getByTestId("profile")).toHaveTextContent("sem-perfil");
    expect(screen.getByTestId("page")).toHaveTextContent("landing");
    expect(window.location.pathname).toBe("/");
  });

  it("falha explicitamente fora de AppProvider", () => {
    expect(() => render(<Probe />)).toThrow("useApp must be used within AppProvider");
  });
});
