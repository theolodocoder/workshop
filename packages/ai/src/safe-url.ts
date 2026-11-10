import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, fetch as undiciFetch } from "undici";

// Guards the "check your site" feature against SSRF: visitors paste a URL and our server fetches it,
// so we must never let that reach internal addresses (localhost, the cloud metadata service, private networks).

export type UnsafeReason = "scheme" | "port" | "private_ip" | "unresolvable" | "too_long" | "too_many_redirects";

export class UnsafeUrlError extends Error {
  reason: UnsafeReason;
  constructor(reason: UnsafeReason) {
    super(`unsafe url: ${reason}`);
    this.reason = reason;
  }
}

export type Lookup = (host: string) => Promise<string[]>;

const defaultLookup: Lookup = async (host) => {
  try {
    return (await dnsLookup(host, { all: true, verbatim: true })).map((a) => a.address);
  } catch {
    return [];
  }
};

const v4 = (ip: string) => ip.split(".").reduce((n, octet) => (n << 8) + Number(octet), 0) >>> 0;
const inV4 = (ip: string, base: string, bits: number) => {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (v4(ip) & mask) === (v4(base) & mask);
};
const PRIVATE_V4: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 4], ["240.0.0.0", 4],
];

/** True for loopback, private, link-local, carrier-grade NAT, multicast and reserved addresses. */
export function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) return PRIVATE_V4.some(([base, bits]) => inV4(ip, base, bits));
  const a = ip.toLowerCase();
  // IPv4-mapped IPv6, in dotted form (::ffff:127.0.0.1) or the hex form URLs normalise to (::ffff:7f00:1).
  const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped?.[1]) return isPrivateIp(mapped[1]);
  const hex = a.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex?.[1] && hex[2]) {
    const n = (parseInt(hex[1], 16) << 16) + parseInt(hex[2], 16);
    return isPrivateIp([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."));
  }
  if (a === "::" || a === "::1") return true;
  return /^f[cd]/.test(a) || /^fe[89ab]/.test(a) || /^ff/.test(a); // fc00::/7, fe80::/10, multicast
}

/** Throws UnsafeUrlError unless `input` is an http(s) URL on a standard port whose every address is public. */
export async function assertPublicUrl(input: string, lookup: Lookup = defaultLookup): Promise<URL> {
  if (input.length > 2048) throw new UnsafeUrlError("too_long");
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new UnsafeUrlError("scheme");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new UnsafeUrlError("scheme");
  if (url.port !== "" && url.port !== "80" && url.port !== "443") throw new UnsafeUrlError("port");

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [host] : await lookup(host);
  if (addresses.length === 0) throw new UnsafeUrlError("unresolvable");
  if (addresses.some(isPrivateIp)) throw new UnsafeUrlError("private_ip");
  return url;
}

// The real fetch re-checks every address at connect time, so a name that resolves to a public
// address during the check and a private one a moment later (DNS rebinding) still can't get through.
const pinnedAgent = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      // Node may ask for one address or for all of them (options.all); answer in the shape it asked for.
      const cb = callback as unknown as (err: Error | null, a: unknown, f?: number) => void;
      defaultLookup(hostname).then(
        (ips): void => {
          const ip = ips[0];
          if (!ip || ips.some(isPrivateIp)) cb(new UnsafeUrlError("private_ip"), options.all ? [] : "", 0);
          else if (options.all) cb(null, ips.map((address) => ({ address, family: isIP(address) })));
          else cb(null, ip, isIP(ip));
        },
        (err: Error): void => cb(err, options.all ? [] : "", 0),
      );
    },
  },
});

// undici's own fetch, so its Agent (with the checked lookup) is always compatible.
const realFetch = ((input: URL, init: RequestInit) =>
  undiciFetch(input, { ...(init as object), dispatcher: pinnedAgent })) as unknown as typeof fetch;

/**
 * Fetches only the response headers of a public URL: HEAD (or GET with the body discarded),
 * redirects followed by hand (max 3), each hop checked again, 10 s total.
 */
export async function fetchHeadersSafely(
  start: URL,
  opts: { fetchImpl?: typeof fetch; lookup?: Lookup } = {},
): Promise<Headers> {
  const doFetch = opts.fetchImpl ?? realFetch;
  const signal = AbortSignal.timeout(10_000);
  let url = start;
  for (let hop = 0; hop <= 3; hop++) {
    await assertPublicUrl(url.href, opts.lookup);
    let res = await doFetch(url, { method: "HEAD", redirect: "manual", signal });
    if (res.status === 405 || res.status === 501) {
      res = await doFetch(url, { method: "GET", redirect: "manual", signal });
      await res.body?.cancel();
    }
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    return res.headers;
  }
  throw new UnsafeUrlError("too_many_redirects");
}
