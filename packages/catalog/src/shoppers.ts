// Two seeded, fake shoppers. Ben's order is the target of "Try to break it".
export const SHOPPERS = {
  ada: { id: "00000000-0000-4000-a000-00000000ada1", name: "Ada" },
  ben: { id: "00000000-0000-4000-a000-00000000be01", name: "Ben" },
} as const;

export const BEN_TARGET_ORDER_ID = "00000000-0000-4000-b000-0000000000b1";
