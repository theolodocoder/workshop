import { z } from "zod";

// The measured before/after numbers shown on /report. Only ever written by
// scripts/collect-results.mjs from real Lighthouse CI runs, never typed in by hand.
export const Metrics = z.object({
  lcpMs: z.number().nonnegative(),
  tbtMs: z.number().nonnegative(),
  cls: z.number().nonnegative(),
  jsKb: z.number().nonnegative(),
  axeIssues: z.number().int().nonnegative(),
});

export const Results = z.object({
  measuredAt: z.string().min(1),
  method: z.string().min(1),
  before: Metrics,
  after: Metrics,
  testCount: z.number().int().nonnegative(),
});

export type Results = z.infer<typeof Results>;
