import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Checklist de requisitos responsivo e imprimível", () => {
  test.skip(process.env.E2E_LOCAL !== "1", "Requer sessão determinística do Supabase local.");
  test.use({ storageState: "e2e/.auth/user.json" });

  test("preserva acessibilidade, limites do modal e documento A4", async ({ page, browserName }) => {
    const missingIconWarnings = [];
    page.on("console", (message) => {
      if (message.type() === "warning" && message.text().includes('Icon "')) {
        missingIconWarnings.push(message.text());
      }
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      window.localStorage.setItem("kriou_theme", "light");
      window.sessionStorage.setItem("kriou_template_category", "legal");
    });
    await page.goto("/templates");

    await expect(page.getByRole("heading", { level: 1, name: "Escolha o Tipo de Documento" })).toBeVisible();
    const purchaseCard = page.locator('[role="button"]').filter({
      has: page.getByRole("heading", { level: 3, name: "Compra e Venda" }),
    });
    await expect(purchaseCard).toHaveCount(1);
    await purchaseCard.getByRole("button", { name: "Criar" }).click();

    await expect(page).toHaveURL(/\/legal-editor$/);
    await page.getByRole("button", { name: "Ver requisitos do documento" }).click();

    const dialog = page.getByRole("dialog", { name: "Compra e Venda" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Fechar requisitos" })).toBeFocused();
    await expect(dialog.getByRole("button", {
      name: "Essencial O necessário para um documento seguro",
    })).toBeVisible();

    const layout = await dialog.evaluate((element) => {
      const dialogRect = element.getBoundingClientRect();
      const levelNames = new Set(["Mínimo", "Essencial", "Completo"]);
      const levelButtons = [...element.querySelectorAll("button")].filter((button) =>
        [...levelNames].some((name) => button.textContent?.includes(name))
      );
      return {
        viewportWidth: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        dialogLeft: dialogRect.left,
        dialogRight: dialogRect.right,
        levels: levelButtons.map((button) => {
          const rect = button.getBoundingClientRect();
          return { left: rect.left, right: rect.right };
        }),
      };
    });

    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.dialogLeft).toBeGreaterThanOrEqual(0);
    expect(layout.dialogRight).toBeLessThanOrEqual(layout.viewportWidth);
    for (const level of layout.levels) {
      expect(level.left).toBeGreaterThanOrEqual(layout.dialogLeft);
      expect(level.right).toBeLessThanOrEqual(layout.dialogRight);
    }

    const axeResults = await new AxeBuilder({ page }).include(".print-modal").analyze();
    const blockingViolations = axeResults.violations
      .filter(({ impact }) => impact === "serious" || impact === "critical")
      .map(({ id, impact, nodes }) => ({
        id,
        impact,
        targets: nodes.map((node) => node.target.join(" ")),
      }));
    expect(blockingViolations).toEqual([]);
    expect(missingIconWarnings).toEqual([]);

    await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
    await expect(page.locator(".print-modal")).toBeHidden();
    await expect(page.locator(".print-document")).toBeVisible();
    await expect(page.locator(".print-document")).toContainText("Checklist de Requisitos");
    await expect(page.locator(".print-document")).toContainText("Compra e Venda");
    await expect(page.locator(".print-document")).toContainText("Essencial");

    if (browserName === "chromium") {
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });
      expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
      expect(pdf.byteLength).toBeGreaterThan(10_000);
    }
  });
});
