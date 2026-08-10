/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INITIAL_FORM_DATA, RESUME_TEMPLATES } from "../data/constants";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { sanitizeFormData } from "../utils/sanitization";
import { generateDocumentCode } from "../utils/documentCode";
import { ResumeProvider, useResume } from "./ResumeContext";

const autoSaveState = vi.hoisted(() => ({
  saveFn: null,
  triggerSave: vi.fn(),
}));

vi.mock("../utils/storage", () => ({
  default: {
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    saveFormData: vi.fn(),
  },
}));

vi.mock("../services/DocumentService", () => ({
  DocumentService: {
    saveDraft: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../hooks/useAutoSave", () => ({
  useAutoSave: vi.fn((_data, saveFn) => {
    autoSaveState.saveFn = saveFn;
    return {
      saveStatus: "saved",
      lastSaved: new Date("2026-08-10T12:00:00.000Z"),
      triggerSave: autoSaveState.triggerSave,
    };
  }),
}));

vi.mock("../utils/documentCode", () => ({
  generateDocumentCode: vi.fn(() => "RES-001"),
}));

let resume;

const Probe = () => {
  const value = useResume();
  React.useEffect(() => {
    resume = value;
  }, [value]);
  return null;
};

const renderProvider = (props = {}) => render(
  <ResumeProvider userId="user-1" isLoading={false} {...props}>
    <Probe />
  </ResumeProvider>,
);

beforeEach(() => {
  vi.clearAllMocks();
  resume = null;
  autoSaveState.saveFn = null;
  DocumentService.saveDraft.mockResolvedValue(true);
  DocumentService.insert.mockResolvedValue({ id: "doc-new", title: "Ana" });
  DocumentService.update.mockResolvedValue({ id: "doc-1" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ResumeProvider estado e autosave", () => {
  it("expõe estado inicial, templates e metadados de save", () => {
    renderProvider();

    expect(resume.formData).toEqual(INITIAL_FORM_DATA);
    expect(resume.templates).toBe(RESUME_TEMPLATES);
    expect(resume.currentStep).toBe(0);
    expect(resume.filter).toBe("todos");
    expect(resume.saveStatus).toBe("saved");
    expect(resume.lastSaved).toEqual(new Date("2026-08-10T12:00:00.000Z"));
    expect(resume.triggerSave).toBe(autoSaveState.triggerSave);
  });

  it("não sobrescreve draft durante loading e salva dados sanitizados quando pronto", async () => {
    const view = renderProvider({ isLoading: true });

    autoSaveState.saveFn({ nome: "<b>Ana</b>" });
    expect(StorageService.saveDraft).not.toHaveBeenCalled();

    view.rerender(
      <ResumeProvider userId="user-1" isLoading={false}>
        <Probe />
      </ResumeProvider>,
    );
    act(() => resume.setCurrentStep(3));
    const input = { nome: "<b>Ana</b>" };
    const sanitized = sanitizeFormData(input);

    autoSaveState.saveFn(input);

    expect(StorageService.saveDraft).toHaveBeenCalledWith(sanitized, "user-1", "resume");
    expect(DocumentService.saveDraft).toHaveBeenCalledWith("user-1", "resume", sanitized, 3);
  });

  it("atualiza campo e reseta currículo junto com o formulário jurídico", () => {
    renderProvider();
    const legalReset = vi.fn();

    act(() => {
      resume.updateForm("nome", "Ana");
      resume.setCurrentStep(4);
      resume.setSelectedTemplate({ id: "moderno" });
    });
    expect(resume.formData.nome).toBe("Ana");

    act(() => resume.resetForm(legalReset));

    expect(resume.formData).toEqual(INITIAL_FORM_DATA);
    expect(resume.currentStep).toBe(0);
    expect(resume.selectedTemplate).toBeNull();
    expect(StorageService.clearDraft).toHaveBeenCalledWith("user-1", "resume");
    expect(StorageService.saveFormData).toHaveBeenCalledWith(INITIAL_FORM_DATA);
    expect(legalReset).toHaveBeenCalledOnce();
  });
});

describe("ResumeProvider persistência de documentos", () => {
  it("cria currículo com código sequencial e adiciona o retorno à lista", async () => {
    renderProvider();
    const existing = [{ id: "doc-0", code: "RES-000" }];
    act(() => resume.setUserDocuments(existing));
    const template = { id: "modern", name: "Moderno" };

    let created;
    await act(async () => {
      created = await resume.saveDocument({ nome: "Ana" }, null, template, null);
    });

    expect(generateDocumentCode).toHaveBeenCalledWith(existing, "resume");
    expect(DocumentService.insert).toHaveBeenCalledWith(expect.objectContaining({
      type: "resume",
      title: "Ana",
      template,
      templateId: "modern",
      templateName: "Moderno",
      status: "finalizado",
      code: "RES-001",
      formData: { nome: "Ana" },
      legalData: null,
    }), "user-1");
    expect(created).toEqual({ id: "doc-new", title: "Ana" });
    expect(resume.userDocuments).toEqual([...existing, created]);
    expect(StorageService.clearDraft).toHaveBeenCalledWith("user-1", "resume");
  });

  it("cria documento jurídico com tipo, variante e status solicitados", async () => {
    renderProvider();
    const documentType = { id: "compra-venda", name: "Compra e venda" };
    const variant = { id: "imovel", name: "Imóvel" };

    await act(async () => {
      await resume.saveDocument(
        { vendedor: "Ana" },
        documentType,
        null,
        variant,
        { status: "aguardando_pagamento" },
      );
    });

    expect(generateDocumentCode).toHaveBeenCalledWith([], "compra-venda");
    expect(DocumentService.insert).toHaveBeenCalledWith(expect.objectContaining({
      type: "legal",
      title: "Compra e venda",
      status: "aguardando_pagamento",
      formData: null,
      legalData: { vendedor: "Ana" },
      documentType: "compra-venda",
      variantId: "imovel",
      variantName: "Imóvel",
      variant,
    }), "user-1");
    expect(StorageService.clearDraft).toHaveBeenCalledWith("user-1", "legal");
  });

  it("atualiza documento, aplica metadados sensíveis e encerra edição", async () => {
    renderProvider();
    act(() => {
      resume.setUserDocuments([{ id: "doc-1", title: "Antigo" }, { id: "doc-2", title: "Outro" }]);
      resume.setEditingDocId("doc-1");
    });

    await act(async () => {
      await resume.updateDocument(
        "doc-1",
        { nome: "Atualizado" },
        null,
        { id: "classic", name: "Clássico" },
        null,
        {
          status: "finalizado",
          paidIdentitySnapshot: { cpf: "***" },
          sensitiveEditUsed: true,
          sensitiveEditUsedAt: "2026-08-10",
          sensitiveEditSummary: "nome",
        },
      );
    });

    expect(DocumentService.update).toHaveBeenCalledWith("doc-1", expect.objectContaining({
      title: "Atualizado",
      status: "finalizado",
      paidIdentitySnapshot: { cpf: "***" },
      sensitiveEditUsed: true,
      sensitiveEditUsedAt: "2026-08-10",
      sensitiveEditSummary: "nome",
    }), "user-1");
    expect(resume.userDocuments).toEqual([
      expect.objectContaining({ id: "doc-1", title: "Atualizado" }),
      { id: "doc-2", title: "Outro" },
    ]);
    expect(resume.editingDocId).toBeNull();
    expect(StorageService.clearDraft).toHaveBeenCalledWith("user-1", "resume");
  });

  it("propaga falhas de insert e update sem alterar silenciosamente a lista", async () => {
    renderProvider();
    const insertError = new Error("insert falhou");
    DocumentService.insert.mockRejectedValueOnce(insertError);

    await expect(resume.saveDocument({ nome: "Ana" }, null, null, null)).rejects.toBe(insertError);
    expect(resume.userDocuments).toEqual([]);

    const updateError = new Error("update falhou");
    DocumentService.update.mockRejectedValueOnce(updateError);
    await expect(resume.updateDocument("doc-1", { nome: "Ana" }, null, null, null)).rejects.toBe(updateError);
  });
});

describe("useResume", () => {
  it("falha explicitamente fora do provider", () => {
    expect(() => render(<Probe />)).toThrow("useResume deve ser usado dentro de ResumeProvider");
  });
});
