"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { useRouter } from "next/navigation";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { DemoSignIn } from "./DemoSignIn";

// PLANTED PROBLEM 7: a whole charting library loads on every page for one tiny decoration.
const trend = [3, 5, 4, 7, 6, 9, 8, 11].map((v, i) => ({ i, v }));

export function Header() {
  const router = useRouter();
  return (
    <header>
      <Banner container="section" status="warning" title="Deliberately insecure demo" description="Fake data, resets every hour. Demo store, not a real shop." />
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 24px", borderBottom: "1px solid #e5e5e5" }}>
        {/* PLANTED PROBLEM 8: navigation built from divs, with low-contrast text. */}
        <div onClick={() => router.push("/")} style={{ cursor: "pointer", fontWeight: 600, fontSize: 18 }}>Northfold Outfitters</div>
        <div onClick={() => router.push("/")} style={{ cursor: "pointer", color: "#b5b5b5" }}>Shop</div>
        <div onClick={() => router.push("/orders")} style={{ cursor: "pointer", color: "#b5b5b5" }}>My orders</div>
        <div onClick={() => router.push("/cart")} style={{ cursor: "pointer", color: "#b5b5b5" }}>Cart</div>
        <div style={{ width: 80, height: 28 }}>
          <ResponsiveContainer>
            <LineChart data={trend}>
              <Line type="monotone" dataKey="v" stroke="#2F6B4F" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <DemoSignIn />
        </div>
      </div>
    </header>
  );
}
