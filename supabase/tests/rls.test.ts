import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BEN_TARGET_ORDER_ID } from "../../packages/catalog/src/shoppers";
import { adminDb, anonymousVisitor, RESCUE } from "./helpers";
import { createClient } from "@supabase/supabase-js";

let db: pg.Client;
let visitor: Awaited<ReturnType<typeof anonymousVisitor>>;
let ownOrderId: string;

beforeAll(async () => {
  db = await adminDb();
  visitor = await anonymousVisitor();
  const { rows } = await db.query(
    "insert into public.orders (user_id, total_cents) values ($1, 1900) returning id",
    [visitor.userId],
  );
  ownOrderId = rows[0].id;
  await db.query("insert into public.order_items values ($1, 'nf-028', 1, 1900)", [ownOrderId]);
});

afterAll(async () => {
  await db.query("delete from auth.users where id = $1", [visitor.userId]);
  await db.end();
});

describe("rescue stack: row-level security", () => {
  it("A can't read B's order", async () => {
    const { data, error } = await visitor.client.from("orders").select("id").eq("id", BEN_TARGET_ORDER_ID);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("A can't read B's order items", async () => {
    const { data } = await visitor.client.from("order_items").select("order_id").eq("order_id", BEN_TARGET_ORDER_ID);
    expect(data).toEqual([]);
  });

  it("A can't change or delete B's order", async () => {
    await visitor.client.from("orders").update({ total_cents: 1 }).eq("id", BEN_TARGET_ORDER_ID);
    await visitor.client.from("orders").delete().eq("id", BEN_TARGET_ORDER_ID);
    const { rows } = await db.query("select total_cents from public.orders where id = $1", [BEN_TARGET_ORDER_ID]);
    expect(rows).toHaveLength(1);
    expect(rows[0].total_cents).toBe(78700);
  });

  it("A can read their own order and its items", async () => {
    const { data } = await visitor.client.from("orders").select("id,order_items(qty)").eq("id", ownOrderId);
    expect(data).toHaveLength(1);
    expect(data?.[0]?.order_items).toHaveLength(1);
  });

  it("anyone, even signed out, can read products", async () => {
    const signedOut = createClient(RESCUE.url, RESCUE.anonKey, { auth: { persistSession: false } });
    const { data } = await signedOut.from("products").select("id");
    expect(data).toHaveLength(40);
  });

  it("nobody can add or change products", async () => {
    const { error } = await visitor.client.from("products").insert({
      id: "nf-999", slug: "free-tent", name: "Free Tent", category: "tents", price_cents: 1, description: "x", image_file: "x.jpg",
    });
    expect(error).not.toBeNull();
    await visitor.client.from("products").update({ price_cents: 1 }).eq("id", "nf-001");
    const { rows } = await db.query("select price_cents from public.products where id = 'nf-001'");
    expect(rows[0].price_cents).toBe(28900);
  });

  it("A can't read anyone else's profile", async () => {
    const { data } = await visitor.client.from("profiles").select("id");
    expect(data).toEqual([]);
  });
});

describe("rescue stack: inserts", () => {
  it("A can't create an order in B's name", async () => {
    const intruder = await anonymousVisitor();
    const { error } = await intruder.client
      .from("orders")
      .insert({ user_id: "00000000-0000-4000-a000-00000000be01", total_cents: 1 });
    expect(error).not.toBeNull();
  });
});
