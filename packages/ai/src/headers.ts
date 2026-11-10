export type HeaderFinding = { name: "csp" | "hsts" | "nosniff" | "referrer-policy" | "frame-protection"; present: boolean };

/** Which common security headers a site sends. Only names and yes/no leave this function. */
export function headerFindings(h: Headers): HeaderFinding[] {
  const csp = h.get("content-security-policy") ?? "";
  return [
    { name: "csp", present: csp.length > 0 },
    { name: "hsts", present: h.has("strict-transport-security") },
    { name: "nosniff", present: (h.get("x-content-type-options") ?? "").toLowerCase() === "nosniff" },
    { name: "referrer-policy", present: h.has("referrer-policy") },
    { name: "frame-protection", present: h.has("x-frame-options") || csp.includes("frame-ancestors") },
  ];
}
