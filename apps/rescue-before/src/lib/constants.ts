// Copied from @workshop/catalog on purpose: the before app is frozen and imports no workspace packages.
export const SHOPPERS = {
  ada: { id: "00000000-0000-4000-a000-00000000ada1", name: "Ada" },
  ben: { id: "00000000-0000-4000-a000-00000000be01", name: "Ben" },
} as const;
export const BEN_TARGET_ORDER_ID = "00000000-0000-4000-b000-0000000000b1";

export const CATEGORIES = [
  ["tents", "Tents"], ["packs", "Packs"], ["footwear", "Footwear"], ["sleep", "Sleep"],
  ["cooking", "Cooking"], ["lights", "Lights"], ["clothing", "Clothing"],
] as const;

export const money = (cents: number) => "$" + (cents / 100).toFixed(2);
