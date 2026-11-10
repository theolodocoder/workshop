import { expect, test } from "@playwright/test";

test("the About page credits all 40 photographers, the design system and the builder", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1, name: "About this demo" })).toBeVisible();
  const credits = page.getByTestId("photo-credit");
  await expect(credits).toHaveCount(40);
  const hrefs = await credits.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs.every((h) => h?.startsWith("https://unsplash.com/photos/"))).toBe(true);
  await expect(page.getByRole("main").getByText(/Built on Astryx \(MIT, by Meta\)/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Promise Okafor" })).toBeVisible();
});

test("every page links to About from the footer", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "About this demo" })).toBeVisible();
});
