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

test("without measured results, the report says so instead of showing numbers", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByText("Not measured yet")).toBeVisible();
  await expect(page.getByText(/\d+(\.\d+)?\s?s\b/)).toHaveCount(0);
});

test("a fix without a released commit says so, not a broken link", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByText("Link after release").first()).toBeVisible();
});
