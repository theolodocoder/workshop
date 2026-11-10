// Turns Lighthouse CI runs (one folder of lhr-*.json per app) into apps/rescue/content/results.json,
// the only source of the numbers on the rescue report. Median of the runs for each metric.
// Usage: node scripts/collect-results.mjs <beforeDir> <afterDir> --tests <n> --axe-before <n> --axe-after <n>
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const { Results } = await import(root + "apps/rescue/src/lib/results.ts");
const DEFAULT_OUT = root + "apps/rescue/content/results.json";

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

async function readRuns(dir) {
  const files = (await readdir(dir).catch(() => [])).filter((f) => /^lhr-.*\.json$/.test(f));
  if (files.length === 0) throw new Error(`no lighthouse results in ${dir}`);
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(join(dir, f), "utf8"))));
}

function metrics(runs, axeIssues) {
  const audit = (lhr, id) => lhr.audits[id].numericValue;
  const js = (lhr) => lhr.audits["resource-summary"].details.items.find((i) => i.resourceType === "script")?.transferSize ?? 0;
  return {
    lcpMs: Math.round(median(runs.map((r) => audit(r, "largest-contentful-paint")))),
    tbtMs: Math.round(median(runs.map((r) => audit(r, "total-blocking-time")))),
    cls: Math.round(median(runs.map((r) => audit(r, "cumulative-layout-shift"))) * 1000) / 1000,
    jsKb: Math.round(median(runs.map(js)) / 1024),
    axeIssues,
  };
}

/** @returns the validated results it wrote to `out`. */
export async function collectResults(beforeDir, afterDir, meta, out = DEFAULT_OUT) {
  const [before, after] = await Promise.all([readRuns(beforeDir), readRuns(afterDir)]);
  const results = Results.parse({
    measuredAt: meta.measuredAt,
    method: meta.method,
    before: metrics(before, meta.axe.before),
    after: metrics(after, meta.axe.after),
    testCount: meta.testCount,
  });
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(results, null, 2) + "\n");
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [beforeDir, afterDir, ...rest] = process.argv.slice(2);
  const flag = (name) => Number(rest[rest.indexOf(`--${name}`) + 1]);
  if (!beforeDir || !afterDir || rest.indexOf("--tests") < 0) {
    console.error("usage: collect-results <beforeDir> <afterDir> --tests <n> --axe-before <n> --axe-after <n>");
    process.exit(2);
  }
  const r = await collectResults(beforeDir, afterDir, {
    measuredAt: new Date().toISOString().slice(0, 10),
    method: "Lighthouse CI on the deployed preview, mobile profile, median of 5 runs, page /c/tents",
    testCount: flag("tests"),
    axe: { before: flag("axe-before"), after: flag("axe-after") },
  });
  console.log(JSON.stringify(r, null, 2));
}
