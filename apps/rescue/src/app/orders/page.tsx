"use client";

import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Table } from "@astryxdesign/core/Table";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { TryToBreakIt } from "@/components/TryToBreakIt";
import { money } from "@/lib/constants";
import { supabase } from "@/lib/supabase/browser";
import { useShopper } from "@/lib/useShopper";
import { useStore } from "@/lib/useStore";

type Order = {
  id: string;
  total_cents: number;
  created_at: string;
  order_items: { qty: number; products: { name: string } }[];
};

interface Row extends Record<string, unknown> {
  id: string;
  placed: string;
  items: string;
  total: string;
}

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
  const rows: Row[] = (store.status === "ready" ? (store.data ?? []) : []).map((o) => ({
    id: o.id.slice(0, 8).toUpperCase(),
    placed: new Date(o.created_at).toLocaleString(),
    items: o.order_items.map((i) => `${i.products.name} ×${i.qty}`).join(", "),
    total: money(o.total_cents),
  }));

  return (
    <VStack gap={8}>
      <VStack gap={3}>
        <Heading level={1}>My orders</Heading>
        {shopper === null && (
          <EmptyState title="Sign in to see your orders" description="Use the sign-in button at the top of the page. It takes one click." />
        )}
        {shopper && store.status === "loading" && <Loading label="Loading your orders" />}
        {shopper && store.status === "error" && <StoreWaking onRetry={store.retry} />}
        {shopper && store.status === "ready" && rows.length === 0 && (
          <EmptyState title="No orders yet" description="When you check out, your orders show up here." actions={<Button label="Browse the shop" href="/" />} />
        )}
        {rows.length > 0 && (
          <Table<Row>
            data={rows}
            idKey="id"
            columns={[
              { key: "id", header: "Order" },
              { key: "placed", header: "Placed" },
              { key: "items", header: "Items" },
              { key: "total", header: "Total", align: "end" },
            ]}
          />
        )}
      </VStack>
      <TryToBreakIt />
    </VStack>
  );
}
