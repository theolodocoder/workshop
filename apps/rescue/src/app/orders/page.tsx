"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/constants";
import { supabase } from "@/lib/supabase/browser";
import { TryToBreakIt } from "@/components/TryToBreakIt";

type Order = {
  id: string;
  total_cents: number;
  created_at: string;
  order_items: { qty: number; products: { name: string } }[];
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      supabase
        .from("orders")
        .select("id,total_cents,created_at,order_items(qty,products(name))")
        .eq("user_id", data.session!.user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setOrders(data as unknown as Order[]));
    });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>My orders</h1>
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
