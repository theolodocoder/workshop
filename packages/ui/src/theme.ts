import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

// Northfold Outfitters theme: Astryx neutral, plus a forest-green accent
// (approved by Promise in M1, 2026-11-10). Each pair is [light mode, dark mode].
// We set the text color on the accent too, so buttons stay readable in dark mode.
export const northfoldTheme = defineTheme({
  name: "northfold",
  extends: neutralTheme,
  tokens: {
    "--color-accent": ["#2F6B4F", "#6FBF95"],
    "--color-on-accent": ["#FFFFFF", "#0B2418"],
  },
});
