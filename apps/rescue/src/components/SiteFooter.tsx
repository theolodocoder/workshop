"use client";

import { Link } from "@astryxdesign/core/Link";
import { HStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--color-border, #e5e5e5)", padding: "24px" }}>
      <HStack gap={4} hAlign="center" style={{ flexWrap: "wrap" }}>
        <Text type="supporting">
          Built by <Link href="https://promise-okafor.vercel.app">Promise Okafor</Link>
        </Text>
        <Text type="supporting">Built on Astryx (MIT, by Meta)</Text>
        <Text type="supporting">Photos from Unsplash</Text>
        <Link href="/about">About this demo</Link>
      </HStack>
    </footer>
  );
}
