import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// /report and /check join this list when they're built (Tasks 21 and 24).
const PAGES = ["/", "/c/tents", "/p/ridge-2-dome-tent", "/cart", "/orders", "/no-such-page"];

for (const path of PAGES) {
  test(`${path} has no serious or critical accessibility problems`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(bad.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
  });
}

test("the shop works with a keyboard alone", async ({ page }) => {
  await page.goto("/p/ridge-2-dome-tent");
  // Server-rendered HTML shows before the page's scripts finish loading; start once it's interactive.
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  // The main navigation is reachable by Tab.
  const reached = new Set<string>();
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.innerText?.trim() ?? "");
    reached.add(label);
    if (label === "Add to cart") break;
  }
  expect([...reached]).toEqual(expect.arrayContaining(["Shop", "My orders"]));
  expect(reached.has("Add to cart")).toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.getByText("Added to your cart")).toBeVisible();
});

test("every product photo has a description", async ({ page }) => {
  await page.goto("/c/tents");
  await page.waitForLoadState("networkidle");
  const photos = page.locator('img[src*="products"]');
  expect(await photos.count()).toBeGreaterThan(0);
  const alts = await photos.evaluateAll((imgs) => imgs.map((img) => img.getAttribute("alt") ?? ""));
  expect(alts.filter((a) => a.trim() === "")).toEqual([]);
});
