/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LEGAL_DOCUMENT_TYPES } from "../data/constants";
import StorageService from "../utils/storage";
import { DocumentService } from "../services/DocumentService";
import { sanitizeFormData } from "../utils/sanitization";
import { LegalProvider, useLegal } from "./LegalContext";

const autoSaveState = vi.hoisted(() => ({
  saveFn: null,
  triggerSave: vi.fn(),
}));

vi.mock("../utils/storage", () => ({
  default: {
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    clearLegalFormData: vi.fn(),
  },
}));

vi.mock("../services/DocumentService", () => ({
  DocumentService: {
    saveDraft: vi.fn(),
  },
}));

vi.mock("../hooks/useAutoSave", () => ({
  useAutoSave: vi.fn((_data, saveFn) => {
    autoSaveState.saveFn = saveFn;
    return { saveStatus: "saved", triggerSave: autoSaveState.triggerSave };
  }),
}));

let legal;

const Probe = () => {
  const value = useLegal();
  React.useEffect(() => {
    legal = value;
  }, [value]);
  return null;
};

const renderProvider = (props = {}) => render(
  <LegalProvider userId="user-1" isLoading={false} {...props}>
    <Probe />
  </LegalProvider>,
);

beforeEach(() => {
  vi.clearAllMocks();
  legal = null;
  autoSaveState.saveFn = null;
  DocumentService.saveDraft.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LegalProvider", () => {
  it("expõe estado inicial, catálogo e status global de save", () => {
    const onSaveStatus = vi.fn();
    renderProvider({ onSaveStatus });

    expect(legal.documentType).toBeNull();
    expect(legal.selectedVariant).toBeNull();
    expect(legal.legalFormData).toEqual({});
    expect(legal.disabledFields).toEqual({});
    expect(legal.legalStep).toBe(0);
    expect(legal.legalDocumentTypes).toBe(LEGAL_DOCUMENT_TYPES);
    expect(legal.triggerSave).toBe(autoSaveState.triggerSave);
    expect(onSaveStatus).toHaveBeenCalledWith("saved");
  });

  it("não salva durante loading nem formulário vazio", () => {
    const view = renderProvider({ isLoading: true });

    autoSaveState.saveFn({ parte: "Ana" });
    expect(StorageService.saveDraft).not.toHaveBeenCalled();

    view.rerender(
      <LegalProvider userId="user-1" isLoading={false}>
        <Probe />
      </LegalProvider>,
    );
    autoSaveState.saveFn({});
    expect(StorageService.saveDraft).not.toHaveBeenCalled();
  });

  it("salva dados sanitizados localmente e na nuvem com o step atual", () => {
    renderProvider();
    act(() => legal.setLegalStep(2));
    const input = { parte: "<b>Ana</b>", cidade: "Belém" };
    const sanitized = sanitizeFormData(input);

    autoSaveState.saveFn(input);

    expect(StorageService.saveDraft).toHaveBeenCalledWith(sanitized, "user-1", "legal");
    expect(DocumentService.saveDraft).toHaveBeenCalledWith("user-1", "legal", sanitized, 2);
  });

  it("atualiza campo e limpa formulário ao trocar o tipo", () => {
    renderProvider();
    const type = { id: "locacao", name: "Locação" };

    act(() => legal.updateLegalField("locador", "Ana"));
    expect(legal.legalFormData).toEqual({ locador: "Ana" });

    act(() => legal.selectDocumentType(type));
    expect(legal.documentType).toBe(type);
    expect(legal.legalFormData).toEqual({});
  });

  it("reseta todos os estados e remove persistência local", () => {
    renderProvider();
    act(() => {
      legal.setDocumentType({ id: "locacao" });
      legal.setSelectedVariant("residencial");
      legal.setLegalFormData({ locador: "Ana" });
      legal.setDisabledFields({ fiador: true });
      legal.setLegalStep(3);
    });

    act(() => legal.resetLegalForm());

    expect(legal.documentType).toBeNull();
    expect(legal.selectedVariant).toBeNull();
    expect(legal.legalFormData).toEqual({});
    expect(legal.disabledFields).toEqual({});
    expect(legal.legalStep).toBe(0);
    expect(StorageService.clearDraft).toHaveBeenCalledWith("user-1", "legal");
    expect(StorageService.clearLegalFormData).toHaveBeenCalledOnce();
  });
});

describe("useLegal", () => {
  it("falha explicitamente fora do provider", () => {
    expect(() => render(<Probe />)).toThrow("useLegal deve ser usado dentro de LegalProvider");
  });
});
