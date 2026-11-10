import { expect, test } from "@playwright/test";

test("no orders shows the empty state", async ({ page }) => {
  await page.goto("/orders", { waitUntil: "networkidle" });
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByRole("heading", { name: "No orders yet" })).toBeVisible();
});

test("signed out, My orders asks you to sign in instead of breaking", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Sign in to see your orders" })).toBeVisible();
});

test("unknown product slug shows not-found", async ({ page }) => {
  await page.goto("/p/no-such-tent");
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the shop" })).toBeVisible();
});

test("an empty cart says so", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
});
