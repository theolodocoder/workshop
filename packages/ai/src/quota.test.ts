import { describe, expect, it } from "vitest";
import { visitorHash } from "./quota.ts";

describe("visitorHash", () => {
  it("is a stable SHA-256 hex string", () => {
    const h = visitorHash("session-1", "203.0.113.7", "salt");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(visitorHash("session-1", "203.0.113.7", "salt")).toBe(h);
  });

  it("changes with the session, the IP or the salt (and never contains the raw IP)", () => {
    const h = visitorHash("session-1", "203.0.113.7", "salt");
    expect(visitorHash("session-2", "203.0.113.7", "salt")).not.toBe(h);
    expect(visitorHash("session-1", "203.0.113.8", "salt")).not.toBe(h);
    expect(visitorHash("session-1", "203.0.113.7", "pepper")).not.toBe(h);
    expect(h).not.toContain("203");
  });
});
