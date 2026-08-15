import process from "node:process";
import { loadEnv } from "vite";
import { resolveBuildEnvironment } from "../src/config/environment.js";

function readMode(argv) {
  const index = argv.indexOf("--mode");
  if (index === -1) return process.env.KRIOU_ENV_MODE || "development";
  const mode = argv[index + 1];
  if (!mode || mode.startsWith("-")) throw new Error("[environment] --mode exige um valor.");
  return mode;
}

try {
  const mode = readMode(process.argv.slice(2));
  const fileEnvironment = loadEnv(mode, process.cwd(), "");
  const result = resolveBuildEnvironment({
    ...fileEnvironment,
    ...process.env,
    MODE: mode,
  });
  const project = result.projectRef || "nenhum (offline/local)";
  console.log(
    `[environment] contrato válido: mode=${mode}; app=${result.appEnvironment}; supabase=${result.supabaseEnvironment}; project-ref=${project}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : "[environment] configuração inválida");
  process.exitCode = 1;
}
