// Google PageSpeed Insights (free API key). We keep only scores and failing audit ids with their
// weights: never titles or descriptions, which can contain text from the visitor's site.

export type PsiFindings = {
  performance: number;
  accessibility: number;
  failedAudits: { id: string; weight: number }[];
};

type Psi = {
  lighthouseResult: {
    categories: Record<string, { score: number | null; auditRefs: { id: string; weight: number }[] }>;
    audits: Record<string, { score: number | null }>;
  };
};

const SAFE_ID = /^[a-z0-9-]{1,60}$/;

export function parsePageSpeed(json: unknown): PsiFindings {
  const lr = (json as Psi).lighthouseResult;
  const score = (cat: string) => Math.round((lr.categories[cat]?.score ?? 0) * 100);
  const failed: { id: string; weight: number }[] = [];
  for (const cat of ["performance", "accessibility"]) {
    for (const ref of lr.categories[cat]?.auditRefs ?? []) {
      const s = lr.audits[ref.id]?.score;
      if (typeof s === "number" && s < 0.9 && SAFE_ID.test(ref.id)) failed.push({ id: ref.id, weight: ref.weight });
    }
  }
  failed.sort((a, b) => b.weight - a.weight);
  return { performance: score("performance"), accessibility: score("accessibility"), failedAudits: failed };
}

export async function runPageSpeed(
  url: URL,
  key: string,
  opts: { fetchImpl?: typeof fetch; base?: string } = {},
): Promise<PsiFindings> {
  const api = new URL(opts.base ?? process.env.PAGESPEED_API_URL ?? "https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  api.searchParams.set("url", url.href);
  api.searchParams.set("strategy", "mobile");
  api.searchParams.append("category", "performance");
  api.searchParams.append("category", "accessibility");
  api.searchParams.set("key", key);
  const res = await (opts.fetchImpl ?? fetch)(api, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`PageSpeed answered ${res.status}`);
  return parsePageSpeed(await res.json());
}
