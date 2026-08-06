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

  test("move para a lixeira, sobrevive ao refresh e restaura", async ({ page }) => {
    await page.goto("/dashboard");

    const actionsTrigger = page.getByRole("button", { name: "Mais ações para Documento lixeira E2E" });
    const moveToTrash = page.getByRole("button", { name: "Mover para a lixeira" });
    await expect(async () => {
      if (!await moveToTrash.isVisible()) await actionsTrigger.click();
      await expect(moveToTrash).toBeVisible();
    }).toPass();
    await moveToTrash.click();
    await page.getByRole("button", { name: "Mover para lixeira", exact: true }).click();
    await expect(page.getByText("Documento movido para a lixeira.")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: /^Lixeira/ }).click();
    await expect(page.getByRole("article", { name: "Documento lixeira E2E" })).toBeVisible();
    await page.getByRole("button", { name: "Restaurar documento" }).click();

    await expect(page.getByRole("heading", { name: "Sua lixeira está vazia" })).toBeVisible();
    await page.getByRole("button", { name: "Voltar aos documentos" }).click();
    await expect(page.getByRole("article", { name: "Documento lixeira E2E" })).toBeVisible();
  });
});
