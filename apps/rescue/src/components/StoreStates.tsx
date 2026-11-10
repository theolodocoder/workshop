"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useRouter } from "next/navigation";

// Retry re-runs the browser request when given one; on server-rendered pages it re-renders the page.
export function StoreWaking({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  return (
    <Banner
      status="warning"
      title="Store is waking up"
      description="We couldn't reach the store just now. Free demo databases sleep when nobody's around. Try again in a minute."
      endContent={<Button label="Retry" variant="primary" onClick={onRetry ?? (() => router.refresh())} />}
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
