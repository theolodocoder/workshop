import type { NextConfig } from "next";

// FIX 9: security headers on every response. The CSP itself is set per request in src/proxy.ts.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@workshop/ui", "@workshop/catalog"],
  // The report reads content/results.json at request time; ship it with the server bundle.
  outputFileTracingIncludes: { "/report": ["./content/**"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
