import type { Metadata } from "next";
import { CheckForm } from "@/components/CheckForm";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = { title: "Check your site · Northfold Outfitters" };

export default function Check() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <PageIntro
        title="Check your site"
        lead="Paste a link. You get a short, plain-English list of what to fix first: speed, accessibility and security headers."
      />
      <CheckForm />
    </div>
  );
}
