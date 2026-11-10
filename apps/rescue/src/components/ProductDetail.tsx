"use client";

import { Breadcrumbs, BreadcrumbItem } from "@astryxdesign/core/Breadcrumbs";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useId, useState } from "react";
import { addToCart } from "@/lib/cart";
import { CATEGORIES, money } from "@/lib/constants";
import { isValidQty } from "@/lib/limits";
import Image from "next/image";
import type { ShopProduct } from "@/lib/products";

// The interactive part of the product page (quantity + Add to cart). The page itself is rendered on the server.
export function ProductDetail({ p }: { p: ShopProduct }) {
  const [qty, setQty] = useState("1");
  const [message, setMessage] = useState<"added" | "bad-qty" | null>(null);
  const qtyId = useId();
  const qtyHelpId = useId();

  const categoryLabel = CATEGORIES.find(([key]) => key === p.category)?.[1] ?? p.category;

  function add() {
    // FIX 5: check the quantity before it goes anywhere.
    const n = Number(qty);
    if (!isValidQty(n)) return setMessage("bad-qty");
    addToCart({ id: p.id, name: p.name, price_cents: p.price_cents, qty: n });
    setMessage("added");
  }

  return (
    <VStack gap={4}>
      <Breadcrumbs>
        <BreadcrumbItem href="/">Shop</BreadcrumbItem>
        <BreadcrumbItem href={`/c/${p.category}`}>{categoryLabel}</BreadcrumbItem>
        <BreadcrumbItem>{p.name}</BreadcrumbItem>
      </Breadcrumbs>
      <Grid columns={2} gap={8} align="start">
        <Card padding={0}>
          {/* FIX 7: sized for the screen, loaded first (it's the main content), space reserved. */}
          <Image
            src={`/products/${p.image_file}`}
            alt={p.name}
            width={p.width}
            height={p.height}
            sizes="(max-width: 800px) 100vw, 560px"
            priority
            style={{ width: "100%", height: "auto", display: "block", borderRadius: "inherit" }}
          />
        </Card>
        <VStack gap={4}>
          <Heading level={1}>{p.name}</Heading>
          <Text type="large" weight="bold">{money(p.price_cents)}</Text>
          <Text color="secondary">{p.description}</Text>
          <Divider />
          {/* FIX 8: the quantity field has a visible label and announces its help and errors. */}
          <HStack gap={3} vAlign="end">
            <VStack gap={1}>
              <label htmlFor={qtyId}>
                <Text type="label">Quantity</Text>
              </label>
              <input
                id={qtyId}
                type="number"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                aria-describedby={qtyHelpId}
                aria-invalid={message === "bad-qty"}
                style={{ width: 96, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border, #8a8a8a)", font: "inherit", background: "transparent", color: "inherit" }}
              />
            </VStack>
            <Button label="Add to cart" variant="primary" onClick={add} />
          </HStack>
          <div id={qtyHelpId} aria-live="polite">
            {message === "bad-qty" && <Text color="primary">Choose a quantity from 1 to 10.</Text>}
            {message === "added" && <Text color="accent">Added to your cart.</Text>}
          </div>
        </VStack>
      </Grid>
    </VStack>
  );
}
