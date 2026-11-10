import { describe, expect, it } from "vitest";
import { assertPublicUrl, fetchHeadersSafely, UnsafeUrlError, withTimeout } from "./safe-url.ts";

const resolvesTo = (...ips: string[]) => async () => ips;

async function reason(p: Promise<unknown>) {
  try {
    await p;
    return "accepted";
  } catch (e) {
    return e instanceof UnsafeUrlError ? e.reason : `other: ${String(e)}`;
  }
}

describe("assertPublicUrl", () => {
  it.each([
    ["http://127.0.0.1", "private_ip"],
    ["http://[::1]/", "private_ip"],
    ["http://10.1.2.3", "private_ip"],
    ["http://172.20.0.1", "private_ip"],
    ["http://192.168.1.1", "private_ip"],
    ["http://169.254.169.254/latest/meta-data", "private_ip"],
    ["http://100.64.0.1", "private_ip"],
    ["http://0.0.0.0", "private_ip"],
    ["http://[fd00::1]", "private_ip"],
    ["http://[fe80::1]", "private_ip"],
    ["http://[::ffff:127.0.0.1]", "private_ip"],
    ["file:///etc/passwd", "scheme"],
    ["ftp://example.com", "scheme"],
    ["javascript:alert(1)", "scheme"],
    ["http://example.com:8080", "port"],
    ["https://example.com:22", "port"],
  ])("refuses %s (%s)", async (input, expected) => {
    expect(await reason(assertPublicUrl(input, resolvesTo("93.184.216.34")))).toBe(expected);
  });

  it("refuses localhost, which resolves to a loopback address", async () => {
    expect(await reason(assertPublicUrl("http://localhost", resolvesTo("127.0.0.1")))).toBe("private_ip");
  });

  it("refuses a name if ANY address it resolves to is private", async () => {
    expect(await reason(assertPublicUrl("https://sneaky.example", resolvesTo("93.184.216.34", "10.0.0.5")))).toBe("private_ip");
  });

  it("refuses names that don't resolve, and very long input", async () => {
    expect(await reason(assertPublicUrl("https://nowhere.invalid", async () => []))).toBe("unresolvable");
    expect(await reason(assertPublicUrl("https://example.com/" + "a".repeat(2100), resolvesTo("93.184.216.34")))).toBe("too_long");
  });

  it("accepts a normal public site, on the default or standard ports", async () => {
    for (const u of ["https://example.com", "http://example.com:80/x", "https://example.com:443/"]) {
      expect((await assertPublicUrl(u, resolvesTo("93.184.216.34"))).hostname).toBe("example.com");
    }
  });
});

describe("fetchHeadersSafely", () => {
  const publicLookup = resolvesTo("93.184.216.34");

  it("returns the headers of a public page", async () => {
    const fetchImpl = async () => new Response(null, { status: 200, headers: { "content-security-policy": "default-src 'self'" } });
    const headers = await fetchHeadersSafely(new URL("https://example.com"), { fetchImpl, lookup: publicLookup });
    expect(headers.get("content-security-policy")).toBe("default-src 'self'");
  });

  it("refuses a redirect from a public site to the cloud metadata address", async () => {
    const fetchImpl = async () => new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest/meta-data" } });
    expect(await reason(fetchHeadersSafely(new URL("https://example.com"), { fetchImpl, lookup: publicLookup }))).toBe("private_ip");
  });

  it("stops after 3 redirects", async () => {
    let n = 0;
    const fetchImpl = async () => new Response(null, { status: 301, headers: { location: `https://example.com/${++n}` } });
    expect(await reason(fetchHeadersSafely(new URL("https://example.com"), { fetchImpl, lookup: publicLookup }))).toBe("too_many_redirects");
  });
});

describe("withTimeout", () => {
  it("treats a lookup that never answers as unresolvable", async () => {
    const hung = withTimeout(() => new Promise<string[]>(() => {}), 30);
    expect(await hung("slow.example")).toEqual([]);
    expect(await reason(assertPublicUrl("https://slow.example", hung))).toBe("unresolvable");
  });

  it("passes a quick answer through", async () => {
    expect(await withTimeout(async () => ["93.184.216.34"], 1000)("example.com")).toEqual(["93.184.216.34"]);
  });
});
