// Stand-ins for Google PageSpeed and Cloudflare Workers AI, so browser tests never call real services.
// PageSpeed: any url -> e2e/fixtures/psi.json. If the url contains "ai-fails", the failing checks include
// "zz-ai-fails", and the AI mock answers 500 when it sees that id in the prompt.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const psi = JSON.parse(readFileSync(new URL("../e2e/fixtures/psi.json", import.meta.url), "utf8"));
const port = Number(process.argv[2] ?? 4398);

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === "/pagespeed") {
    const body = structuredClone(psi);
    if ((url.searchParams.get("url") ?? "").includes("ai-fails")) {
      body.lighthouseResult.categories.performance.auditRefs.push({ id: "zz-ai-fails", weight: 99 });
      body.lighthouseResult.audits["zz-ai-fails"] = { score: 0 };
    }
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(body));
    return;
  }
  if (url.pathname.startsWith("/cf/accounts/")) {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (raw.includes("zz-ai-fails")) return res.writeHead(500).end("{}");
      const response = JSON.stringify([
        { title: "Your page freezes while it loads", why: "Big scripts run before people can tap anything." },
        { title: "Add a Content-Security-Policy", why: "It stops injected scripts from running." },
      ]);
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ result: { response } }));
    });
    return;
  }
  res.writeHead(404).end();
}).listen(port, () => console.log(`mock apis on ${port}`));
