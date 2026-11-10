"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCart, type CartLine } from "@/lib/cart";
import { money } from "@/lib/constants";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { placeOrder, type PlaceOrderResult } from "./actions";

export default function Cart() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [failure, setFailure] = useState<Exclude<PlaceOrderResult, { orderId: string }>["error"] | null>(null);
  useEffect(() => setLines(getCart()), []);

  // The total shown here is only a preview. FIX 3: the server prices the real order.
  if (lines === null) return null;
  if (lines.length === 0)
    return (
      <EmptyState
        headingLevel={1}
        title="Your cart is empty"
        description="Find a tent, a pack or a mug to get started."
        actions={<Button label="Browse the shop" variant="primary" href="/" />}
      />
    );

  const cart = lines;
  const total = cart.reduce((sum, l) => sum + l.price_cents * l.qty, 0);

  async function checkout() {
    const result = await placeOrder(cart.map((l) => ({ productId: l.id, qty: l.qty })));
    if ("orderId" in result) {
      clearCart();
      router.push("/orders");
    } else {
      setFailure(result.error);
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
      {failure && (
        <div style={{ marginBottom: 16 }}>
          <Banner
            status="error"
            title={failure === "rate_limited" ? "That's a lot of orders" : failure === "invalid_cart" ? "Something in your cart isn't right" : "We couldn't place your order"}
            description={failure === "rate_limited" ? "Demo shoppers can place 5 orders an hour. Try again later." : failure === "invalid_cart" ? "Check the quantities (1 to 10) and try again." : "The store didn't answer. Your cart is safe; try again in a minute."}
          />
        </div>
      )}
      <div onClick={checkout} style={{ cursor: "pointer", display: "inline-block", background: "#2F6B4F", color: "white", padding: "10px 18px", borderRadius: 8 }}>
        Place order
      </div>
    </div>
  );
}
