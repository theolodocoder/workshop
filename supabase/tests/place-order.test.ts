import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminDb, anonymousVisitor } from "./helpers";

let db: pg.Client;
const visitors: string[] = [];

async function shopper() {
  const v = await anonymousVisitor();
  visitors.push(v.userId);
  return v;
}

beforeAll(async () => {
  db = await adminDb();
});

afterAll(async () => {
  await db.query("delete from auth.users where id = any($1::uuid[])", [visitors]);
  await db.end();
});

// nf-005 Summit Light Tent = $429.00, nf-026 Flameline Stove = $79.00
describe("place_order: the server sets the price", () => {
  it("totals the order from database prices, ignoring prices sent by the browser", async () => {
    const { client } = await shopper();
    const { data: orderId, error } = await client.rpc("place_order", {
      items: [
        { product_id: "nf-005", qty: 1, price_cents: 1 },
        { product_id: "nf-026", qty: 2, price_cents: 1 },
      ],
    });
    expect(error).toBeNull();
    const { rows } = await db.query("select total_cents from public.orders where id = $1", [orderId]);
    expect(rows[0].total_cents).toBe(42900 + 7900 * 2);
    const items = await db.query("select unit_price_cents from public.order_items where order_id = $1 order by product_id", [orderId]);
    expect(items.rows.map((r) => r.unit_price_cents)).toEqual([42900, 7900]);
  });

  it.each([
    ["quantity 0", [{ product_id: "nf-005", qty: 0 }]],
    ["negative quantity", [{ product_id: "nf-005", qty: -1 }]],
    ["quantity 1000", [{ product_id: "nf-005", qty: 1000 }]],
    ["unknown product", [{ product_id: "nf-404", qty: 1 }]],
    ["empty cart", []],
  ])("rejects a cart with %s", async (_label, items) => {
    const { client } = await shopper();
    const { error } = await client.rpc("place_order", { items });
    expect(error?.message).toContain("invalid_cart");
  });

  it("rate-limits the 6th order within an hour", async () => {
    const { client } = await shopper();
    for (let i = 0; i < 5; i++) {
      const { error } = await client.rpc("place_order", { items: [{ product_id: "nf-028", qty: 1 }] });
      expect(error).toBeNull();
    }
    const { error } = await client.rpc("place_order", { items: [{ product_id: "nf-028", qty: 1 }] });
    expect(error?.message).toContain("rate_limited");
  });

  it("no longer lets shoppers insert orders directly", async () => {
    const { client, userId } = await shopper();
    const { error } = await client.from("orders").insert({ user_id: userId, total_cents: 1 });
    expect(error).not.toBeNull();
  });

  it("refuses visitors who aren't signed in", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    const { RESCUE } = await import("./helpers");
    const signedOut = createClient(RESCUE.url, RESCUE.anonKey, { auth: { persistSession: false } });
    const { error } = await signedOut.rpc("place_order", { items: [{ product_id: "nf-028", qty: 1 }] });
    expect(error).not.toBeNull();
  });
});
