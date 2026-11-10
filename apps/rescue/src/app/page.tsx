"use client";

import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { supabase, type ProductRow } from "@/lib/supabase/browser";
import { useStore } from "@/lib/useStore";

export default function Home() {
  const router = useRouter();
  // PLANTED PROBLEM 7 (fixed in M5): data is still fetched in the browser after the page loads.
  // FIX 4: loading and error states, with Retry.
  const store = useStore<ProductRow[]>(() => supabase.from("products").select("*"), []);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Gear for long days outside</h1>
      <div style={{ display: "flex", gap: 16, margin: "16px 0 24px" }}>
        {CATEGORIES.map(([key, label]) => (
          <div key={key} onClick={() => router.push(`/c/${key}`)} style={{ cursor: "pointer", color: "#9b9b9b" }}>
            {label}
          </div>
        ))}
      </div>
      {store.status === "loading" && <Loading label="Loading products" />}
      {store.status === "error" && <StoreWaking onRetry={store.retry} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
        {store.status === "ready" && (store.data ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
