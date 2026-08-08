/**
 * @vitest-environment jsdom
 */
/**
 * ============================================
 * KRIOU DOCS - Testes: tema claro/escuro
 * ============================================
 * Cobre o ThemeProvider, o ThemeToggle e — o mais importante — garante
 * que as cores de documento não sigam o tema (regressão da F1.1).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, THEME_STORAGE_KEY } from "./Theme";
import { useTheme } from "./themeContext";
import { ThemeToggle } from "./ThemeToggle";

const root = () => document.documentElement;

// Componente sonda: expõe o estado do contexto sem depender da UI real.
const Probe = () => {
  const { mode, isDark, toggleMode } = useTheme();
  return (
    <button onClick={toggleMode} data-mode={mode} data-is-dark={String(isDark)}>
      alternar
    </button>
  );
};

beforeEach(() => {
  localStorage.clear();
  delete root().dataset.theme;
  root().style.colorScheme = "";
  document.head.innerHTML = '<meta name="theme-color" content="#090914" />';
});

describe("ThemeProvider", () => {
  it("usa o tema escuro quando não há preferência salva", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByRole("button")).toHaveAttribute("data-mode", "dark");
    expect(root().dataset.theme).toBe("dark");
  });

  it("respeita a preferência clara salva no localStorage", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByRole("button")).toHaveAttribute("data-mode", "light");
    expect(root().dataset.theme).toBe("light");
  });

  it("ignora valor inválido no localStorage e cai no escuro", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "roxo");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(root().dataset.theme).toBe("dark");
  });

  it("aplica color-scheme no <html> para os controles nativos", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(root().style.colorScheme).toBe("light");
  });

  it("alterna o tema e persiste a escolha", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    const btn = screen.getByRole("button");

    fireEvent.click(btn);
    expect(btn).toHaveAttribute("data-mode", "light");
    expect(root().dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    fireEvent.click(btn);
    expect(btn).toHaveAttribute("data-mode", "dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("atualiza a meta theme-color ao alternar", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    const meta = () => document.querySelector('meta[name="theme-color"]').getAttribute("content");

    expect(meta()).toBe("#090914");
    fireEvent.click(screen.getByRole("button"));
    expect(meta()).toBe("#F5F7FA");
  });

  it("não quebra quando o localStorage está bloqueado", () => {
    const getSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("acesso negado");
    });
    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("acesso negado");
    });

    expect(() => {
      render(<ThemeProvider><Probe /></ThemeProvider>);
      fireEvent.click(screen.getByRole("button"));
    }).not.toThrow();
    // A alternância continua valendo para a sessão, mesmo sem persistir.
    expect(root().dataset.theme).toBe("light");

    getSpy.mockRestore();
    setSpy.mockRestore();
  });
});

describe("useTheme", () => {
  it("falha de forma explícita fora do ThemeProvider", () => {
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
    silence.mockRestore();
  });
});

describe("ThemeToggle", () => {
  it("no escuro, oferece ativar o tema claro", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByRole("button", { name: /ativar tema claro/i })).toBeInTheDocument();
  });

  it("no claro, oferece ativar o tema escuro", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByRole("button", { name: /ativar tema escuro/i })).toBeInTheDocument();
  });

  it("alterna o tema ao ser clicado", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    fireEvent.click(screen.getByRole("button"));
    expect(root().dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: /ativar tema escuro/i })).toBeInTheDocument();
  });

  it("mantém rótulo acessível na variante da landing", () => {
    render(<ThemeProvider><ThemeToggle variant="landing" /></ThemeProvider>);
    expect(screen.getByRole("button", { name: /ativar tema claro/i })).toBeInTheDocument();
  });
});

/**
 * Regressão da F1.1 — o documento não pode seguir o tema.
 *
 * O preview do contrato usava var(--gold) e var(--border); como esses
 * tokens mudam com data-theme, o documento jurídico trocava de cor junto
 * com a interface. Estes testes travam a correção.
 */
describe("cores de documento", () => {
  const css = readFileSync(resolve(process.cwd(), "src/index.css"), "utf8");
  const lightBlock = css.slice(css.indexOf(':root[data-theme="light"]'));

  it("os tokens --doc-* existem no tema padrão", () => {
    expect(css).toMatch(/--doc-gold:/);
    expect(css).toMatch(/--doc-rule:/);
    expect(css).toMatch(/--doc-thumb-bg:/);
  });

  it("nenhum token --doc-* é redefinido no tema claro", () => {
    expect(lightBlock).not.toMatch(/--doc-/);
  });

  it("o preview do contrato não usa tokens de interface", () => {
    const page = readFileSync(
      resolve(process.cwd(), "src/pages/LegalEditorPage.jsx"),
      "utf8",
    );
    // Delimita a folha: dos blocos do documento até o botão de pagamento,
    // que já é interface e legitimamente segue o tema.
    const inicio = page.indexOf("const renderBlock");
    const fim = page.indexOf("onClick={handleFinalize}");
    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    const folha = page.slice(inicio, fim);
    // Prova que a região analisada é mesmo a folha, e não um trecho vazio
    // que faria a asserção seguinte passar sem verificar nada.
    expect(folha).toMatch(/var\(--doc-gold\)/);
    expect(folha).toMatch(/var\(--doc-rule\)/);

    // Dentro da folha só valem tokens de documento e hex fixo. As exceções
    // são o cabeçalho "Visualização do Documento", que fica fora do papel.
    const permitidos = new Set([
      "--doc-gold",
      "--doc-rule",
      "--text",
      "--text-dim",
      "--font-body",
    ]);
    const vazando = [...folha.matchAll(/var\((--[a-z-]+)/g)]
      .map((m) => m[1])
      .filter((token) => !permitidos.has(token));
    expect(vazando).toEqual([]);
  });
});
