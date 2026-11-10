"use client";

import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import Image from "next/image";
import Link from "next/link";
import { money } from "@/lib/constants";
import type { ShopProduct } from "@/lib/products";

export function ProductCard({ p, priority = false }: { p: ShopProduct; priority?: boolean }) {
  // FIX 8: a real link with a described photo. FIX 7: next/image serves a size that fits the
  // screen (srcset), in a modern format, and reserves its space so nothing jumps.
  return (
    <Link href={`/p/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
      <VStack gap={3}>
        <Card padding={0}>
          <Image
            src={`/products/${p.image_file}`}
            alt={p.name}
            width={p.width}
            height={p.height}
            sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 300px"
            priority={priority}
            style={{ width: "100%", height: "auto", display: "block", borderRadius: "inherit" }}
          />
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
