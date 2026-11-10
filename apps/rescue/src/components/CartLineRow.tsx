"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useId, useState } from "react";
import type { CartLine } from "@/lib/cart";
import { money } from "@/lib/constants";
import { isValidQty } from "@/lib/limits";

// One cart line: a labelled quantity field (checked with the same schema the server uses) and Remove.
export function CartLineRow({
  line,
  onQty,
  onRemove,
}: {
  line: CartLine;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(String(line.qty));
  const [bad, setBad] = useState(false);
  const id = useId();

  function commit() {
    const qty = Number(draft);
    if (!isValidQty(qty)) {
      setBad(true);
      return;
    }
    setBad(false);
    onQty(qty);
  }

  return (
    <HStack gap={4} vAlign="center">
      <VStack gap={1} style={{ flex: 1 }}>
        <Text weight="semibold">{line.name}</Text>
        {bad && <Text type="supporting">Choose a quantity from 1 to 10.</Text>}
      </VStack>
      <label htmlFor={id} style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Quantity for {line.name}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={draft}
        aria-invalid={bad}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{ width: 72, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--color-border, #8a8a8a)", font: "inherit", background: "transparent", color: "inherit" }}
      />
      <Text weight="semibold">{money(line.price_cents * line.qty)}</Text>
      <Button label={`Remove ${line.name}`} variant="ghost" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </HStack>
  );
}
