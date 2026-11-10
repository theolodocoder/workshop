"use client";

import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";

export function NotFoundState() {
  return (
    <EmptyState
      headingLevel={1}
      title="We couldn't find that page"
      description="The product may have moved, or the link has a typo."
      actions={<Button label="Back to the shop" variant="primary" href="/shop" />}
    />
  );
}
