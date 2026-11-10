// Cloudflare Workers AI over REST (free daily allowance). Server only: needs the account id and a token.
export const MODEL = "@cf/meta/llama-3.1-8b-instruct";

export function workersAi(opts: { accountId: string; token: string; base?: string; fetchImpl?: typeof fetch }) {
  const base = opts.base ?? process.env.CF_AI_BASE_URL ?? "https://api.cloudflare.com/client/v4";
  return async (prompt: string): Promise<string> => {
    const res = await (opts.fetchImpl ?? fetch)(`${base}/accounts/${opts.accountId}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { authorization: `Bearer ${opts.token}`, "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You explain website speed, accessibility and security problems to non-technical owners. Be brief and concrete." },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Workers AI answered ${res.status}`);
    const json = (await res.json()) as { result?: { response?: string } };
    if (!json.result?.response) throw new Error("Workers AI returned no text");
    return json.result.response;
  };
}
