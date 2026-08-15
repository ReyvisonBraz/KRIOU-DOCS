import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

function environmentWithoutPublicOverrides() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([name]) => (
      !name.startsWith("VITE_")
      && name !== "VERCEL"
      && name !== "VERCEL_ENV"
      && name !== "KRIOU_QUALITY_BUILD"
      && name !== "KRIOU_ENV_MODE"
    )),
  );
}

describe("env:check", () => {
  it("carrega o .env.local documentado com a precedência do Vite", () => {
    const directory = mkdtempSync(join(tmpdir(), "kriou-env-check-"));
    const script = resolve("scripts/check-environment.mjs");
    const example = resolve(".env.example");
    try {
      copyFileSync(example, join(directory, ".env.local"));
      const output = execFileSync(
        process.execPath,
        [script, "--mode", "development"],
        {
          cwd: directory,
          env: environmentWithoutPublicOverrides(),
          encoding: "utf8",
        },
      );

      expect(output).toContain("contrato válido");
      expect(output).toContain("mode=development");
      expect(output).toContain("app=local");
      expect(output).toContain("supabase=offline");
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
