import { expect, test } from "@playwright/test";

test("rescued: Ben's order is blocked", async ({ page }) => {
  await page.goto("/orders", { waitUntil: "networkidle" });
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();

  await page.getByText("Try to open Ben's order").click();

  const result = page.getByTestId("break-result");
  await expect(result).toContainText("Blocked");
  await expect(result).not.toContainText("Summit Light Tent");
});
