import { defineConfig } from "@playwright/test";
import { loadEnv } from "vite";

const localEnvironment = loadEnv("e2e", process.cwd(), "VITE_");
const configuredEnvironment = { ...localEnvironment, ...process.env };
const webServerEnvironment = Object.fromEntries(
  Object.entries(configuredEnvironment).filter(([name]) => !name.startsWith("E2E_")),
);
const e2ePort = Number(process.env.E2E_PORT ?? 4173);

if (!Number.isInteger(e2ePort) || e2ePort < 1024 || e2ePort > 65535) {
  throw new Error("E2E_PORT deve ser uma porta válida entre 1024 e 65535");
}

const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;
const chromium = { browserName: "chromium" };

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: e2eBaseUrl,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "public",
      testMatch: /landing\.spec\.js/,
      use: chromium,
    },
    {
      name: "setup",
      testMatch: /auth\.setup\.js/,
      use: chromium,
    },
    {
      name: "authenticated",
      testMatch: /dashboard\.spec\.js/,
      dependencies: ["setup"],
      use: { ...chromium, storageState: "e2e/.auth/user.json" },
    },
  ],
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${e2ePort} --strictPort`,
    env: {
      ...webServerEnvironment,
      VITE_APP_ENV: configuredEnvironment.VITE_APP_ENV || "local",
      VITE_ALLOW_OFFLINE: configuredEnvironment.VITE_ALLOW_OFFLINE
        || (configuredEnvironment.VITE_SUPABASE_URL ? "false" : "true"),
    },
    url: e2eBaseUrl,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
