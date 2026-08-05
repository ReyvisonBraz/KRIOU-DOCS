import { defineConfig, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";

const localSupabaseEnv = (() => {
  if (process.env.E2E_LOCAL !== "1") return {};

  const status = JSON.parse(
    execFileSync("supabase", ["status", "--output", "json"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );

  return {
    VITE_SUPABASE_URL: status.API_URL,
    VITE_SUPABASE_ANON_KEY: status.ANON_KEY,
  };
})();

const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "mobile-android",
      testMatch: /.*\.responsive\.spec\.js/,
      use: {
        browserName: "chromium",
        viewport: { width: 360, height: 800 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile-iphone",
      testMatch: /.*\.responsive\.spec\.js/,
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "tablet",
      testMatch: /.*\.responsive\.spec\.js/,
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
  webServer: {
    command: process.env.E2E_LOCAL === "1"
      ? "npm run dev -- --host 127.0.0.1 --port 5174"
      : "npm run dev",
    env: { ...process.env, ...localSupabaseEnv },
    url: baseURL,
    reuseExistingServer: process.env.E2E_LOCAL !== "1",
    timeout: 30000,
  },
});
