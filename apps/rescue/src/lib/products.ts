import "server-only";
import { products as catalog } from "@workshop/catalog";
import { supabaseStore } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/supabase/browser";

export type ShopProduct = ProductRow & { width: number; height: number };
export type Loaded<T> = { ok: true; data: T } | { ok: false };

// Real photo sizes come from the catalog manifest, so images reserve their space (no layout shift).
const sizes = new Map(catalog.map((p) => [p.id, p.image]));
const withSize = (row: ProductRow): ShopProduct => ({
  ...row,
  width: sizes.get(row.id)?.width ?? 1600,
  height: sizes.get(row.id)?.height ?? 1067,
});

// FIX 7: products are fetched on the server, so they arrive with the HTML.
export async function getProducts(category?: string): Promise<Loaded<ShopProduct[]>> {
  try {
    let q = supabaseStore.from("products").select("*").order("id");
    if (category) q = q.eq("category", category);
    const { data, error } = await q;
    if (error) return { ok: false };
    return { ok: true, data: (data ?? []).map(withSize) };
  } catch {
    return { ok: false };
  }
}

export async function getProduct(slug: string): Promise<Loaded<ShopProduct | null>> {
  try {
    const { data, error } = await supabaseStore.from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) return { ok: false };
    return { ok: true, data: data ? withSize(data) : null };
  } catch {
    return { ok: false };
  }
}
