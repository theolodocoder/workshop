import { expect, test } from "@playwright/test";

// The Northfold theme is applied: the accent and the text on it come from our theme, not Astryx's neutral default.
test("the shop uses the Northfold theme", async ({ page }) => {
  await page.goto("/shop");
  const brand = page.getByText("Northfold Outfitters").first();
  await expect(brand).toBeVisible();
  const vars = await brand.evaluate((el) => {
    const s = getComputedStyle(el);
    return [s.getPropertyValue("--color-accent"), s.getPropertyValue("--color-on-accent")].join(" ").toLowerCase();
  });
  expect(vars).toContain("#2f6b4f");
  expect(vars).toContain("#0b2418");
});
