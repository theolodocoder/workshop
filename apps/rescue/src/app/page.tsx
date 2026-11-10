"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import { supabase, type ProductRow } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>([]);

  // PLANTED PROBLEM 7: all data is fetched in the browser after the page loads.
  // PLANTED PROBLEM 4: no loading, empty or error state. If this fails, the page stays blank.
  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts(data!));
  }, []);

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
