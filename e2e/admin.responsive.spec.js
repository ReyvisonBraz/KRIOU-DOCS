import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Lista administrativa responsiva", () => {
  test.skip(process.env.E2E_LOCAL !== "1", "Requer Supabase local e Edge Functions servidas.");
  test.use({ storageState: "e2e/.auth/admin.json" });

  for (const theme of ["light", "dark"]) {
    test(`${theme}: usuários mantêm semântica e leitura por viewport`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((selectedTheme) => window.localStorage.setItem("kriou_theme", selectedTheme), theme);
      await page.goto("/admin");

      await expect(page.getByRole("heading", { name: "Painel Administrativo" })).toBeVisible();
      await page.getByRole("button", { name: "Usuários" }).click();
      const table = page.getByRole("table", { name: "Usuários cadastrados" });
      await expect(table).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "E-mail" })).toBeAttached();

      const layout = await page.evaluate(() => {
        const tableElement = document.querySelector(".kriou-data-table");
        const firstRow = tableElement?.querySelector("tbody tr");
        return {
          viewport: document.documentElement.clientWidth,
          content: document.documentElement.scrollWidth,
          tableDisplay: tableElement ? getComputedStyle(tableElement).display : null,
          rowDisplay: firstRow ? getComputedStyle(firstRow).display : null,
        };
      });
      expect(layout.content).toBeLessThanOrEqual(layout.viewport);
      if (page.viewportSize().width < 768) {
        expect(layout.tableDisplay).toBe("block");
        expect(layout.rowDisplay).toBe("block");
      } else {
        expect(layout.tableDisplay).toBe("table");
        expect(layout.rowDisplay).toBe("table-row");
      }

      const results = await new AxeBuilder({ page }).analyze();
      const blockingViolations = results.violations
        .filter(({ impact }) => impact === "serious" || impact === "critical")
        .map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target.join(" ")) }));
      expect(blockingViolations).toEqual([]);
    });
  }
});
