"use client";

import { useRouter } from "next/navigation";
import type { ProductRow } from "@/lib/supabase/browser";
import { money } from "@/lib/constants";

export function ProductCard({ p }: { p: ProductRow }) {
  const router = useRouter();
  // PLANTED PROBLEMS 7 + 8: full-size 1600px photo with no sizes or dimensions, no alt text,
  // and a clickable div instead of a link.
  return (
    <div onClick={() => router.push(`/p/${p.slug}`)} style={{ cursor: "pointer" }}>
      <img src={`/products/${p.image_file}`} style={{ width: "100%", borderRadius: 12 }} />
      <div style={{ marginTop: 12, fontWeight: 600, fontSize: 18 }}>{p.name}</div>
      <div style={{ color: "#c4c4c4" }}>{p.description}</div>
      <div style={{ fontWeight: 700, marginTop: 4 }}>{money(p.price_cents)}</div>
    </div>
  );
}
