import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const origin = process.env.TEST_URL || "http://localhost:4321";
const base = process.env.TEST_BASE || "/";
const root = `${origin}${base}`;
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch();
const results = {
  date: new Date().toISOString(),
  root,
  environment:
    "Windows, Chromium Playwright headless, emulazione viewport; non dispositivi reali",
  widths: [],
  errors: [],
  externalRequests: [],
  resources: [],
};
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (e) => results.errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") results.errors.push(msg.text());
});
page.on("request", (req) => {
  if (new URL(req.url()).origin !== origin)
    results.externalRequests.push(req.url());
});
page.on("response", (res) => {
  if (res.status() >= 400) results.errors.push(`${res.status()} ${res.url()}`);
  results.resources.push({ url: res.url(), status: res.status() });
});
for (const width of [320, 375, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(root);
  if (width === 320) {
    assert.equal(await page.locator("[data-map-content] iframe").count(), 0);
    results.beforeChoice = await page.evaluate(() => ({ ...localStorage }));
    assert.deepEqual(results.beforeChoice, {});
    await page.locator(".consent-banner [data-consent-reject]").click();
  }
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute("content"),
    "noindex, nofollow",
  );
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    dimensions.scroll <= dimensions.client,
    `Overflow ${width}: ${JSON.stringify(dimensions)}`,
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    [],
    `Axe ${width}`,
  );
  if (width < 761) {
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    assert.equal(await toggle.getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent),
      "Servizi",
    );
    await page.keyboard.press("Escape");
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.ok(await toggle.evaluate((el) => el === document.activeElement));
    await toggle.click();
    await page.locator("nav a").first().click();
    assert.equal(await toggle.getAttribute("aria-expanded"), "false");
    assert.ok((await page.locator("#servizi").boundingBox()).y >= -1);
    await page.goto(root);
  }
  const photo = page.locator("[data-gallery]").first();
  await photo.scrollIntoViewIfNeeded();
  await page.evaluate(async () =>
    Promise.all([...document.images].map((image) => image.decode())),
  );
  await photo.focus();
  await page.keyboard.press("Enter");
  const dialog = page.locator(".photo-dialog");
  assert.ok(await dialog.isVisible());
  await page.locator(".dialog-photo img").evaluate((image) => image.decode());
  assert.equal((await new AxeBuilder({ page }).analyze()).violations.length, 0);
  if (width === 390 || width === 1440)
    await page.screenshot({ path: `artifacts/gallery-${width}.png` });
  assert.ok(await dialog.evaluate((el) => el.matches(":modal")));
  assert.ok(
    await page
      .getByRole("button", { name: "Chiudi" })
      .evaluate((el) => el === document.activeElement),
  );
  await page.keyboard.press("Escape");
  assert.ok(!(await dialog.isVisible()));
  assert.ok(await photo.evaluate((el) => el === document.activeElement));
  await photo.click();
  await page.getByRole("button", { name: "Chiudi" }).click();
  assert.ok(!(await dialog.isVisible()));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.locator("h1").click();
  await page.screenshot({
    path: `artifacts/home-${width}${base === "/" ? "" : "-nested"}.png`,
    fullPage: true,
  });
  results.widths.push({
    width,
    overflow: false,
    axeViolations: axe.violations.length,
  });
}
assert.ok((await page.locator('a[href="tel:+390457704390"]').count()) > 0);
assert.match(await page.locator(".hours").innerText(), /Domenica\s+Chiuso/);
assert.ok(
  (await page.locator('a[href="mailto:turbomastin@tiscali.it"]').count()) > 0,
);
assert.match(
  await page
    .getByRole("link", { name: /Ottieni indicazioni/ })
    .getAttribute("href"),
  /maps\/search\/\?api=1&query=/,
);
results.cookies = await context.cookies();
results.storage = await page.evaluate(() => ({
  local: { ...localStorage },
  session: { ...sessionStorage },
}));
assert.equal(results.cookies.length, 0);
assert.deepEqual(Object.keys(results.storage.local), [
  "turbomastin:privacy:v1",
]);
assert.equal(
  JSON.parse(results.storage.local["turbomastin:privacy:v1"]).maps,
  false,
);
assert.deepEqual(results.storage.session, {});
assert.equal(await page.locator("[data-map-content] iframe").count(), 0);
assert.equal(await page.locator(".reviews blockquote").count(), 3);
assert.equal(
  await page.getByRole("img", { name: "5 stelle su 5", exact: true }).count(),
  3,
);
assert.equal(
  await page.locator(".header-whatsapp").getAttribute("href"),
  "https://wa.me/393939305804",
);
assert.equal(
  await page.locator(".whatsapp-contact").getAttribute("href"),
  "https://wa.me/393939305804",
);
assert.deepEqual(results.externalRequests, []);
assert.deepEqual(results.errors, []);
await page.goto(`${root}privacy/`);
assert.ok(await page.getByRole("heading", { level: 1 }).isVisible());
assert.equal((await new AxeBuilder({ page }).analyze()).violations.length, 0);
assert.deepEqual(results.errors, []);
await page.goto(`${root}404.html`);
assert.match(await page.locator("h1").innerText(), /page|pagina/);
const response = await page.goto(`${root}questa-pagina-non-esiste/`);
assert.equal(response.status(), 404);
results.expected404Events = results.errors.splice(0);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(root);
assert.equal(
  await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  ),
  "auto",
);
await page.keyboard.press("Tab");
assert.equal(
  await page.evaluate(() => document.activeElement.textContent),
  "Vai al contenuto",
);
await page.keyboard.press("Enter");
assert.equal(await page.evaluate(() => document.activeElement.id), "contenuto");
const nojs = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 320, height: 800 },
});
const plain = await nojs.newPage();
await plain.goto(root);
assert.ok(await plain.locator("nav").isVisible());
assert.ok(await plain.locator("h1").isVisible());
assert.ok(await plain.locator('.hero a[href="tel:+390457704390"]').isVisible());
results.additionalChecks = [
  "tel/mail/map href",
  "privacy",
  "404 reale",
  "reduced motion",
  "skip link tastiera",
  "JavaScript disattivato",
  "menu tastiera/Escape/focus",
  "galleria dialog modale, apertura tastiera, Escape, pulsante chiudi, focus restituito",
  "immagini decodificate senza risorse mancanti",
  "nessuna richiesta terza parte al caricamento",
];
await writeFile(
  `artifacts/test-report${base === "/" ? "" : "-nested"}.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
console.log("PASS", results.widths, results.additionalChecks);
