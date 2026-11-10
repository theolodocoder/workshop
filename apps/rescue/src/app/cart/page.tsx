"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartLineRow } from "@/components/CartLineRow";
import { clearCart, getCart, removeFromCart, setQty, type CartLine } from "@/lib/cart";
import { money } from "@/lib/constants";
import { placeOrder, type PlaceOrderResult } from "./actions";

type Failure = Exclude<PlaceOrderResult, { orderId: string }>["error"];

const FAILURES: Record<Failure, { title: string; description: string }> = {
  rate_limited: { title: "That's a lot of orders", description: "Demo shoppers can place 5 orders an hour. Try again later." },
  invalid_cart: { title: "Something in your cart isn't right", description: "Check the quantities (1 to 10) and try again." },
  unavailable: { title: "We couldn't place your order", description: "The store didn't answer. Your cart is safe; try again in a minute." },
};

export default function Cart() {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  useEffect(() => setLines(getCart()), []);

  if (lines === null) return null;
  if (lines.length === 0)
    return (
      <EmptyState
        headingLevel={1}
        title="Your cart is empty"
        description="Find a tent, a pack or a mug to get started."
        actions={<Button label="Browse the shop" variant="primary" href="/shop" />}
      />
    );

  const cart = lines;
  // The total shown here is only a preview. FIX 3: the server prices the real order.
  const total = cart.reduce((sum, l) => sum + l.price_cents * l.qty, 0);

  async function checkout() {
    const result = await placeOrder(cart.map((l) => ({ productId: l.id, qty: l.qty })));
    if ("orderId" in result) {
      clearCart();
      router.push("/orders");
    } else {
      setFailure(result.error);
    }
  }

  return (
    <VStack gap={6}>
      <Heading level={1}>Your cart</Heading>
      {failure && <Banner status="error" title={FAILURES[failure].title} description={FAILURES[failure].description} />}
      <Grid columns={2} gap={8} align="start">
        <VStack gap={4}>
          {cart.map((l) => (
            <CartLineRow key={l.id} line={l} onQty={(qty) => setLines(setQty(l.id, qty))} onRemove={() => setLines(removeFromCart(l.id))} />
          ))}
        </VStack>
        <Card padding={5}>
          <VStack gap={3}>
            <Heading level={2}>Summary</Heading>
            <HStack hAlign="between"><Text>Subtotal</Text><Text>{money(total)}</Text></HStack>
            <HStack hAlign="between"><Text>Shipping</Text><Text>Free (demo)</Text></HStack>
            <Divider />
            <HStack hAlign="between"><Text weight="bold">Total</Text><Text weight="bold">{money(total)}</Text></HStack>
            <Text type="supporting">The server works out the final total from its own prices. No payment is taken.</Text>
            <Button label="Place order" variant="primary" width="100%" clickAction={checkout} />
          </VStack>
        </Card>
      </Grid>
    </VStack>
  );
}
