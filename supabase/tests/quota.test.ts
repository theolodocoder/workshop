import { createClient } from "@supabase/supabase-js";
import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { adminDb, RESCUE } from "./helpers";

let db: pg.Client;
const anon = createClient(RESCUE.url, RESCUE.anonKey, { auth: { persistSession: false } });
const take = async (hash: string) => (await anon.rpc("take_check_quota", { visitor_hash: hash })).data as string;
const hash = () => `test-${crypto.randomUUID()}`;

beforeAll(async () => {
  db = await adminDb();
});

afterAll(async () => {
  await db.query("delete from public.check_usage where visitor_hash like 'test-%'");
  await db.end();
});

describe("take_check_quota", () => {
  it("allows 3 checks a day per visitor, then says visitor_limit", async () => {
    const v = hash();
    expect([await take(v), await take(v), await take(v)]).toEqual(["ok", "ok", "ok"]);
    expect(await take(v)).toBe("visitor_limit");
  });

  it("resets the next UTC day", async () => {
    const v = hash();
    for (let i = 0; i < 3; i++) await take(v);
    await db.query("update public.check_usage set day = day - 1 where visitor_hash = $1", [v]);
    expect(await take(v)).toBe("ok");
  });

  it("stops everyone once 200 checks have been used today", async () => {
    const { rows } = await db.query("select count from public.check_global where day = (now() at time zone 'utc')::date");
    const saved = rows[0]?.count ?? null;
    await db.query(
      "insert into public.check_global (day, count) values ((now() at time zone 'utc')::date, 200) on conflict (day) do update set count = 200",
    );
    try {
      expect(await take(hash())).toBe("global_limit");
    } finally {
      if (saved === null) await db.query("delete from public.check_global where day = (now() at time zone 'utc')::date");
      else await db.query("update public.check_global set count = $1 where day = (now() at time zone 'utc')::date", [saved]);
    }
  });

  it("doesn't let visitors read or edit the counters directly", async () => {
    const { data } = await anon.from("check_usage").select("*");
    expect(data ?? []).toEqual([]);
    const { error } = await anon.from("check_global").insert({ day: "2000-01-01", count: 0 });
    expect(error).not.toBeNull();
  });
});
