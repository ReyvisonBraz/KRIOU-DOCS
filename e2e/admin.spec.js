import { test, expect } from "@playwright/test";

test.describe("Painel administrativo (admin local)", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("admin acessa métricas e usuários sem erro de backend", async ({ page }) => {
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Painel Administrativo" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Usuários" })).toBeVisible();
    await expect(page.getByText("2 no período")).toBeVisible();
    await expect(
      page.getByText("Edge Function returned a non-2xx status code"),
    ).toHaveCount(0);

    await page.reload();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Painel Administrativo" }),
    ).toBeVisible();
  });
});

test.describe("Painel administrativo (usuário comum local)", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("usuário comum é redirecionado para o dashboard", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: "Olá, Usuario" }),
    ).toBeVisible();
  });
});
