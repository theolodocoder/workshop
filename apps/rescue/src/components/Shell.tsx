"use client";

import { AppShell } from "@astryxdesign/core/AppShell";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { ShoppingCartIcon, SunIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { DemoSignIn } from "./DemoSignIn";

// FIX 8: a real app shell. Astryx's AppShell adds the skip link and the <main> landmark,
// and TopNav renders real links in a labelled <nav>.
export function Shell({ children, signedIn }: { children: React.ReactNode; signedIn: boolean }) {
  const path = usePathname();
  return (
    <AppShell
      height="auto"
      variant="section"
      banner={<Banner container="section" status="info" title="Demo store, not a real shop" description="The rescued version. Fake data only." />}
      topNav={
        <TopNav
          label="Northfold navigation"
          heading={<TopNavHeading heading="Northfold Outfitters" logo={<NavIcon icon={<Icon icon={SunIcon} size="sm" />} />} headingHref="/" />}
          centerContent={
            <>
              <TopNavItem label="Shop" href="/shop" isSelected={path === "/shop" || path.startsWith("/c/") || path.startsWith("/p/")} />
              <TopNavItem label="My orders" href="/orders" isSelected={path === "/orders"} />
              <TopNavItem label="Rescue report" href="/report" isSelected={path === "/report"} />
            </>
          }
          endContent={
            <>
              <DemoSignIn signedIn={signedIn} />
              <Button label="Cart" variant="primary" href="/cart" icon={<Icon icon={ShoppingCartIcon} size="sm" />} />
            </>
          }
        />
      }
    >
      <div style={{ maxWidth: 1180, marginInline: "auto", padding: "32px 24px 64px" }}>{children}</div>
    </AppShell>
  );
}
