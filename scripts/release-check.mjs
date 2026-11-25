import { readFileSync, writeFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
const source = readFileSync(
  new URL("../src/data/business.ts", import.meta.url),
  "utf8",
).replace("import.meta.env.SITE_URL", "process.env.SITE_URL");
const { release } = await import(
  `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`
);
const missing = Object.entries(release)
  .filter(([, value]) => !value)
  .map(([key]) => key);
let url;
try {
  url = new URL(process.env.SITE_URL);
  if (
    url.protocol !== "https:" ||
    url.hostname.endsWith(".invalid") ||
    url.hostname === "localhost" ||
    url.hostname.includes("example.")
  )
    missing.push("dominio HTTPS reale");
} catch {
  missing.push("SITE_URL");
}
if (process.env.RELEASE !== "true") missing.push("RELEASE=true");
const privacy = readFileSync(
  new URL("../src/pages/privacy.astro", import.meta.url),
  "utf8",
);
if (
  privacy.includes("da completare con") ||
  privacy.includes("da verificare contrattualmente")
)
  missing.push("revisione integrale informativa privacy");
if (missing.length) {
  console.error(
    "Rilascio bloccato. Confermare/completare:",
    missing.join(", "),
  );
  process.exit(1);
}
if (process.env.CUSTOM_DOMAIN === "true") {
  if ((process.env.BASE_PATH || "/") !== "/")
    throw new Error("Dominio personalizzato richiede BASE_PATH=/");
  writeFileSync(
    new URL("../public/CNAME", import.meta.url),
    `${url.hostname}\n`,
  );
}
console.log(
  "Controlli preliminari superati. Verificare comunque checklist e HTTPS.",
);
