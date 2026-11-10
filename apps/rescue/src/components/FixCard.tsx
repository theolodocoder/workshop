"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Link } from "@astryxdesign/core/Link";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { type Fix, REPO_URL } from "@content/fixes";

export function FixCard({ fix }: { fix: Fix }) {
  return (
    <Card padding={5}>
      <div data-testid="fix-card">
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Badge variant={fix.group === "security" ? "purple" : "green"} label={`Fix ${fix.id}`} />
            <Heading level={3}>{fix.title}</Heading>
          </HStack>
          <Text><Text weight="bold">Risk: </Text>{fix.risk}</Text>
          <Text><Text weight="bold">Fix: </Text>{fix.fix}</Text>
          <HStack gap={4} vAlign="center">
            {fix.commit ? (
              <Link href={`${REPO_URL}/commit/${fix.commit}`}>See the commit</Link>
            ) : (
              <Text type="supporting">Link after release</Text>
            )}
            <Text type="supporting">Test: {fix.test}</Text>
          </HStack>
        </VStack>
      </div>
    </Card>
  );
}
