"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import type { Focus } from "@content/fixes";
import type { Results } from "@/lib/results";

type Key = keyof Results["before"];
const ROWS: { key: Key; label: string; hint: string; fmt: (n: number) => string }[] = [
  { key: "lcpMs", label: "Main content appears (LCP)", hint: "Mobile, throttled", fmt: (n) => `${(n / 1000).toFixed(1)} s` },
  { key: "tbtMs", label: "Time blocked (TBT)", hint: "lab stand-in for INP", fmt: (n) => `${Math.round(n)} ms` },
  { key: "cls", label: "Layout shift (CLS)", hint: "Lower is better", fmt: (n) => n.toFixed(2) },
  { key: "jsKb", label: "JavaScript sent", hint: "Compressed, first load", fmt: (n) => `${n} KB` },
  { key: "axeIssues", label: "Accessibility problems", hint: "axe, serious + critical", fmt: (n) => String(n) },
];
const RESCUE_ORDER: Key[] = ["axeIssues", "lcpMs", "tbtMs", "cls", "jsKb"];
const FRONTEND_ORDER: Key[] = ["lcpMs", "tbtMs", "cls", "jsKb", "axeIssues"];

export function ResultsTable({ results, focus }: { results: Results | null; focus: Focus }) {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Heading level={2}>Before vs. after</Heading>
        {!results && <Badge variant="neutral" label="Not measured yet" />}
      </HStack>
      {!results ? (
        <Text type="supporting">
          Numbers appear here only after real test runs on the deployed shops, with how and when they were measured.
        </Text>
      ) : (
        <>
          <Text type="supporting">
            Measured {results.measuredAt}: {results.method}. {results.testCount} automated tests.
          </Text>
          <Grid columns={3} gap={4}>
            {(focus === "frontend" ? FRONTEND_ORDER : RESCUE_ORDER).map((key) => {
              const row = ROWS.find((r) => r.key === key)!;
              return (
                <Card key={key} padding={4}>
                  <div data-testid={`metric-${key}`}>
                    <VStack gap={2}>
                      <Text type="label">{row.label}</Text>
                      <HStack gap={2} vAlign="end">
                        <Text type="large" color="secondary" hasStrikethrough>{row.fmt(results.before[key])}</Text>
                        <Text color="secondary" aria-hidden>→</Text>
                        <Text type="display-3">{row.fmt(results.after[key])}</Text>
                      </HStack>
                      <Text type="supporting">{row.hint}</Text>
                    </VStack>
                  </div>
                </Card>
              );
            })}
          </Grid>
        </>
      )}
    </VStack>
  );
}
