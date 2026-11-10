import type { Metadata } from "next";
import { fixes, orderFixes, type Focus } from "@content/fixes";
import { FixCard } from "@/components/FixCard";
import { PageIntro } from "@/components/PageIntro";
import { ResultsTable } from "@/components/ResultsTable";
import { readResults } from "@/lib/results-file";

export const metadata: Metadata = { title: "Rescue report · Northfold Outfitters" };

// ?focus=frontend puts speed, accessibility and UX-state fixes first (for frontend clients).
export default async function Report({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const focus: Focus = (await searchParams).focus === "frontend" ? "frontend" : "rescue";
  const results = await readResults();
  return (
    <div style={{ display: "grid", gap: 32 }}>
      <PageIntro
        title="Rescue report"
        lead="Nine problems found in the before shop, how each was fixed, and the test that proves it. Each test fails on the before shop and passes here."
      />
      <ResultsTable results={results} focus={focus} />
      <div style={{ display: "grid", gap: 12 }}>
        {orderFixes(fixes, focus).map((f) => <FixCard key={f.id} fix={f} />)}
      </div>
    </div>
  );
}
