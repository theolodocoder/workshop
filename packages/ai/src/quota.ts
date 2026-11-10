import { createHash } from "node:crypto";

/**
 * The key for a visitor's daily check limit: a salted SHA-256 of their session id and IP.
 * We never store the IP itself.
 */
export function visitorHash(sessionId: string, ip: string, salt: string): string {
  return createHash("sha256").update(`${salt}\u0000${sessionId}\u0000${ip}`).digest("hex");
}
