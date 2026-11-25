import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless", "--no-sandbox"],
});
try {
  const summary = [];
  for (const mode of ["mobile", "desktop"]) {
    const result = await lighthouse(
      "http://localhost:4321/",
      {
        port: chrome.port,
        output: ["json", "html"],
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
      mode === "desktop"
        ? {
            extends: "lighthouse:default",
            settings: {
              formFactor: "desktop",
              screenEmulation: {
                mobile: false,
                width: 1440,
                height: 900,
                deviceScaleFactor: 1,
                disabled: false,
              },
              throttling: {
                rttMs: 40,
                throughputKbps: 10240,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0,
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              },
            },
          }
        : undefined,
    );
    await writeFile(`artifacts/lighthouse-${mode}.json`, result.report[0]);
    await writeFile(`artifacts/lighthouse-${mode}.html`, result.report[1]);
    summary.push({
      mode,
      version: result.lhr.lighthouseVersion,
      date: result.lhr.fetchTime,
      url: result.lhr.finalDisplayedUrl,
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
      metrics: Object.fromEntries(
        [
          "first-contentful-paint",
          "largest-contentful-paint",
          "total-blocking-time",
          "cumulative-layout-shift",
        ].map((key) => [key, result.lhr.audits[key]?.displayValue]),
      ),
      issues: Object.values(result.lhr.audits)
        .filter((a) => a.score !== null && a.score < 1)
        .map((a) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          details: a.details,
        })),
    });
  }
  await writeFile(
    "artifacts/lighthouse-summary.json",
    JSON.stringify(summary, null, 2),
  );
  console.log(summary.map(({ issues, ...rest }) => rest));
} finally {
  chrome.kill();
}
