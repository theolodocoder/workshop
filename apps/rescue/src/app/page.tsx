"use client";

import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Text";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <Heading level={1}>Northfold Outfitters</Heading>
      <Button label="Shop gear" variant="primary" />
    </main>
  );
}
