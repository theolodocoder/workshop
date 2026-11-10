"use client";

import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { useParams } from "next/navigation";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { CATEGORIES } from "@/lib/constants";
import { supabase, type ProductRow } from "@/lib/supabase/browser";
import { useStore } from "@/lib/useStore";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const store = useStore<ProductRow[]>(() => supabase.from("products").select("*").eq("category", category), [category]);
  const products = store.status === "ready" ? (store.data ?? []) : [];
  const label = CATEGORIES.find(([key]) => key === category)?.[1] ?? category;

  return (
    <VStack gap={6}>
      <Heading level={1}>{label}</Heading>
      <CategoryTabs current={category} />
      {store.status === "loading" && <Loading label="Loading products" />}
      {store.status === "error" && <StoreWaking onRetry={store.retry} />}
      {store.status === "ready" && products.length === 0 && (
        <EmptyState title="Nothing in this category yet" description="Try another category from the shop." />
      )}
      <Grid columns={{ minWidth: 240 }} gap={6}>
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </Grid>
    </VStack>
  );
}
