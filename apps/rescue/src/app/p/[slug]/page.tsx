"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { CartLine } from "@/lib/schemas";
import { money } from "@/lib/constants";
import { supabase, type ProductRow } from "@/lib/supabase/browser";

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const [p, setP] = useState<ProductRow | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [qtyError, setQtyError] = useState(false);

  useEffect(() => {
    // PLANTED PROBLEM 4: .single() throws on an unknown slug and nothing catches it.
    supabase.from("products").select("*").eq("slug", slug).single().then(({ data }) => setP(data!));
  }, [slug]);

  if (!p) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      <img src={`/products/${p.image_file}`} style={{ width: "100%", borderRadius: 12 }} />
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>{p.name}</h1>
        <div style={{ fontSize: 22, fontWeight: 700, margin: "8px 0" }}>{money(p.price_cents)}</div>
        <p style={{ color: "#c4c4c4" }}>{p.description}</p>
        {/* PLANTED PROBLEM 8 (fixed in M4): no label. */}
        <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: 80, marginTop: 16 }} />
        <div
          onClick={() => {
            // FIX 5: check the quantity before it goes anywhere.
            if (!CartLine.safeParse({ productId: p.id, qty }).success) {
              setQtyError(true);
              setAdded(false);
              return;
            }
            setQtyError(false);
            addToCart({ id: p.id, name: p.name, price_cents: p.price_cents, qty });
            setAdded(true);
          }}
          style={{ cursor: "pointer", display: "inline-block", marginLeft: 12, background: "#2F6B4F", color: "white", padding: "8px 16px", borderRadius: 8 }}
        >
          Add to cart
        </div>
        {qtyError && <div style={{ color: "#b42318", marginTop: 8 }}>Choose a quantity from 1 to 10.</div>}
        {added && <div style={{ color: "#9aa59f", marginTop: 8 }}>Added</div>}
      </div>
    </div>
  );
}
