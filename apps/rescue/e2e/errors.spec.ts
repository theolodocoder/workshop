import { expect, test } from "@playwright/test";

// The database is unreachable: every call to the local Supabase API fails.
async function storeDown(page: import("@playwright/test").Page) {
  await page.route("http://127.0.0.1:54321/**", (route) => route.abort("connectionrefused"));
}

test("store down shows the waking-up message and a retry button", async ({ page }) => {
  await storeDown(page);
  await page.goto("/");
  // supabase-js retries a failed request 3 times with backoff (about 8 s) before reporting it.
  await expect(page.getByText("Store is waking up")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(page.getByText("Application error")).toHaveCount(0);
  await expect(page.getByText("Unhandled Runtime Error")).toHaveCount(0);

  // Once the store is back, Retry loads the products.
  await page.unroute("http://127.0.0.1:54321/**");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Summit Light Tent")).toBeVisible();
});

test("no orders shows the empty state", async ({ page }) => {
  await page.goto("/orders");
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
