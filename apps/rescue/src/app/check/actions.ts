"use server";

import {
  assertPublicUrl,
  checkSalt,
  fetchHeadersSafely,
  headerFindings,
  type Item,
  runPageSpeed,
  summarize,
  UnsafeUrlError,
  visitorHash,
  workersAi,
} from "@workshop/ai";
import { headers } from "next/headers";
import { CheckUrl } from "@/lib/schemas";
import { supabaseStore } from "@/lib/supabase/server";

export type CheckResult = { url: string; performance: number; accessibility: number; items: Item[]; ai: boolean };
export type CheckError = { error: "invalid" | "unsafe" | "visitor_limit" | "global_limit" | "unavailable" };

// The daily limit is per IP (see visitorHash). Behind Vercel, x-forwarded-for is set by the platform.
async function visitor(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  return visitorHash(ip, checkSalt(process.env.CHECK_SALT, process.env.NODE_ENV));
}

/**
 * "Check your site": validate, refuse internal addresses, take one of today's checks, then run
 * Google PageSpeed and read the site's security headers, and summarise in plain words.
 * Order matters: nothing is fetched until the address is known to be public and a check is available.
 */
export async function checkUrl(raw: string): Promise<CheckResult | CheckError> {
  const parsed = CheckUrl.safeParse(raw);
  if (!parsed.success) return { error: "invalid" };

  let url: URL;
  try {
    url = await assertPublicUrl(parsed.data);
  } catch (e) {
    return { error: e instanceof UnsafeUrlError ? "unsafe" : "invalid" };
  }

  const { data: quota, error } = await supabaseStore.rpc("take_check_quota", { visitor_hash: await visitor() });
  if (error) return { error: "unavailable" };
  if (quota === "visitor_limit" || quota === "global_limit") return { error: quota };

  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { error: "unavailable" };

  try {
    const [psi, siteHeaders] = await Promise.all([
      runPageSpeed(url, key),
      fetchHeadersSafely(url).catch(() => null),
    ]);
    const findings = siteHeaders ? headerFindings(siteHeaders) : [];
    const accountId = process.env.CF_ACCOUNT_ID;
    const token = process.env.CF_AI_TOKEN;
    const run = accountId && token ? workersAi({ accountId, token }) : async () => Promise.reject(new Error("no AI configured"));
    const summary = await summarize({ psi, headers: findings }, run);
    return { url: url.href, performance: psi.performance, accessibility: psi.accessibility, ...summary };
  } catch {
    return { error: "unavailable" };
  }
}
