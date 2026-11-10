import "server-only";

export type BeforeState = "awake" | "asleep" | "misconfigured";

/**
 * Is the before shop's database awake? We ask its public API directly, with the BEFORE project's own
 * public key, so the frozen before app needs no changes. 3 s timeout, never throws.
 * A 401/403 means a wrong key (a setup problem), not a sleeping database.
 */
export async function checkBeforeShop(opts: { url?: string; key?: string; fetchImpl?: typeof fetch }): Promise<BeforeState> {
  if (!opts.url || !opts.key) return "awake";
  try {
    const res = await (opts.fetchImpl ?? fetch)(`${opts.url}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: opts.key },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) return "misconfigured";
    return res.ok ? "awake" : "asleep";
  } catch {
    return "asleep";
  }
}

export async function beforeShopAwake(): Promise<boolean> {
  const state = await checkBeforeShop({ url: process.env.BEFORE_SUPABASE_URL, key: process.env.BEFORE_SUPABASE_ANON_KEY });
  // A wrong key is our mistake: keep the door open (the before shop itself may be fine) and say so in the logs.
  if (state === "misconfigured") console.error("BEFORE_SUPABASE_ANON_KEY is wrong for BEFORE_SUPABASE_URL");
  return state !== "asleep";
}

export const BEFORE_URL = process.env.NEXT_PUBLIC_BEFORE_URL ?? "http://localhost:4311";
export const BEFORE_CLIP_URL = process.env.NEXT_PUBLIC_BEFORE_CLIP_URL ?? null;
