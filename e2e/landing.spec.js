import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("deve carregar a página inicial com título correto", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Documentos");
    await expect(page.locator("text=Criar Grátis").first()).toBeVisible();
  });

  test("deve exibir modelos de currículo", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Modelos de currículo")).toBeVisible();
    const templateCards = page.locator(".surface-card");
    await expect(templateCards.first()).toBeVisible();
  });

  test("deve exibir planos de preço", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("text=Precificação simples")).toBeVisible();
    await expect(page.locator("text=Plano Avulso")).toBeVisible();
    await expect(page.locator("text=Plano Mensal")).toBeVisible();
  });

  test("botão Entrar deve navegar para login", async ({ page }) => {
    await page.goto("/");

    await page.locator("text=Entrar").first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
