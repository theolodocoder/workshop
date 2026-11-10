import { createHash } from "node:crypto";

/**
 * The key for a visitor's daily check limit: a salted SHA-256 of their IP. We never store the IP itself.
 * Keyed on the IP alone (not a cookie), so clearing cookies doesn't give a fresh allowance. On Vercel the
 * x-forwarded-for header is set by the platform, so visitors can't fake it.
 */
export function visitorHash(ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}\u0000${ip}`).digest("hex");
}

/** The salt must be a real secret in production; locally a fixed dev salt is fine. */
export function checkSalt(salt: string | undefined, nodeEnv: string | undefined): string {
  if (nodeEnv === "production") {
    if (!salt || salt.length < 16) throw new Error("CHECK_SALT must be set (16+ random characters) in production");
    return salt;
  }
  return salt ?? "local-dev-salt";
}
