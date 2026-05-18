import { test, expect } from "@playwright/test";

test.describe("Dashboard (autenticado)", () => {
  test.use({
    storageState: "e2e/.auth/user.json",
  });

  test("deve exibir saudação do usuário", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.locator("text=Documentos")).toBeVisible();
  });

  test("deve exibir tabs de filtro", async ({ page }) => {
    await page.goto("/dashboard");

    const tabs = ["Todos", "Currículos", "Compra/Venda", "Locação"];
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`).first()).toBeVisible();
    }
  });

  test("deve permitir criar novo currículo", async ({ page }) => {
    await page.goto("/dashboard");

    await page.locator('button:has-text("Currículo")').first().click();
    await expect(page).toHaveURL(/\/templates/);
  });

  test("deve permitir criar novo documento jurídico", async ({ page }) => {
    await page.goto("/dashboard");

    await page.locator('button:has-text("Documento")').first().click();
    await expect(page).toHaveURL(/\/templates/);
  });
});
