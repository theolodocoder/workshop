import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { checkBeforeShop } = await import("./before-health");

const ok = async () => new Response("[]", { status: 200 });

describe("checkBeforeShop", () => {
  it("asks the before project's API with the before project's own key", async () => {
    let sent: { url: string; key: string | null } = { url: "", key: null };
    const fetchImpl = (async (url: string, init: RequestInit) => {
      sent = { url, key: new Headers(init.headers).get("apikey") };
      return ok();
    }) as unknown as typeof fetch;
    const state = await checkBeforeShop({ url: "https://before.supabase.co", key: "BEFORE-KEY", fetchImpl });
    expect(state).toBe("awake");
    expect(sent.url).toBe("https://before.supabase.co/rest/v1/products?select=id&limit=1");
    expect(sent.key).toBe("BEFORE-KEY");
  });

  it("reports a wrong key as a setup problem, not as asleep", async () => {
    const fetchImpl = (async () => new Response("{}", { status: 401 })) as unknown as typeof fetch;
    expect(await checkBeforeShop({ url: "https://before.supabase.co", key: "WRONG", fetchImpl })).toBe("misconfigured");
  });

  it("treats no answer as asleep", async () => {
    const fetchImpl = (async () => {
      throw new Error("connect ECONNREFUSED");
    }) as unknown as typeof fetch;
    expect(await checkBeforeShop({ url: "https://before.supabase.co", key: "K", fetchImpl })).toBe("asleep");
  });
});
