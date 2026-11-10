import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Results } from "../apps/rescue/src/lib/results";
import { collectResults } from "./collect-results.mjs";

const dir = (name: string) => fileURLToPath(new URL(`./fixtures/lhci/${name}/`, import.meta.url));
const meta = { measuredAt: "2026-11-10", method: "Lighthouse CI, mobile, median of 5 runs", testCount: 60, axe: { before: 54, after: 0 } };

describe("collectResults", () => {
  it("takes the median of the runs for each metric", async () => {
    const out = join(mkdtempSync(join(tmpdir(), "results-")), "results.json");
    const r = await collectResults(dir("before"), dir("after"), meta, out);
    expect(r.before.lcpMs).toBe(4100);
    expect(r.after.lcpMs).toBe(1500);
    expect(r.before.tbtMs).toBe(620);
    expect(r.before.cls).toBe(0.31);
    expect(r.before.jsKb).toBe(401); // 410,200 bytes median, in KB
    expect(r.before.axeIssues).toBe(54);
    expect(r.after.axeIssues).toBe(0);
    expect(r.testCount).toBe(60);
    // What's written to disk is valid according to the schema the report page uses.
    expect(Results.parse(JSON.parse(readFileSync(out, "utf8")))).toEqual(r);
  });

  it("refuses to make up numbers when a folder has no results", async () => {
    const empty = mkdtempSync(join(tmpdir(), "empty-"));
    await expect(collectResults(empty, dir("after"), meta, join(empty, "r.json"))).rejects.toThrow(`no lighthouse results in ${empty}`);
  });
});
