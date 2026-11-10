"use client";

import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ProductCard } from "@/components/ProductCard";
import { Loading, StoreWaking } from "@/components/StoreStates";
import { supabase, type ProductRow } from "@/lib/supabase/browser";
import { useStore } from "@/lib/useStore";

export default function Home() {
  // PLANTED PROBLEM 7 (fixed in M5): data is still fetched in the browser after the page loads.
  // FIX 4: loading and error states, with Retry.
  const store = useStore<ProductRow[]>(() => supabase.from("products").select("*"), []);

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>Gear for long days outside</Heading>
        <Text color="secondary">Tents, packs, boots and camp kit. 40 products, all made up.</Text>
      </VStack>
      <CategoryTabs current="all" />
      {store.status === "loading" && <Loading label="Loading products" />}
      {store.status === "error" && <StoreWaking onRetry={store.retry} />}
      {store.status === "ready" && (
        <Grid columns={{ minWidth: 240 }} gap={6}>
          {(store.data ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
        </Grid>
      )}
    </VStack>
  );
}
