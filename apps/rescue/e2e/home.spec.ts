import { expect, test } from "@playwright/test";

test("home has two doors, one to each shop", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /before and after a rescue/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the before shop" })).toHaveAttribute("href", /localhost:4311|okafor-workshop-rescue-before/);
  await expect(page.getByRole("link", { name: "Open the rescued shop" })).toHaveAttribute("href", "/shop");
  await expect(page.getByRole("link", { name: "Read the rescue report" })).toBeVisible();
});

test("the shop now lives at /shop", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("heading", { level: 1, name: "Gear for long days outside" })).toBeVisible();
});
