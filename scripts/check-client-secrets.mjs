// FIX 2 guard: fails the build if a secret ends up in files sent to the browser.
// Usage: node scripts/check-client-secrets.mjs apps/rescue/.next/static
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const JWT = /eyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]*/g;
const PATTERNS = [
  { name: "Supabase secret key", re: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: "Stripe secret key", re: /sk_(live|test)_[A-Za-z0-9]{10,}/ },
];

function isServiceRoleJwt(payload) {
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).role === "service_role";
  } catch {
    return false;
  }
}

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (/\.(js|mjs|cjs|html|json|map|txt)$/.test(entry.name)) yield path;
  }
}

/** @returns {Promise<{ file: string; match: string }[]>} */
export async function checkClientSecrets(dir) {
  const findings = [];
  for await (const file of files(dir)) {
    const text = await readFile(file, "utf8");
    for (const [, payload] of text.matchAll(JWT)) {
      if (isServiceRoleJwt(payload)) {
        findings.push({ file, match: "service_role JWT" });
        break;
      }
    }
    for (const { name, re } of PATTERNS) if (re.test(text)) findings.push({ file, match: name });
  }
  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("usage: check-client-secrets <dir>");
    process.exit(2);
  }
  const findings = await checkClientSecrets(dir);
  for (const f of findings) console.error(`SECRET IN CLIENT BUNDLE: ${f.match} in ${f.file}`);
  if (findings.length) process.exit(1);
  console.log(`No secrets found in ${dir}`);
}
