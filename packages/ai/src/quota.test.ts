import { describe, expect, it } from "vitest";
import { checkSalt, visitorHash } from "./quota.ts";

describe("visitorHash", () => {
  it("is a stable SHA-256 hex string of the IP, never the raw IP", () => {
    const h = visitorHash("203.0.113.7", "salt");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(visitorHash("203.0.113.7", "salt")).toBe(h);
    expect(h).not.toContain("203");
  });

  it("changes with the IP or the salt", () => {
    const h = visitorHash("203.0.113.7", "salt");
    expect(visitorHash("203.0.113.8", "salt")).not.toBe(h);
    expect(visitorHash("203.0.113.7", "pepper")).not.toBe(h);
  });
});

describe("checkSalt", () => {
  it("requires a real salt in production", () => {
    expect(() => checkSalt(undefined, "production")).toThrow("CHECK_SALT");
    expect(() => checkSalt("short", "production")).toThrow("CHECK_SALT");
    expect(checkSalt("a-long-random-salt-value", "production")).toBe("a-long-random-salt-value");
  });

  it("falls back to a dev salt outside production", () => {
    expect(checkSalt(undefined, "development")).toBe("local-dev-salt");
  });
});
