"use client";

import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";

// Last line of defence: any unexpected error shows a friendly page instead of a stack trace.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState
      headingLevel={1}
      title="Something went wrong"
      description="That's on us, not you. Try again, or head back to the shop."
      actions={
        <>
          <Button label="Try again" variant="primary" onClick={reset} />
          <Button label="Back to the shop" href="/" />
        </>
      }
    />
  );
}
