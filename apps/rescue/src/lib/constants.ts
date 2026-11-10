export { BEN_TARGET_ORDER_ID, SHOPPERS } from "@workshop/catalog";

export const CATEGORIES = [
  ["tents", "Tents"], ["packs", "Packs"], ["footwear", "Footwear"], ["sleep", "Sleep"],
  ["cooking", "Cooking"], ["lights", "Lights"], ["clothing", "Clothing"],
] as const;

export const money = (cents: number) => "$" + (cents / 100).toFixed(2);
