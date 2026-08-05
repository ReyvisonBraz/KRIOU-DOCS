import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Dashboard responsivo autenticado", () => {
  test.skip(process.env.E2E_LOCAL !== "1", "Requer sessão determinística do Supabase local.");
  test.use({ storageState: "e2e/.auth/user.json" });

  for (const theme of ["light", "dark"]) {
    test(`${theme}: sem overflow ou violações graves`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("kriou_theme", selectedTheme);
      }, theme);
      await page.goto("/dashboard");

      await expect(page.getByRole("heading", { name: "Olá, Usuario" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Novo Currículo" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Novo Documento" })).toBeVisible();

      const layout = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(layout.content).toBeLessThanOrEqual(layout.viewport);

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations
        .filter(({ impact }) => impact === "serious" || impact === "critical")
        .map(({ id, impact, nodes }) => ({
          id,
          impact,
          targets: nodes.map((node) => node.target.join(" ")),
        }));

      expect(blockingViolations).toEqual([]);
    });
  }
});
