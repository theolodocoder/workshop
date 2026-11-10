import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/components/Shell";

// FIX 7: the theme font is downloaded at build time and served from our own domain, with a
// size-matched fallback, so text doesn't jump when it loads.
const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  title: "Northfold Outfitters (rescued)",
  description: "The same shop after its rescue. Demo store, not a real shop.",
};

// Reading the request headers makes every page render per request, which a nonce needs
// (Next.js adds the nonce to its own scripts automatically).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers();
  // Supabase keeps the session in "sb-<project>-auth-token" cookies (sometimes split into .0, .1).
  const signedIn = (await cookies()).getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        <Providers>
          <Shell signedIn={signedIn}>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
