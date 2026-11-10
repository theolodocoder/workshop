import { expect, test } from "@playwright/test";

test("before: a demo shopper can read Ben's order", async ({ page }) => {
  await page.goto("/orders");
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();

  await page.getByText("Try to open Ben's order").click();

  const result = page.getByTestId("break-result");
  await expect(result).toContainText("Ben's order opened");
  await expect(result).toContainText("Summit Light Tent");
  await expect(result).toContainText("Total $787.00");
});
