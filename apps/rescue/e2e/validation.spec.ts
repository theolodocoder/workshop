import { expect, test } from "@playwright/test";

test("a quantity outside 1 to 10 is refused with a clear message", async ({ page }) => {
  await page.goto("/p/summit-light-tent");
  const qty = page.locator('input[type="number"]');
  for (const bad of ["0", "-3", "9999"]) {
    await qty.fill(bad);
    await page.getByText("Add to cart").click();
    await expect(page.getByText("Choose a quantity from 1 to 10")).toBeVisible();
  }
  const cart = await page.evaluate(() => localStorage.getItem("cart"));
  expect(cart).toBeNull();
});
