import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("deve carregar a página inicial com título correto", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Crie documentos bonitos");
    await expect(page.getByRole("button", { name: "Começar agora" }).first()).toBeVisible();
  });

  test("deve exibir modelos de currículo", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Currículos e documentos jurídicos/ })).toBeVisible();
    const templateCards = page.locator(".surface-card");
    await expect(templateCards.first()).toBeVisible();
  });

  test("deve exibir planos de preço", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Pague pelo documento que precisar." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Avulso" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mensal" })).toBeVisible();
  });

  test("botão Entrar deve navegar para login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
