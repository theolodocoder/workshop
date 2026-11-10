import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Northfold Outfitters (rescued)",
  description: "The same shop after its rescue. Demo store, not a real shop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
