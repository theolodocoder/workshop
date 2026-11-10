"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import Image from "next/image";

export function HomeDoors({ beforeUrl, beforeAwake, clipUrl }: { beforeUrl: string; beforeAwake: boolean; clipUrl: string | null }) {
  return (
    <VStack gap={8}>
      <div style={{ position: "relative", minHeight: 380, borderRadius: 16, overflow: "hidden", display: "grid", alignItems: "end" }}>
        <Image src="/products/hollow-pine-3-tent.jpg" alt="" fill priority sizes="(max-width: 1180px) 100vw, 1180px" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 25%, rgba(0,0,0,.7))" }} />
        <div style={{ position: "relative", padding: "40px 32px", color: "white" }}>
          <VStack gap={3}>
            <Text type="label" color="inherit">Northfold Outfitters · a demo app rescue</Text>
            <Heading level={1} type="display-2" color="inherit">A typical AI-built shop, before and after a rescue</Heading>
            <Text type="large" color="inherit">Open both. Try to break them. See what changed and why.</Text>
          </VStack>
        </div>
      </div>

      <Grid columns={2} gap={6}>
        <Card padding={6} elevation="low">
          <VStack gap={4}>
            <HStack gap={2} vAlign="center">
              <Badge variant="warning" label="Before" />
              <Text type="supporting">As an AI builder left it</Text>
            </HStack>
            <Heading level={2}>The before shop</Heading>
            <Text color="secondary">
              Looks fine. Any signed-in shopper can read other people's orders, prices come from the browser, and pages are
              slow and hard to use with a keyboard.
            </Text>
            {beforeAwake ? (
              <Button label="Open the before shop" href={beforeUrl} />
            ) : (
              <VStack gap={2}>
                <Text weight="semibold">The before shop is asleep right now</Text>
                <Text type="supporting">Its free database rests when nobody visits. Try again in a minute.</Text>
                {clipUrl && <Button label="Watch the clip instead" href={clipUrl} />}
              </VStack>
            )}
          </VStack>
        </Card>
        <Card padding={6} elevation="low">
          <VStack gap={4}>
            <HStack gap={2} vAlign="center">
              <Badge variant="success" label="Rescued" />
              <Text type="supporting">After the rescue</Text>
            </HStack>
            <Heading level={2}>The rescued shop</Heading>
            <Text color="secondary">
              The same shop with nine fixes. Each fix is its own commit, with a test that fails on the before shop and passes
              here.
            </Text>
            <Button label="Open the rescued shop" variant="primary" href="/shop" />
          </VStack>
        </Card>
      </Grid>

      <HStack gap={2} hAlign="center">
        <Button label="Read the rescue report" variant="ghost" href="/report" />
      </HStack>
      <Text type="supporting" justify="center">
        Built by Promise Okafor · Built on Astryx (MIT, by Meta) · Photos from Unsplash
      </Text>
    </VStack>
  );
}
