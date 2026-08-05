import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Renomear documento responsivamente", () => {
  test.skip(process.env.E2E_LOCAL !== "1", "Requer sessão determinística do Supabase local.");
  test.use({ storageState: "e2e/.auth/user.json" });

  test("modal mantém foco, acessibilidade e atualização local", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const authKey = Object.keys(window.localStorage).find((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
      const session = authKey ? JSON.parse(window.localStorage.getItem(authKey)) : null;
      const userId = session?.user?.id;
      if (!userId) return;
      window.localStorage.setItem(`kriou_user_${userId}_documents`, JSON.stringify([{
        id: `draft-e2e-${userId}`,
        title: "Documento para renomear",
        type: "resume",
        status: "rascunho",
        date: "5 ago.",
        userId,
      }]));
    });

    await page.goto("/dashboard");
    const actions = page.getByRole("button", { name: "Mais ações para Documento para renomear" });
    await expect(actions).toBeVisible();
    await actions.focus();
    await actions.press("Enter");
    const renameAction = page.getByRole("button", { name: "Renomear", exact: true });
    await expect(renameAction).toBeVisible();
    await renameAction.press("Enter");

    const modal = page.getByRole("dialog", { name: "Renomear arquivo" });
    const input = page.getByRole("textbox", { name: "Novo nome" });
    await expect(modal).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("Documento para renomear");

    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(layout.content).toBeLessThanOrEqual(layout.viewport);

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations
      .filter(({ impact }) => impact === "serious" || impact === "critical")
      .map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target.join(" ")) }));
    expect(blockingViolations).toEqual([]);

    await input.fill("Documento renomeado no teste");
    await page.getByRole("button", { name: "Salvar nome" }).click();
    await expect(modal).toBeHidden();
    await expect(page.getByText("Documento renomeado no teste", { exact: true })).toBeVisible();
  });
});
