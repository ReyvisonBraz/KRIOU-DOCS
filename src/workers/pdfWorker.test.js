import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateResumePDF } from "../utils/pdfGenerator";
import { generateLegalPDF } from "../utils/legalPdfGenerator";

vi.mock("../utils/pdfGenerator", () => ({
  generateResumePDF: vi.fn(),
}));

vi.mock("../utils/legalPdfGenerator", () => ({
  generateLegalPDF: vi.fn(),
}));

let messageHandler;
let workerScope;

const createPdf = () => {
  const arrayBuffer = new ArrayBuffer(16);
  return {
    arrayBuffer,
    doc: { output: vi.fn(() => arrayBuffer) },
  };
};

const dispatch = (data) => messageHandler({ data });

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  messageHandler = undefined;
  workerScope = {
    addEventListener: vi.fn((type, handler) => {
      if (type === "message") messageHandler = handler;
    }),
    postMessage: vi.fn(),
  };
  vi.stubGlobal("self", workerScope);

  await import("./pdfWorker");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("protocolo do pdfWorker", () => {
  it("gera currículo, personaliza o filename e transfere o ArrayBuffer", () => {
    const { arrayBuffer, doc } = createPdf();
    generateResumePDF.mockReturnValue(doc);
    const formData = { nome: "Ana Maria" };
    const template = { color: "#123456" };

    dispatch({ type: "GENERATE_RESUME", formData, template });

    expect(generateResumePDF).toHaveBeenCalledWith(formData, template);
    expect(doc.output).toHaveBeenCalledWith("arraybuffer");
    expect(workerScope.postMessage).toHaveBeenCalledWith({
      type: "PDF_SUCCESS",
      arrayBuffer,
      filename: "curriculo-ana-maria.pdf",
    }, [arrayBuffer]);
  });

  it("usa o filename padrão para currículo sem nome", () => {
    const { arrayBuffer, doc } = createPdf();
    generateResumePDF.mockReturnValue(doc);

    dispatch({ type: "GENERATE_RESUME", formData: {}, template: undefined });

    expect(workerScope.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: "PDF_SUCCESS",
      arrayBuffer,
      filename: "curriculo-kriou-docs.pdf",
    }), [arrayBuffer]);
  });

  it("gera documento jurídico com filename e opções personalizados", () => {
    const { arrayBuffer, doc } = createPdf();
    generateLegalPDF.mockReturnValue(doc);
    const formData = { vendedor_nome: "Ana" };
    const docType = { id: "compra-venda" };
    const disabledFields = { testemunhas: true };

    dispatch({
      type: "GENERATE_LEGAL",
      formData,
      docType,
      disabledFields,
      variantId: "imovel",
    });

    expect(generateLegalPDF).toHaveBeenCalledWith(
      formData,
      docType,
      disabledFields,
      "imovel",
    );
    expect(workerScope.postMessage).toHaveBeenCalledWith({
      type: "PDF_SUCCESS",
      arrayBuffer,
      filename: "compra-venda-kriou-docs.pdf",
    }, [arrayBuffer]);
  });

  it("aplica opções e filename padrão ao documento jurídico", () => {
    const { arrayBuffer, doc } = createPdf();
    generateLegalPDF.mockReturnValue(doc);
    const formData = {};
    const docType = {};

    dispatch({ type: "GENERATE_LEGAL", formData, docType });

    expect(generateLegalPDF).toHaveBeenCalledWith(formData, docType, {}, null);
    expect(workerScope.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: "PDF_SUCCESS",
      arrayBuffer,
      filename: "documento-kriou-docs.pdf",
    }), [arrayBuffer]);
  });

  it("rejeita tipo desconhecido pelo canal de erro", () => {
    dispatch({ type: "EXPORTAR_OUTRO" });

    expect(workerScope.postMessage).toHaveBeenCalledWith({
      type: "PDF_ERROR",
      message: "Tipo de mensagem desconhecido: EXPORTAR_OUTRO",
    });
    expect(generateResumePDF).not.toHaveBeenCalled();
    expect(generateLegalPDF).not.toHaveBeenCalled();
  });

  it("propaga falhas do gerador pelo protocolo", () => {
    generateResumePDF.mockImplementation(() => {
      throw new Error("Falha ao montar PDF");
    });

    dispatch({ type: "GENERATE_RESUME", formData: { nome: "Ana" } });

    expect(workerScope.postMessage).toHaveBeenCalledWith({
      type: "PDF_ERROR",
      message: "Falha ao montar PDF",
    });
  });
});
