import type { HeaderFinding } from "./headers.ts";
import type { PsiFindings } from "./pagespeed.ts";

export type Item = { title: string; why: string };
export type Summary = { items: Item[]; ai: boolean };

// Our own plain-English copy, used when the AI is unavailable (and as the AI's reference).
const AUDIT_COPY: Record<string, Item> = {
  "total-blocking-time": { title: "Your page is slow to respond to taps", why: "Big scripts keep the browser busy while the page loads, so taps and clicks feel stuck." },
  "largest-contentful-paint": { title: "The main content shows up late", why: "The biggest thing on screen (often a photo or heading) takes too long to appear on phones." },
  "cumulative-layout-shift": { title: "Things jump around while loading", why: "Images or ads without reserved space push the page down as they arrive." },
  "first-contentful-paint": { title: "The screen stays blank too long", why: "Nothing appears until large files have downloaded." },
  "speed-index": { title: "The page fills in slowly", why: "Content appears bit by bit instead of all at once." },
  "uses-responsive-images": { title: "Your images are too big for phones", why: "Phones download desktop-sized photos. Serve smaller sizes to small screens." },
  "render-blocking-resources": { title: "Files block the page from showing", why: "Stylesheets or scripts must finish before anything is drawn." },
  "unused-javascript": { title: "You send JavaScript nobody uses", why: "Code for other pages or features downloads on every visit." },
  "button-name": { title: "Some buttons have no name", why: "Screen readers announce them as just 'button', so people can't tell what they do." },
  "color-contrast": { title: "Some text is hard to read", why: "Light text on a light background fails for many people, especially outdoors." },
  "image-alt": { title: "Images have no description", why: "Screen-reader users hear nothing, or a file name." },
  "link-name": { title: "Some links have no name", why: "Screen readers can't say where they go." },
  "label": { title: "Form fields have no labels", why: "People using screen readers don't know what to type." },
};
const HEADER_COPY: Record<HeaderFinding["name"], Item> = {
  csp: { title: "No Content-Security-Policy header", why: "A CSP limits which scripts can run, which blocks a whole class of attacks." },
  hsts: { title: "No HSTS header", why: "Browsers may still try the insecure version of your site first." },
  nosniff: { title: "No nosniff header", why: "Browsers may guess file types, which attackers can abuse." },
  "referrer-policy": { title: "No referrer policy", why: "Full page addresses can leak to other sites when people click links." },
  "frame-protection": { title: "Your site can be embedded by others", why: "Without frame protection, other sites can put yours in a frame to trick people (clickjacking)." },
};
const fallbackFor = (id: string): Item => AUDIT_COPY[id] ?? { title: `Fix the "${id}" check`, why: "Google's speed and accessibility test flagged this." };

function fallback(psi: PsiFindings, headers: HeaderFinding[]): Item[] {
  const audits = psi.failedAudits.slice(0, 4).map((a) => fallbackFor(a.id));
  const missing = headers.filter((h) => !h.present).slice(0, 2).map((h) => HEADER_COPY[h.name]);
  return [...audits, ...missing];
}

// Only ids, numbers and header names go into the prompt: nothing from the visitor's page.
function prompt(psi: PsiFindings, headers: HeaderFinding[]): string {
  const audits = psi.failedAudits.slice(0, 6).map((a) => `${a.id} (weight ${a.weight})`).join(", ") || "none";
  const missing = headers.filter((h) => !h.present).map((h) => h.name).join(", ") || "none";
  return [
    `Performance score: ${psi.performance}/100. Accessibility score: ${psi.accessibility}/100.`,
    `Failing Lighthouse checks, most important first: ${audits}.`,
    `Missing security headers: ${missing}.`,
    "Write at most 6 fixes for a non-technical site owner, most important first.",
    'Answer with ONLY a JSON array like [{"title": "...", "why": "..."}]. Title under 80 characters, why under 200. Plain words, no jargon.',
  ].join("\n");
}

function parseAi(text: string): Item[] | null {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    const arr: unknown = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(arr) || arr.length === 0 || arr.length > 6) return null;
    const items = arr.map((x) => x as Partial<Item>);
    const ok = items.every(
      (i) => typeof i.title === "string" && typeof i.why === "string" && i.title.length > 0 && i.title.length <= 120 && i.why.length <= 300,
    );
    return ok ? (items as Item[]) : null;
  } catch {
    return null;
  }
}

/** A short, ranked fix list. Uses the AI's wording when it behaves; our own copy otherwise. */
export async function summarize(
  input: { psi: PsiFindings; headers: HeaderFinding[] },
  run: (prompt: string) => Promise<string>,
): Promise<Summary> {
  try {
    const items = parseAi(await run(prompt(input.psi, input.headers)));
    if (items) return { items, ai: true };
  } catch {
    // fall through to our own copy
  }
  return { items: fallback(input.psi, input.headers), ai: false };
}
