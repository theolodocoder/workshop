"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";

export function StoreWaking({ onRetry }: { onRetry: () => void }) {
  return (
    <Banner
      status="warning"
      title="Store is waking up"
      description="We couldn't reach the store just now. Free demo databases sleep when nobody's around. Try again in a minute."
      endContent={<Button label="Retry" variant="primary" onClick={onRetry} />}
    />
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "64px 0" }}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
