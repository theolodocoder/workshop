import { expect, test } from "@playwright/test";

// Runs against the "check" server, whose PageSpeed and AI calls go to e2e-tools/mock-apis.mjs.
// The headers check reads real public sites (example.com / example.org).
// The daily limit is per IP, so each test gets its own made-up visitor IP (Vercel sets this header in production).
test.beforeEach(async ({ page }) => {
  const octet = () => Math.floor(Math.random() * 254) + 1;
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `203.0.${octet()}.${octet()}` });
});
async function check(page: import("@playwright/test").Page, url: string) {
  await page.getByLabel("Your site's address").fill(url);
  await page.getByRole("button", { name: "Check it" }).click();
}

test("a public site gets a short, ranked fix list and the audit offer", async ({ page }) => {
  await page.goto("/check");
  await check(page, "https://example.com");
  const results = page.getByTestId("check-result");
  await expect(results).toContainText("Your page freezes while it loads", { timeout: 20_000 });
  await expect(page.getByText("Performance 42")).toBeVisible();
  await expect(page.getByRole("link", { name: "See the audit offer" })).toHaveAttribute("href", "#audit-offer");
});

test("internal addresses are refused before anything is fetched", async ({ page }) => {
  await page.goto("/check");
  for (const bad of ["http://localhost:4310", "http://169.254.169.254/latest/meta-data", "http://10.0.0.1"]) {
    await check(page, bad);
    await expect(page.getByText("We can only check public websites")).toBeVisible();
  }
});

test("text that isn't a web address gets a clear message", async ({ page }) => {
  await page.goto("/check");
  await check(page, "not a url");
  await expect(page.getByText("That doesn't look like a web address")).toBeVisible();
});

test("the 4th check in a day is refused politely", async ({ page }) => {
  await page.goto("/check");
  for (let i = 0; i < 3; i++) {
    await check(page, "https://example.com");
    await expect(page.getByTestId("check-result")).toBeVisible({ timeout: 20_000 });
  }
  await check(page, "https://example.com");
  await expect(page.getByText("You've used today's 3 checks")).toBeVisible();
});

test("when the AI is unavailable, the results still show in our own words", async ({ page }) => {
  await page.goto("/check");
  await check(page, "https://example.org/?ai-fails");
  await expect(page.getByText("AI summary unavailable today")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("check-result")).toContainText("Your page is slow to respond to taps");
});

test("clearing cookies doesn't reset the daily limit", async ({ page, context }) => {
  await page.goto("/check");
  for (let i = 0; i < 3; i++) {
    await check(page, "https://example.com");
    await expect(page.getByTestId("check-result")).toBeVisible({ timeout: 20_000 });
  }
  await context.clearCookies();
  await page.reload();
  await check(page, "https://example.com");
  await expect(page.getByText("You've used today's 3 checks")).toBeVisible();
});
