"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { supabase, type ProductRow } from "@/lib/supabase/browser";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("category", category).then(({ data }) => setProducts(data!));
  }, [category]);

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, textTransform: "capitalize" }}>{category}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24, marginTop: 24 }}>
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
