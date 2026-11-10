import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source.
  transpilePackages: ["@workshop/ui", "@workshop/catalog"],
};

export default nextConfig;
