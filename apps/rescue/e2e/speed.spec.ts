import { expect, test } from "@playwright/test";

test("the product page arrives with its content in the HTML, even with JavaScript blocked", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/p/summit-light-tent");
  await expect(page.getByRole("heading", { name: "Summit Light Tent" })).toBeVisible();
  await expect(page.getByText("$429.00")).toBeVisible();
});

test("the category page lists products in the HTML, even with JavaScript blocked", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("/c/tents");
  await expect(page.getByText("Ridge 2 Dome Tent")).toBeVisible();
});

test("every product photo is sized for the screen and reserves its space", async ({ page }) => {
  await page.goto("/c/tents");
  const imgs = page.locator('img[alt="Ridge 2 Dome Tent"], main img');
  expect(await imgs.count()).toBeGreaterThan(0);
  const info = await page.locator("main img").evaluateAll((els) =>
    els.map((img) => ({ srcset: img.getAttribute("srcset"), w: img.getAttribute("width"), h: img.getAttribute("height") })),
  );
  for (const i of info) {
    expect(i.srcset, "srcset").toBeTruthy();
    expect(Number(i.w)).toBeGreaterThan(0);
    expect(Number(i.h)).toBeGreaterThan(0);
  }
});

test("no charting library is loaded on the shop pages", async ({ page }) => {
  const scripts: string[] = [];
  page.on("response", async (res) => {
    if (res.request().resourceType() === "script") scripts.push(await res.text().catch(() => ""));
  });
  await page.goto("/shop");
  await page.waitForLoadState("networkidle");
  expect(scripts.some((s) => s.includes("recharts"))).toBe(false);
});
