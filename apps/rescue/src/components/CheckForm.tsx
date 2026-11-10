"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useState } from "react";
import { type CheckError, type CheckResult, checkUrl } from "@/app/check/actions";

const MESSAGES: Record<CheckError["error"], { title: string; description: string }> = {
  invalid: { title: "That doesn't look like a web address", description: "Paste the full address, like https://yourshop.com." },
  unsafe: { title: "We can only check public websites", description: "Addresses inside a private network, or on unusual ports, are refused for safety." },
  visitor_limit: { title: "You've used today's 3 checks", description: "Come back tomorrow, or ask for the full audit." },
  global_limit: { title: "Today's free checks are used up", description: "Everyone shares a daily allowance. Try again tomorrow." },
  unavailable: { title: "The check isn't available right now", description: "Google's test or our service didn't answer. Try again in a few minutes." },
};

export function CheckForm() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<CheckResult | CheckError | null>(null);

  async function run() {
    setState(null);
    setState(await checkUrl(url));
  }

  return (
    <VStack gap={6}>
      <HStack gap={3} vAlign="end">
        <div style={{ flex: 1 }}>
          <TextInput
            label="Your site's address"
            type="url"
            value={url}
            onChange={setUrl}
            onEnter={run}
            size="lg"
            description="3 free checks a day. We only read public data, and we never store your address."
          />
        </div>
        <Button label="Check it" variant="primary" size="lg" clickAction={run} />
      </HStack>

      <div aria-live="polite">
        {state && "error" in state && <Banner status={state.error === "unsafe" || state.error === "invalid" ? "warning" : "info"} title={MESSAGES[state.error].title} description={MESSAGES[state.error].description} />}
        {state && "items" in state && (
          <div data-testid="check-result">
            <VStack gap={3}>
              <HStack gap={3}>
                <Badge variant="neutral" label={`Performance ${state.performance}`} />
                <Badge variant="neutral" label={`Accessibility ${state.accessibility}`} />
              </HStack>
              {!state.ai && <Text type="supporting">AI summary unavailable today. Here's our own reading of the results.</Text>}
              {state.items.map((item, i) => (
                <Card key={item.title} padding={4}>
                  <HStack gap={3} vAlign="start">
                    <Badge variant={i === 0 ? "error" : "warning"} label={i === 0 ? "Fix first" : "Worth fixing"} />
                    <VStack gap={1}>
                      <Text weight="semibold">{item.title}</Text>
                      <Text color="secondary">{item.why}</Text>
                    </VStack>
                  </HStack>
                </Card>
              ))}
            </VStack>
          </div>
        )}
      </div>

      <Banner
        status="info"
        title="Want the full audit?"
        description="A full code, security and speed audit of your app, with fixes."
        endContent={<Button label="See the audit offer" variant="primary" href="#audit-offer" />}
      />
    </VStack>
  );
}
