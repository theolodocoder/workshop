"use client";

import { Heading } from "@astryxdesign/core/Heading";
import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

export function PageIntro({ title, lead }: { title: string; lead?: string }) {
  return (
    <VStack gap={2}>
      <Heading level={1}>{title}</Heading>
      {lead && <Text color="secondary">{lead}</Text>}
    </VStack>
  );
}
