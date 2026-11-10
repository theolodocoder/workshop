import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkClientSecrets } from "./check-client-secrets.mjs";

// The fake keys are built while the test runs, so no secret-looking text is ever committed
// (GitHub's push protection would rightly block it).
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = (role: string) => `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ iss: "supabase-demo", role, exp: 1983812996 })}.c2lnbmF0dXJl`;
const fakeSupabaseSecret = ["sb", "secret", "X".repeat(32)].join("_");

function fixture(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), "bundle-"));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
}

describe("checkClientSecrets", () => {
  it("finds a service-role JWT and a Supabase secret key, naming each file", async () => {
    const dir = fixture({
      "app.js": `const a="${jwt("anon")}";const admin="${jwt("service_role")}";`,
      "chunk.js": `var k="${fakeSupabaseSecret}";`,
    });
    const findings = await checkClientSecrets(dir);
    expect(findings.map((f) => f.file.split("/").pop()).sort()).toEqual(["app.js", "chunk.js"]);
    expect(findings.find((f) => f.file.endsWith("app.js"))?.match).toBe("service_role JWT");
    expect(findings.find((f) => f.file.endsWith("chunk.js"))?.match).toBe("Supabase secret key");
  });

  it("allows the public anon key", async () => {
    const dir = fixture({ "app.js": `const url="http://127.0.0.1:54321";const key="${jwt("anon")}";export{url,key};` });
    expect(await checkClientSecrets(dir)).toEqual([]);
  });
});
