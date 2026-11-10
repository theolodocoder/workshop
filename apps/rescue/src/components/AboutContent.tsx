"use client";

import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

type Credit = { product: string; photographer: string; url: string };

export function AboutContent({ credits }: { credits: Credit[] }) {
  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Heading level={1}>About this demo</Heading>
        <Text color="secondary">
          Northfold Outfitters is not a real shop. It's a demo built by Promise Okafor to show an app rescue: the same
          shop as a typical AI-built app, and again after nine fixes. All products, prices and shoppers are made up, and
          nothing can be bought.
        </Text>
      </VStack>
      <VStack gap={2}>
        <Heading level={2}>Credits</Heading>
        <Text>Built on Astryx (MIT, by Meta). Code: <Link href="https://github.com/theolodocoder">github.com/theolodocoder</Link>.</Text>
        <Text>Product photos are free photos from Unsplash, used under the Unsplash License. Thank you to:</Text>
      </VStack>
      <ul style={{ columns: "16rem", margin: 0, paddingInlineStart: "1.25rem" }}>
        {credits.map((c) => (
          <li key={c.url} data-testid="photo-credit" style={{ breakInside: "avoid", marginBottom: 6 }}>
            <Text>
              {c.product}: <Link href={c.url}>{c.photographer}</Link>
            </Text>
          </li>
        ))}
      </ul>
    </VStack>
  );
}
