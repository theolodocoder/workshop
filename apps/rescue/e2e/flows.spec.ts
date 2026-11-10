import { expect, test } from "@playwright/test";

test("browse, add two things, change a quantity, remove one, check out", async ({ page }) => {
  await page.goto("/shop", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Sign in as a demo shopper" }).click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();

  // Category, then product, then add.
  await page.getByRole("link", { name: "Cooking", exact: true }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Cooking" })).toBeVisible();
  await page.getByRole("link", { name: /Flameline Stove/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByText("Added to your cart")).toBeVisible();

  await page.goto("/p/enamel-camp-mug", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByText("Added to your cart")).toBeVisible();

  // Cart: change the stove to 3, remove the mug.
  await page.getByRole("link", { name: "Cart" }).click();
  await page.getByLabel("Quantity for Flameline Stove").fill("3");
  await page.getByLabel("Quantity for Flameline Stove").blur();
  await expect(page.getByText("$237.00").first()).toBeVisible();
  await page.getByRole("button", { name: "Remove Enamel Camp Mug" }).click();
  await expect(page.getByText("Enamel Camp Mug")).toHaveCount(0);

  // Checkout: the order shows the server's total (3 × $79.00).
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole("cell", { name: "Flameline Stove ×3" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "$237.00" })).toBeVisible();
});
