import { expect, test } from "@playwright/test";

test("pages are sent with security headers", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toMatch(/script-src [^;]*'nonce-[A-Za-z0-9+/=]+'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("every page load gets a fresh nonce", async ({ request }) => {
  const nonce = async () => (await request.get("/")).headers()["content-security-policy"]?.match(/'nonce-([^']+)'/)?.[1];
  const [a, b] = [await nonce(), await nonce()];
  expect(a).toBeTruthy();
  expect(a).not.toBe(b);
});

test("the shop still works under the policy, with no CSP errors", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (m) => {
    if (/Content Security Policy|Refused to/i.test(m.text())) violations.push(m.text());
  });
  await page.goto("/p/enamel-camp-mug", { waitUntil: "networkidle" });
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();
  await page.getByText("Add to cart").click();
  await expect(page.getByText("Added to your cart")).toBeVisible();
  expect(violations).toEqual([]);
});
