"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useState } from "react";
import { BEN_TARGET_ORDER_ID, money } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

type Found = { total_cents: number; order_items: { qty: number; products: { name: string; price_cents: number } }[] };

// The same component runs, unchanged, in both shops. It asks the database for Ben's order as
// the signed-in visitor. Only the database's security rules decide what comes back.
export function TryToBreakIt() {
  const [state, setState] = useState<"idle" | "opened" | "blocked">("idle");
  const [order, setOrder] = useState<Found | null>(null);

  async function attempt() {
    const { data } = await supabase
      .from("orders")
      .select("total_cents,order_items(qty,products(name,price_cents))")
      .eq("id", BEN_TARGET_ORDER_ID);
    const found = (data as unknown as Found[] | null)?.[0] ?? null;
    setOrder(found);
    setState(found ? "opened" : "blocked");
  }

  return (
    <Card padding={6} elevation="low">
      <VStack gap={4}>
        <Heading level={2}>Try to break it</Heading>
        <Text color="secondary">
          You're signed in as a demo shopper. This button asks the database for Ben's order, which isn't yours.
        </Text>
        <Button label="Try to open Ben's order" variant="destructive" clickAction={attempt} />
        <div data-testid="break-result" aria-live="polite">
          {state === "opened" && order && (
            <Banner status="error" title="Ben's order opened" collapsible={false}
              description="Anyone signed in can read it. The orders table has no security rules.">
              <VStack gap={1}>
                {order.order_items.map((i) => (
                  <Text key={i.products.name}>{i.products.name} · {money(i.products.price_cents * i.qty)}</Text>
                ))}
                <Text weight="bold">Total {money(order.total_cents)}</Text>
              </VStack>
            </Banner>
          )}
          {state === "blocked" && (
            <Banner status="success" title="Blocked" collapsible={false}
              description="The database only returns orders that belong to you. Same request, zero rows." />
          )}
        </div>
      </VStack>
    </Card>
  );
}
