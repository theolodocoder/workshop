import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

// Northfold Outfitters theme: Astryx neutral plus one outdoor accent.
// Placeholder accent (forest green) until the M1 mockups are approved.
export const northfoldTheme = defineTheme({
  name: "northfold",
  extends: neutralTheme,
  tokens: {
    "--color-accent": ["#2F6B4F", "#6FBF95"],
  },
});
