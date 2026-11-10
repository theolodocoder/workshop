"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

// PLANTED PROBLEM 7 (fixed in M5): a whole charting library for one tiny decoration.
const trend = [3, 5, 4, 7, 6, 9, 8, 11].map((v, i) => ({ i, v }));

export function TrendSparkline() {
  return (
    <div aria-hidden="true" inert style={{ width: 80, height: 28 }}>
      <ResponsiveContainer>
        <LineChart data={trend}>
          <Line type="monotone" dataKey="v" stroke="var(--color-accent)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
