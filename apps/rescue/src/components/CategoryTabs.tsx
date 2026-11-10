"use client";

import { Tab, TabList } from "@astryxdesign/core/TabList";
import { CATEGORIES } from "@/lib/constants";

// FIX 8: categories are real links in a labelled list, not clickable divs.
export function CategoryTabs({ current }: { current: string }) {
  return (
    <nav aria-label="Categories">
      <TabList value={current} onChange={() => {}} hasDivider>
        <Tab value="all" label="All" href="/shop" />
        {CATEGORIES.map(([key, label]) => (
          <Tab key={key} value={key} label={label} href={`/c/${key}`} />
        ))}
      </TabList>
    </nav>
  );
}
