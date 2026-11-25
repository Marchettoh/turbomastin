import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
const valid = {
  ...process.env,
  PUBLIC_PREVIEW: "true",
  RELEASE: "false",
  SITE_URL: "https://turbomastin.dallaviaweb.it",
  BASE_PATH: "/",
};
function run(overrides = {}) {
  return spawnSync(process.execPath, ["scripts/preview-check.mjs"], {
    env: { ...valid, ...overrides },
    encoding: "utf8",
  });
}
assert.equal(run().status, 0);
for (const overrides of [
  { PUBLIC_PREVIEW: "false" },
  { RELEASE: "true" },
  { SITE_URL: "https://example.invalid" },
  { BASE_PATH: "/turbomastin/" },
])
  assert.notEqual(run(overrides).status, 0);
if (process.argv.includes("--built")) {
  const built = spawnSync(
    process.execPath,
    ["scripts/preview-check.mjs", "--built"],
    { env: valid, encoding: "utf8" },
  );
  assert.equal(built.status, 0, built.stdout + built.stderr);
}
console.log(
  "PASS: anteprima esplicita, produzione negata, dominio e base vincolati" +
    (process.argv.includes("--built") ? ", HTML/robots/bozza verificati" : ""),
);
