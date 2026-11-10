"use client";

import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme, northfoldTheme } from "@workshop/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={northfoldTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
