import "server-only";

// Is the before shop's database awake? We ask its public API directly (with its public key),
// so the frozen before app needs no changes. 3 s timeout, never throws.
export async function beforeShopAwake(): Promise<boolean> {
  const url = process.env.BEFORE_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return true;
  try {
    const res = await fetch(`${url}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const BEFORE_URL = process.env.NEXT_PUBLIC_BEFORE_URL ?? "http://localhost:4311";
export const BEFORE_CLIP_URL = process.env.NEXT_PUBLIC_BEFORE_CLIP_URL ?? null;
