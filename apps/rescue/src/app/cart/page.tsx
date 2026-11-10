"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartLine } from "@/lib/cart";
import { money } from "@/lib/constants";
import { placeOrder } from "./actions";

export default function Cart() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => setLines(getCart()), []);

  // The total shown here is only a preview. FIX 3: the server prices the real order.
  const total = lines.reduce((sum, l) => sum + l.price_cents * l.qty, 0);

  async function checkout() {
    const result = await placeOrder(lines.map((l) => ({ productId: l.id, qty: l.qty })));
    if ("orderId" in result) {
      clearCart();
      router.push("/orders");
    }
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
      <div onClick={checkout} style={{ cursor: "pointer", display: "inline-block", background: "#2F6B4F", color: "white", padding: "10px 18px", borderRadius: 8 }}>
        Place order
      </div>
    </div>
  );
}
