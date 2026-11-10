import { expect, test } from "@playwright/test";

// Runs against a server whose database never answers (see playwright.config.ts, "store-down").
for (const path of ["/", "/c/tents", "/p/summit-light-tent"]) {
  test(`${path}: store down shows the waking-up message and a retry button`, async ({ page }) => {
    const t0 = Date.now();
    await page.goto(path);
    await expect(page.getByText("Store is waking up")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(page.getByText("Application error")).toHaveCount(0);
    // No retries on the server and a 3 s timeout: the page doesn't hang.
    expect(Date.now() - t0).toBeLessThan(6000);
  });
}

test("Retry asks the server again", async ({ page }) => {
  await page.goto("/");
  const again = page.waitForResponse((r) => r.url().includes("localhost") && r.request().method() === "GET");
  await page.getByRole("button", { name: "Retry" }).click();
  await again;
  await expect(page.getByText("Store is waking up")).toBeVisible();
});
