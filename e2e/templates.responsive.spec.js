import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Modelos de currículo responsivos", () => {
  test.skip(process.env.E2E_LOCAL !== "1", "Requer sessão determinística do Supabase local.");
  test.use({ storageState: "e2e/.auth/user.json" });

  for (const theme of ["light", "dark"]) {
    test(`${theme}: cards têm ações válidas, sem overflow ou violações graves`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("kriou_theme", selectedTheme);
        window.sessionStorage.setItem("kriou_template_category", "resume");
      }, theme);
      await page.goto("/templates");

      const categoryHeading = page.getByRole("heading", { level: 1, name: "O que deseja criar?" });
      if (await categoryHeading.isVisible()) {
        await page.getByRole("button", { name: "Currículos Modelos profissionais com visualização em tempo real. Escolha o layout que combina com sua área. 10 modelos Preview visual" }).click();
      }
      await expect(page.getByRole("heading", { level: 1, name: "Modelos de Currículo" })).toBeVisible();
      await expect(page.getByRole("article", { name: "Executivo" })).toBeVisible();

      const useButton = page.getByRole("button", { name: "Usar modelo Executivo" });
      const specButton = page.getByRole("button", { name: "Ver ficha do modelo Executivo" });
      await expect(useButton).toBeAttached();
      await expect(specButton).toBeAttached();
      await useButton.focus();
      await expect(useButton).toBeFocused();
      await specButton.focus();
      await expect(specButton).toBeFocused();
      await specButton.press("Enter");

      const detailsDrawer = page.getByRole("dialog", { name: "Executivo" });
      await expect(detailsDrawer).toBeVisible();
      await expect(page.getByRole("button", { name: "Fechar painel" })).toBeFocused();

      const structure = await page.evaluate(() => ({
        invalidNestedActions: document.querySelectorAll(
          "button button, button a, a button, [role='button'] button, [role='button'] a",
        ).length,
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(structure.invalidNestedActions).toBe(0);
      expect(structure.content).toBeLessThanOrEqual(structure.viewport);

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations
        .filter(({ impact }) => impact === "serious" || impact === "critical")
        .map(({ id, impact, nodes }) => ({
          id,
          impact,
          targets: nodes.map((node) => node.target.join(" ")),
        }));

      expect(blockingViolations).toEqual([]);

      await page.keyboard.press("Escape");
      await expect(detailsDrawer).toBeHidden();
      await expect(specButton).toBeFocused();
    });
  }
});
