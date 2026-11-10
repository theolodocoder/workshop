"use server";

import { supabaseServer } from "@/lib/supabase/server";

export type CartLine = { productId: string; qty: number };
export type PlaceOrderResult = { orderId: string } | { error: "invalid_cart" | "rate_limited" | "unavailable" };

// FIX 3: checkout sends only product ids and quantities. The database function prices the order.
export async function placeOrder(lines: CartLine[]): Promise<PlaceOrderResult> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("place_order", {
    items: lines.map((l) => ({ product_id: l.productId, qty: l.qty })),
  });
  if (error) {
    if (error.message.includes("invalid_cart")) return { error: "invalid_cart" };
    if (error.message.includes("rate_limited")) return { error: "rate_limited" };
    return { error: "unavailable" };
  }
  return { orderId: data as string };
}
