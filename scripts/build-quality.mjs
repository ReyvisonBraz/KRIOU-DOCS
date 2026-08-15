import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

if (process.env.VERCEL || process.env.VERCEL_ENV) {
  console.error("[build:ci] modo offline de qualidade é proibido dentro da Vercel.");
  process.exit(1);
}

const viteCli = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const result = spawnSync(
  process.execPath,
  [viteCli, "build", "--mode", "quality"],
  {
    stdio: "inherit",
    env: { ...process.env, KRIOU_QUALITY_BUILD: "1" },
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
