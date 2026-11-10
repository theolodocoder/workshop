/* global process, console */
// Counts serious + critical accessibility problems (axe, WCAG 2.2 AA) on one page, for the report.
// Usage (from apps/rescue): node e2e-tools/axe-count.mjs <url>
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const url = process.argv[2];
if (!url) {
  console.error("usage: axe-count <url>");
  process.exit(2);
}
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto(url, { waitUntil: "networkidle" });
const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
await browser.close();
const count = violations.filter((v) => v.impact === "serious" || v.impact === "critical").reduce((n, v) => n + v.nodes.length, 0);
console.log(count);
