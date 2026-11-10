import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Northfold Outfitters (rescued)",
  description: "The same shop after its rescue. Demo store, not a real shop.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 64px" }}>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
