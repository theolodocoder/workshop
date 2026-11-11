import { expect, test } from "@playwright/test";

// Runs on the "store-down" server, which has no results file (RESULTS_PATH points nowhere).
test("without measured results, the report says so instead of showing numbers", async ({ page }) => {
  await page.goto("/report");
  await expect(page.getByText("Not measured yet")).toBeVisible();
  await expect(page.getByText(/\d+(\.\d+)?\s?s\b/)).toHaveCount(0);
});
