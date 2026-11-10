import { expect, test } from "@playwright/test";
import pg from "pg";

// The nightly reset deletes yesterday's anonymous demo shoppers. A returning visitor still has the old
// session cookie; the shop must notice and offer sign-in again instead of a dead end.
test("after the nightly reset, a returning visitor gets the sign-in button back", async ({ page, context }) => {
  await page.goto("/orders", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Sign in as a demo shopper" }).click();
  await expect(page.getByText("Signed in as demo shopper")).toBeVisible();

  // Find this visitor's user id in the Supabase session cookie, then delete that user like the reset does.
  const cookie = (await context.cookies()).find((c) => /^sb-.*-auth-token(\.0)?$/.test(c.name));
  const raw = decodeURIComponent(cookie!.value).replace(/^base64-/, "");
  const userId = JSON.parse(Buffer.from(raw, "base64").toString("utf8")).user.id as string;
  const db = new pg.Client({ connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres" });
  await db.connect();
  await db.query("delete from auth.users where id = $1", [userId]);
  await db.end();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("banner").getByRole("button", { name: "Sign in as a demo shopper" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sign in to see your orders" })).toBeVisible();
});

test("My orders says demo orders are cleared every night", async ({ page }) => {
  await page.goto("/orders");
  await expect(page.getByText("Demo orders are cleared every night")).toBeVisible();
});
