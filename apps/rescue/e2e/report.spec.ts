import { expect, test } from "@playwright/test";

test("the report shows 9 fixes, security first by default", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByRole("heading", { level: 1, name: "Rescue report" })).toBeVisible();
  const cards = page.getByTestId("fix-card");
  await expect(cards).toHaveCount(9);
  await expect(cards.first()).toContainText("Fix 1");
});

test("frontend focus puts speed, then accessibility, first", async ({ page }) => {
  await page.goto("/report?focus=frontend");
  const cards = page.getByTestId("fix-card");
  await expect(cards.nth(0)).toContainText("Fix 7");
  await expect(cards.nth(1)).toContainText("Fix 8");
  await expect(cards.last()).toContainText("Fix 3");
});

test("every fix links to its public commit on GitHub", async ({ page }) => {
  await page.goto("/report");
  const links = page.getByRole("link", { name: "See the commit" });
  await expect(links).toHaveCount(9);
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  for (const h of hrefs) expect(h).toMatch(/^https:\/\/github\.com\/theolodocoder\/workshop\/commit\/[0-9a-f]{40}$/);
  await expect(page.getByText("Link after release")).toHaveCount(0);
});
