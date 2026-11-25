import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { CONSENT_KEY, createChoice, parseChoice } from "../src/lib/consent.ts";
const root = "http://localhost:4321/";
await mkdir("artifacts", { recursive: true });
assert.equal(parseChoice(null), null);
assert.equal(parseChoice("bad"), null);
assert.equal(
  parseChoice(JSON.stringify({ ...createChoice(true), maps: "true" })),
  null,
);
assert.equal(
  parseChoice(JSON.stringify(createChoice(true, Date.now() - 400 * 86400000))),
  null,
);
assert.equal(
  parseChoice(JSON.stringify({ ...createChoice(true), version: 99 })),
  null,
);
assert.equal(parseChoice(JSON.stringify(createChoice(false))).maps, false);
const browser = await chromium.launch();
const report = {
  date: new Date().toISOString(),
  environment: "Windows, Playwright Chromium headless",
  checks: [],
  live: {},
};
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
  });
  const external = [];
  const errors = [];
  context.on("request", (req) => {
    if (new URL(req.url()).origin !== new URL(root).origin)
      external.push(req.url());
  });
  await context.route("https://www.google.com/maps/embed?*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html lang="it"><title>Fixture Google Maps</title><body>Risposta simulata solo per il test del consenso.</body></html>',
    }),
  );
  const page = await context.newPage();
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto(root);
  await expect(page.locator(".consent-banner")).toBeVisible();
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(await page.evaluate(() => ({ ...localStorage })), {});
  assert.deepEqual(await context.cookies(), []);
  assert.deepEqual(external, []);
  assert.equal((await new AxeBuilder({ page }).analyze()).violations.length, 0);
  await page.screenshot({ path: "artifacts/cookie-banner-390.png" });
  await page.locator(".consent-banner [data-consent-open]").click();
  await expect(page.locator(".consent-dialog")).toBeVisible();
  await expect(page.locator("#consent-maps")).not.toBeChecked();
  assert.equal((await new AxeBuilder({ page }).analyze()).violations.length, 0);
  await page.screenshot({ path: "artifacts/cookie-preferences-390.png" });
  await page.keyboard.press("Escape");
  await expect(page.locator(".consent-dialog")).not.toBeVisible();
  await expect(
    page.locator(".consent-banner [data-consent-open]"),
  ).toBeFocused();
  await page.locator(".consent-banner [data-consent-reject]").click();
  await page.reload();
  await expect(page.locator(".consent-banner")).not.toBeVisible();
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(external, []);
  report.checks.push(
    "Nessun cookie, storage o collegamento esterno prima della scelta; rifiuto persistente e mappa assente",
  );
  await page.locator("[data-consent-footer]").click();
  await expect(page.locator("#consent-maps")).not.toBeChecked();
  await page.locator("#consent-maps").check();
  await page.locator("[data-consent-save]").click();
  await page.locator(".external-map").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-map-content] iframe")).toHaveCount(1);
  await expect.poll(() => external.length).toBeGreaterThan(0);
  assert.ok(
    external.every((url) =>
      url.startsWith("https://www.google.com/maps/embed?"),
    ),
  );
  await page.locator("[data-consent-footer]").click();
  await expect(page.locator("#consent-maps")).toBeChecked();
  await page.locator("#consent-maps").uncheck();
  await page.locator("[data-consent-save]").click();
  assert.equal(await page.locator("iframe").count(), 0);
  external.length = 0;
  await page.reload();
  await page.locator(".external-map").scrollIntoViewIfNeeded();
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(external, []);
  report.checks.push(
    "Consenso personalizzato carica iframe; revoca lo rimuove; nessuna nuova richiesta dopo revoca e reload (risposta Google simulata)",
  );
  await page.evaluate((key) => localStorage.removeItem(key), CONSENT_KEY);
  await page.reload();
  await page.locator(".consent-banner [data-consent-accept]").click();
  await page.locator(".external-map").scrollIntoViewIfNeeded();
  await expect(page.locator("iframe")).toHaveCount(1);
  const other = await context.newPage();
  await other.goto(root);
  await expect(other.locator(".consent-banner")).not.toBeVisible();
  await other.locator("[data-consent-footer]").click();
  await other.locator(".consent-dialog [data-consent-reject]").click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await other.close();
  report.checks.push(
    "Accetta tutti e preferenza riutilizzata; revoca sincronizzata fra due schede",
  );
  await page.evaluate(
    ({ key, choice }) => localStorage.setItem(key, JSON.stringify(choice)),
    {
      key: CONSENT_KEY,
      choice: createChoice(true, Date.now() - 400 * 86400000),
    },
  );
  await page.reload();
  await expect(page.locator(".consent-banner")).toBeVisible();
  assert.equal(await page.locator("iframe").count(), 0);
  assert.deepEqual(errors, []);
  await context.close();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Bloccato", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Bloccato", "SecurityError");
    };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(root);
  await blockedPage.locator(".consent-banner [data-consent-reject]").click();
  await expect(blockedPage.locator(".consent-banner")).not.toBeVisible();
  assert.equal(await blockedPage.locator("iframe").count(), 0);
  await blocked.close();
  report.checks.push(
    "Scelta scaduta o malformata negata; storage non disponibile non interrompe il rifiuto",
  );
  const live = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "it-IT",
  });
  const livePage = await live.newPage();
  const liveRequests = [];
  const liveFailures = [];
  live.on("request", (req) => {
    const url = new URL(req.url());
    if (url.origin !== new URL(root).origin)
      liveRequests.push({ origin: url.origin, path: url.pathname });
  });
  livePage.on("requestfailed", (req) =>
    liveFailures.push({
      origin: new URL(req.url()).origin,
      error: req.failure()?.errorText,
    }),
  );
  await livePage.goto(root);
  assert.deepEqual(liveRequests, []);
  await livePage.locator(".consent-banner [data-consent-accept]").click();
  await livePage.locator(".external-map").scrollIntoViewIfNeeded();
  const frame = livePage.locator("[data-map-content] iframe");
  await expect(frame).toHaveCount(1);
  await livePage.waitForTimeout(10000);
  const googleFrame = livePage
    .frames()
    .find((f) => f.url().startsWith("https://www.google.com/maps/embed"));
  report.live.frameUrl = googleFrame?.url();
  report.live.text = googleFrame
    ? (
        await googleFrame
          .locator("body")
          .innerText({ timeout: 10000 })
          .catch(() => "")
      ).slice(0, 2000)
    : "";
  report.live.requests = liveRequests;
  report.live.failures = liveFailures;
  report.live.cookies = (await live.cookies()).map(
    ({ name, domain, expires, secure, sameSite }) => ({
      name,
      domain,
      expires,
      secure,
      sameSite,
    }),
  );
  await livePage
    .locator(".external-map")
    .screenshot({ path: "artifacts/map-consented-1440.png" });
  await livePage.locator("[data-consent-footer]").click();
  await livePage.locator(".consent-dialog [data-consent-reject]").click();
  await expect(frame).toHaveCount(0);
  report.live.revocationRemovesIframe = true;
  report.checks.push(
    "Prova Google Maps reale separata dalla simulazione; richieste, cookie e risultato salvati in live",
  );
  await live.close();
  await writeFile(
    "artifacts/consent-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log("PASS", report.checks, "Mappa reale:", report.live.text);
} finally {
  await browser.close();
}
