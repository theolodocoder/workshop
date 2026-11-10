import { expect, test } from "@playwright/test";

test("a demo shopper can browse, add a tent, check out and see the order", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();

  await page.getByText("Tents", { exact: true }).click();
  await page.getByText("Summit Light Tent").click();
  await expect(page.getByRole("heading", { name: "Summit Light Tent" })).toBeVisible();
  await page.getByText("Add to cart").click();

  await page.goto("/cart");
  await expect(page.getByText("Summit Light Tent")).toBeVisible();
  await page.getByText("Place order").click();

  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByText("Summit Light Tent")).toBeVisible();
});
