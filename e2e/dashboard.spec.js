import { test, expect } from "@playwright/test";

test.describe("Dashboard (autenticado)", () => {
  test.use({
    storageState: "e2e/.auth/user.json",
  });

  test("deve exibir saudação do usuário", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: "Olá, Usuario" }),
    ).toBeVisible();
  });

  test("deve exibir busca e ações de criação", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByPlaceholder("Buscar por nome, CPF, RG ou código..."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo Currículo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Novo Documento" })).toBeVisible();
  });

  test("deve permitir criar novo currículo", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Novo Currículo" }).click();
    await expect(page).toHaveURL(/\/templates/);
  });

  test("deve permitir criar novo documento jurídico", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("button", { name: "Novo Documento" }).click();
    await expect(page).toHaveURL(/\/templates/);
  });
});
