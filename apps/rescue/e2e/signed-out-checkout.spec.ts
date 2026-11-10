import { expect, test } from "@playwright/test";

test("checking out while signed out asks you to sign in, then works", async ({ page }) => {
  await page.goto("/p/enamel-camp-mug", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByText("Sign in to place your order")).toBeVisible();
  await expect(page.getByText("The store didn't answer")).toHaveCount(0);

  await page.getByRole("main").getByRole("button", { name: "Sign in as a demo shopper" }).click();
  await expect(page.getByText("Sign in to place your order")).toHaveCount(0);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByRole("cell", { name: "Enamel Camp Mug ×1" })).toBeVisible();
});
