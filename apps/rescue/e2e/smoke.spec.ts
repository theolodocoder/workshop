import { expect, test } from "@playwright/test";

test("home renders an Astryx button with the Northfold theme", async ({ page }) => {
  await page.goto("/");
  const button = page.getByRole("button", { name: "Shop gear" });
  await expect(button).toBeVisible();
  // The Northfold accent comes from our theme, not Astryx's neutral default.
  const accent = await button.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--color-accent").trim().toLowerCase(),
  );
  expect(accent).toContain("#2f6b4f");
});
