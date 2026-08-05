import { test, expect } from "@playwright/test";

const PROTECTED_PATHS = [
  "/dashboard",
  "/templates",
  "/editor",
  "/preview",
  "/checkout",
  "/profile",
  "/legal-editor",
  "/admin",
];

test.describe("Navegação e proteção de rotas", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test("landing não tenta persistir rascunho sem usuário", async ({ page }) => {
    const warnings = [];
    page.on("console", (message) => {
      if (message.type() === "warning" || message.type() === "warn") {
        warnings.push(message.text());
      }
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(1800);

    expect(
      warnings.filter((message) => message.includes("saveDraft")),
    ).toEqual([]);
  });

  for (const path of PROTECTED_PATHS) {
    test(`visitante em ${path} retorna para a landing`, async ({ page }) => {
      await page.goto(path);

      await expect.poll(() => new URL(page.url()).pathname).toBe("/");
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        "Crie documentos bonitos",
      );
    });
  }

  test("refresh direto em /login preserva a rota pública", async ({ page }) => {
    await page.goto("/login");
    await page.reload();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Entre para continuar" }),
    ).toBeVisible();
  });

  test("rota desconhecida retorna para a landing", async ({ page }) => {
    await page.goto("/rota-inexistente");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Crie documentos bonitos",
    );
  });

  test("callback OAuth direto monta a tela intermediária", async ({ page }) => {
    await page.goto("/auth/callback");

    await expect(page).toHaveURL(/\/auth\/callback$/);
    await expect(page.getByText("Verificando login...")).toBeVisible();
  });
});
