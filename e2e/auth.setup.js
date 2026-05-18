import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.resolve("e2e/.auth/user.json");

/**
 * ============================================
 * KRIOU DOCS — Auth Setup para E2E
 * ============================================
 *
 * Para executar testes autenticados:
 *   1. Configure VITE_TEST_EMAIL e VITE_TEST_PASSWORD no .env
 *   2. Execute: npx playwright test --project=setup
 *   3. Execute: npx playwright test
 *
 * Alternativa: use storageState manual via login manual
 *   - Faça login no app em http://localhost:5173
 *   - No console: localStorage.getItem("supabase.auth.token")
 *   - Salve como e2e/.auth/user.json
 * ============================================
 */

const TEST_EMAIL = process.env.VITE_TEST_EMAIL;
const TEST_PASSWORD = process.env.VITE_TEST_PASSWORD;

setup("autenticar via Google OAuth (mock)", async ({ page }) => {
  if (!TEST_EMAIL) {
    console.warn("[E2E] VITE_TEST_EMAIL não configurado. Pule este setup.");
    return;
  }

  await page.goto("/login");
  await page.waitForTimeout(2000);

  // Intercepta a chamada do Supabase OAuth para mock
  await page.route("**/auth/v1/authorize**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        url: "http://localhost:5173/auth/callback?access_token=mock-token",
      }),
    });
  });

  await page.locator('button:has-text("Google")').click();

  await page.waitForURL(/\/auth\/callback/);
  await page.context().storageState({ path: AUTH_FILE });
});
