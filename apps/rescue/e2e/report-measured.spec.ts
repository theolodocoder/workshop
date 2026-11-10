import { expect, test } from "@playwright/test";

// Runs against a server given e2e/fixtures/results.json (see playwright.config.ts, "measured").
test("with measured results, the report shows before and after with the method", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByText("TEST FIXTURE ONLY, not a real measurement")).toBeVisible();
  const lcp = page.getByTestId("metric-lcpMs");
  await expect(lcp).toContainText("4.1 s");
  await expect(lcp).toContainText("1.5 s");
  await expect(page.getByTestId("metric-tbtMs")).toContainText("lab stand-in for INP");
});

test("frontend focus leads the results with speed", async ({ page }) => {
  await page.goto("/report?focus=frontend");
  await expect(page.getByTestId(/^metric-/).first()).toHaveAttribute("data-testid", "metric-lcpMs");
});
