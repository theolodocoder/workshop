"use server";

import { Cart } from "@/lib/schemas";
import { supabaseServer } from "@/lib/supabase/server";

export type CartLine = { productId: string; qty: number };
export type PlaceOrderResult = { orderId: string } | { error: "invalid_cart" | "rate_limited" | "not_signed_in" | "unavailable" };

// FIX 3: checkout sends only product ids and quantities. The database function prices the order.
// FIX 5: the input is parsed with Zod first; anything malformed never reaches the database.
export async function placeOrder(lines: CartLine[]): Promise<PlaceOrderResult> {
  const parsed = Cart.safeParse(lines);
  if (!parsed.success) return { error: "invalid_cart" };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("place_order", {
    items: parsed.data.map((l) => ({ product_id: l.productId, qty: l.qty })),
  });
  if (error) {
    if (error.message.includes("invalid_cart")) return { error: "invalid_cart" };
    if (error.message.includes("rate_limited")) return { error: "rate_limited" };
    // Signed-out callers can't run place_order (execute is granted to signed-in shoppers only).
    if (error.message.includes("not_signed_in") || error.code === "42501") return { error: "not_signed_in" };
    return { error: "unavailable" };
  }
  return { orderId: data as string };
}
