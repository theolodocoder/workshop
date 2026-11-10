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

test("text on the accent color is readable in light and dark mode", async ({ browser }) => {
  for (const [scheme, expected] of [["light", "#ffffff"], ["dark", "#0b2418"]] as const) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto("/");
    const onAccent = await page
      .getByRole("button", { name: "Shop gear" })
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--color-on-accent").trim().toLowerCase());
    expect(onAccent, scheme).toContain(expected);
    await ctx.close();
  }
});
