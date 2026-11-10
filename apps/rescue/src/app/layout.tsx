import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Northfold Outfitters (rescued)",
  description: "The same shop after its rescue. Demo store, not a real shop.",
};

// Reading the request headers makes every page render per request, which a nonce needs
// (Next.js adds the nonce to its own scripts automatically).
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers();
  return (
    <html lang="en">
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
