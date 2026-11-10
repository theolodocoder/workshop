"use client";

import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { Theme, defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

// Copied from packages/ui so this frozen app stays self-contained.
const northfoldTheme = defineTheme({
  name: "northfold",
  extends: neutralTheme,
  tokens: {
    "--color-accent": ["#2F6B4F", "#6FBF95"],
    "--color-on-accent": ["#FFFFFF", "#0B2418"],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={northfoldTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
