import { expect, test } from "@playwright/test";

test("one visitor keeps one session across tabs, and their order survives a reload", async ({ context }) => {
  const tab1 = await context.newPage();
  await tab1.goto("/p/enamel-camp-mug");
  await tab1.getByText("Sign in as a demo shopper").click();
  await expect(tab1.getByText("Signed in as demo shopper")).toBeVisible();
  await tab1.getByText("Add to cart").click();
  await tab1.goto("/cart");
  await tab1.getByText("Place order").click();
  await expect(tab1).toHaveURL(/\/orders$/);

  // A second tab is already signed in (no second anonymous user) and sees the same order.
  const tab2 = await context.newPage();
  await tab2.goto("/orders");
  await expect(tab2.getByText("Signed in as demo shopper")).toBeVisible();
  await expect(tab2.getByText("Enamel Camp Mug ×1")).toBeVisible();

  await tab2.reload();
  await expect(tab2.getByText("Enamel Camp Mug ×1")).toBeVisible();
});

test("the order total comes from the server, even if the cart's price was edited", async ({ page }) => {
  await page.goto("/p/summit-light-tent");
  await page.getByText("Sign in as a demo shopper").click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();
  await page.getByText("Add to cart").click();
  // Tamper with the price stored in the browser, like an attacker would.
  await page.evaluate(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart[0].price_cents = 1;
    localStorage.setItem("cart", JSON.stringify(cart));
  });
  await page.goto("/cart");
  await page.getByText("Place order").click();
  await expect(page).toHaveURL(/\/orders$/);
  await expect(page.getByText("$429.00")).toBeVisible();
  await expect(page.getByText("$0.01")).toHaveCount(0);
});
