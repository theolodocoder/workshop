"use client";

import { useParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { supabase, type ProductRow } from "@/lib/supabase/browser";
import { useStore } from "@/lib/useStore";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const store = useStore<ProductRow[]>(() => supabase.from("products").select("*").eq("category", category), [category]);
  const products = store.status === "ready" ? (store.data ?? []) : [];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, textTransform: "capitalize" }}>{category}</h1>
      {store.status === "loading" && <Loading label="Loading products" />}
      {store.status === "error" && <StoreWaking onRetry={store.retry} />}
      {store.status === "ready" && products.length === 0 && (
        <EmptyState title="Nothing in this category yet" description="Try another category from the shop." />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24, marginTop: 24 }}>
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
