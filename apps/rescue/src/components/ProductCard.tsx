"use client";

import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import Link from "next/link";
import { money } from "@/lib/constants";
import type { ProductRow } from "@/lib/supabase/browser";

export function ProductCard({ p }: { p: ProductRow }) {
  // FIX 8: a real link with a described photo and readable text.
  // PLANTED PROBLEM 7 (fixed in M5): still the full-size photo with no sizes.
  return (
    <Link href={`/p/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
      <VStack gap={3}>
        <Card padding={0}>
          <img src={`/products/${p.image_file}`} alt={p.name} style={{ width: "100%", display: "block", borderRadius: "inherit" }} />
        </Card>
        <VStack gap={1}>
          <Heading level={2}>{p.name}</Heading>
          <Text color="secondary" maxLines={2}>{p.description}</Text>
          <Text type="large" weight="bold">{money(p.price_cents)}</Text>
        </VStack>
      </VStack>
    </Link>
  );
}
