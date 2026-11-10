import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { BEN_TARGET_ORDER_ID } from "../../packages/catalog/src/shoppers";

const stacks = [
  { name: "before", dbPort: 54422 },
  { name: "rescue", dbPort: 54322 },
] as const;

const clients: pg.Client[] = [];
afterAll(async () => {
  await Promise.all(clients.map((c) => c.end()));
});

async function connect(port: number) {
  const client = new pg.Client({ connectionString: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres` });
  await client.connect();
  clients.push(client);
  return client;
}

describe.each(stacks)("$name stack seed", ({ name, dbPort }) => {
  it("has the 40 Northfold products", async () => {
    const db = await connect(dbPort);
    const { rows } = await db.query("select count(*)::int as n from public.products");
    expect(rows[0].n).toBe(40);
  });

  it("has Ben's target order with at least one item", async () => {
    const db = await connect(dbPort);
    const { rows } = await db.query(
      "select count(*)::int as n from public.order_items where order_id = $1",
      [BEN_TARGET_ORDER_ID],
    );
    expect(rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it("allows anonymous sign-ins", () => {
    const toml = readFileSync(new URL(`../${name}/supabase/config.toml`, import.meta.url), "utf8");
    expect(toml).toMatch(/^enable_anonymous_sign_ins = true$/m);
  });
});
