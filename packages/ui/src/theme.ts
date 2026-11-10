import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

// Northfold Outfitters theme: Astryx neutral, plus a forest-green accent
// (approved by Promise in M1, 2026-11-10). Each pair is [light mode, dark mode].
// We set the text color on the accent too, so buttons stay readable in dark mode.
// Font tokens point at a CSS variable each app fills with next/font, so there's no late font swap.
export const northfoldTheme = defineTheme({
  name: "northfold",
  extends: neutralTheme,
  tokens: {
    "--color-accent": ["#2F6B4F", "#6FBF95"],
    "--color-on-accent": ["#FFFFFF", "#0B2418"],
    // Astryx's Figtree font, self-hosted by next/font in each app (set as --font-figtree on <html>).
    "--font-family-body": "var(--font-figtree), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    "--font-family-heading": "var(--font-figtree), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
});
