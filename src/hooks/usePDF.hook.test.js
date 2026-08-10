/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePDF } from "./usePDF";

const NativeURL = globalThis.URL;

class WorkerMock {
  static instances = [];

  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.postMessage = vi.fn();
    this.terminate = vi.fn();
    this.onmessage = null;
    this.onerror = null;
    WorkerMock.instances.push(this);
  }
}

beforeEach(() => {
  WorkerMock.instances = [];
  vi.stubGlobal("Worker", WorkerMock);
  class URLMock extends NativeURL {}
  URLMock.createObjectURL = vi.fn(() => "blob:pdf");
  URLMock.revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", URLMock);
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("usePDF", () => {
  it("gera o PDF no worker, baixa o arquivo e encerra recursos", async () => {
    const { result } = renderHook(() => usePDF());
    const options = { type: "GENERATE_RESUME", formData: { nome: "Ana" } };
    let generation;

    act(() => {
      generation = result.current.generatePDF(options);
    });

    const worker = WorkerMock.instances[0];
    expect(result.current.isGenerating).toBe(true);
    expect(worker.options).toEqual({ type: "module" });
    expect(worker.postMessage).toHaveBeenCalledWith(options);

    await act(async () => {
      worker.onmessage({
        data: {
          type: "PDF_SUCCESS",
          arrayBuffer: new Uint8Array([1, 2, 3]).buffer,
          filename: "curriculo.pdf",
        },
      });
      await generation;
    });

    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf");
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce();
    expect(result.current.isGenerating).toBe(false);
    expect(document.querySelector("a")).toBeNull();
  });

  it("propaga erro informado pelo worker sem iniciar download", async () => {
    const { result } = renderHook(() => usePDF());
    let generation;

    act(() => {
      generation = result.current.generatePDF({ type: "GENERATE_LEGAL", formData: {} });
    });
    const worker = WorkerMock.instances[0];

    await act(async () => {
      worker.onmessage({ data: { type: "PDF_ERROR", message: "Modelo inválido" } });
      await expect(generation).rejects.toThrow("Modelo inválido");
    });

    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(result.current.isGenerating).toBe(false);
  });

  it("propaga falha nativa e encerra o worker", async () => {
    const { result } = renderHook(() => usePDF());
    let generation;

    act(() => {
      generation = result.current.generatePDF({ type: "GENERATE_RESUME", formData: {} });
    });
    const worker = WorkerMock.instances[0];

    await act(async () => {
      worker.onerror({ message: "Worker indisponível" });
      await expect(generation).rejects.toThrow("Worker indisponível");
    });

    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(result.current.isGenerating).toBe(false);
  });

  it("cancela o worker anterior quando uma nova geração começa", () => {
    const { result } = renderHook(() => usePDF());

    act(() => {
      result.current.generatePDF({ type: "GENERATE_RESUME", formData: { versao: 1 } });
      result.current.generatePDF({ type: "GENERATE_RESUME", formData: { versao: 2 } });
    });

    expect(WorkerMock.instances).toHaveLength(2);
    expect(WorkerMock.instances[0].terminate).toHaveBeenCalledOnce();
    expect(WorkerMock.instances[1].postMessage).toHaveBeenCalledWith(expect.objectContaining({
      formData: { versao: 2 },
    }));
  });
});
