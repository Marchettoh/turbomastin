import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
const site = "https://turbomastin.dallaviaweb.it";
assert.equal(
  process.env.PUBLIC_PREVIEW,
  "true",
  "Richiesta autorizzazione esplicita alla build di anteprima",
);
assert.equal(
  process.env.RELEASE,
  "false",
  "L’anteprima non può essere una build di rilascio",
);
assert.equal(
  process.env.SITE_URL,
  site,
  "Dominio di anteprima diverso da quello autorizzato",
);
assert.equal(
  process.env.BASE_PATH,
  "/",
  "Il sottodominio richiede BASE_PATH=/",
);
const cname = resolve("public/CNAME");
if (existsSync(cname))
  assert.equal(
    readFileSync(cname, "utf8").trim(),
    new URL(site).hostname,
    "CNAME locale incompatibile con l’anteprima",
  );
if (process.argv.includes("--built")) {
  const root = resolve("dist");
  const pages = [];
  function inspect(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (entry.name.endsWith(".html")) {
        const html = readFileSync(path, "utf8");
        assert.match(
          html,
          /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["']noindex,\s*nofollow["'])[^>]*>/i,
          `noindex mancante: ${path}`,
        );
        assert.match(
          html,
          /data-public-preview/,
          `Avviso di anteprima mancante: ${path}`,
        );
        assert.doesNotMatch(
          html,
          /<link\b[^>]*\brel=["']canonical["']/i,
          `Canonical di produzione nell’anteprima: ${path}`,
        );
        pages.push(path);
      }
    }
  }
  inspect(root);
  assert.ok(pages.length >= 3, "Pagine statiche mancanti");
  assert.match(
    readFileSync(join(root, "robots.txt"), "utf8"),
    /^Disallow: \/\s*$/m,
    "robots.txt non blocca i crawler",
  );
  assert.match(
    readFileSync(join(root, "privacy/index.html"), "utf8"),
    /Bozza per revisione/,
    "La bozza privacy non è segnalata",
  );
  writeFileSync(join(root, "CNAME"), `${new URL(site).hostname}\n`);
  console.log(
    `Anteprima verificata: ${pages.length} pagine non indicizzabili, dominio ${site}`,
  );
} else
  console.log(
    "Configurazione di sola anteprima verificata; controlli di produzione invariati.",
  );
