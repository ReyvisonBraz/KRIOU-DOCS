import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";
import { resolveClientEnvironment } from "../src/config/environment.js";

const AUTH_FILE = path.resolve("e2e/.auth/user.json");
const publicProcessEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => name.startsWith("VITE_")),
);
const publicEnvironment = {
  ...loadEnv("e2e", process.cwd(), "VITE_"),
  ...publicProcessEnvironment,
};
const privateEnvironment = { ...loadEnv("e2e", process.cwd(), "E2E_"), ...process.env };
const TEST_EMAIL = privateEnvironment.E2E_TEST_EMAIL;
const TEST_PASSWORD = privateEnvironment.E2E_TEST_PASSWORD;

/**
 * Login real e protegido para a homologação. Nunca usa produção, mock de token
 * ou service_role. O storageState gerado contém sessão e fica em diretório
 * ignorado pelo Git.
 */
setup("autenticar conta descartável na homologação", async ({ page }) => {
  rmSync(AUTH_FILE, { force: true });
  setup.skip(
    !TEST_EMAIL && !TEST_PASSWORD,
    "E2E_TEST_EMAIL/E2E_TEST_PASSWORD ausentes; smoke autenticado não executado.",
  );

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error("E2E_TEST_EMAIL e E2E_TEST_PASSWORD devem ser configuradas juntas.");
  }

  const environment = resolveClientEnvironment({
    ...publicEnvironment,
    MODE: "production",
  });
  if (environment.appEnvironment !== "preview" || environment.supabaseEnvironment !== "staging") {
    throw new Error("Setup autenticado só pode executar em Preview/homologação.");
  }

  const supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (error || !data.session) {
    throw new Error("Falha ao autenticar a conta descartável de homologação.");
  }

  await page.goto("/");
  const storageKey = `sb-${environment.projectRef}-auth-token`;
  await page.evaluate(
    ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
    { key: storageKey, session: data.session },
  );

  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
