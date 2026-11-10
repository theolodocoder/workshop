"use client";

import { money } from "@/lib/constants";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { supabase } from "@/lib/supabase/browser";
import { useShopper } from "@/lib/useShopper";
import { useStore } from "@/lib/useStore";
import { TryToBreakIt } from "@/components/TryToBreakIt";

type Order = {
  id: string;
  total_cents: number;
  created_at: string;
  order_items: { qty: number; products: { name: string } }[];
};

export default function Orders() {
  const shopper = useShopper();
  const store = useStore<Order[]>(
    () =>
      shopper
        ? (supabase
            .from("orders")
            .select("id,total_cents,created_at,order_items(qty,products(name))")
            .eq("user_id", shopper)
            .order("created_at", { ascending: false }) as unknown as PromiseLike<{ data: Order[] | null; error: unknown }>)
        : Promise.resolve({ data: [], error: null }),
    [shopper],
  );
  const orders = store.status === "ready" ? (store.data ?? []) : [];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>My orders</h1>
      {shopper === null && (
        <EmptyState title="Sign in to see your orders" description="Use the sign-in button at the top of the page. It takes one click." />
      )}
      {shopper && store.status === "loading" && <Loading label="Loading your orders" />}
      {shopper && store.status === "error" && <StoreWaking onRetry={store.retry} />}
      {shopper && store.status === "ready" && orders.length === 0 && (
        <EmptyState title="No orders yet" description="When you check out, your orders show up here." actions={<Button label="Browse the shop" href="/" />} />
      )}
      {orders.map((o) => (
        <div key={o.id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
          <div>{o.order_items.map((i) => `${i.products.name} ×${i.qty}`).join(", ")}</div>
          <div style={{ color: "#c4c4c4" }}>{new Date(o.created_at).toLocaleString()} · {money(o.total_cents)}</div>
        </div>
      ))}
      <div style={{ marginTop: 40 }}>
        <TryToBreakIt />
      </div>
    </div>
  );
}
