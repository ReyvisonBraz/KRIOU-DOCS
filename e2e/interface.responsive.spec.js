import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const THEMES = ["light", "dark"];

async function openLanding(page, theme) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem("kriou_theme", selectedTheme);
  }, theme);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(500);
}

for (const theme of THEMES) {
  test(`landing ${theme} não possui violações graves de acessibilidade`, async ({ page }) => {
    await openLanding(page, theme);

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical"
    );

    const summary = blockingViolations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      targets: nodes.map((node) => node.target.join(" ")),
    }));

    expect(summary).toEqual([]);
  });
}

test("landing não cria rolagem horizontal", async ({ page }) => {
  await openLanding(page, "light");

  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test("menu móvel mantém as ações principais acessíveis", async ({ page }) => {
  test.skip(page.viewportSize().width >= 768, "Comportamento exclusivo do menu móvel.");
  await openLanding(page, "light");

  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("button", { name: "Começar agora" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
