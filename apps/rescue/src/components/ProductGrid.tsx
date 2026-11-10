"use client";

import { Grid } from "@astryxdesign/core/Grid";
import type { ShopProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: ShopProduct[] }) {
  return (
    <Grid columns={{ minWidth: 240 }} gap={6}>
      {products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}
    </Grid>
  );
}
