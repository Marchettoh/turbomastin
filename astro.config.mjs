import { defineConfig } from "astro/config";
import { execFileSync } from "node:child_process";

const production = process.env.RELEASE === "true";
if (production)
  execFileSync(process.execPath, ["scripts/release-check.mjs"], {
    stdio: "inherit",
  });
if (
  process.env.BASE_PATH &&
  !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(process.env.BASE_PATH)
)
  throw new Error("BASE_PATH deve essere / oppure /repository/");
if (process.env.SITE_URL && new URL(process.env.SITE_URL).pathname !== "/")
  throw new Error(
    "SITE_URL deve contenere solo origine; usare BASE_PATH per il percorso",
  );
export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "https://example.invalid",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  vite: { build: { assetsInlineLimit: 0 } },
});
