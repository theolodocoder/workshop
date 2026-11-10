import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { headerFindings } from "./headers.ts";
import { parsePageSpeed, runPageSpeed } from "./pagespeed.ts";
import { summarize } from "./summarize.ts";

const psiJson = JSON.parse(readFileSync(new URL("./fixtures/psi.json", import.meta.url), "utf8"));
const psi = parsePageSpeed(psiJson);
const headers = headerFindings(new Headers({ "strict-transport-security": "max-age=1", "x-frame-options": "DENY" }));

describe("parsePageSpeed", () => {
  it("keeps the two scores and the failing audits by id and weight, nothing else", () => {
    expect(psi.performance).toBe(42);
    expect(psi.accessibility).toBe(81);
    expect(psi.failedAudits).toEqual([
      { id: "total-blocking-time", weight: 30 },
      { id: "largest-contentful-paint", weight: 25 },
      { id: "button-name", weight: 10 },
      { id: "color-contrast", weight: 7 },
      { id: "uses-responsive-images", weight: 0 },
    ]);
    expect(JSON.stringify(psi)).not.toContain("injected");
  });

  it("calls the PageSpeed API for mobile performance and accessibility", async () => {
    let called = "";
    const fetchImpl = (async (u: string | URL) => {
      called = String(u);
      return new Response(JSON.stringify(psiJson));
    }) as typeof fetch;
    await runPageSpeed(new URL("https://example.com"), "KEY", { fetchImpl, base: "https://psi.test/run" });
    const q = new URL(called).searchParams;
    expect(q.get("url")).toBe("https://example.com/");
    expect(q.get("strategy")).toBe("mobile");
    expect(q.getAll("category")).toEqual(["performance", "accessibility"]);
    expect(q.get("key")).toBe("KEY");
  });
});

describe("headerFindings", () => {
  it("reports which security headers are present", () => {
    expect(headers).toEqual([
      { name: "csp", present: false },
      { name: "hsts", present: true },
      { name: "nosniff", present: false },
      { name: "referrer-policy", present: false },
      { name: "frame-protection", present: true },
    ]);
  });
});

describe("summarize", () => {
  it("falls back to our own plain-English list, by weight, when the AI fails", async () => {
    const out = await summarize({ psi, headers }, async () => {
      throw new Error("AI down");
    });
    expect(out.ai).toBe(false);
    expect(out.items[0]?.title).toMatch(/slow to respond|blocked/i);
    expect(out.items.length).toBeLessThanOrEqual(6);
    expect(out.items.some((i) => /Content-Security-Policy/.test(i.title))).toBe(true);
  });

  it("sends the AI only ids, scores and header names: no page text, no URLs, no HTML", async () => {
    let prompt = "";
    await summarize({ psi, headers }, async (p) => {
      prompt = p;
      return "not json";
    });
    expect(prompt).toContain("total-blocking-time");
    expect(prompt).not.toContain("<");
    expect(prompt).not.toContain("http");
    expect(prompt).not.toContain("injected");
  });

  it("uses the AI's wording when it returns the expected shape", async () => {
    const out = await summarize({ psi, headers }, async () =>
      JSON.stringify([{ title: "Your page freezes while it loads", why: "Big scripts run before people can tap anything." }]),
    );
    expect(out.ai).toBe(true);
    expect(out.items[0]?.title).toBe("Your page freezes while it loads");
  });

  it("ignores AI output that isn't the expected shape, or is too long", async () => {
    const bad = await summarize({ psi, headers }, async () => JSON.stringify([{ title: "x".repeat(500), why: "y" }]));
    expect(bad.ai).toBe(false);
  });
});
