"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartLine } from "@/lib/cart";
import { money } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default function Cart() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => setLines(getCart()), []);

  // PLANTED PROBLEM 3: the total is computed in the browser from prices stored in localStorage,
  // and written straight to the database. Edit localStorage and you pick your own price.
  const total = lines.reduce((sum, l) => sum + l.price_cents * l.qty, 0);

  async function placeOrder() {
    const { data: session } = await supabase.auth.getSession();
    const { data: order } = await supabase
      .from("orders")
      .insert({ user_id: session.session!.user.id, total_cents: total })
      .select()
      .single();
    await supabase.from("order_items").insert(
      lines.map((l) => ({ order_id: order!.id, product_id: l.id, qty: l.qty, unit_price_cents: l.price_cents })),
    );
    clearCart();
    router.push("/orders");
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Your cart</h1>
      {lines.map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ flex: 1 }}>{l.name}</div>
          <div>×{l.qty}</div>
          <div>{money(l.price_cents * l.qty)}</div>
        </div>
      ))}
      <div style={{ fontWeight: 700, margin: "16px 0" }}>Total {money(total)}</div>
      <div onClick={placeOrder} style={{ cursor: "pointer", display: "inline-block", background: "#2F6B4F", color: "white", padding: "10px 18px", borderRadius: 8 }}>
        Place order
      </div>
    </div>
  );
}
